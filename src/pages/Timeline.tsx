import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, ArrowLeft, Printer, ChevronRight, Activity, Award, Clock
} from 'lucide-react';
import { recoveryTimelines, hotspots, missions, mockMonitoringCheckpoints } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

const STAGES_MASTER = [
  { id: '01', title: 'POLLUTION DETECTED', date: '2026-07-20', status: 'completed', desc: 'Illegal dumping report filed by citizen volunteer.', badge: 'USER-REPORTED' },
  { id: '02', title: 'REPORT SUBMITTED', date: '2026-07-20', status: 'completed', desc: 'GPS pin & initial evidence registered in TrashChain.', badge: 'VERIFIED' },
  { id: '03', title: 'COMMUNITY MISSION', date: '2026-07-22', status: 'completed', desc: 'Cleanup mission created. 14 local volunteers registered.', badge: 'FIELD DATA' },
  { id: '04', title: 'CLEANUP STARTED', date: '2026-07-25', status: 'completed', desc: 'Mobile Field Mode active. Safety checklist completed.', badge: 'MEASURED' },
  { id: '05', title: 'EVIDENCE SUBMITTED', date: '2026-07-25', status: 'completed', desc: 'After-cleanup photo & 180kg scale weight uploaded.', badge: 'MEASURED' },
  { id: '06', title: 'RECOVERY VERIFIED', date: '2026-07-25', status: 'completed', desc: 'AI-assisted verification passed. Score boosted to 72/100.', badge: 'VERIFIED' },
  { id: '07', title: 'PREVENTION PLAN', date: '2026-07-28', status: 'completed', desc: 'AI recurrence risk (78%) evaluated. Garden concept chosen.', badge: 'AI-ASSISTED' },
  { id: '08', title: 'TRANSFORMATION', date: '2026-08-05', status: 'active', desc: 'Community voting finalized (58% vote). Mini-garden planned.', badge: 'PROJECTED' },
  { id: '09', title: 'MONITORING', date: '2026-08-24', status: 'active', desc: '30-Day monitoring underway. No major recurrence.', badge: 'MEASURED' }
];

export default function Timeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemo } = useAuth();

  const timeline = recoveryTimelines[0];
  const hotspot = hotspots.find(h => h.id === (id || timeline?.hotspotId)) || hotspots[0];
  const mission = missions[0];

  const [compareView, setCompareView] = useState<'side' | 'slider'>('side');
  const [activeTab, setActiveTab] = useState<'timeline' | 'monitoring' | 'certificate' | 'share'>('timeline');

  if (!hotspot) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-28">
      
      {/* 1. PAGE HEADER */}
      <header className="bg-neutral-950 border-b border-neutral-850 py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-neutral-900 border-neutral-700 text-white font-bold text-xs"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-[10px]">
                <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 uppercase">
                  {isDemo ? 'DEMO DATA' : 'FIELD DATA'}
                </Badge>
                <span className="text-neutral-500">REC ID: #TRC-REC-2026-001</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Recovery Story</h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mt-1">
                Follow the transformation of this place from a polluted hotspot to a monitored community recovery.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-3 rounded-2xl font-mono text-xs">
              <MapPin className="w-4 h-4 text-fresh-400 shrink-0" />
              <div>
                <span className="text-neutral-500 block text-[9px]">LOCATION</span>
                <span className="font-bold text-white">{hotspot.location}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* 2. HERO RECOVERY CARD (BEFORE vs AFTER) */}
        <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Before vs After Photos */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-neutral-400 text-[10px]">EVIDENCE COMPARISON</span>
                <div className="flex gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                  <button 
                    onClick={() => setCompareView('side')} 
                    className={cn("px-2.5 py-1 rounded text-[10px] font-bold", compareView === 'side' ? "bg-forest-600 text-white" : "text-neutral-500")}
                  >
                    Side-by-Side
                  </button>
                  <button 
                    onClick={() => setCompareView('slider')} 
                    className={cn("px-2.5 py-1 rounded text-[10px] font-bold", compareView === 'slider' ? "bg-forest-600 text-white" : "text-neutral-500")}
                  >
                    Overlay
                  </button>
                </div>
              </div>

              {compareView === 'side' ? (
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-coral-400 text-[10px] font-bold block">BEFORE (POLLUTED)</span>
                    <div className="h-40 rounded-2xl overflow-hidden bg-neutral-950 relative border border-neutral-800">
                      <img src={hotspots[1]?.images[0] || hotspot.images[0]} alt="Before" className="w-full h-full object-cover filter grayscale" />
                      <div className="absolute bottom-2 left-2 bg-neutral-950/90 text-coral-400 text-[9px] font-bold px-2 py-0.5 rounded border border-coral-500/30">18 / 100</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-fresh-400 text-[10px] font-bold block">AFTER (CLEANED)</span>
                    <div className="h-40 rounded-2xl overflow-hidden bg-neutral-950 relative border border-fresh-500/30">
                      <img src={hotspot.images[0]} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-fresh-950/90 text-fresh-400 text-[9px] font-bold px-2 py-0.5 rounded border border-fresh-500/40">72 / 100</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-44 rounded-2xl overflow-hidden bg-neutral-950 border border-fresh-500/30 group">
                  <img src={hotspot.images[0]} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-fresh-950/90 text-fresh-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-fresh-500/30">
                    Captured from approximately the same location
                  </div>
                </div>
              )}
            </div>

            {/* Impact Metrics Summary */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">Recovery Overview</h3>
                  <p className="text-xs text-neutral-400">Verified environmental transformation</p>
                </div>
                <ImpactBadge type="VERIFIED" size="sm" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Score Jump</span>
                  <span className="text-base font-bold text-fresh-400">+54 Pts</span>
                  <span className="text-[9px] text-neutral-500 block">18 → 72 / 100</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Waste Removed</span>
                  <span className="text-base font-bold text-white">180 kg</span>
                  <span className="text-[9px] text-fresh-400 block">MEASURED</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Volunteers</span>
                  <span className="text-base font-bold text-white">14 Heroes</span>
                  <span className="text-[9px] text-neutral-500 block">FIELD DATA</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Action Date</span>
                  <span className="text-base font-bold text-white">Jul 25, 2026</span>
                  <span className="text-[9px] text-neutral-500 block">Verified</span>
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-neutral-850 pb-3 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'timeline' ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            <Clock className="w-3.5 h-3.5" /> 9-Stage Timeline
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={cn(
              "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'monitoring' ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            <Activity className="w-3.5 h-3.5" /> Monitoring Checkpoints
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={cn(
              "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'certificate' ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            <Award className="w-3.5 h-3.5" /> Recovery Record
          </button>
        </div>

        {/* 3. VISUAL VERTICAL 9-STAGE TIMELINE */}
        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            
            <div className="relative border-l-2 border-neutral-850 ml-4 pl-6 space-y-8">
              {STAGES_MASTER.map((stage, idx) => (
                <div key={stage.id} className="relative">
                  {/* Glowing Node Dot */}
                  <div className={cn(
                    "absolute -left-[31px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center font-mono text-[9px] font-bold transition-all",
                    stage.status === 'completed' ? "bg-fresh-500 border-fresh-400 text-neutral-950" : "bg-forest-600 border-forest-400 text-white animate-pulse"
                  )}>
                    {idx + 1}
                  </div>

                  <Card className="bg-neutral-900 border-neutral-800 text-white p-5 rounded-2xl space-y-2 hover:border-neutral-700 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{stage.title}</span>
                        <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[9px] font-mono">
                          {stage.badge}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">{stage.date}</span>
                    </div>

                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">{stage.desc}</p>
                  </Card>
                </div>
              ))}
            </div>

            {/* 6. WASTE REMOVAL BREAKDOWN & 7. COMMUNITY IMPACT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Waste Removal Breakdown */}
              <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Waste Removed</h3>
                  <ImpactBadge type="MEASURED" size="sm" />
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 flex justify-between items-center">
                    <div><span className="font-bold text-white block">180 kg</span><span className="text-[10px] text-neutral-500">Plastic Waste</span></div>
                    <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 text-[9px]">MEASURED (Digital Scale)</Badge>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 flex justify-between items-center">
                    <div><span className="font-bold text-white block">12 bags</span><span className="text-[10px] text-neutral-500">Mixed Municipal</span></div>
                    <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[9px]">COUNTED (Refuse Bags)</Badge>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 flex justify-between items-center">
                    <div><span className="font-bold text-white block">3 items</span><span className="text-[10px] text-neutral-500">E-Waste Items</span></div>
                    <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[9px]">COUNTED (Retrieved Monitors)</Badge>
                  </div>
                </div>
              </Card>

              {/* 8. AI PREVENTION & 9. TRANSFORMATION STORY */}
              <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-lg font-bold text-white">AI Prevention Story</h3>
                  <ImpactBadge type="PROJECTED" size="sm" />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] text-purple-300 font-bold block uppercase">AI Recommendation</span>
                    <p className="font-bold text-white text-sm">Community Mini Garden</p>
                    <p className="text-[10px] text-neutral-400 font-sans">Recurrence risk cut by 65% via community ownership.</p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-neutral-400 text-xs">Community Vote: <strong className="text-white">58% Leading</strong></span>
                    <Link to={`/missions/${mission.id}/prevention`}>
                      <Button variant="outline" size="sm" className="border-neutral-700 text-xs font-bold">
                        View Prevention Plan <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

            </div>

          </motion.div>
        )}

        {/* 10. MONITORING TIMELINE & 11. LONG-TERM RECOVERY STATUS */}
        {activeTab === 'monitoring' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Monitoring Checkpoints</h3>
                  <p className="text-xs text-neutral-400">Post-cleanup monitoring for 90 days</p>
                </div>
                <Badge variant="success" className="bg-fresh-500/20 text-fresh-300 border-fresh-500/30 text-xs font-mono">
                  30-DAY RECOVERY MAINTAINED
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {mockMonitoringCheckpoints.slice(0, 3).map((chk) => (
                  <div key={chk.id} className="p-4 bg-neutral-950 rounded-2xl border border-neutral-850 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-fresh-400 text-sm">DAY {chk.day} CHECKPOINT</span>
                      <span className="text-[10px] text-neutral-500">{chk.scheduledDate}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-neutral-850">
                      <span className="text-neutral-400">Cleanliness Score</span>
                      <span className="font-bold text-white">{chk.cleanlinessScore} / 100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Recurrence State</span>
                      <span className={cn("font-bold capitalize", chk.recurrenceStatus === 'clean' ? "text-fresh-400" : "text-amber-400")}>
                        {chk.recurrenceStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 12. RECOVERY CERTIFICATE CARD */}
        {activeTab === 'certificate' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 text-white p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">OFFICIAL RECORD</span>
                  <h3 className="text-2xl font-black text-white">TrashChain Recovery Record</h3>
                </div>
                <ImpactBadge type="VERIFIED" size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                <div><span className="text-neutral-500 block text-[10px]">RECOVERY ID</span><span className="font-bold text-white">#TRC-REC-2026-001</span></div>
                <div><span className="text-neutral-500 block text-[10px]">LOCATION</span><span className="font-bold text-white">{hotspot.location}</span></div>
                <div><span className="text-neutral-500 block text-[10px]">ACTION DATE</span><span className="font-bold text-white">Jul 25, 2026</span></div>
                <div><span className="text-neutral-500 block text-[10px]">WASTE DIVERTED</span><span className="font-bold text-fresh-400">180 kg MEASURED</span></div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={() => window.print()} className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 px-6">
                  <Printer className="w-4 h-4 mr-2" /> Print / Save Record
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
