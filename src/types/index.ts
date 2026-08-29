export type HotspotStatus = 'reported' | 'mission_active' | 'cleaned' | 'transformed';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type WasteCategory = 'plastic' | 'electronic' | 'organic' | 'industrial' | 'mixed' | 'chemical';

export type AffiliationType = 
  | 'Independent'
  | 'NSS Chapter'
  | 'NGO / Non-Profit'
  | 'College / Institution'
  | 'Foundation'
  | 'Community Group'
  | 'Corporate / CSR'
  | 'Other';

export type EnvironmentalRoleType = 
  | 'Citizen'
  | 'Student'
  | 'NSS Volunteer'
  | 'NGO Volunteer'
  | 'Community Organizer'
  | 'Environmental Professional'
  | 'CSR / Organization Representative'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  environmentalScore: number;
  missionsCompleted: number;
  hotspotsReported: number;
  wasteRemovedKg: number;
  locationsRecovered: number;
  rank: string;
  joinDate: string;
  dataSource?: DataSourceType;
}

export interface Hotspot {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance: string; // e.g. "1.2 km"
  estimatedWaste: string; // e.g. "500kg"
  category: WasteCategory;
  severity: Severity;
  status: HotspotStatus;
  reportedAt: string;
  reporterId: string;
  images: string[];
  locationAccuracy?: number; // e.g. ± 12 metres
  photoCapturedAt?: string;
  gpsAccuracy?: number;
  locationCapturedAt?: string;
  evidenceSource?: EvidenceSourceType;
  locationSource?: LocationSourceType;
  recoveryStatus?: RecoveryStatus;
  monitoringStatus?: RecurrenceStatus;
  dataSource?: DataSourceType;
}

export type MissionStatus = 'upcoming' | 'active' | 'accepted' | 'in_progress' | 'proof_submitted' | 'verifying' | 'completed' | 'verified';

export interface Mission {
  id: string;
  hotspotId: string;
  title: string;
  description: string;
  volunteersNeeded: number;
  volunteersRegistered: string[]; // array of user IDs
  points: number;
  status: MissionStatus;
  date: string;
  organizerId: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  location: string;
  time: string;
  impact: string;
}

export interface AiRecommendation {
  id: string;
  title: string;
  idea: string;
  description: string;
  expectedImpact: string;
  feasibilityScore: number;
  estimatedCost: string;
  impactTags: string[];
}

export type TimelineStageType = 'reported' | 'mission_active' | 'cleaned' | 'ai_recommendation' | 'transformed';

export interface TimelineStage {
  id: string;
  type: TimelineStageType;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  images?: string[];
  aiRecommendation?: AiRecommendation;
}

export interface RecoveryTimeline {
  id: string;
  hotspotId: string;
  stages: TimelineStage[];
  currentScore: number; // 0-100 environmental score
  beforeImage?: string;
  afterImage?: string;
  wasteRemoved?: string;
  scoreImprovement?: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export interface AIAnalysis {
  detectedWaste: string[];
  confidence: number;
  estimatedWaste: string;
  severity: Severity;
  risk: string;
  immediateAction: string;
  prevention: string;
}

export interface PollutionAIAnalysis {
  detectedWasteTypes: string[];
  primaryWasteType: string;
  confidence: number;
  severityAssessment: Severity;
  environmentalImpacts: string[];
  cleanupRecommendations: string[];
  preventionRecommendations: string[];
  recurrenceFactors: string[];
  safetyWarnings: string[];
  summary: string;
  analyzedAt: string;
  model: string;
  version: string;
  dataClassification: 'AI-ASSISTED' | 'AI-ASSISTED DEMO';
}

export type ReportStatus = 'draft' | 'analyzing' | 'submitted' | 'verified';

export type EvidenceSourceType = 'CAMERA_CAPTURE' | 'GALLERY_UPLOAD';
export type LocationSourceType = 'BROWSER_GPS' | 'EXIF_GPS' | 'MANUAL';

export interface PollutionReport {
  id?: string;
  imageUrl?: string;
  photoCapturedAt?: string;
  location?: LocationData;
  gpsAccuracy?: number;
  locationCapturedAt?: string;
  evidenceSource?: EvidenceSourceType;
  locationSource?: LocationSourceType;
  categories: WasteCategory[];
  severity?: Severity;
  estimatedWaste?: string;
  estimatedArea?: string;
  description?: string;
  duration?: string;
  recurring?: boolean;
  aiAnalysis?: AIAnalysis;
  status: ReportStatus;
}

export interface RecurrenceRisk {
  level: 'High' | 'Medium' | 'Low';
  percentage: number;
  explanation: string;
  factors: string[];
}

export interface TransformationIdea {
  id: string;
  title: string;
  description: string;
  whySuits: string;
  estimatedCost: string;
  estimatedTime: string;
  expectedReduction: string;
  environmentalImpact: string;
  maintenanceDifficulty: string;
  requiredInvolvement: string;
  imageUrl?: string;
  votes: number;
}

export interface PreventionRecommendation {
  id: string;
  hotspotId: string;
  missionId?: string;
  locationName: string;
  previousWaste: string;
  recurrenceRisk: RecurrenceRisk;
  locationAnalysis: {
    characteristics: string[];
    previousWastePatterns: string;
    nearbyActivity: string;
    spaceCharacteristics: string;
  };
  ideas: TransformationIdea[];
}

export interface CommunityVote {
  userId: string;
  ideaId: string;
  timestamp: string;
}

export type TransformationStatus = 'ai_recommendation' | 'community_voting' | 'idea_selected' | 'planning' | 'implementation' | 'transformation_complete';

export interface TransformationProject {
  id: string;
  hotspotId: string;
  selectedIdeaId?: string;
  status: TransformationStatus;
  votes: CommunityVote[];
  projectedScore: number;
  maintenancePlan: string;
  communityRole: string;
}

// ==========================================
// Phase 6 Field Mode & Pilot Data Types
// ==========================================

export type FieldActivityStatus = 'not_started' | 'active' | 'paused' | 'completed';
export type MeasurementMethod = 'visual_estimate' | 'weighed_on_scale' | 'count_based_estimate' | 'other';
export type MeasurementUnit = 'kg' | 'bags' | 'items' | 'litres' | 'other';
export type RecurrenceStatus = 'clean' | 'minor_recurrence' | 'significant_recurrence' | 'requires_intervention';
export type RecoveryStatus = 'submitted' | 'under_review' | 'verified' | 'recovery_confirmed';
export type ImpactType = 'projected' | 'verified' | 'estimated' | 'measured' | 'user_reported' | 'test_data' | 'trashchain_verified' | 'independently_verified';
export type DataSourceType = 'DEMO DATA' | 'FIELD DATA' | 'TEST DATA';

export interface WasteRecord {
  id: string;
  type: WasteCategory;
  quantity: number;
  unit: MeasurementUnit;
  method: MeasurementMethod;
  notes?: string;
}

export interface BaselineObservation {
  beforeImage: string;
  categories: WasteCategory[];
  estimatedWeightKg: number;
  visibleClusters: number;
  cleanlinessScore: number; // 0-100 scale
  recurrenceStatus: RecurrenceStatus;
  approximateAge: string; // e.g. "Recent (1-2 weeks)", "Old (> 1 month)"
  siteConditions: string;
  measurementMethod: MeasurementMethod;
  notes?: string;
}

export interface EvidenceRecord {
  afterImage: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  timestamp: string;
  durationMinutes: number;
  volunteerCount: number;
  wasteRecords: WasteRecord[];
  notes?: string;
}

export interface RecoveryRecord {
  id: string;
  activityId: string;
  referenceId: string;
  locationName: string;
  baseline: BaselineObservation;
  evidence: EvidenceRecord;
  status: RecoveryStatus;
  verificationType: 'ai_assisted_review';
  verifiedAt?: string;
}

export interface MonitoringCheckpoint {
  id: string;
  recoveryRecordId: string;
  day: number; // 7, 14, 30, 60, 90
  scheduledDate: string;
  actualDate?: string;
  photoUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  recurrenceStatus: RecurrenceStatus;
  estimatedRecurrenceKg: number;
  cleanlinessScore: number; // 0-100
  communityObservation?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue';
}

export interface RecurrenceObservation {
  baselineMonthlyAverageKg: number;
  postInterventionAverageKg: number;
  observedReductionPercentage: number | null;
  dataSufficient: boolean;
  explanation: string;
}

export interface SiteObservation {
  period: 'baseline' | 'intervention' | 'monitoring';
  date: string;
  wasteKg: number;
  cleanlinessScore: number;
}

export interface ControlSite {
  id: string;
  name: string;
  location: string;
  observations: SiteObservation[];
  currentScore: number;
}

export interface InterventionSite {
  id: string;
  name: string;
  location: string;
  observations: SiteObservation[];
  currentScore: number;
}

export interface FieldActivity {
  id: string;
  referenceId: string;
  referenceType: 'mission' | 'hotspot' | 'standalone';
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  date: string;
  startTime?: string;
  endTime?: string;
  durationSeconds: number;
  status: FieldActivityStatus;
  volunteerCount: number;
  safetyChecklistCompleted: boolean;
  baseline?: BaselineObservation;
  wasteRecords: WasteRecord[];
  evidence?: EvidenceRecord;
  hazards?: string[];
  notes?: string;
  isOfflineSaved?: boolean;
}

export type PilotStatus = 'PLANNED' | 'BASELINE' | 'INTERVENTION' | 'RECOVERY' | 'MONITORING' | 'COMPLETED';

export type PhotoStorageProviderType = 'LOCAL_DEMO' | 'FREE_EXTERNAL' | 'FIREBASE_STORAGE';

export interface Pilot {
  pilotId: string;
  siteName: string;
  siteDescription: string;
  latitude: number;
  longitude: number;
  gpsAccuracy?: number;
  baselineStartDate: string;
  baselineEndDate: string;
  interventionDate?: string;
  leadUserId: string;
  leadUserName?: string;
  status: PilotStatus;
  interventionType: string;
  controlSiteId?: string;
  monitoringSchedule: number[]; // e.g. [7, 14, 30, 60, 90]
  dataSource: DataSourceType;
  createdAt: string;
  updatedAt: string;
  baselineObservation?: BaselineObservation;
}
