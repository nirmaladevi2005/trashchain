import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedWasteTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
    primaryWasteType: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    severityAssessment: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
    environmentalImpacts: { type: Type.ARRAY, items: { type: Type.STRING } },
    cleanupRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    preventionRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    recurrenceFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
    safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING }
  },
  required: [
    'detectedWasteTypes', 'primaryWasteType', 'confidence', 
    'severityAssessment', 'environmentalImpacts', 'cleanupRecommendations', 
    'preventionRecommendations', 'summary'
  ]
};

export const analyzePollutionImage = onCall(
  { 
    secrets: [geminiApiKey],
    cors: true,
    maxInstances: 10
  }, 
  async (request) => {
    // 1. Input validation
    const { imageUrl, userCategories, locationName } = request.data || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new HttpsError('invalid-argument', 'Image URL is required for pollution analysis.');
    }

    // 2. Secret Manager resolution
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      console.error('[analyzePollutionImage] Secret GEMINI_API_KEY is unconfigured on server');
      throw new HttpsError('failed-precondition', 'AI Provider Secret is unconfigured on server.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are an expert environmental remediation scientist analyzing field photos for TrashChain.
Instructions:
1. Identify all visible waste categories (e.g. Plastic, Organic, Construction Debris).
2. Assess visible severity level ('low', 'medium', 'high', 'critical').
3. Outline environmental risks (drainage blockage, microplastics, vector breeding).
4. Recommend practical cleanup safety measures for volunteers.
5. Suggest prevention & place transformation interventions (mini-gardens, waste bins).
6. NEVER invent exact weight measurements (e.g., "52 kg") that cannot be measured visually.
7. Return strictly formatted JSON matching the schema.
    `;

    try {
      // Current stable Gemini multimodal model: gemini-3.6-flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemInstruction },
              { text: `Location context: ${locationName || 'Unspecified site'}. Pre-selected categories: ${userCategories?.join(', ') || 'None'}.` },
              { fileData: { fileUri: imageUrl, mimeType: 'image/jpeg' } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: analysisResponseSchema,
          temperature: 0.2
        }
      });

      if (!response.text) {
        throw new Error('Empty response received from Gemini Vision model.');
      }

      const structuredData = JSON.parse(response.text);

      return {
        ...structuredData,
        analyzedAt: new Date().toISOString(),
        model: 'gemini-3.6-flash',
        version: 'v1.0.4',
        dataClassification: 'AI-ASSISTED'
      };
    } catch (err: any) {
      console.error('[analyzePollutionImage] Gemini API call error:', err);
      throw new HttpsError('internal', `AI Vision analysis error: ${err.message || 'Model execution failed'}`);
    }
  }
);
