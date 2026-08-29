import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ShieldCheck, Clock, ArrowLeft,
  CheckCircle2, AlertTriangle, Leaf, Camera, X,
  Sparkles, Activity, ArrowRight, Loader2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { missions, hotspots, currentUser } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ChainLinkAnimation, RecoveryCelebration } from '../components/ui/impact/ImpactMoments';
import { cn } from '../utils/cn';
import type { MissionStatus, Mission } from '../types';

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
  
  const originalMission = missions.find(m => m.id === id) || missions[0];
  const hotspot = hotspots.find(h => h.id === originalMission.hotspotId);
  
  // Local state to simulate the entire mission lifecycle
  const [mission, setMission] = useState<Mission>(originalMission);
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
  const currentStageIdx = getStageIndex(mission.status);

  if (!hotspot) return <div>Mission not found</div>;

  const handleAcceptMission = () => {
    setMission({
      ...mission,
      status: 'accepted',
      volunteersRegistered: [...new Set([...mission.volunteersRegistered, currentUser.id])]
    });
    setIsModalOpen(false);
    setShowChainAnimation(true);
  };

  const handleStartCleanup = () => {
    setMission({ ...mission, status: 'in_progress' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const url = await storageService.uploadAfterPhoto(file, mission.id || 'mission', (progress) => {
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

  const handleSubmitProof = () => {
    setMission({ ...mission, status: 'proof_submitted' });
    setTimeout(() => {
      setMission(prev => ({ ...prev, status: 'verifying' }));
      setTimeout(() => {
        setMission(prev => ({ ...prev, status: 'verified' }));
        setShowRecoveryCelebration(true);
      }, 2500);
    }, 1500);
  };

  const isUserRegistered = mission.volunteersRegistered.includes(currentUser.id);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-28">
      
      {/* Micro-Interaction Toasts */}
      <ChainLinkAnimation 
        show={showChainAnimation} 
        message="You joined the recovery chain. One more link has been added."
        onClose={() => setShowChainAnimation(false)}
      />

      <RecoveryCelebration 
        show={showRecoveryCelebration}
        impactScore={mission.points}
        onClose={() => setShowRecoveryCelebration(false)}
      />

      {/* 1. MISSION HERO AREA */}
      <div className="relative h-72 md:h-96 w-full bg-neutral-950 border-b border-neutral-850 overflow-hidden">
        <img 
          src={hotspot.images[0]} 
          alt={mission.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        
        <div className="absolute top-4 left-4 z-10">
          <Button variant="outline" size="sm" className="bg-neutral-900/80 border-neutral-700 text-white font-bold" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Missions
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 max-w-5xl mx-auto space-y-2">
          <div className="flex gap-2">
            <Badge variant={hotspot.severity === 'critical' ? 'danger' : 'default'} className="uppercase font-mono text-[10px]">
              {hotspot.severity} Severity
            </Badge>
            <Badge variant="warning" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 uppercase font-mono text-[10px]">
              {mission.status.replace('_', ' ')}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{mission.title}</h1>
          <p className="text-neutral-300 flex items-center text-xs md:text-sm font-medium">
            <MapPin className="w-4 h-4 mr-1 text-neutral-400" /> {hotspot.location} • {hotspot.distance}
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progress & Workflows */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 7-STAGE PROGRESS TRACKER */}
          <Card className="bg-neutral-900 border-neutral-800 p-5 rounded-3xl overflow-x-auto scrollbar-none">
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

          {/* CURRENT STATE VS RECOVERY TARGET */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-coral-950/40 border border-coral-500/30 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-coral-400 uppercase">CURRENT STATE</span>
              <div className="text-2xl font-black text-coral-400 font-mono">18 / 100</div>
              <p className="text-xs text-neutral-400 font-sans">Severe plastic accumulation & contamination risk.</p>
            </div>

            <div className="p-4 bg-fresh-950/40 border border-fresh-500/30 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-fresh-400 uppercase">RECOVERY TARGET</span>
                <Badge variant="outline" className="border-fresh-500/40 text-fresh-300 text-[9px] font-mono">TARGET</Badge>
              </div>
              <div className="text-2xl font-black text-fresh-400 font-mono">75+ / 100</div>
              <p className="text-xs text-neutral-400 font-sans">Verified clean space & mini-garden installation.</p>
            </div>
          </div>

          {/* MISSION OVERVIEW */}
          {(mission.status === 'upcoming' || mission.status === 'active' || mission.status === 'accepted') && (
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-3">
                <h2 className="text-xl font-bold text-white">Why This Place Matters</h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">{mission.description}</p>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">{hotspot.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <ShieldCheck className="w-5 h-5 text-neutral-500 mb-2" />
                  <span className="text-[10px] text-neutral-500 block">Est. Waste</span>
                  <span className="font-bold text-white">{hotspot.estimatedWaste}</span>
                </div>
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
                  <span className="text-[10px] text-neutral-500 block">Risk Level</span>
                  <span className="font-bold text-coral-400 capitalize">{hotspot.severity}</span>
                </div>
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <Clock className="w-5 h-5 text-neutral-500 mb-2" />
                  <span className="text-[10px] text-neutral-500 block">Time Reported</span>
                  <span className="font-bold text-white">3 days ago</span>
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
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
                      `Waste bags ready for ${hotspot.category} segregation`,
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
                  <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3" onClick={() => setMission({...mission, status: 'proof_submitted'})}>
                    Record Cleanup Evidence <ArrowRight className="w-4 h-4 ml-1.5" />
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
                    <div className="h-44 rounded-2xl overflow-hidden border border-neutral-800 relative">
                      <img src={hotspot.images[0]} alt="Before" className="w-full h-full object-cover filter grayscale" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-fresh-400 block mb-2">AFTER CLEANUP</span>
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-fresh-500/40 rounded-2xl bg-neutral-950 p-4 text-center space-y-2">
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
                <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3.5" onClick={handleSubmitProof} disabled={!proofWaste || !proofVolunteers || isUploading}>
                  Submit Evidence for Verification <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* RECOVERY COMPLETE STATE */}
          {mission.status === 'verified' && (
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
                  <p className="text-xs text-neutral-300 mt-1">Official environmental recovery record added to the map.</p>
                </div>

                <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-left space-y-3">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Don't Let It Come Back</span>
                  <h4 className="font-bold text-white text-base">The place is clean. Now help decide what it becomes.</h4>
                  <Button onClick={() => navigate(`/missions/${mission.id}/prevention`)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3">
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
                <span className="text-fresh-400 font-bold">{mission.volunteersRegistered.length} / {mission.volunteersNeeded}</span>
              </div>
              <div className="h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                <div className="h-full bg-fresh-400 rounded-full" style={{ width: `${Math.min(100, (mission.volunteersRegistered.length / mission.volunteersNeeded) * 100)}%` }} />
              </div>
            </div>

            {!isUserRegistered && mission.status !== 'completed' && mission.status !== 'verified' && (
              <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3" onClick={() => setIsModalOpen(true)}>
                Join This Mission
              </Button>
            )}
            {isUserRegistered && (
              <div className="p-3 bg-forest-950/60 border border-forest-500/30 rounded-xl text-center font-mono text-xs text-fresh-400 font-bold">
                ✓ You're on this mission
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
                By joining this mission, you commit to assisting with the cleanup of <strong>{hotspot.location}</strong> safely and responsibly.
              </p>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 border-neutral-700 text-xs font-bold" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button className="flex-1 bg-forest-600 hover:bg-forest-700 text-xs font-bold" onClick={handleAcceptMission}>Confirm Participation</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
