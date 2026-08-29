import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, Leaf, MapPin, Activity, Sparkles, 
  ShieldCheck, CalendarClock, ArrowRight, ArrowUpRight, 
  Link as LinkIcon, Compass, CheckCircle2
} from 'lucide-react';
import { 
  currentUser as mockUser, hotspots as mockHotspots, missions, recentActivities, 
  recoveryTimelines 
} from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { ScoreReveal } from '../components/ui/impact/ImpactMoments';
import { SatelliteMap } from '../components/shared/SatelliteMap';
import { useAuth } from '../hooks/useAuth';
import { hotspotService, type FirestoreHotspot } from '../services/hotspotService';

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();
  const [hotspotsList, setHotspotsList] = useState<FirestoreHotspot[]>([]);

  useEffect(() => {
    const unsubscribe = hotspotService.subscribeToHotspots((data) => {
      setHotspotsList(data);
    });
    return () => unsubscribe();
  }, []);

  const rawHotspots = hotspotsList.length > 0 ? hotspotsList : mockHotspots;
  // Exclude synthetic TEST DATA from real/demo metrics
  const displayHotspots = rawHotspots.filter((h: any) => !h.id?.includes('SMOKETEST') && !h.reporterId?.includes('smoketest') && h.dataSource !== 'TEST DATA');
  const activeMissions = missions.filter(m => !m.id.includes('SMOKETEST') && (m.status === 'active' || m.status === 'upcoming'));
  const recentRecovery = recoveryTimelines[0];

  const displayName = user?.displayName || mockUser.name;
  const firstName = displayName.split(' ')[0] || 'Citizen';
  const impactScore = user?.impactScore ?? mockUser.environmentalScore;
  const dataSource = user?.dataSource || (isDemo ? 'DEMO DATA' : 'FIELD DATA');

  // Stats calculation
  const totalHotspots = displayHotspots.length;
  const criticalHotspots = displayHotspots.filter((h: any) => h.severity === 'critical').length;
  const activeMissionsCount = activeMissions.length;
  const recoveredCount = displayHotspots.filter((h: any) => h.status === 'cleaned' || h.status === 'transformed').length;

  return (
    <motion.div 
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen font-sans transition-colors duration-200"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* 1. HERO / ENVIRONMENTAL IMPACT HEADER */}
      <motion.section 
        variants={itemVariants} 
        className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-forest-950/40 p-6 md:p-8 rounded-3xl border border-neutral-850 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-forest-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono">
                {dataSource}
              </Badge>
              <span className="text-xs font-mono text-neutral-400">ENVIRONMENTAL COMMAND CENTER</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Good day, <span className="text-fresh-400">{firstName}</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 max-w-xl font-sans leading-relaxed">
              Let's recover another place today. Every reported hotspot and completed mission protects community health.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Button 
                size="md" 
                onClick={() => navigate('/report')}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 shadow-lg shadow-forest-600/25"
              >
                Start a Recovery <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button 
                variant="outline" 
                size="md" 
                onClick={() => navigate('/explore')}
                className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-850 font-bold px-6 py-3"
              >
                Explore Hotspots <Compass className="w-4 h-4 ml-1.5 text-fresh-400" />
              </Button>
            </div>
          </div>

          {/* Environmental Impact Score Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 rounded-2xl shrink-0 space-y-3 min-w-[260px] shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase">Impact Score</span>
              <div className="w-8 h-8 rounded-full bg-fresh-500/20 text-fresh-400 flex items-center justify-center border border-fresh-400/30">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-white font-mono flex items-baseline gap-2">
                <ScoreReveal value={impactScore} />
                <span className="text-xs font-sans text-emerald-400 font-bold">+12 this month</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Verified field impact points</p>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>SOURCE:</span>
              <span className="text-fresh-400 font-bold">{dataSource}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. IMPACT OVERVIEW (4 DISTINCT METRICS) */}
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-fresh-400" /> Impact Overview
          </h2>
          <span className="text-xs font-mono text-neutral-400">Strict Data Segregation</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-neutral-900 border-neutral-800 text-white p-5 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <MapPin className="w-5 h-5 text-amber-400" />
              <ImpactBadge type="USER-REPORTED" size="sm" showIcon={false} />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-white">
                <ScoreReveal value={user?.hotspotsReported ?? mockUser.hotspotsReported} />
              </div>
              <p className="text-xs font-medium text-neutral-400 mt-0.5">Hotspots Reported</p>
            </div>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white p-5 flex flex-col justify-between hover:border-yellow-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-5 h-5 text-yellow-400" />
              <ImpactBadge type="USER-REPORTED" size="sm" showIcon={false} />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-white">
                <ScoreReveal value={user?.missionsCompleted ?? mockUser.missionsCompleted} />
              </div>
              <p className="text-xs font-medium text-neutral-400 mt-0.5">Cleanup Missions</p>
            </div>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white p-5 flex flex-col justify-between hover:border-fresh-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <ShieldCheck className="w-5 h-5 text-fresh-400" />
              <ImpactBadge type="ESTIMATED" size="sm" showIcon={false} />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-fresh-400 flex items-baseline gap-1">
                <ScoreReveal value={user?.wasteRemovedKg ?? mockUser.wasteRemovedKg} />
                <span className="text-sm font-sans text-neutral-400 font-normal">kg</span>
              </div>
              <p className="text-xs font-medium text-neutral-400 mt-0.5">Waste Removed</p>
            </div>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <ImpactBadge type="VERIFIED" size="sm" showIcon={false} />
            </div>
            <div>
              <div className="text-3xl font-black font-mono text-emerald-400">
                <ScoreReveal value={user?.locationsRecovered ?? mockUser.locationsRecovered} />
              </div>
              <p className="text-xs font-medium text-neutral-400 mt-0.5">Locations Recovered</p>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* 3. RECOVERY HEALTH PANEL */}
      <motion.section variants={itemVariants} className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 mb-1">
              Field Surveillance Pipeline
            </Badge>
            <h2 className="text-2xl font-black text-white">Environmental Recovery Health</h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">{totalHotspots} Active Tracking Locations</span>
        </div>

        {/* Visual Progress Journey */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3.5 bg-coral-950/40 border border-coral-500/30 rounded-xl space-y-1">
            <span className="text-[10px] text-coral-400 font-bold uppercase">1. Polluted</span>
            <div className="text-2xl font-black text-coral-400">{criticalHotspots}</div>
            <span className="text-[10px] text-neutral-400 block">Critical Hotspots</span>
          </div>

          <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase">2. Active Mission</span>
            <div className="text-2xl font-black text-amber-400">{activeMissionsCount}</div>
            <span className="text-[10px] text-neutral-400 block">In Mobilization</span>
          </div>

          <div className="p-3.5 bg-yellow-950/40 border border-yellow-500/30 rounded-xl space-y-1">
            <span className="text-[10px] text-yellow-400 font-bold uppercase">3. Cleaned</span>
            <div className="text-2xl font-black text-yellow-400">{recoveredCount}</div>
            <span className="text-[10px] text-neutral-400 block">Debris Removed</span>
          </div>

          <div className="p-3.5 bg-fresh-950/40 border border-fresh-500/30 rounded-xl space-y-1">
            <span className="text-[10px] text-fresh-400 font-bold uppercase">4. Verified</span>
            <div className="text-2xl font-black text-fresh-400">1</div>
            <span className="text-[10px] text-neutral-400 block">Pine St Lot</span>
          </div>

          <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1">
            <span className="text-[10px] text-purple-400 font-bold uppercase">5. Protected</span>
            <div className="text-2xl font-black text-purple-400">1</div>
            <span className="text-[10px] text-neutral-400 block">Mini Garden Hub</span>
          </div>
        </div>
      </motion.section>

      {/* 10. NEXT BEST ACTION (RECOMMENDATION BANNER) */}
      <motion.section variants={itemVariants} className="bg-gradient-to-r from-forest-950 via-neutral-900 to-neutral-950 border border-forest-500/40 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-900/60 border border-fresh-400 flex items-center justify-center text-fresh-400 shrink-0 mt-1">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-fresh-400 uppercase tracking-wider">Your Next Best Action</span>
            <h3 className="text-lg font-bold text-white">3 high-impact hotspots are within 2 km of your location</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Mission #TRC-REC-2026-001 at Pine Street Lot requires 2 more volunteers to complete its recovery pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Button onClick={() => navigate('/missions')} className="w-full md:w-auto bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 px-5">
            Join Cleanup Mission <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </motion.section>

      {/* GRID: ACTIVE MISSIONS & NEARBY HOTSPOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 4. ACTIVE MISSIONS */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-400" /> Action Needed Nearby
            </h2>
            <Link to="/missions" className="text-xs font-bold text-fresh-400 hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {activeMissions.length > 0 ? (
              activeMissions.map(mission => {
                const hotspot = displayHotspots.find(h => h.id === mission.hotspotId);
                return (
                  <Card key={mission.id} className="bg-neutral-900 border-neutral-800 text-white p-5 hover:border-forest-500/50 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="warning" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[10px] uppercase font-mono">
                        {mission.status}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-fresh-400 bg-fresh-950/60 px-2.5 py-1 rounded-lg border border-fresh-500/30">
                        +{mission.points} pts
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{mission.title}</h3>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" /> {hotspot?.location || 'Pine Street Lot'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Category</span>
                        <span className="text-neutral-200 capitalize">{hotspot?.category || 'mixed'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Est. Waste</span>
                        <span className="text-neutral-200">{hotspot?.estimatedWaste || '105 kg'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Volunteers</span>
                        <span className="text-fresh-400 font-bold">{mission.volunteersRegistered.length}/{mission.volunteersNeeded}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => navigate(`/missions/${mission.id}`)}
                      className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-2.5"
                    >
                      View Mission Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Card>
                );
              })
            ) : (
              <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <CheckCircle2 className="w-8 h-8 text-fresh-400 mx-auto" />
                <p className="text-xs text-neutral-400">No active missions nearby right now.</p>
                <Button size="sm" onClick={() => navigate('/explore')} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs">
                  Explore Hotspots
                </Button>
              </div>
            )}
          </div>
        </motion.section>

        {/* 5. RECENT RECOVERIES (BEFORE / AFTER CARDS) */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-fresh-400" /> Recent Recoveries
            </h2>
            <Link to="/timeline" className="text-xs font-bold text-fresh-400 hover:underline">View Timeline</Link>
          </div>

          <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden space-y-4">
            <div className="grid grid-cols-2 h-44 relative border-b border-neutral-800">
              <div className="relative">
                <img src={recentRecovery.beforeImage} className="w-full h-full object-cover filter grayscale" alt="Before" />
                <span className="absolute top-2 left-2 bg-neutral-950/80 text-coral-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-coral-500/30">
                  BEFORE
                </span>
              </div>
              <div className="relative">
                <img src={recentRecovery.afterImage} className="w-full h-full object-cover" alt="After" />
                <span className="absolute top-2 right-2 bg-neutral-950/80 text-fresh-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-fresh-500/30">
                  AFTER
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Pine Street Vacant Lot</h3>
                <ImpactBadge type="VERIFIED" size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Waste Removed</span>
                  <span className="text-fresh-400 font-bold">{recentRecovery.wasteRemoved}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Score Improvement</span>
                  <span className="text-emerald-400 font-bold">+{recentRecovery.scoreImprovement}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Date</span>
                  <span className="text-neutral-300">July 2026</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => navigate('/timeline')}
                className="w-full border-neutral-700 bg-neutral-850 hover:bg-neutral-800 text-white text-xs font-bold py-2.5"
              >
                View Recovery Timeline <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </motion.section>
      </div>

      {/* 6. AI PREVENTION RECOMMENDATION */}
      <motion.section variants={itemVariants} className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-purple-950/40 border border-purple-500/30 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-[10px]">
                AI-ASSISTED
              </Badge>
              <ImpactBadge type="PROJECTED" size="sm" />
            </div>
            <h2 className="text-2xl font-black text-white">Prevent the Next Dump</h2>
          </div>
          <Button 
            onClick={() => navigate('/prevention/rec-1')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-4 shrink-0"
          >
            Explore Transformation <Sparkles className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800">
            <span className="text-neutral-500 block text-[10px] uppercase">Location & Risk</span>
            <span className="text-white font-bold block mt-1">Pine Street Lot</span>
            <span className="text-coral-400 font-bold block mt-0.5">High Recurrence Risk — 78%</span>
          </div>

          <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800">
            <span className="text-neutral-500 block text-[10px] uppercase">AI Recommendation</span>
            <span className="text-purple-300 font-bold block mt-1">Community Mini Garden</span>
            <span className="text-neutral-400 block mt-0.5">Raised planter barrier</span>
          </div>

          <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800">
            <span className="text-neutral-500 block text-[10px] uppercase">Projected Impact</span>
            <span className="text-fresh-400 font-bold block text-lg mt-1">65% Lower Repeat Dumping</span>
            <span className="text-neutral-400 block mt-0.5">Econometric model</span>
          </div>
        </div>
      </motion.section>

      {/* GRID: RECOVERY MAP PREVIEW & YOUR CHAIN & LIVE COMMUNITY ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 8. RECOVERY MAP PREVIEW */}
        <motion.section variants={itemVariants} className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-fresh-400" /> Recovery Map
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">{displayHotspots.length} Pins Active</span>
          </div>

          <div className="h-56 rounded-2xl overflow-hidden border border-neutral-800 relative">
            <SatelliteMap items={displayHotspots} />
          </div>

          <Button onClick={() => navigate('/explore')} className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-2.5">
            Open Full Map <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.section>

        {/* 9. YOUR CHAIN */}
        <motion.section variants={itemVariants} className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-amber-400" /> Your Recovery Chain
            </h3>
            <span className="text-[10px] font-mono text-amber-400 font-bold">4 Links Connected</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-850">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-fresh-500/20 text-fresh-400 font-bold text-[10px] flex items-center justify-center border border-fresh-400/30">01</span>
                <span className="text-white">Hotspot Report</span>
              </div>
              <span className="text-fresh-400 font-bold">COMPLETED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-850">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center border border-amber-400/30">02</span>
                <span className="text-white">Mission Participated</span>
              </div>
              <span className="text-amber-400 font-bold">COMPLETED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-850">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-[10px] flex items-center justify-center border border-purple-400/30">03</span>
                <span className="text-white">Field Mode Weigh-In</span>
              </div>
              <span className="text-purple-400 font-bold">COMPLETED</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Places Recovered: <strong className="text-white font-mono">4</strong></span>
            <span>Streak: <strong className="text-fresh-400 font-mono">3 Weeks</strong></span>
          </div>
        </motion.section>

        {/* 7. LIVE COMMUNITY ACTIVITY */}
        <motion.section variants={itemVariants} className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-purple-400" /> Community Pulse
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">Live Activity</span>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <img src={act.userAvatar} alt={act.userName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-neutral-200 leading-snug">
                    <strong className="text-white font-bold">{act.userName}</strong> {act.action}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">{act.location} • {act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>

    </motion.div>
  );
}
