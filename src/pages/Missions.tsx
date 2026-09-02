import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MapPin, Users, ShieldCheck, Filter, 
  ArrowUpDown, Clock, Leaf, Target, ArrowRight,
  PlusCircle, Sparkles, X, CheckCircle2
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { EmptyState } from '../components/shared/States';
import { hotspotService, type FirestoreHotspot } from '../services/hotspotService';
import { missionService, type FirestoreMission } from '../services/missionService';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../lib/firebase';

const FILTERS = ['All', 'Nearby', 'Critical', 'Plastic', 'Mixed Waste', 'Organic', 'My Missions', 'Completed'];
const SORTS = ['Highest Impact', 'Nearest', 'Most Urgent', 'Newest'];

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

export default function Missions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isDemo, isDemoSession } = useAuth();

  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Highest Impact');

  // Real-time Hotspots & Missions state
  const [allHotspots, setAllHotspots] = useState<FirestoreHotspot[]>([]);
  const [allMissions, setAllMissions] = useState<FirestoreMission[]>([]);

  // Mission creation modal state
  const [selectedHotspotForMission, setSelectedHotspotForMission] = useState<FirestoreHotspot | null>(null);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionDate, setMissionDate] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState(15);
  const [isCreatingMission, setIsCreatingMission] = useState(false);
  const [creationSuccessMessage, setCreationSuccessMessage] = useState<string | null>(null);

  // Subscribe to Hotspots & Missions
  useEffect(() => {
    const unsubscribeHotspots = hotspotService.subscribeToHotspots((hList) => {
      setAllHotspots(hList);
    });

    const unsubscribeMissions = missionService.subscribeToMissions((mList) => {
      setAllMissions(mList);
    });

    return () => {
      unsubscribeHotspots();
      unsubscribeMissions();
    };
  }, []);

  // Candidate hotspots that need action:
  // 1. Not closed/resolved/cleaned/transformed
  // 2. Not already associated with an active mission
  const reportedPlacesNeedingAction = useMemo(() => {
    return allHotspots.filter(h => {
      const isClosed = h.status === 'cleaned' || h.status === 'transformed';
      const hasActiveMission = allMissions.some(m => m.hotspotId === h.id);
      return !isClosed && !hasActiveMission;
    });
  }, [allHotspots, allMissions]);

  // Combine missions with hotspot data for filtering/sorting
  const enrichedMissions = useMemo(() => {
    return allMissions.map(mission => ({
      ...mission,
      hotspot: allHotspots.find(h => h.id === mission.hotspotId)
    })).filter(m => m.hotspot);
  }, [allMissions, allHotspots]);

  // Handle URL pre-selection query param e.g. /missions?startMissionFor=field-hotspot-123
  useEffect(() => {
    const targetHotspotId = searchParams.get('startMissionFor') || searchParams.get('hotspotId');
    if (targetHotspotId && allHotspots.length > 0) {
      const found = allHotspots.find(h => h.id === targetHotspotId);
      if (found) {
        handleOpenStartMissionModal(found);
      }
    }
  }, [searchParams, allHotspots]);

  const handleOpenStartMissionModal = (hotspot: FirestoreHotspot) => {
    setSelectedHotspotForMission(hotspot);
    setMissionTitle(`Recovery Mission: ${hotspot.location || hotspot.title}`);
    setMissionDesc(
      hotspot.aiAnalysis?.immediateAction ||
      hotspot.description ||
      `Community recovery mission to clean up and restore ${hotspot.location}.`
    );
    // Default recommended date: 3 days from today
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    setMissionDate(futureDate);
    setVolunteersNeeded(15);
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotspotForMission || isCreatingMission) return;

    setIsCreatingMission(true);
    try {
      const isDemoSessionActive = isDemoMode() || isDemo || isDemoSession || user?.dataSource === 'DEMO DATA';
      const organizerId = user?.uid || 'demo-user-1';

      await missionService.createMissionFromHotspot(
        selectedHotspotForMission.id,
        missionTitle,
        missionDesc,
        missionDate,
        organizerId,
        isDemoSessionActive
      );

      setCreationSuccessMessage(`Mission created for ${selectedHotspotForMission.location}!`);
      setSelectedHotspotForMission(null);

      // Clean up URL query parameters if present
      if (searchParams.has('startMissionFor') || searchParams.has('hotspotId')) {
        searchParams.delete('startMissionFor');
        searchParams.delete('hotspotId');
        setSearchParams(searchParams);
      }

      setTimeout(() => setCreationSuccessMessage(null), 4000);
    } catch (err) {
      console.error('[Missions] Failed to create mission:', err);
    } finally {
      setIsCreatingMission(false);
    }
  };

  // Compute live counts
  const stats = useMemo(() => {
    return {
      active: enrichedMissions.filter(m => m.status === 'active' || m.status === 'upcoming').length,
      volunteers: enrichedMissions.reduce((acc, m) => acc + m.volunteersRegistered.length, 0),
      critical: enrichedMissions.filter(m => m.hotspot?.severity === 'critical').length,
      needingAction: reportedPlacesNeedingAction.length,
    };
  }, [enrichedMissions, reportedPlacesNeedingAction]);

  // Apply filters
  let filteredMissions = enrichedMissions.filter((mission) => {
    const currentUserId = user?.uid || currentUser.id;
    const isMine = mission.volunteersRegistered.includes(currentUserId) || mission.organizerId === currentUserId;
    if (activeFilter === 'My Missions') return isMine;
    if (activeFilter === 'Completed') return mission.status === 'verified' || mission.status === 'completed';
    
    if (activeFilter === 'Nearby') return parseFloat(mission.hotspot!.distance) < 2.0;
    if (activeFilter === 'Critical') return mission.hotspot!.severity === 'critical';
    if (activeFilter === 'Plastic') return mission.hotspot!.category === 'plastic';
    if (activeFilter === 'Mixed Waste') return mission.hotspot!.category === 'mixed';
    if (activeFilter === 'Organic') return mission.hotspot!.category === 'organic';
    
    return true; // 'All'
  });

  // Apply sorting
  filteredMissions = filteredMissions.sort((a, b) => {
    if (activeSort === 'Nearest') return parseFloat(a.hotspot!.distance) - parseFloat(b.hotspot!.distance);
    if (activeSort === 'Highest Impact') return b.points - a.points;
    if (activeSort === 'Newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (activeSort === 'Most Urgent') {
      const severityScore = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityScore[b.hotspot!.severity] - severityScore[a.hotspot!.severity];
    }
    return 0;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-neutral-950 text-neutral-100 min-h-screen font-sans">
      
      {/* SUCCESS NOTIFICATION TOAST */}
      <AnimatePresence>
        {creationSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-forest-950 border border-fresh-400 text-fresh-300 p-4 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-fresh-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Recovery Mission Active</p>
              <p className="text-[11px] text-neutral-300">{creationSuccessMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. DISCOVERY HEADER */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                {isDemoMode() || isDemo ? 'DEMO MISSION NETWORK' : 'LIVE MISSION NETWORK'}
              </Badge>
              <span className="text-xs font-mono text-neutral-500">COMMUNITY DISPATCH</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <Target className="w-8 h-8 text-yellow-400" /> Cleanup Missions
            </h1>
            <p className="text-sm text-neutral-400 max-w-2xl font-sans">
              Real places. Real people. Real environmental recovery. Join an active mission or lead a cleanup for a reported hotspot.
            </p>
          </div>

          {/* Network Summary Bar */}
          <div className="flex items-center gap-3 font-mono text-xs bg-neutral-900 border border-neutral-800 p-3 rounded-2xl shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-yellow-400 block uppercase">Active</span>
              <span className="font-bold text-white text-base">{stats.active}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-fresh-400 block uppercase">Needs Action</span>
              <span className="font-bold text-white text-base">{stats.needingAction}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-purple-400 block uppercase">Volunteers</span>
              <span className="font-bold text-white text-base">{stats.volunteers}</span>
            </div>
          </div>
        </motion.div>

        {/* 2. REPORTED PLACES NEEDING ACTION (CANDIDATE HOTSPOTS) */}
        {reportedPlacesNeedingAction.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono uppercase">
                    REPORTED PLACES NEEDING ACTION
                  </Badge>
                  <span className="text-xs font-mono text-neutral-500">HOTSPOT CANDIDATES</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">Pollution Hotspots Looking for Mission Leaders</h2>
              </div>
              <span className="text-xs font-mono text-neutral-400 hidden sm:block">
                {reportedPlacesNeedingAction.length} place{reportedPlacesNeedingAction.length > 1 ? 's' : ''} awaiting community action
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reportedPlacesNeedingAction.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="bg-neutral-900 border border-amber-500/30 hover:border-amber-500/60 rounded-3xl overflow-hidden p-5 flex flex-col justify-between transition-all duration-300 shadow-xl space-y-4 relative"
                >
                  <div className="space-y-3">
                    {/* Header Image & Badges */}
                    <div className="h-40 relative rounded-2xl overflow-hidden bg-neutral-950">
                      <img
                        src={hotspot.images?.[0] || hotspot.beforePhotoUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800'}
                        alt={hotspot.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="outline" className="bg-neutral-950/80 text-[10px] font-mono text-neutral-300 border-neutral-700">
                          {hotspot.dataSource}
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge variant={hotspot.severity === 'critical' ? 'danger' : 'default'} className="uppercase shadow-md bg-neutral-950/80 backdrop-blur-md">
                          {hotspot.severity}
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] font-mono text-amber-400 block uppercase">Reported Place</span>
                        <h3 className="text-base font-bold text-white line-clamp-1">{hotspot.title}</h3>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 font-mono text-xs">
                      <p className="text-neutral-300 flex items-center text-xs">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{hotspot.location}</span>
                      </p>

                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 rounded border border-neutral-850 capitalize">
                          {hotspot.category} waste
                        </span>
                        <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 rounded border border-neutral-850">
                          {hotspot.estimatedWaste}
                        </span>
                        <span className="px-2 py-0.5 bg-neutral-950 text-neutral-400 rounded border border-neutral-850">
                          Reported: {hotspot.reportedAt.split('T')[0]}
                        </span>
                      </div>

                      {((hotspot.aiAnalysis as any)?.summary || hotspot.aiAnalysis?.risk || hotspot.aiAnalysis?.immediateAction) && (
                        <p className="text-[11px] font-sans text-neutral-400 line-clamp-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                          <span className="text-purple-400 font-mono font-bold block text-[9px] uppercase">AI SCENE SUMMARY</span>
                          {(hotspot.aiAnalysis as any)?.summary || hotspot.aiAnalysis?.risk || hotspot.aiAnalysis?.immediateAction}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <Button
                    onClick={() => handleOpenStartMissionModal(hotspot)}
                    className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 flex items-center justify-center gap-1.5 font-mono shadow-md"
                  >
                    <PlusCircle className="w-4 h-4 text-fresh-400" /> Start Recovery Mission
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. FILTERS & SORTING */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2 sticky top-0 bg-neutral-950/90 backdrop-blur z-20">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none font-mono text-xs flex-1">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0 mr-1 hidden md:block" />
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all",
                  activeFilter === filter
                    ? "bg-forest-600 border-forest-500 text-white shadow-md"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <ArrowUpDown className="w-4 h-4 text-neutral-500" />
            <select
              className="bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl focus:border-forest-500 block p-2.5 font-bold outline-none cursor-pointer"
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
            >
              {SORTS.map(sort => (
                <option key={sort} value={sort}>{sort}</option>
              ))}
            </select>
          </div>
        </motion.div>
      </motion.div>

      {/* 4. ACTIVE MISSION GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredMissions.map(({ hotspot, ...mission }) => (
          <motion.div 
            key={mission.id} 
            variants={itemVariants} 
            className="group bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden hover:border-forest-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative"
          >
            
            {/* Status Ribbon */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Badge variant={hotspot?.severity === 'critical' ? 'danger' : 'default'} className="uppercase shadow-md bg-neutral-950/80 backdrop-blur-md">
                {hotspot?.severity} Severity
              </Badge>
              <Badge variant="warning" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 uppercase shadow-md backdrop-blur-md text-[10px] font-mono">
                {mission.status}
              </Badge>
            </div>

            {/* Header Image */}
            <div className="h-48 relative overflow-hidden bg-neutral-950">
              <img
                src={hotspot?.images[0] || hotspot?.beforePhotoUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80f4173?auto=format&fit=crop&q=80&w=800'}
                alt={hotspot?.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 space-y-0.5">
                <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-fresh-400 transition-colors">{mission.title}</h3>
                <p className="text-xs font-medium text-neutral-300 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-neutral-400" /> {hotspot?.location} • {hotspot?.distance}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col space-y-4">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 rounded border border-neutral-800 capitalize">
                  {hotspot?.category} waste
                </span>
                <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 rounded border border-neutral-800 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1 text-neutral-400" /> {hotspot?.estimatedWaste}
                </span>
                <span className="px-2 py-0.5 bg-fresh-950/60 text-fresh-400 font-bold rounded border border-fresh-500/30 flex items-center ml-auto">
                  <Leaf className="w-3 h-3 mr-1" /> +{mission.points} Pts
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400 font-medium flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-neutral-500" /> Volunteers</span>
                    <span className="font-bold text-white">{mission.volunteersRegistered.length} / {mission.volunteersNeeded}</span>
                  </div>
                  <div className="h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                    <div 
                      className="h-full bg-gradient-to-r from-forest-500 to-fresh-400 rounded-full" 
                      style={{ width: `${Math.min(100, (mission.volunteersRegistered.length / mission.volunteersNeeded) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center text-xs text-neutral-400 font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Recommended: {new Date(mission.date).toLocaleDateString()}
                </div>
              </div>

              <div className="pt-2 mt-auto">
                <Button 
                  onClick={() => navigate(`/missions/${mission.id}`)}
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3"
                >
                  View Mission Details <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredMissions.length === 0 && (
        <motion.div variants={itemVariants} className="pt-12">
          <EmptyState 
            title="No missions found" 
            description="We couldn't find any active missions matching your current filter."
            action={<Button variant="outline" onClick={() => setActiveFilter('All')}>View All Missions</Button>}
          />
        </motion.div>
      )}

      {/* 5. START MISSION MODAL FOR CANDIDATE HOTSPOT */}
      <AnimatePresence>
        {selectedHotspotForMission && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-hidden relative text-neutral-100"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
                    INITIATE RECOVERY MISSION
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedHotspotForMission(null)}
                  className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Hotspot Brief */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 flex gap-3 items-center">
                <img
                  src={selectedHotspotForMission.images?.[0] || selectedHotspotForMission.beforePhotoUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800'}
                  alt={selectedHotspotForMission.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1 font-mono text-xs overflow-hidden">
                  <span className="text-[10px] text-amber-400 block uppercase font-bold">LINKED HOTSPOT</span>
                  <h4 className="font-bold text-white truncate">{selectedHotspotForMission.title}</h4>
                  <p className="text-[11px] text-neutral-400 truncate">{selectedHotspotForMission.location}</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateMission} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="block text-neutral-300 font-bold uppercase text-[10px]">Mission Title</label>
                  <input
                    type="text"
                    required
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-forest-500 text-xs"
                    placeholder="e.g. Riverbank Cleanup & Recycling Dispatch"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-neutral-300 font-bold uppercase text-[10px]">Cleanup Plan / Description</label>
                  <textarea
                    rows={3}
                    required
                    value={missionDesc}
                    onChange={(e) => setMissionDesc(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-forest-500 text-xs font-sans"
                    placeholder="Outline volunteer goals, tools required, and safety instructions..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-neutral-300 font-bold uppercase text-[10px]">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      value={missionDate}
                      onChange={(e) => setMissionDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-forest-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-300 font-bold uppercase text-[10px]">Volunteers Needed</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={volunteersNeeded}
                      onChange={(e) => setVolunteersNeeded(parseInt(e.target.value) || 10)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-forest-500 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-forest-950/40 border border-fresh-500/30 rounded-xl text-[11px] text-fresh-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-fresh-400" /> Connected Recovery Pipeline</p>
                  <p className="text-neutral-400 font-sans">This mission will be permanently linked to Hotspot #{selectedHotspotForMission.id}. The hotspot will transition from "Needs Action" to an active cleanup mission.</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="submit"
                    disabled={isCreatingMission}
                    className="flex-1 bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 text-xs"
                  >
                    {isCreatingMission ? 'Launching Mission...' : 'Confirm & Launch Mission'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedHotspotForMission(null)}
                    className="border-neutral-700 text-neutral-300 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
