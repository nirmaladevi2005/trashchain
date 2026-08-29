# TRASHCHAIN — REAL AI VISION SERVER ENDPOINT CONTRACT

## Architecture Overview
To maintain zero API key exposure in client source code, all Gemini Vision API calls must be proxied through a secure server-side environment (Firebase Cloud Functions or Node.js backend).

```
React App (Client)
  ↓ httpsCallable('analyzePollutionImage')
Firebase Cloud Function (Server Node.js Environment)
  ↓ Reads secret GEMINI_API_KEY from environment/Secret Manager
Gemini 1.5 Flash Vision Model (@google/genai)
  ↓ Structured JSON output matching PollutionAIAnalysis schema
Firebase Cloud Function (Server)
  ↓ Returns JSON object
React App (Client)
```

---

## Server Function Code Example (Node.js / Firebase Cloud Functions v2)

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize SDK using environment secret (NEVER exposed to frontend)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export const analyzePollutionImage = onCall({ secrets: ['GEMINI_API_KEY'] }, async (request) => {
  const { imageUrl, userCategories, locationName } = request.data;
  if (!imageUrl) {
    throw new HttpsError('invalid-argument', 'Image URL is required for analysis.');
  }

  const systemInstruction = `
You are an expert environmental remediation scientist analyzing field photos for TrashChain.
Instructions:
1. Identify all visible waste types (e.g. Plastic, Organic, Debris).
2. Assess visible severity level ('low', 'medium', 'high', 'critical').
3. Outline environmental risks (drainage blockage, microplastics, vector breeding).
4. Recommend practical cleanup safety measures for volunteers.
5. Suggest prevention & place transformation interventions (mini-gardens, waste bins).
6. NEVER invent exact weight measurements (e.g., "52 kg") that cannot be measured visually.
7. Return strictly formatted JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction },
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

    const structuredData = JSON.parse(response.text);

    return {
      ...structuredData,
      analyzedAt: new Date().toISOString(),
      model: 'gemini-3.6-flash',
      version: 'v1.0.4',
      dataClassification: 'AI-ASSISTED'
    };
  } catch (err) {
    console.error('Gemini Vision API call failed:', err);
    throw new HttpsError('internal', 'AI Vision analysis service encountered an error.');
  }
});
```
