import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MapPin, Layers, Activity
} from 'lucide-react';
import { pilotService } from '../services/pilotService';
import type { Pilot, PilotStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const PILOT_STATUSES: PilotStatus[] = ['PLANNED', 'BASELINE', 'INTERVENTION', 'RECOVERY', 'MONITORING', 'COMPLETED'];
const SCHEDULE_STEPS = ['Baseline', 'Intervention', 'Recovery', 'Day 7', 'Day 14', 'Day 30', 'Day 60', 'Day 90'];

import { ChainLinkAnimation } from '../components/ui/impact/ImpactMoments';

export default function Pilots() {
  const [showCelebration, setShowCelebration] = useState(false);
  const { id } = useParams();
  const { user, isDemo } = useAuth();

  const [pilotsList, setPilotsList] = useState<Pilot[]>([]);
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Pilot Form State
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(40.7150);
  const [longitude, setLongitude] = useState(-74.0100);
  const [baselineStart, setBaselineStart] = useState('2026-08-01');
  const [baselineEnd, setBaselineEnd] = useState('2026-08-24');
  const [leadVolunteer, setLeadVolunteer] = useState('');
  const [controlSite, setControlSite] = useState('');
  const [isTestRecord, setIsTestRecord] = useState(false);

  useEffect(() => {
    pilotService.listPilots().then(data => {
      setPilotsList(data);
      if (id) {
        const found = data.find(p => p.pilotId === id);
        setSelectedPilot(found || data[0] || null);
      } else {
        setSelectedPilot(data[0] || null);
      }
    });
  }, [id]);

  const handleCreatePilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName || !locationName) return;

    setIsSubmitting(true);
    try {
      const customId = await pilotService.createPilot(
        {
          siteName,
          siteDescription: siteDescription || 'Real environmental recovery pilot site.',
          latitude: Number(latitude),
          longitude: Number(longitude),
          gpsAccuracy: 8,
          baselineStartDate: baselineStart,
          baselineEndDate: baselineEnd,
          leadUserId: user?.uid || 'user-001',
          leadUserName: leadVolunteer || user?.displayName || 'Citizen Lead',
          status: 'PLANNED',
          interventionType: 'Community Action & Site Transformation',
          controlSiteId: controlSite || undefined,
          monitoringSchedule: [7, 14, 30, 60, 90],
          dataSource: isTestRecord ? 'TEST DATA' : (user && !isDemo ? 'FIELD DATA' : 'DEMO DATA'),
          baselineObservation: {
            beforeImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
            categories: ['plastic', 'mixed'],
            estimatedWeightKg: 400,
            visibleClusters: 6,
            cleanlinessScore: 18,
            recurrenceStatus: 'significant_recurrence',
            approximateAge: 'Old (> 1 month)',
            siteConditions: 'Pre-intervention baseline monitoring site',
            measurementMethod: 'visual_estimate',
            notes: 'Baseline monitoring initialized.'
          }
        },
        !!user,
        isTestRecord
      );

      const refreshed = await pilotService.listPilots();
      setPilotsList(refreshed);
      const created = refreshed.find(p => p.pilotId === customId);
      if (created) setSelectedPilot(created);
      setIsModalOpen(false);
      setShowCelebration(true);
      
      // Reset form
      setSiteName('');
      setSiteDescription('');
      setLocationName('');
    } catch (err) {
      console.error('Failed to create pilot:', err);
      alert('Error creating pilot site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-28">
      <ChainLinkAnimation 
        show={showCelebration} 
        message="Pilot site added to the recovery network." 
        onClose={() => setShowCelebration(false)} 
      />
      
      {/* 1. HEADER */}
      <div className="bg-neutral-950 border-b border-neutral-850 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px]">
              <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 uppercase">
                REAL PILOT FOUNDATION
              </Badge>
              <span className="text-neutral-500">ENVIRONMENTAL SURVEILLANCE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Pilot Site Tracker</h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mt-1">
              Monitor polluted locations before, during, and after community intervention.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 px-5 shadow-lg shadow-forest-600/25"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Initialize New Pilot
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* PILOT LIST CHIPS */}
        <div className="flex items-center gap-2 border-b border-neutral-850 pb-3 overflow-x-auto scrollbar-none font-mono text-xs">
          {pilotsList.map((p) => (
            <button
              key={p.pilotId}
              onClick={() => setSelectedPilot(p)}
              className={cn(
                "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 border",
                selectedPilot?.pilotId === p.pilotId 
                  ? "bg-forest-600 border-forest-500 text-white shadow-md" 
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              )}
            >
              <span>{p.siteName}</span>
              <span className="text-[9px] opacity-70">({p.pilotId})</span>
            </button>
          ))}
        </div>

        {selectedPilot && (
          <div className="space-y-8">
            
            {/* 2. PILOT HERO DASHBOARD */}
            <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px]">
                    <span className="text-fresh-400 font-bold">PILOT ID: #{selectedPilot.pilotId}</span>
                    <span className="text-neutral-600">•</span>
                    <Badge variant={selectedPilot.dataSource === 'TEST DATA' ? 'warning' : 'success'} className="font-mono text-[9px]">
                      {selectedPilot.dataSource}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-black text-white">{selectedPilot.siteName}</h2>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-fresh-400" /> GPS Pin ({selectedPilot.latitude.toFixed(4)}, {selectedPilot.longitude.toFixed(4)})
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-850 font-mono text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[9px]">CURRENT STATUS</span>
                    <span className="font-bold text-fresh-400 text-sm">{selectedPilot.status}</span>
                  </div>
                </div>
              </div>

              {/* TIMELINE PROGRESS */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-neutral-400 uppercase">PILOT SURVEILLANCE TIMELINE</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-[10px]">
                  {SCHEDULE_STEPS.map((stepName, idx) => {
                    const statusIdx = PILOT_STATUSES.indexOf(selectedPilot.status);
                    const isPassed = idx <= Math.min(statusIdx, 7);
                    const isCurrent = idx === Math.min(statusIdx, 7);

                    return (
                      <div 
                        key={stepName} 
                        className={cn(
                          "p-2.5 rounded-xl border text-center font-bold transition-all",
                          isCurrent 
                            ? "bg-forest-600/40 border-fresh-500 text-white ring-2 ring-fresh-500/20" 
                            : isPassed 
                              ? "bg-neutral-950 border-neutral-800 text-fresh-400" 
                              : "bg-neutral-950/40 border-neutral-850 text-neutral-600"
                        )}
                      >
                        <span className="block text-[8px] text-neutral-500">STAGE 0{idx + 1}</span>
                        <span className="text-xs">{stepName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                {selectedPilot.siteDescription}
              </p>
            </Card>

            {/* 3. BASELINE OBSERVATION CARD */}
            <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" /> BASELINE OBSERVATION
                </h3>
                <div className="flex gap-2">
                  <ImpactBadge type="USER-REPORTED" size="sm" />
                  <ImpactBadge type="ESTIMATED" size="sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-850 relative">
                  <img 
                    src={selectedPilot.baselineObservation?.beforeImage || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800'} 
                    alt="Baseline photo" 
                    className="w-full h-full object-cover filter grayscale opacity-90"
                  />
                  <div className="absolute bottom-3 left-3 bg-neutral-950/90 text-coral-400 text-xs font-mono font-bold px-3 py-1 rounded border border-coral-500/30">
                    Baseline Cleanliness Score: {selectedPilot.baselineObservation?.cleanlinessScore || 18} / 100
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                    <span className="text-neutral-500 block text-[9px] uppercase">EST. BASELINE DEBRIS</span>
                    <span className="font-bold text-white text-base">{selectedPilot.baselineObservation?.estimatedWeightKg || 400} kg</span>
                    <span className="text-[9px] text-blue-400 block">ESTIMATED</span>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                    <span className="text-neutral-500 block text-[9px] uppercase">WASTE CLUSTERS</span>
                    <span className="font-bold text-white text-base">{selectedPilot.baselineObservation?.visibleClusters || 6} Clusters</span>
                    <span className="text-[9px] text-neutral-500 block">USER-REPORTED</span>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                    <span className="text-neutral-500 block text-[9px] uppercase">START DATE</span>
                    <span className="font-bold text-white">{selectedPilot.baselineStartDate}</span>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                    <span className="text-neutral-500 block text-[9px] uppercase">END DATE</span>
                    <span className="font-bold text-white">{selectedPilot.baselineEndDate}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. CONTROL SITE COMPARISON */}
            {selectedPilot.controlSiteId && (
              <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" /> CONTROL SITE LINKED
                  </h3>
                  <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 font-mono text-[10px]">
                    Preliminary comparison only
                  </Badge>
                </div>

                <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl text-xs font-mono text-neutral-300 space-y-1">
                  <span className="text-purple-400 font-bold uppercase block">Control Site Reference ID: {selectedPilot.controlSiteId}</span>
                  <p className="font-sans text-neutral-300">
                    This pilot is linked with an unmanaged control site to establish difference-in-difference baseline comparisons over 90 days.
                  </p>
                </div>
              </Card>
            )}

          </div>
        )}
      </div>

      {/* CREATE PILOT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
                <div>
                  <Badge variant="success" className="bg-fresh-500/20 text-fresh-400 mb-1">New Environmental Pilot</Badge>
                  <h3 className="text-xl font-bold text-white">Initialize Pilot Site</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white font-bold p-2">✕</button>
              </div>

              <form onSubmit={handleCreatePilot} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 uppercase font-bold mb-1">Site Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Pine Street Lot Pilot Site"
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-bold mb-1">Site Location *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Pine St & 5th Ave, Sector 4"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 uppercase font-bold mb-1">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={latitude}
                      onChange={e => setLatitude(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase font-bold mb-1">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={longitude}
                      onChange={e => setLongitude(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 uppercase font-bold mb-1">Baseline Start</label>
                    <input 
                      type="date" 
                      value={baselineStart}
                      onChange={e => setBaselineStart(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase font-bold mb-1">Baseline End</label>
                    <input 
                      type="date" 
                      value={baselineEnd}
                      onChange={e => setBaselineEnd(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-bold mb-1">Lead Volunteer</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex Rivera"
                    value={leadVolunteer}
                    onChange={e => setLeadVolunteer(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-bold mb-1">Control Site Ref (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ctrl-001"
                    value={controlSite}
                    onChange={e => setControlSite(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                  />
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300 font-bold">Classify as Synthetic TEST DATA?</span>
                  <input 
                    type="checkbox" 
                    checked={isTestRecord}
                    onChange={e => setIsTestRecord(e.target.checked)}
                    className="w-4 h-4 rounded text-forest-500 accent-fresh-400"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-850">
                  <Button variant="outline" className="flex-1 border-neutral-700 text-neutral-300" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-[2] bg-forest-600 hover:bg-forest-700 text-white font-bold py-3" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Pilot...' : 'Initialize Pilot Site'}
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
