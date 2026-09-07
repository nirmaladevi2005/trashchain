import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Lock, Eye } from 'lucide-react';
import { leaderboard, currentUser } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { PageTransition } from '../components/ui/PageTransition';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

const CATEGORIES = ['Individuals', 'Colleges', 'Communities', 'Organizations'];

function getInitials(name: string): string {
  if (!name) return 'TC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function LeaderboardUserAvatar({
  photoURL,
  avatar,
  name,
  isCurrent
}: {
  photoURL?: string;
  avatar?: string;
  name: string;
  isCurrent?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = !imageFailed ? (photoURL || avatar) : undefined;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImageFailed(true)}
        className={cn(
          "w-11 h-11 rounded-full object-cover shrink-0 bg-neutral-800",
          isCurrent && "ring-2 ring-fresh-400"
        )}
      />
    );
  }

  return (
    <div className={cn(
      "w-11 h-11 rounded-full bg-forest-950 border border-fresh-500/40 text-fresh-400 font-black flex items-center justify-center text-xs shrink-0 font-mono",
      isCurrent && "ring-2 ring-fresh-400"
    )}>
      {getInitials(name)}
    </div>
  );
}

export default function Leaderboard() {
  const { user: authUser, isDemo } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Individuals');

  const cleanLeaderboard = leaderboard.filter(u => !u.id.includes('smoketest') && !u.id.includes('test_user_'));
  const isCurrentUserPublic = authUser?.publicProfile === true;

  const currentUserEntry = (isCurrentUserPublic && authUser) ? {
    id: authUser.uid || 'demo-user-1',
    name: authUser.displayName || 'Alex Chen',
    avatar: authUser.photoURL || currentUser.avatar,
    photoURL: authUser.photoURL,
    environmentalScore: authUser.impactScore ?? 742,
    rank: authUser.role || 'Eco Guardian',
    participantType: authUser.participantType || 'Individual Citizen',
    institutionName: authUser.institutionName || authUser.organization,
    verifiedRecoveries: authUser.locationsRecovered ?? 4,
    measuredWaste: `${authUser.wasteRemovedKg ?? 340} kg`,
    chainLength: `${authUser.missionsCompleted ?? 4} Links`,
    isCurrent: true,
    publicProfile: true,
  } : null;

  const seedUsers = cleanLeaderboard
    .filter(u => u.id !== 'u-1' && u.id !== 'demo-user-1' && u.id !== authUser?.uid)
    .map((u, i) => ({
      ...u,
      photoURL: u.avatar,
      verifiedRecoveries: u.locationsRecovered || (4 - (i % 3)),
      measuredWaste: `${u.wasteRemovedKg || (450 - i * 60)} kg`,
      chainLength: `${u.missionsCompleted || (5 - (i % 3))} Links`,
      isCurrent: false,
      publicProfile: true,
    }));

  const rawUsers = currentUserEntry ? [currentUserEntry, ...seedUsers] : seedUsers;

  const leaders = [...rawUsers]
    .sort((a, b) => b.environmentalScore - a.environmentalScore)
    .map((u, index) => ({
      ...u,
      rankIndex: index + 1
    }));

  const currentUserRankItem = leaders.find(u => u.isCurrent);
  const currentUserRank = currentUserRankItem ? currentUserRankItem.rankIndex : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-28">
      
      {/* 1. HEADER */}
      <div className="bg-neutral-950 border-b border-neutral-850 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                {isDemo ? 'DEMO DATA' : 'FIELD DATA'}
              </Badge>
              <span className="text-xs font-mono text-neutral-500">VERIFIED ACTION RANKINGS</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <Trophy className="w-9 h-9 text-amber-400" /> Recovery Leaders
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl font-sans">
              Recognition for community members turning field action into verified environmental recovery.
            </p>
          </div>

          {/* YOUR POSITION CARD */}
          <div className="bg-neutral-900 border border-forest-500/40 p-4 rounded-2xl shrink-0 flex items-center gap-4 font-mono">
            <div className="w-12 h-12 rounded-xl bg-forest-950 text-fresh-400 border border-fresh-500/40 flex items-center justify-center font-black text-lg">
              {isCurrentUserPublic && currentUserRank ? `#${currentUserRank}` : 'OFF'}
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">YOUR LEADERBOARD STATUS</span>
              <span className="font-bold text-white text-sm">
                {isCurrentUserPublic && currentUserRank ? `Publicly Listed (Rank #${currentUserRank})` : 'Private Profile (Hidden)'}
              </span>
              <span className="text-[10px] text-fresh-400 block font-bold">
                {isCurrentUserPublic ? `${authUser?.impactScore ?? 742} Impact Pts` : 'Enable Public Profile in Settings'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* PRIVATE PROFILE NOTICE BANNER */}
        {!isCurrentUserPublic && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-200 block">Your Profile is Currently Private</span>
                <span className="text-[11px] text-amber-300/80">Enable "Public Profile Visibility" in Account Settings to join the public community leaderboard.</span>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold shrink-0 transition-colors"
            >
              Open Settings
            </Link>
          </div>
        )}

        {/* 2. COMMUNITY IMPACT BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[9px] uppercase">PEOPLE MOBILIZED</span>
            <span className="text-2xl font-black text-white"><AnimatedCounter value={184} suffix=" Volunteers" /></span>
            <span className="text-[9px] text-neutral-500 block">FIELD PARTICIPANTS</span>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[9px] uppercase">PLACES RECOVERED</span>
            <span className="text-2xl font-black text-fresh-400"><AnimatedCounter value={42} suffix=" Sites" /></span>
            <span className="text-[9px] text-neutral-500 block">VERIFIED RECOVERIES</span>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[9px] uppercase">MONITORING CHECKS</span>
            <span className="text-2xl font-black text-yellow-400"><AnimatedCounter value={128} suffix=" Inspection Checkpoints" /></span>
            <span className="text-[9px] text-neutral-500 block">POST-CLEANUP</span>
          </div>
        </div>

        {/* 3. CATEGORY TABS */}
        <div className="flex items-center gap-2 border-b border-neutral-850 pb-3 overflow-x-auto scrollbar-none font-mono text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap",
                activeCategory === cat ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. RANKINGS ROWS */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } }
          }}
          initial="hidden"
          animate="show"
          className="space-y-3 font-mono text-xs"
        >
          {leaders.map((user) => (
            <motion.div
              key={user.id}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{ y: -4, scale: 1.005, transition: { duration: 0.18, ease: 'easeOut' } }}
            >
              <Card
                className={cn(
                  "bg-neutral-900 border-neutral-800 text-white p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:border-neutral-700",
                  user.isCurrent && "border-fresh-500/50 bg-forest-950/30 ring-1 ring-fresh-500/30"
                )}
              >
              <div className="flex items-center gap-4">
                
                {/* Rank Badge */}
                <div className="w-10 text-center shrink-0">
                  {user.rankIndex === 1 && <Medal className="w-7 h-7 text-amber-400 mx-auto" />}
                  {user.rankIndex === 2 && <Medal className="w-7 h-7 text-neutral-300 mx-auto" />}
                  {user.rankIndex === 3 && <Medal className="w-7 h-7 text-amber-600 mx-auto" />}
                  {user.rankIndex > 3 && <span className="text-base font-bold text-neutral-500">#{user.rankIndex}</span>}
                </div>

                {/* Avatar with fallback */}
                <LeaderboardUserAvatar
                  photoURL={user.photoURL}
                  avatar={user.avatar}
                  name={user.name}
                  isCurrent={user.isCurrent}
                />

                {/* User Details */}
                <div className="flex-1 min-w-0 font-sans">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-sm truncate">{user.name}</h3>
                    {user.isCurrent && (
                      <span className="text-[9px] font-mono font-bold bg-fresh-500/20 text-fresh-300 px-2 py-0.5 rounded border border-fresh-500/30">
                        YOU
                      </span>
                    )}
                    {(user.participantType || (user as any).category) && (
                      <span className="text-[9px] font-mono font-bold bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                        {user.participantType || (user as any).category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 font-mono truncate">
                    {user.rank}{user.institutionName ? ` • ${user.institutionName}` : ''}
                  </p>
                </div>

                {/* Verified Metrics */}
                <div className="hidden md:flex items-center gap-6 shrink-0 font-mono">
                  <div className="text-center">
                    <span className="text-[9px] text-neutral-500 block">RECOVERIES</span>
                    <span className="font-bold text-fresh-400 text-sm">{user.verifiedRecoveries} Sites</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-neutral-500 block">WASTE REMOVED</span>
                    <span className="font-bold text-white text-sm">{user.measuredWaste}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-neutral-500 block">CHAIN</span>
                    <span className="font-bold text-yellow-400 text-sm">{user.chainLength}</span>
                  </div>
                </div>

                {/* Score & Profile CTA */}
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-fresh-400 block">+{user.environmentalScore} Pts</span>
                    <ImpactBadge type="VERIFIED" size="sm" />
                  </div>

                  <Link
                    to={`/profile/${user.id}`}
                    aria-label={`View public profile of ${user.name}`}
                    className="px-3 py-2 rounded-xl bg-forest-600/20 hover:bg-forest-600/40 border border-forest-500/40 text-fresh-400 font-mono text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View Profile</span>
                  </Link>
                </div>

              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      </div>
    </div>
    </PageTransition>
  );
}
