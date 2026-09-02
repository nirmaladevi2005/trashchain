import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SatelliteMap } from '../components/shared/SatelliteMap';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  MapPin, Search, ChevronRight, Compass, X, ArrowRight, Target, Users, Calendar, Sparkles
} from 'lucide-react';
import { hotspotService, type FirestoreHotspot } from '../services/hotspotService';
import { missionService, type FirestoreMission } from '../services/missionService';
import { isDemoMode } from '../lib/firebase';
import { cn } from '../utils/cn';

type FilterType = 'all' | 'critical' | 'reported' | 'mission' | 'recovered' | 'transformed';

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [hotspotsList, setHotspotsList] = useState<FirestoreHotspot[]>([]);
  const [missionsList, setMissionsList] = useState<FirestoreMission[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHotspot, setSelectedHotspotState] = useState<FirestoreHotspot | null>(null);
  const isDemo = isDemoMode();

  // Synchronize selectedHotspot state with URL query parameter for clean deep-linking
  const setSelectedHotspot = (hotspot: FirestoreHotspot | null) => {
    setSelectedHotspotState(hotspot);
    if (hotspot) {
      searchParams.set('hotspotId', hotspot.id);
      setSearchParams(searchParams, { replace: true });
    } else if (searchParams.has('hotspotId')) {
      searchParams.delete('hotspotId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    const unsubscribeHotspots = hotspotService.subscribeToHotspots((data) => {
      setHotspotsList(data);
    });

    const unsubscribeMissions = missionService.subscribeToMissions((mData) => {
      setMissionsList(mData);
    });

    return () => {
      unsubscribeHotspots();
      unsubscribeMissions();
    };
  }, []);

  // Auto-select hotspot from URL query param if present
  useEffect(() => {
    const targetId = searchParams.get('hotspotId');
    if (targetId && hotspotsList.length > 0) {
      const found = hotspotsList.find(h => h.id === targetId);
      if (found && selectedHotspot?.id !== found.id) {
        setSelectedHotspotState(found);
      }
    }
  }, [searchParams, hotspotsList]);

  // Find mission linked to selected hotspot if any
  const linkedMission = useMemo(() => {
    if (!selectedHotspot) return null;
    return missionsList.find(m => m.hotspotId === selectedHotspot.id);
  }, [selectedHotspot, missionsList]);

  // Filtered hotspots list based on search and category filter
  const filteredHotspots = useMemo(() => {
    return hotspotsList.filter(h => {
      // Filter tab logic
      if (activeFilter === 'critical' && h.severity !== 'critical') return false;
      if (activeFilter === 'reported' && h.status !== 'reported') return false;
      if (activeFilter === 'mission' && h.status !== 'mission_active') return false;
      if (activeFilter === 'recovered' && h.status !== 'cleaned') return false;
      if (activeFilter === 'transformed' && h.status !== 'transformed') return false;

      // Search query logic
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = h.title?.toLowerCase().includes(q);
        const matchLocation = h.location?.toLowerCase().includes(q);
        const matchCategory = h.category?.toLowerCase().includes(q);
        return matchTitle || matchLocation || matchCategory;
      }

      return true;
    });
  }, [hotspotsList, activeFilter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      active: hotspotsList.filter(h => h.status === 'reported' || h.severity === 'critical').length,
      missions: hotspotsList.filter(h => h.status === 'mission_active').length,
      recovered: hotspotsList.filter(h => h.status === 'cleaned').length,
      transformed: hotspotsList.filter(h => h.status === 'transformed').length,
    };
  }, [hotspotsList]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. EXPLORE PAGE HEADER */}
      <header className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-850 px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 font-mono text-[10px]">
                LIVE ENVIRONMENTAL NETWORK
              </Badge>
              <span className="text-xs font-mono text-neutral-500">|</span>
              <span className="text-xs font-mono text-neutral-400">{isDemo ? 'DEMO MODE' : 'FIREBASE CONNECTED'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Compass className="w-7 h-7 text-fresh-400" /> Explore the Recovery Network
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              See polluted spaces, active cleanup missions, verified recoveries, and community transformations in real time.
            </p>
          </div>

          {/* Quick Network Stats */}
          <div className="flex items-center gap-3 font-mono text-xs bg-neutral-900 border border-neutral-800 p-3 rounded-2xl shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-coral-400 block uppercase">Active</span>
              <span className="font-bold text-white text-base">{stats.active}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-yellow-400 block uppercase">Missions</span>
              <span className="font-bold text-white text-base">{stats.missions}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-fresh-400 block uppercase">Recovered</span>
              <span className="font-bold text-white text-base">{stats.recovered}</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-purple-400 block uppercase">Transform</span>
              <span className="font-bold text-white text-base">{stats.transformed}</span>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-neutral-900/90 border-b border-neutral-850 px-4 py-3 md:px-8 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search a location, waste type, or hotspot title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-forest-500 placeholder:text-neutral-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Floating Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none font-mono text-xs">
            {[
              { id: 'all', label: 'All', count: hotspotsList.length, color: 'text-neutral-300' },
              { id: 'critical', label: '🔴 Critical', count: stats.active, color: 'text-coral-400' },
              { id: 'reported', label: '🟠 Reported', count: hotspotsList.filter(h => h.status === 'reported').length, color: 'text-amber-400' },
              { id: 'mission', label: '🟡 Mission', count: stats.missions, color: 'text-yellow-400' },
              { id: 'recovered', label: '🟢 Recovered', count: stats.recovered, color: 'text-fresh-400' },
              { id: 'transformed', label: '🟣 Transformed', count: stats.transformed, color: 'text-purple-400' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterType)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                  activeFilter === tab.id
                    ? "bg-forest-600 border-forest-500 text-white shadow-md"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn("text-[10px] opacity-80", activeFilter === tab.id ? "text-white" : tab.color)}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. MAP MAIN AREA AND DETAILED SIDE PANEL */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden h-[calc(100vh-160px)]">
        
        {/* Real Leaflet Satellite Map Layer */}
        <div className="flex-1 h-full p-2 sm:p-4 bg-neutral-50 dark:bg-neutral-950 relative">
          <SatelliteMap 
            items={filteredHotspots} 
            selectedHotspotId={selectedHotspot?.id}
            onSelectHotspot={(h) => setSelectedHotspot(h as FirestoreHotspot)}
          />
        </div>

        {/* Desktop Side List & Selected Hotspot Detail Panel */}
        <div className="w-full md:w-96 bg-neutral-950 border-t md:border-t-0 md:border-l border-neutral-850 flex flex-col h-72 md:h-full shrink-0">
          
          {/* List Header */}
          <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-fresh-400" /> Hotspots ({filteredHotspots.length})
            </h2>
            <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono">
              {isDemo ? 'DEMO DATA' : 'FIELD DATA'}
            </Badge>
          </div>

          {/* List items / Selected Hotspot view */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedHotspot ? (
              /* Selected Hotspot Detail Card */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-forest-500/50 rounded-2xl p-4 space-y-4 shadow-2xl relative"
              >
                <button 
                  onClick={() => setSelectedHotspot(null)}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white text-xs font-bold p-1 bg-neutral-800 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-coral-400 bg-coral-500/10 px-2 py-0.5 rounded border border-coral-500/30">
                      {selectedHotspot.severity} Severity
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono text-neutral-300 border-neutral-700">
                      {selectedHotspot.dataSource || "DEMO DATA"}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base">{selectedHotspot.title}</h3>
                  <p className="text-xs text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" /> {selectedHotspot.location}
                  </p>
                </div>

                {selectedHotspot.images?.[0] && (
                  <div className="h-40 rounded-xl overflow-hidden border border-neutral-800">
                    <img src={selectedHotspot.images[0]} alt={selectedHotspot.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Category</span>
                    <span className="font-semibold text-neutral-200 capitalize">{selectedHotspot.category}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Est. Debris</span>
                    <span className="font-semibold text-fresh-400">{selectedHotspot.estimatedWaste || 'N/A'}</span>
                  </div>
                </div>

                {/* Progress Journey */}
                <div className="space-y-1.5 font-mono text-[10px]">
                  <span className="text-neutral-500 uppercase font-bold block">Recovery Pipeline Stage</span>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <span className="text-coral-400 font-bold">REPORTED</span>
                    <ChevronRight className="w-3 h-3 text-neutral-600" />
                    <span className={selectedHotspot.status !== 'reported' || linkedMission ? 'text-yellow-400 font-bold' : 'text-neutral-600'}>MISSION</span>
                    <ChevronRight className="w-3 h-3 text-neutral-600" />
                    <span className={selectedHotspot.status === 'cleaned' || selectedHotspot.status === 'transformed' ? 'text-fresh-400 font-bold' : 'text-neutral-600'}>CLEANED</span>
                  </div>
                </div>

                {/* Linked Mission or Recovery Candidate Details */}
                {linkedMission ? (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-yellow-400 font-bold text-[10px] uppercase">
                      <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-yellow-400" /> Active Mission</span>
                      <Badge variant="warning" className="text-[9px] uppercase">{linkedMission.status}</Badge>
                    </div>
                    <p className="font-bold text-white text-xs">{linkedMission.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-neutral-300">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3 text-neutral-400" /> {linkedMission.volunteersRegistered.length} / {linkedMission.volunteersNeeded} volunteers</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-neutral-400" /> {new Date(linkedMission.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : selectedHotspot.aiAnalysis ? (
                  <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1 font-mono text-xs">
                    <span className="text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" /> AI Scene Evaluation
                    </span>
                    <p className="text-[11px] text-neutral-300 font-sans line-clamp-2">
                      {(selectedHotspot.aiAnalysis as any)?.summary || selectedHotspot.aiAnalysis.risk || selectedHotspot.aiAnalysis.immediateAction}
                    </p>
                  </div>
                ) : null}

                {/* Hotspot Actions */}
                <div className="space-y-2 pt-2 font-mono text-xs">
                  {linkedMission ? (
                    <Button
                      onClick={() => navigate(`/missions/${linkedMission.id}`)}
                      className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-2.5 flex items-center justify-center gap-1.5"
                    >
                      View Mission Details <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : selectedHotspot.status === 'cleaned' || selectedHotspot.status === 'transformed' ? (
                    <Button
                      onClick={() => navigate('/timeline')}
                      className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-2.5 flex items-center justify-center gap-1.5"
                    >
                      View Recovery Story <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/missions?startMissionFor=${selectedHotspot.id}`)}
                      className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-2.5 flex items-center justify-center gap-1.5 shadow-md"
                    >
                      Start Recovery Mission <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Hotspot List Items */
              filteredHotspots.map(hotspot => {
                const dataSource = hotspot.dataSource || 'DEMO DATA';
                return (
                  <Card 
                    key={hotspot.id} 
                    onClick={() => setSelectedHotspot(hotspot)}
                    className="bg-neutral-900 border-neutral-800 text-white p-4 cursor-pointer hover:border-forest-500/50 transition-all space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-white text-sm line-clamp-1">{hotspot.title}</h3>
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono",
                          dataSource === 'DEMO DATA' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-fresh-500/20 text-fresh-300 border border-fresh-500/30"
                        )}>
                          {dataSource}
                        </span>
                      </div>
                      {hotspot.severity === 'critical' && (
                        <span className="w-2 h-2 rounded-full bg-coral-500 shrink-0 mt-1 animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" /> <span className="truncate">{hotspot.location}</span>
                    </p>

                    <div className="flex gap-2 font-mono text-[10px] pt-1">
                      <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 capitalize">
                        {hotspot.category} waste
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-fresh-400 capitalize font-bold">
                        {hotspot.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
