import { authService } from './authService';
import { auth, isDemoMode } from '../lib/firebase';
import type { RecoveryPlan, RecoveryPlannerRequest } from '../types';

const UNAVAILABLE_MESSAGE = 'Recovery planning is temporarily unavailable. Your report and AI analysis are still available.';

function priorityFromSeverity(severity: RecoveryPlannerRequest['analysis']['severityAssessment']): RecoveryPlan['priority'] {
  if (severity === 'critical') return 'URGENT';
  if (severity === 'high') return 'HIGH';
  if (severity === 'medium') return 'MEDIUM';
  return 'LOW';
}

function createDemoPlan(request: RecoveryPlannerRequest): RecoveryPlan {
  const waste = request.analysis.primaryWasteType || 'mixed waste';
  const hazardous = request.analysis.safetyWarnings.length > 0 || /chemical|electronic|medical|sharp/i.test(waste);

  return {
    title: `Community recovery plan for ${waste}`,
    priority: priorityFromSeverity(request.analysis.severityAssessment),
    summary: `A practical DEMO DATA plan based on the scene analysis. Confirm conditions on site before any cleanup begins.`,
    immediateActions: [
      'Inspect the site from a safe distance and identify public access risks.',
      'Tell nearby volunteers what was observed and agree on a safe meeting time.',
      'Escalate visible hazardous material to the appropriate local authority or professional handler.'
    ],
    safetyPrecautions: hazardous
      ? ['Do not touch unknown, sharp, leaking, medical, chemical, or electronic waste.', 'Use gloves, closed shoes, and tongs for ordinary litter only.', 'Keep children and untrained volunteers away; seek local-authority or professional handling for hazards.']
      : ['Wear gloves and closed shoes.', 'Use tongs or a litter picker; do not handle sharp or unknown material.', 'Pause and seek appropriate help if hazards become visible.'],
    cleanupPlan: ['Brief volunteers and mark safe collection areas.', 'Collect accessible non-hazardous waste by type.', 'Keep bags separated and leave any suspected hazardous material untouched.'],
    peopleNeeded: request.analysis.severityAssessment === 'high' || request.analysis.severityAssessment === 'critical' ? 6 : 3,
    recommendedEquipment: ['Reusable gloves', 'Closed shoes', 'Litter pickers or tongs', 'Separated collection bags', 'Handwashing supplies'],
    sortingGuidance: ['Keep dry recyclables separate from organic waste.', 'Keep e-waste, batteries, sharps, and unknown items separate and do not process them on site.'],
    disposalGuidance: ['Use authorised local collection or recycling channels where available.', 'Ask the relevant local authority or licensed handler about hazardous, electronic, or chemical material.'],
    preventionActions: request.analysis.preventionRecommendations.slice(0, 3),
    monitoringPlan: ['Check the location after 7 days.', 'Record a follow-up observation after 30 days.', 'Report recurrence through TrashChain rather than estimating unmeasured impact.'],
    estimatedEffort: 'Small volunteer team; confirm site conditions before scheduling.',
    communityMessage: 'A safer, cleaner shared space starts with one coordinated recovery action.',
    dataClassification: 'DEMO DATA'
  };
}

function isRecoveryPlan(value: unknown): value is RecoveryPlan {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  const textFields = ['title', 'summary', 'estimatedEffort', 'communityMessage'];
  const listFields = ['immediateActions', 'safetyPrecautions', 'cleanupPlan', 'recommendedEquipment', 'sortingGuidance', 'disposalGuidance', 'preventionActions', 'monitoringPlan'];
  return textFields.every(field => typeof plan[field] === 'string')
    && listFields.every(field => Array.isArray(plan[field]) && plan[field].every(item => typeof item === 'string'))
    && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(plan.priority as string)
    && Number.isInteger(plan.peopleNeeded) && (plan.peopleNeeded as number) > 0
    && plan.dataClassification === 'AI-ASSISTED';
}

class RecoveryPlannerService {
  public async createPlan(request: RecoveryPlannerRequest): Promise<RecoveryPlan> {
    if (isDemoMode() || authService.isDemoSession()) {
      return createDemoPlan(request);
    }

    const user = auth?.currentUser;
    if (!user) {
      throw new Error('Please sign in to create a recovery plan.');
    }

    let token: string;
    try {
      token = await user.getIdToken();
    } catch {
      throw new Error('Please sign in again to create a recovery plan.');
    }

    let response: Response;
    try {
      response = await fetch('/api/recovery-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Never forward caller-supplied metadata: OpenAI receives only Gemini's
        // structured environmental analysis through the server boundary.
        body: JSON.stringify({ analysis: request.analysis }),
      });
    } catch {
      throw new Error(UNAVAILABLE_MESSAGE);
    }

    if (!response.ok) {
      if (response.status === 401) throw new Error('Please sign in again to create a recovery plan.');
      throw new Error(UNAVAILABLE_MESSAGE);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error(UNAVAILABLE_MESSAGE);
    }

    if (!isRecoveryPlan(payload)) {
      throw new Error(UNAVAILABLE_MESSAGE);
    }
    return payload;
  }
}

export const recoveryPlannerService = new RecoveryPlannerService();
export { UNAVAILABLE_MESSAGE };
