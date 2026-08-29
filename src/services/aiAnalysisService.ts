import { app, isDemoMode } from '../lib/firebase';
import type { PollutionAIAnalysis, Severity, WasteCategory } from '../types';

export interface AnalyzeImageOptions {
  imageUrl: string;
  imageBlob?: Blob | File;
  userCategories?: WasteCategory[];
  userDescription?: string;
  locationName?: string;
}

class AIAnalysisService {
  private cache = new Map<string, PollutionAIAnalysis>();
  private activeRequests = new Map<string, Promise<PollutionAIAnalysis>>();

  /**
   * Main client method for AI pollution image analysis via Firebase AI Logic / Gemini Developer API.
   * - Checks cache first to prevent duplicate API costs.
   * - Prevents concurrent duplicate calls for the same image.
   * - Uses gemini-3.6-flash model via Firebase AI Logic / Gemini Developer API.
   * - Fallbacks gracefully to structured DEMO mode if API is unreachable/unconfigured.
   */
  public async analyzePollutionImage(options: AnalyzeImageOptions): Promise<PollutionAIAnalysis> {
    const cacheKey = options.imageUrl;

    // 1. Check in-memory cache
    if (this.cache.has(cacheKey)) {
      console.info('[AIAnalysisService] Returning cached analysis for image');
      return this.cache.get(cacheKey)!;
    }

    // 2. Prevent duplicate concurrent requests
    if (this.activeRequests.has(cacheKey)) {
      console.info('[AIAnalysisService] Reusing active analysis request for image');
      return this.activeRequests.get(cacheKey)!;
    }

    // 3. Initiate analysis request
    const requestPromise = this.performAnalysis(options);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async performAnalysis(options: AnalyzeImageOptions): Promise<PollutionAIAnalysis> {
    const timestamp = new Date().toISOString();

    // Live AI Analysis via Firebase AI Logic / Gemini Developer API (gemini-3.6-flash)
    if (!isDemoMode() && app) {
      try {
        console.info('[AIAnalysisService] Executing Gemini Developer API analysis using gemini-3.6-flash...');
        
        // Convert image to Base64 inline data if accessible
        const inlineImage = await this.prepareInlineImage(options);

        // System instructions & prompt enforcing structured JSON and quantity safety
        const prompt = `Analyze this pollution/waste image for environmental report classification.
Location hint: ${options.locationName || 'Urban field site'}
User categories: ${(options.userCategories || []).join(', ') || 'Unclassified'}

Return ONLY a valid JSON object matching this exact schema:
{
  "detectedWasteTypes": ["string"],
  "primaryWasteType": "string",
  "confidence": 92,
  "severityAssessment": "low" | "medium" | "high" | "critical",
  "environmentalImpacts": ["string"],
  "cleanupRecommendations": ["string"],
  "preventionRecommendations": ["string"],
  "recurrenceFactors": ["string"],
  "safetyWarnings": ["string"],
  "summary": "string"
}

QUANTITY SAFETY INSTRUCTION:
Do NOT output specific measured weight in kilograms or pounds (such as "52 kg" or "100 lbs"). Describe waste quantity qualitatively only (e.g. "substantial visible pile", "scattered litter", "dense heap"). Actual field measurements remain separate.`;

        // Direct fetch to Gemini Developer API endpoint via Firebase proxy/backend (Spark $0 tier compatible)
        const requestPayload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                ...(inlineImage ? [{ inlineData: inlineImage }] : [])
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        };

        // Call Gemini 3.6 Flash via Developer API / Firebase AI Logic
        const response = await this.callGeminiApi('gemini-3.6-flash', requestPayload);
        if (response) {
          const parsed = this.parseAndSanitizeAiResponse(response, timestamp);
          if (parsed) {
            return parsed;
          }
        }
      } catch (err: any) {
        console.warn('[AIAnalysisService] Live AI Logic execution error, falling back to structured DEMO mode:', err.message || err);
      }
    }

    // Fallback or Demo Mode Analysis (tagged explicitly as AI-ASSISTED DEMO)
    return this.generateFallbackAnalysis(options, timestamp);
  }

  /**
   * Helper to convert image URL or Blob into inline Base64 data for Gemini
   */
  private async prepareInlineImage(options: AnalyzeImageOptions): Promise<{ mimeType: string; data: string } | null> {
    try {
      if (options.imageBlob) {
        const base64 = await this.blobToBase64(options.imageBlob);
        const mimeType = options.imageBlob.type || 'image/jpeg';
        return { mimeType, data: base64 };
      }

      if (options.imageUrl && options.imageUrl.startsWith('data:')) {
        const parts = options.imageUrl.split(',');
        const mimeMatch = options.imageUrl.match(/data:(.*?);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        return { mimeType, data: parts[1] };
      }

      if (options.imageUrl && options.imageUrl.startsWith('blob:')) {
        const res = await fetch(options.imageUrl);
        const blob = await res.blob();
        const base64 = await this.blobToBase64(blob);
        return { mimeType: blob.type || 'image/jpeg', data: base64 };
      }
    } catch (err) {
      console.warn('[AIAnalysisService] Unable to convert image for inline data:', err);
    }
    return null;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Calls the Gemini Developer API via standard Firebase Web App credentials
   */
  private async callGeminiApi(modelName: string, payload: any): Promise<any> {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResult) {
      return JSON.parse(textResult);
    }
    return null;
  }

  /**
   * Parses and sanitizes raw JSON from Gemini, enforcing quantity safety
   */
  private parseAndSanitizeAiResponse(raw: any, timestamp: string): PollutionAIAnalysis | null {
    if (!raw || typeof raw !== 'object') return null;

    const sanitizeText = (str: string) => {
      // Quantity safety: remove any exact weight estimations like "52 kg" or "100 lbs"
      return str.replace(/\b\d+(\.\d+)?\s*(kg|kilograms|lbs|pounds)\b/gi, 'substantial visible volume');
    };

    const severityMap: Record<string, Severity> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical'
    };

    return {
      detectedWasteTypes: Array.isArray(raw.detectedWasteTypes) ? raw.detectedWasteTypes.map(sanitizeText) : ['Mixed Debris'],
      primaryWasteType: sanitizeText(raw.primaryWasteType || 'Mixed Household Waste'),
      confidence: typeof raw.confidence === 'number' ? Math.min(100, Math.max(50, raw.confidence)) : 90,
      severityAssessment: severityMap[raw.severityAssessment] || 'medium',
      environmentalImpacts: Array.isArray(raw.environmentalImpacts) ? raw.environmentalImpacts.map(sanitizeText) : ['Potential drainage and soil impact'],
      cleanupRecommendations: Array.isArray(raw.cleanupRecommendations) ? raw.cleanupRecommendations.map(sanitizeText) : ['Standard volunteer safety equipment required'],
      preventionRecommendations: Array.isArray(raw.preventionRecommendations) ? raw.preventionRecommendations.map(sanitizeText) : ['Community bin placement and monitoring'],
      recurrenceFactors: Array.isArray(raw.recurrenceFactors) ? raw.recurrenceFactors.map(sanitizeText) : ['Secluded dumping spot'],
      safetyWarnings: Array.isArray(raw.safetyWarnings) ? raw.safetyWarnings.map(sanitizeText) : ['Wear gloves and heavy-duty footwear'],
      summary: sanitizeText(raw.summary || 'Pollution site identified for community cleanup.'),
      analyzedAt: timestamp,
      model: 'gemini-3.6-flash (Firebase AI Logic)',
      version: 'v1.1.0',
      dataClassification: 'AI-ASSISTED'
    };
  }

  /**
   * Generates a structured fallback result when live AI is offline/unconfigured.
   */
  private generateFallbackAnalysis(options: AnalyzeImageOptions, timestamp: string): PollutionAIAnalysis {
    const categories = options.userCategories || ['plastic', 'mixed'];
    const detectedWasteTypes = categories.map(c => 
      c === 'plastic' ? 'Plastic Packaging & Bottles' :
      c === 'mixed' ? 'Mixed Household Waste' :
      c === 'organic' ? 'Decomposing Food Waste' :
      c === 'industrial' ? 'Construction & Demolition Debris' :
      c === 'electronic' ? 'Electronic Waste & Wiring' : 'Chemical / Industrial Waste'
    );

    return {
      detectedWasteTypes,
      primaryWasteType: detectedWasteTypes[0] || 'Plastic Packaging & Bottles',
      confidence: 94,
      severityAssessment: 'high' as Severity,
      environmentalImpacts: [
        'Stormwater drain obstruction risk during heavy rainfall',
        'Microplastic breakdown and soil contamination risk',
        'Community vector breeding and odor risk'
      ],
      cleanupRecommendations: [
        'Equip volunteer team with heavy-duty puncture-resistant gloves and safety boots',
        'Segregate recyclables (PET/HDPE) from mixed debris at source',
        'Coordinate municipal waste transfer truck for bulk disposal'
      ],
      preventionRecommendations: [
        'Install visible community waste infrastructure and signage',
        'Transform site into a community mini-garden planter hub to discourage re-dumping',
        'Schedule bi-weekly community monitoring check-ins'
      ],
      recurrenceFactors: [
        'Unmonitored secluded corner with low nighttime illumination',
        'Lack of nearby public waste bins'
      ],
      safetyWarnings: [
        'Exercise caution with broken glass or sharp metal edges',
        'Do not handle unsealed chemical containers directly'
      ],
      summary: 'High-density unsegregated waste dump requiring immediate volunteer cleanup and site transformation.',
      analyzedAt: timestamp,
      model: 'gemini-3.6-flash (Simulated Contract)',
      version: 'v1.1.0',
      dataClassification: 'AI-ASSISTED DEMO'
    };
  }

  /**
   * Clears in-memory cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const aiAnalysisService = new AIAnalysisService();
