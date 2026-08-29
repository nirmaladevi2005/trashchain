import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, AlertTriangle, Clock, 
  ArrowLeft, Calendar, ShieldCheck, Camera, 
  TrendingDown, TrendingUp, Activity, 
  Layers, MapPin, ChevronRight, Scale, Loader2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { 
  mockMonitoringCheckpoints, 
  mockInterventionSite, 
  mockControlSite,
  mockRecoveryRecords
} from '../data/mockData';
import { cn } from '../utils/cn';
import type { MonitoringCheckpoint, RecurrenceStatus } from '../types';

import { ImpactCelebration } from '../components/ui/impact/ImpactMoments';

export default function Monitoring() {
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'checkpoints' | 'did_comparison'>('checkpoints');
  const [checkpoints, setCheckpoints] = useState<MonitoringCheckpoint[]>(mockMonitoringCheckpoints);
  
  // Selected checkpoint for completion modal/form
  const [activeModalChk, setActiveModalChk] = useState<MonitoringCheckpoint | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800');
  const [recStatus, setRecStatus] = useState<RecurrenceStatus>('clean');
  const [recKg, setRecKg] = useState<number>(0);
  const [cleanScore, setCleanScore] = useState<number>(88);
  const [commObs, setCommObs] = useState<string>('Site remains clean and accessible to local residents.');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recovery = mockRecoveryRecords[0];

  const handleOpenModal = (chk: MonitoringCheckpoint) => {
    setActiveModalChk(chk);
    setPhotoUrl(chk.photoUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800');
    setRecStatus(chk.recurrenceStatus || 'clean');
    setRecKg(chk.estimatedRecurrenceKg || 0);
    setCleanScore(chk.cleanlinessScore || 85);
    setCommObs(chk.communityObservation || '');
    setUploadError(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeModalChk) return;

    setUploadError(null);
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const recId = activeModalChk.recoveryRecordId || recovery?.id || 'TRC-REC-2026-001';
      const url = await storageService.uploadMonitoringPhoto(
        file,
        recId,
        activeModalChk.day,
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );
      setPhotoUrl(url);
    } catch (err: any) {
      console.error('Failed to upload monitoring photo:', err);
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveCheckpoint = () => {
    if (!activeModalChk) return;
    setCheckpoints(prev => prev.map(c => {
      if (c.id === activeModalChk.id) {
        return {
          ...c,
          status: 'completed',
          actualDate: new Date().toISOString().split('T')[0],
          photoUrl,
          recurrenceStatus: recStatus,
          estimatedRecurrenceKg: Number(recKg),
          cleanlinessScore: Number(cleanScore),
          communityObservation: commObs
        };
      }
      return c;
    }));
    setActiveModalChk(null);
    setShowCelebration(true);
  };

  // Calculate Transparency & Reduction Stats
  const completedCheckpoints = checkpoints.filter(c => c.status === 'completed');
  const totalRecurrenceKg = completedCheckpoints.reduce((sum, c) => sum + (c.estimatedRecurrenceKg || 0), 0);
  
  // Average monthly recurrence based on completed days
  const baselineMonthlyKg = 105; // From historical baseline observation
  const postInterventionAvgKg = completedCheckpoints.length >= 2 
    ? Math.round((totalRecurrenceKg / completedCheckpoints.length) * 2) // Approximate monthly rate from biweekly monitoring
    : 0;

  const dataSufficient = completedCheckpoints.length >= 2;
  const reductionPct = dataSufficient 
    ? Math.max(0, Math.round(((baselineMonthlyKg - postInterventionAvgKg) / baselineMonthlyKg) * 100))
    : null;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 pb-32">
      <ImpactCelebration 
        show={showCelebration} 
        title="Monitoring Recorded" 
        message="Recovery monitoring checkpoint recorded." 
        onClose={() => setShowCelebration(false)} 
      />
      
      {/* Top Header */}
      <div className="bg-neutral-950 border-b border-neutral-800 pt-8 pb-6 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="success" className="bg-fresh-500/20 text-fresh-400 border-fresh-500/30">
                  Long-Term Surveillance
                </Badge>
                <span className="text-xs font-mono text-neutral-400">REF: {recovery?.id || 'TRC-REC-2026-001'}</span>
              </div>
              <h1 className="text-3xl font-black text-white">30 / 60 / 90-Day Monitoring System</h1>
              <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
                Track post-cleanup recurrence over 90 days. Compare active interventions against unmanaged control sites to build verified environmental recovery datasets.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 shrink-0">
              <button
                onClick={() => setActiveTab('checkpoints')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === 'checkpoints' ? "bg-forest-600 text-white shadow" : "text-neutral-400 hover:text-white"
                )}
              >
                <Activity className="w-4 h-4" /> Site Checkpoints
              </button>
              <button
                onClick={() => setActiveTab('did_comparison')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === 'did_comparison' ? "bg-forest-600 text-white shadow" : "text-neutral-400 hover:text-white"
                )}
              >
                <Layers className="w-4 h-4" /> Control vs Intervention (DiD)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-8">

        {/* TAB 1: SITE CHECKPOINTS & RECURRENCE TRACKER */}
        {activeTab === 'checkpoints' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Transparent Impact Metrics Panel */}
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-fresh-400" /> Transparent Recurrence Reduction Analysis
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Observed reduction is strictly calculated from verified field checkpoints.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImpactBadge type="VERIFIED" size="md" />
                    <ImpactBadge type="ESTIMATED" size="md" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                    <span className="text-xs text-neutral-400 uppercase font-bold block mb-1">Baseline Monthly Average</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{baselineMonthlyKg} kg</span>
                      <span className="text-xs text-neutral-500">/ month</span>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 inline-block mt-2">
                      Historical Estimate
                    </span>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                    <span className="text-xs text-neutral-400 uppercase font-bold block mb-1">Post-Intervention Rate</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-fresh-400">{postInterventionAvgKg} kg</span>
                      <span className="text-xs text-neutral-500">/ month</span>
                    </div>
                    <span className="text-[10px] text-fresh-400 bg-fresh-400/10 px-2 py-0.5 rounded border border-fresh-400/20 inline-block mt-2">
                      Based on {completedCheckpoints.length} Checkpoints
                    </span>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 relative overflow-hidden">
                    <span className="text-xs text-neutral-400 uppercase font-bold block mb-1">Observed Reduction</span>
                    {dataSufficient ? (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-emerald-400">{reductionPct}%</span>
                          <TrendingDown className="w-6 h-6 text-emerald-400 inline" />
                        </div>
                        <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 inline-block mt-2">
                          Verified Recurrence Reduction
                        </span>
                      </div>
                    ) : (
                      <div className="py-2">
                        <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0" /> Insufficient Data
                        </span>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-tight font-sans">
                          Complete at least 2 monitoring checkpoints (Day 14+) to calculate verified reduction.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-forest-950/40 border border-forest-500/30 p-4 rounded-2xl text-xs text-forest-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-fresh-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-fresh-300 mb-0.5">TrashChain Scientific Integrity Rule</p>
                    <p className="text-neutral-300 leading-relaxed">
                      We never generate synthetic reduction percentages or claim permanent environmental recovery after a single cleanup. A site is only classified as a <strong>Confirmed Recovery</strong> after passing its Day 90 surveillance inspection without significant dumping.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 30/60/90 Day Checkpoint Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-fresh-400" /> Surveillance Checkpoints — {recovery?.locationName || 'Pine Street Lot'}
                </h3>
                <span className="text-xs font-mono text-neutral-400">
                  {completedCheckpoints.length} of {checkpoints.length} Checkpoints Completed
                </span>
              </div>

              <div className="space-y-4">
                {checkpoints.map((chk) => {
                  const isCompleted = chk.status === 'completed';
                  const isPending = chk.status === 'pending';
                  
                  return (
                    <Card 
                      key={chk.id} 
                      className={cn(
                        "bg-neutral-950 border transition-all",
                        isCompleted ? "border-forest-500/50 hover:border-forest-500" : "border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-bold shrink-0 border",
                            isCompleted ? "bg-forest-950 border-forest-500 text-fresh-400" : "bg-neutral-900 border-neutral-750 text-neutral-400"
                          )}>
                            <span className="text-[10px] text-neutral-500 uppercase leading-none">DAY</span>
                            <span className="text-lg leading-none mt-0.5">{chk.day}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <h4 className="font-bold text-white text-base">Day {chk.day} Inspection</h4>
                              {isCompleted ? (
                                <Badge variant="success" className="bg-fresh-500/20 text-fresh-400 border-fresh-500/30 text-[10px]">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED ({chk.actualDate})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-neutral-900 text-neutral-400 border-neutral-700 text-[10px]">
                                  <Clock className="w-3 h-3 mr-1" /> SCHEDULED ({chk.scheduledDate})
                                </Badge>
                              )}
                            </div>

                            {isCompleted ? (
                              <div className="text-xs text-neutral-300 space-y-1">
                                <p className="text-neutral-400 italic">"{chk.communityObservation}"</p>
                                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] pt-1">
                                  <span className="text-fresh-400 font-bold">Score: {chk.cleanlinessScore}/100</span>
                                  <span className="text-neutral-500">|</span>
                                  <span className={cn(
                                    "font-bold uppercase",
                                    chk.recurrenceStatus === 'clean' ? "text-emerald-400" : "text-amber-400"
                                  )}>
                                    Status: {chk.recurrenceStatus?.replace(/_/g, ' ')}
                                  </span>
                                  {chk.estimatedRecurrenceKg > 0 && (
                                    <>
                                      <span className="text-neutral-500">|</span>
                                      <span className="text-amber-400 font-bold">Recurrence: {chk.estimatedRecurrenceKg} kg</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-500">
                                Pending volunteer walk-by inspection to verify whether illegal waste dumping has returned.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                          {isCompleted && chk.photoUrl && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-700 shrink-0">
                              <img src={chk.photoUrl} alt="Inspection" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {isPending && (
                            <Button 
                              size="sm"
                              className="w-full sm:w-auto bg-forest-600 hover:bg-forest-700 text-white font-bold px-5 py-5 rounded-xl shadow"
                              onClick={() => handleOpenModal(chk)}
                            >
                              <Camera className="w-4 h-4 mr-2" /> Complete Inspection <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                          {isCompleted && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs"
                              onClick={() => handleOpenModal(chk)}
                            >
                              Edit Data
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: INTERVENTION VS CONTROL SITE (DID ARCHITECTURE) */}
        {activeTab === 'did_comparison' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Scientific Architecture Explanation Box */}
            <Card className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-forest-950/40 border-neutral-800 text-white shadow-2xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div>
                    <Badge variant="outline" className="text-fresh-400 border-fresh-400/40 bg-fresh-400/10 mb-2 text-[10px] font-mono">
                      Difference-in-Difference (DiD) Preparation
                    </Badge>
                    <h2 className="text-2xl font-black text-white">Scientific Comparison: Control vs Intervention Sites</h2>
                  </div>
                  <ImpactBadge type="USER-REPORTED" size="md" />
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  To confirm that waste reduction is genuinely caused by TrashChain community cleanups and place transformations—rather than broader municipal policy shifts or seasonal weather changes—our architecture tracks <strong>unmanaged control sites</strong> alongside active intervention sites over identical timelines.
                </p>

                {/* Prominent Scientific Disclaimer Banner */}
                <div className="bg-amber-950/60 border-2 border-amber-500/50 p-5 rounded-2xl text-xs space-y-2 text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Preliminary Comparison — Do not claim causal impact unless proper analysis is performed.</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed font-sans">
                    While the intervention site shows an 80%+ reduction and the control site shows a 15% increase, formal Difference-in-Difference statistical significance testing requires at least 12 months of multi-season surveillance, matching demographic covariates, and peer-reviewed econometric analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Side-by-Side Site Comparison Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Active Intervention Site Card */}
              <Card className="bg-neutral-950 border-forest-500/50 text-white shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="border-b border-neutral-850 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="success" className="bg-fresh-500/20 text-fresh-400 border-0 text-[10px]">MANAGED INTERVENTION</Badge>
                      <span className="text-xs font-mono font-bold text-fresh-400">Score: {mockInterventionSite.currentScore}/100</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{mockInterventionSite.name}</h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {mockInterventionSite.location}
                    </p>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-wider">Historical Observation Log</p>
                    
                    {mockInterventionSite.observations.map((obs, i) => (
                      <div key={i} className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                        <div>
                          <span className="text-white font-bold block">{obs.date}</span>
                          <span className={cn(
                            "text-[10px] uppercase font-bold",
                            obs.period === 'baseline' ? "text-neutral-500" : obs.period === 'intervention' ? "text-fresh-400" : "text-emerald-400"
                          )}>
                            {obs.period}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "text-base font-black block",
                            obs.wasteKg === 0 ? "text-fresh-400" : obs.wasteKg < 30 ? "text-emerald-400" : "text-amber-400"
                          )}>
                            {obs.wasteKg} kg
                          </span>
                          <span className="text-[10px] text-neutral-500">Cleanliness: {obs.cleanlinessScore}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-forest-950/50 p-4 rounded-xl border border-forest-500/30 text-xs text-fresh-300">
                    <div className="flex items-center gap-2 font-bold text-fresh-400 mb-1">
                      <TrendingDown className="w-4 h-4" /> 80%+ Reduction Observed
                    </div>
                    <span>Following community cleanup on July 25 and weekly monitoring, recurrence remains under 15 kg/month.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Control Site Card */}
              <Card className="bg-neutral-950 border-neutral-800 text-white shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="border-b border-neutral-850 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="bg-neutral-900 text-neutral-400 border-neutral-700 text-[10px]">UNMANAGED CONTROL SITE</Badge>
                      <span className="text-xs font-mono font-bold text-coral-400">Score: {mockControlSite.currentScore}/100</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{mockControlSite.name}</h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {mockControlSite.location}
                    </p>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-wider">Historical Observation Log</p>
                    
                    {mockControlSite.observations.map((obs, i) => (
                      <div key={i} className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                        <div>
                          <span className="text-white font-bold block">{obs.date}</span>
                          <span className="text-[10px] uppercase font-bold text-neutral-500">{obs.period}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-coral-400 block">{obs.wasteKg} kg</span>
                          <span className="text-[10px] text-neutral-500">Cleanliness: {obs.cleanlinessScore}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-coral-950/30 p-4 rounded-xl border border-coral-500/30 text-xs text-coral-300">
                    <div className="flex items-center gap-2 font-bold text-coral-400 mb-1">
                      <TrendingUp className="w-4 h-4" /> 15% Increase in Waste Accumulation
                    </div>
                    <span>Without community intervention or physical barrier transformation, illegal dumping continued to increase steadily over the same period.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          </motion.div>
        )}

      </div>

      {/* CHECKPOINT INSPECTION MODAL */}
      {activeModalChk && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
              <div>
                <Badge variant="success" className="bg-fresh-500/20 text-fresh-400 mb-1">Day {activeModalChk.day} Inspection</Badge>
                <h3 className="text-xl font-bold text-white">Record Field Surveillance</h3>
              </div>
              <button onClick={() => setActiveModalChk(null)} className="text-neutral-500 hover:text-white font-bold text-lg p-2">✕</button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 uppercase font-bold mb-1">1. Recurrence Status</label>
                <select 
                  value={recStatus} 
                  onChange={e => setRecStatus(e.target.value as RecurrenceStatus)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-fresh-400"
                >
                  <option value="clean">Clean (No dumping observed)</option>
                  <option value="minor_recurrence">Minor Recurrence (&lt; 20 kg litter)</option>
                  <option value="significant_recurrence">Significant Recurrence (&gt; 20 kg dumping)</option>
                  <option value="requires_intervention">Requires Immediate Cleanup Intervention</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-bold mb-1">2. Estimated Recurrence Weight (kg)</label>
                <input 
                  type="number" 
                  min="0"
                  value={recKg} 
                  onChange={e => setRecKg(Number(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-fresh-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-bold mb-1">3. Cleanliness Score ({cleanScore}/100)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={cleanScore} 
                  onChange={e => setCleanScore(Number(e.target.value))}
                  className="w-full accent-fresh-400 mt-2"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-bold mb-1">4. Volunteer Field Observation Notes</label>
                <textarea 
                  rows={3}
                  value={commObs}
                  onChange={e => setCommObs(e.target.value)}
                  placeholder="Describe condition of site, community usage, or any new dumping patterns..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white font-sans outline-none focus:border-fresh-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-bold mb-1">5. Surveillance Photo</label>
                
                {uploadError && (
                  <div className="p-3 mb-2 bg-red-950/60 border border-coral-500/40 rounded-xl flex items-center gap-2 text-coral-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-coral-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {isUploading ? (
                  <div className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-fresh-500/50 rounded-xl bg-fresh-950/20 p-4 text-center">
                    <Loader2 className="w-6 h-6 text-fresh-400 animate-spin mb-2" />
                    <span className="font-bold text-xs text-white">Uploading monitoring photo...</span>
                    <div className="w-40 max-w-full bg-neutral-800 h-2 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-fresh-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-400 mt-1 font-mono">{uploadProgress}%</span>
                  </div>
                ) : photoUrl ? (
                  <div className="relative h-36 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 group">
                    <img src={photoUrl} alt="Checkpoint Surveillance" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" /> Replace Photo
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-neutral-700 hover:border-fresh-400 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 transition-all cursor-pointer p-4 text-center">
                    <Camera className="w-6 h-6 text-neutral-400 mb-1" />
                    <span className="font-bold text-xs text-white">Upload Surveillance Photo</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">JPEG, PNG, WebP (Max 10 MB)</span>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neutral-850">
              <Button variant="outline" className="flex-1 border-neutral-700 text-neutral-300" onClick={() => setActiveModalChk(null)}>
                Cancel
              </Button>
              <Button className="flex-[2] bg-forest-600 hover:bg-forest-700 text-white font-bold py-3" onClick={handleSaveCheckpoint} disabled={isUploading}>
                Save Inspection Data <CheckCircle2 className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
