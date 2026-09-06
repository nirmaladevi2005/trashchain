import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ShieldCheck, Clock, ArrowLeft,
  CheckCircle2, AlertTriangle, Leaf, Camera, X,
  Sparkles, Activity, ArrowRight, Loader2, FileText, Image as ImageIcon
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { hotspotService, type FirestoreHotspot } from '../services/hotspotService';
import { missionService, type FirestoreMission } from '../services/missionService';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { ChainLinkAnimation, RecoveryCelebration } from '../components/ui/impact/ImpactMoments';
import { cn } from '../utils/cn';
import type { MissionStatus } from '../types';
import { PageTransition } from '../components/ui/PageTransition';

const STATUS_STAGES = [
  { id: 'reported', label: 'Reported' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'active', label: 'Volunteers Joined' },
  { id: 'in_progress', label: 'Cleanup In Progress' },
  { id: 'proof_submitted', label: 'Proof Submitted' },
  { id: 'verifying', label: 'Verification' },
  { id: 'verified', label: 'Recovered' }
];

export default function MissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [allMissions, setAllMissions] = useState<FirestoreMission[]>([]);
  const [allHotspots, setAllHotspots] = useState<FirestoreHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Micro-interaction states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showChainAnimation, setShowChainAnimation] = useState(false);
  const [showRecoveryCelebration, setShowRecoveryCelebration] = useState(false);
  
  // Proof Submission State
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofWaste, setProofWaste] = useState('');
  const [proofVolunteers, setProofVolunteers] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to central hotspotService and missionService
  useEffect(() => {
    const unsubHotspots = hotspotService.subscribeToHotspots((hList) => {
      setAllHotspots(hList);
    });

    const unsubMissions = missionService.subscribeToMissions((mList) => {
      setAllMissions(mList);
      setLoading(false);
    });

    return () => {
      unsubHotspots();
      unsubMissions();
    };
  }, []);

  // Resolve mission and linked hotspot
  const mission = useMemo(() => {
    return allMissions.find(m => m.id === id);
  }, [allMissions, id]);

  const linkedHotspotId = mission?.hotspotId || (mission as any)?.linkedHotspotId;

  const hotspot = useMemo(() => {
    if (!linkedHotspotId) return null;
    return allHotspots.find(h => h.id === linkedHotspotId);
  }, [allHotspots, linkedHotspotId]);

  const evidenceImage = useMemo(() => {
    if (!hotspot) return null;
    return (
      (hotspot.images && hotspot.images.length > 0 && hotspot.images[0]) ||
      hotspot.beforePhotoUrl ||
      hotspot.imageUrl ||
      hotspot.photoURL ||
      hotspot.evidencePhoto ||
      (hotspot as any).image ||
      (hotspot as any).photo ||
      null
    );
  }, [hotspot]);

  useEffect(() => {
    setImageLoadError(false);
  }, [evidenceImage]);

  // Derive current stage index
  const getStageIndex = (status: MissionStatus) => {
    switch(status) {
      case 'upcoming': return 0;
      case 'accepted': return 1;
      case 'active': return 2;
      case 'in_progress': return 3;
      case 'proof_submitted': return 4;
      case 'verifying': return 5;
      case 'completed': return 6;
      case 'verified': return 6;
      default: return 0;
    }
  };

  const currentUserId = user?.uid || 'demo-user-1';

  const handleAcceptMission = async () => {
    if (!mission) return;
    await missionService.joinMission(mission.id, currentUserId);
    await missionService.updateMissionStatus(mission.id, 'accepted');
    setIsModalOpen(false);
    setShowChainAnimation(true);
  };

  const handleStartCleanup = async () => {
    if (!mission) return;
    await missionService.updateMissionStatus(mission.id, 'in_progress');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !mission) return;

    setUploadError(null);
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid photo format.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const url = await storageService.uploadAfterPhoto(file, mission.id, (progress) => {
        setUploadProgress(Math.round(progress));
      }, 'missions');
      setProofImage(url);
    } catch (err: any) {
      console.error('Failed to upload proof photo:', err);
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmitProof = async () => {
    if (!mission) return;
    await missionService.updateMissionStatus(mission.id, 'proof_submitted');
    setTimeout(async () => {
      await missionService.updateMissionStatus(mission.id, 'verifying');
      setTimeout(async () => {
        await missionService.updateMissionStatus(mission.id, 'verified');
        setShowRecoveryCelebration(true);
      }, 2000);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3 font-mono text-xs">
          <Loader2 className="w-8 h-8 animate-spin text-fresh-400" />
          <span>Loading mission details...</span>
        </div>
      </div>
    );
  }

  // Handle missing mission gracefully (Requirement 8)
  if (!mission) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-8">
        <div className="max-w-xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Mission Not Found</h2>
          <p className="text-xs text-neutral-400 font-mono">
            Mission ID #{id} could not be located in the active network database.
          </p>
          <Button onClick={() => navigate('/missions')} className="bg-forest-600 hover:bg-forest-700 font-bold text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Cleanup Missions
          </Button>
        </div>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(mission.status);
  const isUserRegistered = mission.volunteersRegistered?.includes(currentUserId);
  const aiAnalysis: any = hotspot?.aiAnalysis;

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-28">
      
      {/* Micro-Interaction Toasts */}
      <ChainLinkAnimation 
        show={showChainAnimation} 
        message="You joined the recovery chain. One more link has been added."
        onClose={() => setShowChainAnimation(false)}
      />

      <RecoveryCelebration 
        show={showRecoveryCelebration}
        impactScore={mission.points || 150}
        onClose={() => setShowRecoveryCelebration(false)}
      />

      {/* 1. MISSION HERO AREA */}
      <div className="relative h-72 md:h-96 w-full bg-neutral-950 border-b border-neutral-850 overflow-hidden">
        <img 
          src={evidenceImage || hotspot?.images?.[0] || hotspot?.beforePhotoUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80f4173?auto=format&fit=crop&q=80&w=800'}
          alt={mission.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        
        <div className="absolute top-4 left-4 z-10">
          <Button variant="outline" size="sm" className="bg-neutral-900/80 border-neutral-700 text-white font-bold text-xs" onClick={() => navigate('/missions')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Missions
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 max-w-5xl mx-auto space-y-2">
          <div className="flex gap-2 flex-wrap">
            {hotspot && (
              <Badge variant={hotspot.severity === 'critical' ? 'danger' : 'default'} className="uppercase font-mono text-[10px]">
                {hotspot.severity} Severity
              </Badge>
            )}
            <Badge variant="warning" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 uppercase font-mono text-[10px]">
              {mission.status.replace('_', ' ')}
            </Badge>
            {hotspot && (
              <Badge variant="outline" className="bg-neutral-950/80 text-neutral-300 border-neutral-700 text-[10px] font-mono">
                {hotspot.dataSource || 'DEMO DATA'}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{mission.title}</h1>
          <p className="text-neutral-300 flex items-center text-xs md:text-sm font-medium">
            <MapPin className="w-4 h-4 mr-1 text-neutral-400" /> {hotspot?.location || 'Location Pending'}
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progress & Workflows */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 7-STAGE PROGRESS TRACKER */}
          <Card className="bg-neutral-900 border-neutral-800 p-5 rounded-3xl overflow-x-auto scrollbar-none shadow-xl">
            <div className="flex items-center min-w-max">
              {STATUS_STAGES.map((stage, idx) => {
                const isActive = idx === currentStageIdx;
                const isPast = idx < currentStageIdx;
                return (
                  <React.Fragment key={stage.id}>
                    <div className="flex flex-col items-center relative z-10 w-24">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300",
                        isActive ? "bg-forest-600 text-white ring-4 ring-forest-500/30" :
                        isPast ? "bg-fresh-500 text-neutral-950 font-black" : "bg-neutral-800 text-neutral-500"
                      )}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : (idx + 1)}
                      </div>
                      <p className={cn(
                        "text-[10px] font-mono font-bold text-center mt-2",
                        (isActive || isPast) ? "text-fresh-400" : "text-neutral-500"
                      )}>
                        {stage.label}
                      </p>
                    </div>
                    {idx < STATUS_STAGES.length - 1 && (
                      <div className={cn(
                        "h-1 w-12 -ml-3 -mr-3 -mt-5 rounded-full transition-colors duration-300",
                        isPast ? "bg-fresh-500" : "bg-neutral-800"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </Card>

          {/* STRUCTURED "REPORTED HOTSPOT" DETAILS SECTION (Requirement 4) */}
          <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-fresh-400 font-bold uppercase tracking-widest block">LINKED REPORT DATA</span>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-fresh-400" /> Reported Hotspot Details
                </h2>
              </div>
              {hotspot && <ImpactBadge type={hotspot.dataSource === 'FIELD DATA' ? 'VERIFIED' : 'USER-REPORTED'} size="sm" />}
            </div>

            {hotspot ? (
              <div className="space-y-4">
                {/* Location & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-neutral-500 block text-[9px] uppercase font-bold">📍 REPORTED LOCATION</span>
                    <span className="font-bold text-white text-sm block">{hotspot.location}</span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-neutral-500 block text-[9px] uppercase font-bold">📌 GPS COORDINATES</span>
                    <span className="font-bold text-fresh-400 text-xs block">
                      {hotspot.coordinates?.lat.toFixed(5)}, {hotspot.coordinates?.lng.toFixed(5)}
                    </span>
                  </div>
                </div>

                {/* Waste Category & Severity */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-neutral-500 block text-[9px] uppercase font-bold">🗑️ PROBLEM TYPE</span>
                    <span className="font-bold text-neutral-200 capitalize block">{hotspot.category} waste</span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-neutral-500 block text-[9px] uppercase font-bold">⚠️ SEVERITY</span>
                    <span className={cn(
                      "font-bold uppercase block text-xs",
                      hotspot.severity === 'critical' ? "text-coral-400" : "text-amber-400"
                    )}>
                      {hotspot.severity}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-neutral-500 block text-[9px] uppercase font-bold">⚖️ ESTIMATED DEBRIS</span>
                    <span className="font-bold text-fresh-400 block">{hotspot.estimatedWaste || 'N/A'}</span>
                  </div>
                </div>

                {/* Original Report Description */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                  <span className="text-neutral-500 block text-[9px] font-mono font-bold uppercase">📝 ORIGINAL REPORT DESCRIPTION</span>
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                    {hotspot.description || 'Reported via TrashChain Field App.'}
                  </p>
                </div>

                {/* AI Scene Analysis (Requirement 5) */}
                {aiAnalysis && (
                  <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Scene Evaluation (Gemini)
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold">
                        {aiAnalysis.confidence || 94}% Confidence
                      </span>
                    </div>

                    <p className="text-xs font-sans text-neutral-200 leading-relaxed font-semibold">
                      {aiAnalysis.summary || aiAnalysis.risk || 'Environmental risk identified at site.'}
                    </p>

                    {aiAnalysis.cleanupRecommendations && aiAnalysis.cleanupRecommendations.length > 0 && (
                      <div className="space-y-1 font-mono text-[11px]">
                        <span className="text-neutral-400 text-[10px] block uppercase font-bold">Recommended Cleanup Action:</span>
                        <ul className="list-disc list-inside text-neutral-300 font-sans space-y-0.5">
                          {aiAnalysis.cleanupRecommendations.slice(0, 2).map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Evidence Photo & Metadata */}
                <div className="space-y-2">
                  <span className="text-neutral-500 block text-[9px] font-mono font-bold uppercase">📸 REPORT EVIDENCE PHOTO</span>
                  <div className="h-56 rounded-2xl overflow-hidden border border-neutral-800 relative bg-neutral-950 flex items-center justify-center">
                    {evidenceImage && !imageLoadError ? (
                      <img
                        src={evidenceImage}
                        alt={`Report evidence for ${hotspot.title || hotspot.location}`}
                        onError={() => setImageLoadError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-neutral-950 text-neutral-500 text-xs font-mono">
                        <ImageIcon className="w-8 h-8 mb-2 text-neutral-600" />
                        <span>Evidence photo unavailable</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] pt-1">
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                    <span className="text-neutral-500 block uppercase">DATA SOURCE</span>
                    <span className="font-bold text-fresh-400">{hotspot.dataSource || 'DEMO DATA'}</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                    <span className="text-neutral-500 block uppercase">REPORTED BY</span>
                    <span className="font-bold text-white">{hotspot.reportedBy || 'Citizen Volunteer'}</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                    <span className="text-neutral-500 block uppercase">REPORT DATE</span>
                    <span className="font-bold text-white">{hotspot.reportedAt.split('T')[0]}</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                    <span className="text-neutral-500 block uppercase">HOTSPOT STATUS</span>
                    <span className="font-bold text-amber-400 capitalize">{hotspot.status.replace('_', ' ')}</span>
                  </div>
                </div>

              </div>
            ) : (
              /* Fallback state when hotspot details are missing/deleted (Requirement 8) */
              <div className="p-6 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-center space-y-2 font-mono text-xs">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-amber-300">Linked Hotspot Details Unavailable</h4>
                <p className="text-neutral-400 text-[11px] font-sans">
                  The original hotspot report (#{mission.hotspotId}) may have been archived. Mission details remain active.
                </p>
              </div>
            )}
          </Card>

          {/* MISSION OVERVIEW */}
          {(mission.status === 'upcoming' || mission.status === 'active' || mission.status === 'accepted') && (
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-3">
                <h2 className="text-xl font-bold text-white">Mission Cleanup Plan</h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">{mission.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <ShieldCheck className="w-5 h-5 text-neutral-500 mb-2" />
                  <span className="text-[10px] text-neutral-500 block">Est. Waste</span>
                  <span className="font-bold text-white">{hotspot?.estimatedWaste || 'N/A'}</span>
                </div>
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
                  <span className="text-[10px] text-neutral-500 block">Risk Level</span>
                  <span className="font-bold text-coral-400 capitalize">{hotspot?.severity || 'medium'}</span>
                </div>
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <Clock className="w-5 h-5 text-neutral-500 mb-2" />
                  <span className="text-[10px] text-neutral-500 block">Scheduled Date</span>
                  <span className="font-bold text-white">{new Date(mission.date).toLocaleDateString()}</span>
                </div>
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <Leaf className="w-5 h-5 text-fresh-400 mb-2" />
                  <span className="text-[10px] text-neutral-500 block">Impact Points</span>
                  <span className="font-bold text-fresh-400">+{mission.points} Pts</span>
                </div>
              </div>

              {isUserRegistered && (
                <div className="bg-gradient-to-r from-forest-950 to-neutral-900 border border-forest-500/40 rounded-3xl p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold text-white">You're registered for this mission!</h3>
                  <p className="text-xs text-neutral-300">Gather your supplies and begin cleanup action when ready.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center font-mono">
                    <Button size="md" className="bg-forest-600 hover:bg-forest-700 font-bold text-xs" onClick={handleStartCleanup}>
                      Start Cleanup Action
                    </Button>
                    <Link to={`/field/${mission.id}`}>
                      <Button variant="outline" size="md" className="border-neutral-700 text-white font-bold text-xs">
                        Launch Mobile Field Mode
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE CLEANUP & CHECKLIST */}
          {mission.status === 'in_progress' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-pulse" /> CLEANUP IN PROGRESS
                  </h2>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    Timer Active
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-white text-sm">Before You Start Checklist</h3>
                  <div className="space-y-2 font-sans text-xs">
                    {[
                      "Protective gloves available and worn",
                      `Waste bags ready for ${hotspot?.category || 'mixed'} segregation`,
                      "Sharp objects and hazards identified",
                      "Team briefed on safe handling route"
                    ].map((task, i) => (
                      <label key={i} className="flex items-start gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-850 cursor-pointer hover:border-neutral-700">
                        <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-forest-500" />
                        <span className="text-neutral-300">{task}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row gap-3">
                  <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 font-mono" onClick={() => handleSubmitProof()}>
                    Record & Submit Cleanup Evidence <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* AFTER PHOTO / PROOF UPLOAD */}
          {mission.status === 'proof_submitted' && !proofImage && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Submit Cleanup Proof</h2>
              <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 space-y-6 shadow-xl">
                {uploadError && (
                  <div className="p-4 bg-coral-950/60 border border-coral-500/40 rounded-2xl flex items-center gap-3 text-coral-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-coral-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-neutral-400 block mb-2">BEFORE STATE</span>
                    <div className="h-44 rounded-2xl overflow-hidden border border-neutral-800 relative bg-neutral-950">
                      <img src={hotspot?.images?.[0] || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800'} alt="Before" className="w-full h-full object-cover filter grayscale" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-fresh-400 block mb-2">AFTER CLEANUP</span>
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-fresh-500/40 rounded-2xl bg-neutral-950 p-4 text-center space-y-2 font-mono">
                        <Loader2 className="w-8 h-8 text-fresh-400 animate-spin" />
                        <span className="font-bold text-white text-xs">Uploading photo...</span>
                        <div className="w-40 max-w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div className="bg-fresh-400 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-950 hover:bg-neutral-900 hover:border-fresh-500/40 transition-all cursor-pointer text-center p-4">
                        <Camera className="w-8 h-8 text-fresh-400 mb-2" />
                        <span className="font-bold text-white text-xs">Upload Evidence Photo</span>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* VERIFICATION REVIEW */}
          {mission.status === 'proof_submitted' && proofImage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 space-y-6 shadow-xl">
                <h3 className="text-xl font-bold text-white">Record Waste Diverted</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-neutral-400 mb-1">Waste Removed (kg)</label>
                    <input type="text" placeholder="e.g. 150 kg" className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-white outline-none focus:border-forest-500" value={proofWaste} onChange={e => setProofWaste(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Participants</label>
                    <input type="number" placeholder="Number of volunteers" className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-white outline-none focus:border-forest-500" value={proofVolunteers} onChange={e => setProofVolunteers(e.target.value)} />
                  </div>
                </div>
                <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3.5 font-mono" onClick={handleSubmitProof} disabled={!proofWaste || !proofVolunteers || isUploading}>
                  Submit Evidence for Verification <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* RECOVERY COMPLETE STATE */}
          {(mission.status === 'verified' || mission.status === 'completed') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-gradient-to-br from-forest-950 via-neutral-900 to-neutral-950 border border-fresh-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 bg-fresh-500/20 text-fresh-400 border border-fresh-400/30 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <Badge variant="success" className="bg-fresh-500/20 text-fresh-300 border-fresh-500/30 font-mono text-[10px] uppercase">
                    Recovery Verified
                  </Badge>
                  <h2 className="text-3xl font-black text-white mt-1">Place Recovered!</h2>
                  <p className="text-xs text-neutral-300 mt-1 font-mono">
                    Official environmental recovery record added to the map for {hotspot?.location || 'reported hotspot'}.
                  </p>
                </div>

                <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-left space-y-3">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Don't Let It Come Back</span>
                  <h4 className="font-bold text-white text-base">The place is clean. Now help decide what it becomes.</h4>
                  <Button onClick={() => navigate(`/missions/${mission.id}/prevention`)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 font-mono">
                    Explore AI Prevention Recommendations <Sparkles className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column: Volunteer Actions */}
        <div className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800 text-white p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="font-bold text-lg text-white mb-1">Recover this place together</h3>
              <p className="text-xs text-neutral-400">Community volunteer participation.</p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Volunteers Joined</span>
                <span className="text-fresh-400 font-bold">{mission.volunteersRegistered?.length || 0} / {mission.volunteersNeeded}</span>
              </div>
              <div className="h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                <div className="h-full bg-fresh-400 rounded-full" style={{ width: `${Math.min(100, ((mission.volunteersRegistered?.length || 0) / mission.volunteersNeeded) * 100)}%` }} />
              </div>
            </div>

            {!isUserRegistered && mission.status !== 'completed' && mission.status !== 'verified' && (
              <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 font-mono" onClick={() => setIsModalOpen(true)}>
                Join This Mission
              </Button>
            )}
            {isUserRegistered && (
              <div className="p-3 bg-forest-950/60 border border-forest-500/30 rounded-xl text-center font-mono text-xs text-fresh-400 font-bold">
                ✓ You're registered on this mission
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Accept Mission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
              <button className="absolute top-4 right-4 text-neutral-400 hover:text-white" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 bg-forest-950 text-fresh-400 border border-fresh-400/30 rounded-2xl flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Join Recovery Mission</h2>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                By joining this mission, you commit to assisting with the cleanup of <strong>{hotspot?.location || mission.title}</strong> safely and responsibly.
              </p>

              <div className="flex gap-3 pt-2 font-mono">
                <Button variant="outline" className="flex-1 border-neutral-700 text-xs font-bold" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button className="flex-1 bg-forest-600 hover:bg-forest-700 text-xs font-bold" onClick={handleAcceptMission}>Confirm Participation</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </PageTransition>
  );
}
