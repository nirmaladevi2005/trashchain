import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Users, ShieldCheck, Filter, 
  ArrowUpDown, Clock, Leaf, Target, ArrowRight
} from 'lucide-react';
import { missions, hotspots, currentUser } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { EmptyState } from '../components/shared/States';

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
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Highest Impact');

  // Combine missions with hotspot data for filtering/sorting
  const enrichedMissions = useMemo(() => {
    return missions.map(mission => ({
      ...mission,
      hotspot: hotspots.find(h => h.id === mission.hotspotId)
    })).filter(m => m.hotspot);
  }, []);

  // Compute live counts
  const stats = useMemo(() => {
    return {
      active: enrichedMissions.filter(m => m.status === 'active' || m.status === 'upcoming').length,
      volunteers: enrichedMissions.reduce((acc, m) => acc + m.volunteersRegistered.length, 0),
      critical: enrichedMissions.filter(m => m.hotspot?.severity === 'critical').length,
      completed: enrichedMissions.filter(m => m.status === 'verified' || m.status === 'completed').length,
    };
  }, [enrichedMissions]);

  // Apply filters
  let filteredMissions = enrichedMissions.filter((mission) => {
    const isMine = mission.volunteersRegistered.includes(currentUser.id) || mission.organizerId === currentUser.id;
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
      
      {/* 1. DISCOVERY HEADER */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                LIVE MISSION NETWORK
              </Badge>
              <span className="text-xs font-mono text-neutral-500">COMMUNITY DISPATCH</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <Target className="w-8 h-8 text-yellow-400" /> Cleanup Missions
            </h1>
            <p className="text-sm text-neutral-400 max-w-2xl font-sans">
              Real places. Real people. Real environmental recovery. Join a mission to transform a polluted space.
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
              <span className="text-[10px] text-purple-400 block uppercase">Volunteers</span>
              <span className="font-bold text-white text-base">{stats.volunteers}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-coral-400 block uppercase">Critical</span>
              <span className="font-bold text-white text-base">{stats.critical}</span>
            </div>
          </div>
        </motion.div>

        {/* 2. FILTERS & SORTING */}
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

      {/* 3. MISSION GRID */}
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
                src={hotspot?.images[0]} 
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
            description="We couldn't find any missions matching your current filter. Try selecting 'All'."
            action={<Button variant="outline" onClick={() => setActiveFilter('All')}>View All Missions</Button>}
          />
        </motion.div>
      )}
    </div>
  );
}
