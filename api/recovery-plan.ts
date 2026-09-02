import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type RecoveryPlanPayload = {
  title: string;
  priority: Priority;
  summary: string;
  immediateActions: string[];
  safetyPrecautions: string[];
  cleanupPlan: string[];
  peopleNeeded: number;
  recommendedEquipment: string[];
  sortingGuidance: string[];
  disposalGuidance: string[];
  preventionActions: string[];
  monitoringPlan: string[];
  estimatedEffort: string;
  communityMessage: string;
  dataClassification: 'AI-ASSISTED';
};

const planSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'priority', 'summary', 'immediateActions', 'safetyPrecautions', 'cleanupPlan', 'peopleNeeded', 'recommendedEquipment', 'sortingGuidance', 'disposalGuidance', 'preventionActions', 'monitoringPlan', 'estimatedEffort', 'communityMessage', 'dataClassification'],
  properties: {
    title: { type: 'string' },
    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
    summary: { type: 'string' },
    immediateActions: { type: 'array', items: { type: 'string' } },
    safetyPrecautions: { type: 'array', items: { type: 'string' } },
    cleanupPlan: { type: 'array', items: { type: 'string' } },
    peopleNeeded: { type: 'integer', minimum: 1, maximum: 30 },
    recommendedEquipment: { type: 'array', items: { type: 'string' } },
    sortingGuidance: { type: 'array', items: { type: 'string' } },
    disposalGuidance: { type: 'array', items: { type: 'string' } },
    preventionActions: { type: 'array', items: { type: 'string' } },
    monitoringPlan: { type: 'array', items: { type: 'string' } },
    estimatedEffort: { type: 'string' },
    communityMessage: { type: 'string' },
    dataClassification: { type: 'string', enum: ['AI-ASSISTED'] },
  },
} as const;

const textFields = ['title', 'summary', 'estimatedEffort', 'communityMessage'] as const;
const listFields = ['immediateActions', 'safetyPrecautions', 'cleanupPlan', 'recommendedEquipment', 'sortingGuidance', 'disposalGuidance', 'preventionActions', 'monitoringPlan'] as const;

function getAdminAuth() {
  if (!getApps().length) {
    const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({ credential: cert(serviceAccount) });
    } else if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  }
  return getAuth();
}

function sendError(res: any, status: number, message: string) {
  return res.status(status).json({ error: message });
}

function isShortString(value: unknown, maxLength = 500): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 12 && value.every(item => isShortString(item, 300));
}

function sanitizeAnalysis(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const analysis = value as Record<string, unknown>;
  const validSeverity = ['low', 'medium', 'high', 'critical'].includes(analysis.severityAssessment as string);
  if (!isStringList(analysis.detectedWasteTypes) || !isShortString(analysis.primaryWasteType, 120) || typeof analysis.confidence !== 'number' || !Number.isFinite(analysis.confidence) || !validSeverity || !isStringList(analysis.environmentalImpacts) || !isStringList(analysis.cleanupRecommendations) || !isStringList(analysis.preventionRecommendations) || !isStringList(analysis.recurrenceFactors) || !isStringList(analysis.safetyWarnings) || !isShortString(analysis.summary)) {
    return null;
  }
  return {
    detectedWasteTypes: analysis.detectedWasteTypes,
    primaryWasteType: analysis.primaryWasteType,
    confidence: Math.max(0, Math.min(100, analysis.confidence)),
    severityAssessment: analysis.severityAssessment,
    environmentalImpacts: analysis.environmentalImpacts,
    cleanupRecommendations: analysis.cleanupRecommendations,
    preventionRecommendations: analysis.preventionRecommendations,
    recurrenceFactors: analysis.recurrenceFactors,
    safetyWarnings: analysis.safetyWarnings,
    summary: analysis.summary,
  };
}

function isRecoveryPlan(value: unknown): value is RecoveryPlanPayload {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  return textFields.every(field => isShortString(plan[field]))
    && listFields.every(field => isStringList(plan[field]))
    && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(plan.priority as string)
    && Number.isInteger(plan.peopleNeeded) && (plan.peopleNeeded as number) >= 1 && (plan.peopleNeeded as number) <= 30
    && plan.dataClassification === 'AI-ASSISTED';
}

function extractOutputText(response: any): string | null {
  if (typeof response?.output_text === 'string') return response.output_text;
  const content = response?.output?.flatMap((item: any) => item?.content ?? []);
  const text = content?.find((item: any) => item?.type === 'output_text')?.text;
  return typeof text === 'string' ? text : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed.');
  }

  const authorization = req.headers.authorization;
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return sendError(res, 401, 'Authentication is required.');

  try {
    await getAdminAuth().verifyIdToken(token);
  } catch {
    return sendError(res, 401, 'Your sign-in session could not be verified.');
  }

  const analysis = sanitizeAnalysis(req.body?.analysis);
  if (!analysis) {
    return sendError(res, 400, 'The recovery-planning request is invalid.');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return sendError(res, 503, 'Recovery planning is temporarily unavailable.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_RECOVERY_PLANNER_MODEL || 'gpt-5-mini',
        store: false,
        max_output_tokens: 1200,
        instructions: 'Generate a practical recovery plan for a citizen-facing environmental recovery platform in India. Use only the supplied analysis and context. Never invent exact weight, volume, item counts, contamination levels, or other measurements. Recommendations are AI-assisted, not measured or verified field evidence. For hazardous, sharp, medical, chemical, leaking, or electronic materials, give conservative advice: do not handle them and recommend suitable local-authority or professional handling. Do not imply government approval or partnership. Use simple, actionable language and no unnecessary jargon.',
        // The model receives only server-sanitized Gemini analysis. No location,
        // identity, token, or arbitrary client metadata crosses this boundary.
        input: JSON.stringify({ analysis }),
        text: { format: { type: 'json_schema', name: 'recovery_plan', strict: true, schema: planSchema } },
      }),
    });
    if (!response.ok) return sendError(res, 502, 'Recovery planning is temporarily unavailable.');
    const responseBody = await response.json();
    const outputText = extractOutputText(responseBody);
    if (!outputText) return sendError(res, 502, 'Recovery planning is temporarily unavailable.');
    const plan = JSON.parse(outputText);
    if (!isRecoveryPlan(plan)) return sendError(res, 502, 'Recovery planning is temporarily unavailable.');
    return res.status(200).json(plan);
  } catch {
    return sendError(res, 502, 'Recovery planning is temporarily unavailable.');
  } finally {
    clearTimeout(timeout);
  }
}
