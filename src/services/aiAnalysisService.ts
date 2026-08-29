import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app, isDemoMode } from '../lib/firebase';
import type { PollutionAIAnalysis, Severity, WasteCategory } from '../types';

export interface AnalyzeImageOptions {
  imageUrl: string;
  imageBlob?: Blob | File;
  userCategories?: WasteCategory[];
  userDescription?: string;
  locationName?: string;
}

let aiInstance: any = null;

function getFirebaseAI() {
  if (!aiInstance && app) {
    try {
      aiInstance = getAI(app, { backend: new GoogleAIBackend() });
    } catch (err) {
      console.warn('[AIAnalysisService] Firebase AI SDK initialization warning:', err);
    }
  }
  return aiInstance;
}

class AIAnalysisService {
  private cache = new Map<string, PollutionAIAnalysis>();
  private activeRequests = new Map<string, Promise<PollutionAIAnalysis>>();

  /**
   * Main client method for AI pollution image analysis via Firebase AI Logic / Gemini Developer API.
   * - Checks cache first to prevent duplicate API costs.
   * - Prevents concurrent duplicate calls for the same image.
   * - Uses gemini-3.6-flash model via Firebase AI Logic (firebase/ai SDK).
   * - Passes actual inline base64 image data to Gemini.
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

    // Live AI Analysis via Firebase AI Logic (firebase/ai SDK) with gemini-3.6-flash
    if (!isDemoMode() && app) {
      try {
        const ai = getFirebaseAI();
        if (ai) {
          const model = getGenerativeModel(ai, {
            model: 'gemini-3.6-flash',
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          });

          // Convert image to inline Base64 data for Gemini
          const inlineImagePart = await this.prepareInlineImage(options);

          if (import.meta.env.DEV) {
            console.info('[AI DEBUG]', {
              mode: 'LIVE',
              model: 'gemini-3.6-flash',
              imageMime: inlineImagePart?.inlineData?.mimeType || 'none',
              imageBytes: inlineImagePart ? Math.round((inlineImagePart.inlineData.data.length * 3) / 4) : 0,
              base64Length: inlineImagePart?.inlineData?.data?.length || 0,
              requestStarted: timestamp
            });
          }

          const systemPrompt = `You are analyzing a real environmental pollution photograph for community waste recovery.

Analyze ONLY what is visually supported by the image.
Location hint: ${options.locationName || 'Urban field site'}
User categories: ${(options.userCategories || []).join(', ') || 'Unclassified'}

Identify visible waste categories.
Identify the most likely primary waste type.
Assess visible severity.
Describe environmental risks that are visually plausible from the scene.
Describe visible hazards for cleanup volunteers.
Recommend practical cleanup actions.
Recommend realistic prevention/intervention strategies.
Identify recurrence factors only when supported.

QUANTITY SAFETY INSTRUCTION:
Do NOT output specific measured weight in kilograms or pounds (such as "52 kg" or "100 lbs"). Describe waste quantity qualitatively only (e.g. "substantial visible pile", "scattered litter", "dense heap"). Actual field measurements remain separate.

Return ONLY a JSON object with this exact schema:
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
}`;

          const parts: any[] = [systemPrompt];
          if (inlineImagePart) {
            parts.push(inlineImagePart);
          }

          const result = await model.generateContent(parts);
          const responseText = result.response.text();

          if (import.meta.env.DEV) {
            console.info('[AI DEBUG]', {
              requestCompleted: new Date().toISOString(),
              responseLength: responseText ? responseText.length : 0,
              schemaValid: !!responseText
            });
          }

          if (responseText) {
            const rawObj = JSON.parse(responseText);
            const parsed = this.parseAndSanitizeAiResponse(rawObj, timestamp);
            if (parsed) {
              return parsed;
            }
          }
        }
      } catch (err: any) {
        console.error('[AIAnalysisService] Live Gemini AI Analysis error:', err.message || err);
        // In LIVE MODE, throw real error so UI displays "AI analysis unavailable" & "Continue without AI"
        throw new Error(err.message || 'Gemini AI vision analysis unavailable for the uploaded image.');
      }
    }

    // Fallback or Demo Mode Analysis (tagged explicitly as AI-ASSISTED DEMO)
    return this.generateFallbackAnalysis(options, timestamp);
  }

  /**
   * Helper to convert image URL or Blob into inline Base64 part for Gemini SDK
   */
  private async prepareInlineImage(options: AnalyzeImageOptions): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
    try {
      if (options.imageBlob) {
        const base64 = await this.blobToBase64(options.imageBlob);
        const mimeType = options.imageBlob.type || 'image/jpeg';
        return { inlineData: { mimeType, data: base64 } };
      }

      if (options.imageUrl && options.imageUrl.startsWith('data:')) {
        const parts = options.imageUrl.split(',');
        const mimeMatch = options.imageUrl.match(/data:(.*?);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        return { inlineData: { mimeType, data: parts[1] } };
      }

      if (options.imageUrl && options.imageUrl.startsWith('blob:')) {
        const res = await fetch(options.imageUrl);
        const blob = await res.blob();
        const base64 = await this.blobToBase64(blob);
        return { inlineData: { mimeType: blob.type || 'image/jpeg', data: base64 } };
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
