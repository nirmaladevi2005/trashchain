import type { 
  Hotspot, Mission, RecoveryTimeline, User, Activity, AiRecommendation,
  FieldActivity, RecoveryRecord, MonitoringCheckpoint, ControlSite, InterventionSite 
} from '../types';

export const currentUser: User = {
  id: 'u-1',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  avatar: 'https://i.pravatar.cc/150?u=alex',
  environmentalScore: 1450,
  missionsCompleted: 12,
  hotspotsReported: 8,
  wasteRemovedKg: 450,
  locationsRecovered: 3,
  rank: 'Eco Guardian',
  joinDate: '2025-03-15T00:00:00Z',
};

export const users: User[] = [
  currentUser,
  {
    id: 'u-2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    environmentalScore: 3200,
    missionsCompleted: 28,
    hotspotsReported: 15,
    wasteRemovedKg: 1200,
    locationsRecovered: 8,
    rank: 'Planet Champion',
    joinDate: '2024-11-20T00:00:00Z',
  },
  {
    id: 'u-3',
    name: 'David Osei',
    email: 'david@example.com',
    avatar: 'https://i.pravatar.cc/150?u=david',
    environmentalScore: 850,
    missionsCompleted: 5,
    hotspotsReported: 2,
    wasteRemovedKg: 120,
    locationsRecovered: 1,
    rank: 'Green Scout',
    joinDate: '2026-01-10T00:00:00Z',
  }
];

export const hotspots: Hotspot[] = [
  {
    id: 'h-1',
    title: 'Riverbank Plastic Accumulation',
    description: 'Significant plastic waste accumulated along the east riverbank near the old bridge. Affecting local wildlife.',
    location: 'East Riverbank, Sector 4',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    distance: '1.2 km',
    estimatedWaste: '200 kg',
    category: 'plastic',
    severity: 'high',
    status: 'mission_active',
    reportedAt: '2026-07-20T08:30:00Z',
    reporterId: 'u-2',
    images: ['https://images.unsplash.com/photo-1618477461853-cf6ed80f4173?auto=format&fit=crop&q=80&w=800'],
  },
  {
    id: 'h-2',
    title: 'Abandoned Lot Dumping Ground',
    description: 'Construction debris and mixed waste illegally dumped in the vacant lot next to the community center.',
    location: 'Pine St & 5th Ave',
    coordinates: { lat: 40.7150, lng: -74.0100 },
    distance: '0.8 km',
    estimatedWaste: '800 kg',
    category: 'mixed',
    severity: 'critical',
    status: 'reported',
    reportedAt: '2026-07-22T14:15:00Z',
    reporterId: 'u-1',
    images: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800'],
  },
  {
    id: 'h-3',
    title: 'Park Edge E-Waste',
    description: 'Several old CRTs and electronic appliances dumped at the edge of the national park trail.',
    location: 'North Trailhead',
    coordinates: { lat: 40.7200, lng: -74.0010 },
    distance: '3.5 km',
    estimatedWaste: '150 kg',
    category: 'electronic',
    severity: 'medium',
    status: 'cleaned',
    reportedAt: '2026-06-15T09:00:00Z',
    reporterId: 'u-3',
    images: ['https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800'],
  },
  {
    id: 'h-4',
    title: 'City Square Transformation',
    description: 'Formerly a highly littered concrete square, now a community garden.',
    location: 'Downtown Square',
    coordinates: { lat: 40.7100, lng: -74.0000 },
    distance: '2.1 km',
    estimatedWaste: '400 kg',
    category: 'mixed',
    severity: 'low',
    status: 'transformed',
    reportedAt: '2025-08-10T11:00:00Z',
    reporterId: 'u-2',
    images: ['https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800'],
  }
];

export const missions: Mission[] = [
  {
    id: 'm-1',
    hotspotId: 'h-1',
    title: 'Riverbank Rescue Operation',
    description: 'Join us for a massive cleanup of the east riverbank. We need volunteers to help bag plastic waste and sort recyclables. Gloves and bags provided.',
    volunteersNeeded: 20,
    volunteersRegistered: ['u-1', 'u-2', 'u-3'],
    points: 150,
    status: 'active',
    date: '2026-07-28T09:00:00Z',
    organizerId: 'u-2',
  },
  {
    id: 'm-2',
    hotspotId: 'h-2',
    title: 'Pine St Lot Clearance',
    description: 'Heavy lifting required. We are clearing out the construction debris from the vacant lot to prepare for a potential community garden project.',
    volunteersNeeded: 10,
    volunteersRegistered: ['u-1'],
    points: 200,
    status: 'upcoming',
    date: '2026-08-05T08:00:00Z',
    organizerId: 'u-1',
  }
];

export const dashboardRecommendation: AiRecommendation = {
  id: 'ai-rec-1',
  title: 'AI Recommendation',
  idea: 'Community Garden & Composting Station',
  description: 'Your next nearby hotspot (Pine St Lot) could be transformed into a community garden. Based on the available space and surrounding residential activity, this intervention is proven to reduce repeat dumping by 85%.',
  expectedImpact: '+120% Community Engagement, -85% Re-dumping risk',
  feasibilityScore: 92,
  estimatedCost: '$1,200',
  impactTags: ['Community', 'Green Space', 'Waste Prevention']
};

export const recentActivities: Activity[] = [
  {
    id: 'act-1',
    userId: 'u-2',
    userName: 'Sarah Chen',
    userAvatar: 'https://i.pravatar.cc/150?u=sarah',
    action: 'verified a cleanup',
    location: 'North Trailhead',
    time: '2 hours ago',
    impact: '+200 pts'
  },
  {
    id: 'act-2',
    userId: 'u-3',
    userName: 'David Osei',
    userAvatar: 'https://i.pravatar.cc/150?u=david',
    action: 'reported a critical hotspot',
    location: 'Downtown Alley',
    time: '5 hours ago',
    impact: '+50 pts'
  },
  {
    id: 'act-3',
    userId: 'u-4',
    userName: 'Maya Patel',
    userAvatar: 'https://i.pravatar.cc/150?u=maya',
    action: 'joined mission',
    location: 'Riverbank Rescue Operation',
    time: '1 day ago',
    impact: 'Volunteer'
  }
];

export const recoveryTimelines: RecoveryTimeline[] = [
  {
    id: 'rt-1',
    hotspotId: 'h-4',
    currentScore: 95,
    beforeImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    afterImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800',
    wasteRemoved: '400kg',
    scoreImprovement: 75,
    stages: [
      {
        id: 's-1',
        type: 'reported',
        title: 'Severe Littering Reported',
        description: 'Area was heavily polluted with daily waste.',
        date: '2025-08-10T11:00:00Z',
        completed: true,
      },
      {
        id: 's-4',
        type: 'transformed',
        title: 'Garden Inauguration',
        description: 'The community garden is now fully operational and maintained by local residents.',
        date: '2026-04-12T10:00:00Z',
        completed: true,
      }
    ]
  }
];

export const leaderboard = [...users].sort((a, b) => b.environmentalScore - a.environmentalScore);

export const mockTransformationIdeas = [
  {
    id: 'idea-1',
    title: 'Community Mini Garden',
    description: 'Convert the cleaned space into a visible, maintained community garden with raised beds for local residents.',
    whySuits: 'Near residential buildings and has good sunlight exposure; community presence deters illegal dumping.',
    estimatedCost: '$450 (Low)',
    estimatedTime: '1–2 weeks',
    expectedReduction: '65% reduction in repeat dumping',
    environmentalImpact: 'High positive impact on soil biodiversity and local air quality.',
    maintenanceDifficulty: 'Low — Community volunteers',
    requiredInvolvement: '5–8 volunteers for weekly watering and upkeep.',
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800',
    votes: 42,
  },
  {
    id: 'idea-2',
    title: 'Public Art / Awareness Mural',
    description: 'Paint a vibrant environmental awareness mural on the adjacent wall with interactive lighting.',
    whySuits: 'An unused blank wall attracts graffiti and littering; public art establishes ownership and cultural value.',
    estimatedCost: '$300 (Low)',
    estimatedTime: '3–5 days',
    expectedReduction: '50% reduction in repeat dumping',
    environmentalImpact: 'Medium — Promotes awareness and community pride.',
    maintenanceDifficulty: 'Very Low — Annual touch-up',
    requiredInvolvement: '2–3 local artists or student volunteers.',
    imageUrl: 'https://images.unsplash.com/photo-1572945288583-b09be38be227?auto=format&fit=crop&q=80&w=800',
    votes: 28,
  },
  {
    id: 'idea-3',
    title: 'Composting & Waste Segregation Zone',
    description: 'Install structured, odor-controlled organic composting bins and clear recycling drop-off stations.',
    whySuits: 'Near local markets and residential blocks where organic waste dumping was frequently observed.',
    estimatedCost: '$800 (Medium)',
    estimatedTime: '2 weeks',
    expectedReduction: '85% reduction in repeat dumping',
    environmentalImpact: 'Very High — Directly diverts organic waste from landfills into fertilizer.',
    maintenanceDifficulty: 'Medium — Bi-weekly monitoring by municipal partner or green champion.',
    requiredInvolvement: '3–4 trained community composting champions.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    votes: 35,
  },
  {
    id: 'idea-4',
    title: 'Community Seating & Book Exchange',
    description: 'Create a cozy pocket park with benches made from recycled plastic and a weatherproof community bookshelf.',
    whySuits: 'High pedestrian foot traffic area that lacked resting spots, making it a passive dumping ground.',
    estimatedCost: '$600 (Medium)',
    estimatedTime: '1 week',
    expectedReduction: '70% reduction in repeat dumping',
    environmentalImpact: 'Medium — Encourages sustainable sharing economy and outdoor community presence.',
    maintenanceDifficulty: 'Low — Monthly checkup',
    requiredInvolvement: '4 volunteers for initial assembly and book stocking.',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=800',
    votes: 19,
  },
  {
    id: 'idea-5',
    title: 'Native Pollinator Garden & Buffer',
    description: 'Plant indigenous flowering shrubs and perennial grasses that require zero irrigation once established.',
    whySuits: 'Ecological buffer zone near water drainage; native roots prevent soil erosion and restore bees and butterflies.',
    estimatedCost: '$350 (Low)',
    estimatedTime: '4–5 days',
    expectedReduction: '60% reduction in repeat dumping',
    environmentalImpact: 'Very High — Restores native pollinator ecosystem and natural drainage.',
    maintenanceDifficulty: 'Very Low — Self-sustaining after 2 months.',
    requiredInvolvement: '6–10 volunteers for planting day.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
    votes: 31,
  },
  {
    id: 'idea-6',
    title: 'Solar-Powered Bicycle Parking & Station',
    description: 'Install secure bicycle racks with a solar-powered LED light and bike repair stand.',
    whySuits: 'Near transit hub and school routes; well-lit active utility spaces drastically deter nocturnal illegal dumping.',
    estimatedCost: '$1,200 (High)',
    estimatedTime: '3 weeks',
    expectedReduction: '90% reduction in repeat dumping',
    environmentalImpact: 'High — Encourages zero-emission micro-mobility and improves night safety.',
    maintenanceDifficulty: 'Low — Quarterly hardware check.',
    requiredInvolvement: 'Local cycling group advocacy and municipal approval.',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
    votes: 15,
  }
];

export const mockPreventionRecommendation = {
  id: 'prev-1',
  hotspotId: 'h-2',
  missionId: 'm-2',
  locationName: 'Pine Street Lot',
  previousWaste: 'Plastic and Mixed Municipal Waste',
  recurrenceRisk: {
    level: 'High' as const,
    percentage: 78,
    explanation: 'This location has a high probability of recurring dumping because it is an unused open space with low community visibility and a history of repeated waste accumulation.',
    factors: [
      'Unused vacant lot without physical boundaries or gates',
      'Low street lighting and minimal nocturnal surveillance',
      'Proximity to commercial alleys without adequate municipal dumpsters',
      'Historical pattern of debris accumulation over 12+ months'
    ]
  },
  locationAnalysis: {
    characteristics: ['Vacant urban plot', '400 sq. meters', 'Good afternoon sunlight', 'Adjacent to brick residential wall'],
    previousWastePatterns: 'Heavy accumulation of single-use plastics, packaging cartons, and illegal construction rubble.',
    nearbyActivity: 'Residential apartment buildings (50m east), primary school bus stop (100m north), weekend farmer market alley.',
    spaceCharacteristics: 'Flat terrain, permeable soil base, visible from main pedestrian intersection.'
  },
  ideas: mockTransformationIdeas
};

// ==========================================
// Phase 6 Mock Field Mode & Pilot Data
// ==========================================

export const mockFieldActivities: FieldActivity[] = [
  {
    id: 'TRC-2026-001',
    referenceId: 'm-2',
    referenceType: 'mission',
    locationName: 'Pine St & 5th Ave (Pine Street Lot)',
    coordinates: { lat: 40.7150, lng: -74.0100, accuracy: 12 },
    date: '2026-07-25',
    startTime: '09:15:00',
    endTime: '11:45:00',
    durationSeconds: 9000,
    status: 'completed',
    volunteerCount: 14,
    safetyChecklistCompleted: true,
    baseline: {
      beforeImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
      categories: ['plastic', 'mixed'],
      estimatedWeightKg: 400,
      visibleClusters: 6,
      cleanlinessScore: 18,
      recurrenceStatus: 'significant_recurrence',
      approximateAge: 'Old (> 1 month)',
      siteConditions: 'Dry, sunny, heavy accumulation along northern fence',
      measurementMethod: 'visual_estimate',
      notes: 'Initial baseline observation prior to community sweep.'
    },
    wasteRecords: [
      { id: 'wr-1', type: 'plastic', quantity: 180, unit: 'kg', method: 'weighed_on_scale', notes: 'Weighed on digital field scale' },
      { id: 'wr-2', type: 'mixed', quantity: 12, unit: 'bags', method: 'count_based_estimate', notes: 'Standard 50L heavy duty refuse bags' },
      { id: 'wr-3', type: 'electronic', quantity: 3, unit: 'items', method: 'count_based_estimate', notes: 'Old monitors retrieved from brush' }
    ],
    evidence: {
      afterImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800',
      coordinates: { lat: 40.7151, lng: -74.0101, accuracy: 8 },
      timestamp: '2026-07-25T11:45:00Z',
      durationMinutes: 150,
      volunteerCount: 14,
      wasteRecords: [
        { id: 'wr-1', type: 'plastic', quantity: 180, unit: 'kg', method: 'weighed_on_scale', notes: 'Weighed on digital field scale' },
        { id: 'wr-2', type: 'mixed', quantity: 12, unit: 'bags', method: 'count_based_estimate', notes: 'Standard 50L heavy duty refuse bags' },
        { id: 'wr-3', type: 'electronic', quantity: 3, unit: 'items', method: 'count_based_estimate', notes: 'Old monitors retrieved from brush' }
      ],
      notes: 'Site fully cleared. All bags staged for municipal pickup at curb.'
    },
    hazards: ['Broken glass near east wall', 'Heavy lifting required for timber debris'],
    notes: 'Excellent team coordination. Municipal truck arrived at 12:00.',
    isOfflineSaved: false
  }
];

export const mockRecoveryRecords: RecoveryRecord[] = [
  {
    id: 'TRC-REC-2026-001',
    activityId: 'TRC-2026-001',
    referenceId: 'm-2',
    locationName: 'Pine Street Lot',
    baseline: mockFieldActivities[0].baseline!,
    evidence: mockFieldActivities[0].evidence!,
    status: 'verified',
    verificationType: 'ai_assisted_review',
    verifiedAt: '2026-07-25T14:30:00Z'
  }
];

export const mockMonitoringCheckpoints: MonitoringCheckpoint[] = [
  {
    id: 'chk-1',
    recoveryRecordId: 'TRC-REC-2026-001',
    day: 7,
    scheduledDate: '2026-08-01',
    actualDate: '2026-08-01',
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    coordinates: { lat: 40.7150, lng: -74.0100 },
    recurrenceStatus: 'clean',
    estimatedRecurrenceKg: 5,
    cleanlinessScore: 92,
    communityObservation: 'No new dumping observed. Local residents using the cleared pathway daily.',
    notes: 'Weekly volunteer walk-by completed.',
    status: 'completed'
  },
  {
    id: 'chk-2',
    recoveryRecordId: 'TRC-REC-2026-001',
    day: 14,
    scheduledDate: '2026-08-08',
    actualDate: '2026-08-08',
    photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80&w=800',
    coordinates: { lat: 40.7150, lng: -74.0100 },
    recurrenceStatus: 'minor_recurrence',
    estimatedRecurrenceKg: 15,
    cleanlinessScore: 84,
    communityObservation: 'Small pile of food wrappers and plastic beverage bottles accumulated in northeast corner.',
    notes: 'Volunteer picked up the 15kg minor litter during monitoring inspection.',
    status: 'completed'
  },
  {
    id: 'chk-3',
    recoveryRecordId: 'TRC-REC-2026-001',
    day: 30,
    scheduledDate: '2026-08-24',
    recurrenceStatus: 'clean',
    estimatedRecurrenceKg: 0,
    cleanlinessScore: 88,
    status: 'pending'
  },
  {
    id: 'chk-4',
    recoveryRecordId: 'TRC-REC-2026-001',
    day: 60,
    scheduledDate: '2026-09-23',
    recurrenceStatus: 'clean',
    estimatedRecurrenceKg: 0,
    cleanlinessScore: 90,
    status: 'pending'
  },
  {
    id: 'chk-5',
    recoveryRecordId: 'TRC-REC-2026-001',
    day: 90,
    scheduledDate: '2026-10-23',
    recurrenceStatus: 'clean',
    estimatedRecurrenceKg: 0,
    cleanlinessScore: 90,
    status: 'pending'
  }
];

export const mockInterventionSite: InterventionSite = {
  id: 'int-1',
  name: 'Pine Street Lot (Active Intervention)',
  location: 'Pine St & 5th Ave',
  currentScore: 88,
  observations: [
    { period: 'baseline', date: '2026-05-01', wasteKg: 110, cleanlinessScore: 18 },
    { period: 'baseline', date: '2026-06-01', wasteKg: 95, cleanlinessScore: 22 },
    { period: 'baseline', date: '2026-07-01', wasteKg: 105, cleanlinessScore: 15 },
    { period: 'intervention', date: '2026-07-25', wasteKg: 0, cleanlinessScore: 95 },
    { period: 'monitoring', date: '2026-08-01', wasteKg: 5, cleanlinessScore: 92 },
    { period: 'monitoring', date: '2026-08-08', wasteKg: 15, cleanlinessScore: 84 }
  ]
};

export const mockControlSite: ControlSite = {
  id: 'ctrl-1',
  name: 'Oak Street Vacant Alley (Control Site — Unmanaged)',
  location: 'Oak St & 4th Ave (0.6 km away)',
  currentScore: 16,
  observations: [
    { period: 'baseline', date: '2026-05-01', wasteKg: 90, cleanlinessScore: 24 },
    { period: 'baseline', date: '2026-06-01', wasteKg: 100, cleanlinessScore: 20 },
    { period: 'baseline', date: '2026-07-01', wasteKg: 95, cleanlinessScore: 18 },
    { period: 'monitoring', date: '2026-08-01', wasteKg: 105, cleanlinessScore: 16 },
    { period: 'monitoring', date: '2026-08-08', wasteKg: 115, cleanlinessScore: 14 }
  ]
};
