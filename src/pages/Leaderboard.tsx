import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Lock, Eye } from 'lucide-react';
import { leaderboard, currentUser } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

const CATEGORIES = ['Individuals', 'Colleges', 'Communities', 'Organizations'];

export default function Leaderboard() {
  const { user: authUser, isDemo } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Individuals');

  // Exclude synthetic test user accounts from public leaderboard rankings
  const cleanLeaderboard = leaderboard.filter(u => !u.id.includes('smoketest') && !u.id.includes('test_user_'));
  const leaders = [
    { 
      ...currentUser, 
      id: authUser?.uid || currentUser.id, 
      name: authUser?.displayName || currentUser.name, 
      rankIndex: 1, 
      verifiedRecoveries: 3, 
      measuredWaste: '180 kg', 
      chainLength: '4 Links', 
      isCurrent: true,
      publicProfile: authUser?.publicProfile ?? true
    },
    ...cleanLeaderboard.slice(1).map((u, i) => ({
      ...u,
      rankIndex: i + 2,
      verifiedRecoveries: 4 - (i % 3),
      measuredWaste: `${450 - i * 60} kg`,
      chainLength: `${5 - (i % 3)} Links`,
      isCurrent: false,
      publicProfile: i % 4 !== 3 // Every 4th rank simulates a private profile for testing
    }))
  ];

  return (
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
              Recognition for people turning action into measurable environmental recovery.
            </p>
          </div>

          {/* YOUR POSITION CARD */}
          <div className="bg-neutral-900 border border-forest-500/40 p-4 rounded-2xl shrink-0 flex items-center gap-4 font-mono">
            <div className="w-12 h-12 rounded-xl bg-forest-950 text-fresh-400 border border-fresh-500/40 flex items-center justify-center font-black text-lg">
              #1
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">YOUR POSITION</span>
              <span className="font-bold text-white text-sm">Top 1% in Local Region</span>
              <span className="text-[10px] text-fresh-400 block font-bold">1,450 Impact Pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* 2. COMMUNITY IMPACT BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[9px] uppercase">PEOPLE MOBILIZED</span>
            <span className="text-2xl font-black text-white">184 Volunteers</span>
            <span className="text-[9px] text-neutral-500 block">FIELD PARTICIPANTS</span>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[9px] uppercase">PLACES RECOVERED</span>
            <span className="text-2xl font-black text-fresh-400">42 Sites</span>
            <span className="text-[9px] text-neutral-500 block">VERIFIED RECOVERIES</span>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[9px] uppercase">MONITORING CHECKS</span>
            <span className="text-2xl font-black text-yellow-400">128 Inspection Checkpoints</span>
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
        <div className="space-y-3 font-mono text-xs">
          {leaders.map((user) => (
            <Card 
              key={user.id} 
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

                {/* Avatar */}
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className={cn(
                    "w-11 h-11 rounded-full object-cover shrink-0",
                    user.isCurrent && "ring-2 ring-fresh-400"
                  )}
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
                    {!user.publicProfile && (
                      <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> PRIVATE PROFILE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 font-mono truncate">{user.rank}</p>
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
          ))}
        </div>

      </div>
    </div>
  );
}
