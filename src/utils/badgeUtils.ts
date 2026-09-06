export interface BadgeItem {
  id: string;
  title: string;
  name?: string;
  desc: string;
  description?: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  category?: string;
}

export interface UserBadgeStats {
  reportsSubmitted?: number;
  hotspotsReported?: number;
  missionsJoined?: number;
  missionsOrganized?: number;
  missionsCompleted?: number;
  wasteRemovedKg?: number;
  locationsRecovered?: number;
  verifiedRecoveries?: number;
  locationsTransformed?: number;
  chainLength?: number;
  createdAt?: string;
}

/**
  Calculate all environmental badges and their earned state based on user activity statistics.
 */
export function calculateUserBadges(stats: UserBadgeStats): BadgeItem[] {
  const reports = (stats.reportsSubmitted ?? 0) || (stats.hotspotsReported ?? 0);
  const completed = (stats.missionsCompleted ?? 0);
  const joined = (stats.missionsJoined ?? 0) || completed;
  const organized = (stats.missionsOrganized ?? 0);
  const waste = (stats.wasteRemovedKg ?? 0);
  const recovered = (stats.locationsRecovered ?? 0) || (stats.verifiedRecoveries ?? 0);
  const transformed = (stats.locationsTransformed ?? 0);
  const chain = (stats.chainLength ?? 0) || recovered;

  const allBadges: BadgeItem[] = [
    {
      id: 'badge-first-report',
      title: 'First Report',
      name: 'First Report',
      desc: 'Submitted your first pollution hotspot report.',
      description: 'Submitted your first pollution hotspot report.',
      icon: '📍',
      earned: reports >= 1,
      category: 'Reporting'
    },
    {
      id: 'badge-cleanup-starter',
      title: 'Cleanup Starter',
      name: 'Cleanup Starter',
      desc: 'Participated in your first community cleanup mission.',
      description: 'Participated in your first community cleanup mission.',
      icon: '🧹',
      earned: joined >= 1 || completed >= 1,
      category: 'Action'
    },
    {
      id: 'badge-mission-leader',
      title: 'Mission Leader',
      name: 'Mission Leader',
      desc: 'Organized a community cleanup mission to mobilize local volunteers.',
      description: 'Organized a community cleanup mission to mobilize local volunteers.',
      icon: '👥',
      earned: organized >= 1,
      category: 'Leadership'
    },
    {
      id: 'badge-community-builder',
      title: 'Community Builder',
      name: 'Community Builder',
      desc: 'Participated in 3 or more community cleanup missions.',
      description: 'Participated in 3 or more community cleanup missions.',
      icon: '🤝',
      earned: completed >= 3 || joined >= 3,
      category: 'Community'
    },
    {
      id: 'badge-waste-warrior',
      title: 'Waste Warrior',
      name: 'Waste Warrior',
      desc: 'Cleared 100 kg or more of waste from polluted environments.',
      description: 'Cleared 100 kg or more of waste from polluted environments.',
      icon: '⚡',
      earned: waste >= 100,
      category: 'Impact'
    },
    {
      id: 'badge-recovery-champion',
      title: 'Recovery Champion',
      name: 'Recovery Champion',
      desc: 'Verified recovery and cleanup of a polluted location.',
      description: 'Verified recovery and cleanup of a polluted location.',
      icon: '🛡️',
      earned: recovered >= 1,
      category: 'Recovery'
    },
    {
      id: 'badge-transformation-hero',
      title: 'Transformation Hero',
      name: 'Transformation Hero',
      desc: 'Helped transform a recovered hotspot into a vibrant green space.',
      description: 'Helped transform a recovered hotspot into a vibrant green space.',
      icon: '🌱',
      earned: transformed >= 1,
      category: 'Transformation'
    },
    {
      id: 'badge-chain-builder',
      title: 'Chain Builder',
      name: 'Chain Builder',
      desc: 'Contributed across multiple stages of the TrashChain recovery lifecycle.',
      description: 'Contributed across multiple stages of the TrashChain recovery lifecycle.',
      icon: '🔗',
      earned: chain >= 3 || (reports >= 1 && completed >= 1 && recovered >= 1),
      category: 'Lifecycle'
    }
  ];

  return allBadges;
}

/**
 * Returns only earned badges for a user based on statistics.
 */
export function getEarnedBadges(stats: UserBadgeStats): BadgeItem[] {
  return calculateUserBadges(stats).filter(b => b.earned);
}
