import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Camera, Image as ImageIcon, MapPin, Navigation, 
  AlertTriangle, CheckCircle2, ChevronRight, 
  ChevronLeft, Sparkles, ArrowRight, Loader2, RefreshCw, ShieldAlert
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { ImpactCelebration } from '../components/ui/impact/ImpactMoments';
import { cn } from '../utils/cn';
import type { 
  PollutionReport, WasteCategory, Severity, 
  EvidenceSourceType, LocationSourceType, PollutionAIAnalysis 
} from '../types';
import { useAuth } from '../hooks/useAuth';
import { auth, isDemoMode } from '../lib/firebase';
import { hotspotService } from '../services/hotspotService';
import { storageService } from '../services/storageService';
import { aiAnalysisService } from '../services/aiAnalysisService';

const WASTE_CATEGORIES: { id: WasteCategory; label: string; icon: string }[] = [
  { id: 'plastic', label: 'Plastic Waste', icon: '🥤' },
  { id: 'mixed', label: 'Mixed Municipal', icon: '🗑️' },
  { id: 'organic', label: 'Food / Organic', icon: '🍎' },
  { id: 'industrial', label: 'Construction', icon: '🧱' },
  { id: 'electronic', label: 'E-Waste', icon: '💻' },
  { id: 'chemical', label: 'Chemical / Other', icon: '⚠️' }
];

const SEVERITIES: { id: Severity; label: string; color: string }[] = [
  { id: 'low', label: 'Low', color: 'bg-green-500/20 text-green-300 border-green-500/40' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { id: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { id: 'critical', label: 'Critical', color: 'bg-coral-500/20 text-coral-300 border-coral-500/40' }
];

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function Report() {
  const navigate = useNavigate();
  const { user, isDemo, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const queryLat = searchParams.get('lat');
  const queryLng = searchParams.get('lng');

  const [step, setStep] = useState<number>(1);
  const [report, setReport] = useState<PollutionReport>({
    categories: ['plastic'],
    severity: 'medium',
    status: 'draft',
    estimatedWaste: 'Approx. 45 kg',
    evidenceSource: 'CAMERA_CAPTURE',
    locationSource: 'BROWSER_GPS'
  });

  const [isFromMap, setIsFromMap] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiStepStage, setAiStepStage] = useState<string>('Scanning evidence photo...');
  const [aiResult, setAiResult] = useState<PollutionAIAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [createdHotspotId, setCreatedHotspotId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Storage Upload state, preview state & Dual Input refs
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'preparing' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Prefill location if lat/lng query params exist from Explore Map
  useEffect(() => {
    if (queryLat && queryLng) {
      const lat = parseFloat(queryLat);
      const lng = parseFloat(queryLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setIsFromMap(true);
        setReport(prev => ({
          ...prev,
          locationSource: 'MANUAL',
          location: {
            lat,
            lng,
            name: `Map Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            address: `GPS Pin: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          }
        }));
      }
    }
  }, [queryLat, queryLng]);

  // Revoke object URL on cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Real AI analysis execution at Step 4
  const triggerAiAnalysis = async () => {
    if (!report.imageUrl) return;
    setIsAnalyzing(true);
    setAiError(null);

    setAiStepStage('Scanning evidence photo...');
    const t1 = setTimeout(() => setAiStepStage('Identifying visible waste types...'), 600);
    const t2 = setTimeout(() => setAiStepStage('Assessing severity & environmental risks...'), 1200);
    const t3 = setTimeout(() => setAiStepStage('Generating cleanup & prevention strategy...'), 1800);

    try {
      const analysis = await aiAnalysisService.analyzePollutionImage({
        imageUrl: report.imageUrl,
        imageBlob: selectedFile || undefined,
        userCategories: report.categories,
        locationName: report.location?.name
      });

      setAiResult(analysis);
      setReport(prev => ({
        ...prev,
        aiAnalysis: {
          detectedWaste: analysis.detectedWasteTypes,
          confidence: analysis.confidence,
          estimatedWaste: 'Visual Estimate Only',
          severity: analysis.severityAssessment,
          risk: analysis.environmentalImpacts[0] || 'Environmental risk identified',
          immediateAction: analysis.cleanupRecommendations[0] || 'Volunteer cleanup recommended',
          prevention: analysis.preventionRecommendations[0] || 'Community waste infrastructure'
        }
      }));
    } catch (err: any) {
      console.warn('AI Analysis failed:', err);
      setAiError('AI vision service unavailable. You can proceed with manual report submission.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      setStep(4);
      triggerAiAnalysis();
    } else {
      setStep(s => Math.min(s + 1, 6));
    }
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  // Geolocation Handler with Accuracy & Timestamp
  const handleGetLocation = (source: LocationSourceType = 'BROWSER_GPS') => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const now = new Date().toISOString();
        setReport(prev => ({
          ...prev,
          gpsAccuracy: pos.coords.accuracy,
          locationCapturedAt: now,
          locationSource: source,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: `GPS Pin (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            address: `GPS Pin: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
          }
        }));
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location capture error:', err);
        setIsLocating(false);
        setLocationError('GPS access denied or unavailable. Manual location required.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Perform background compression and Cloud/Demo Storage upload
  const startAsyncUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadStatus('preparing');
    setUploadProgress(10);
    setUploadError(null);

    try {
      const tempHotspotId = `draft_${Date.now()}`;
      const persistentUrl = await storageService.uploadBeforePhoto(fileToUpload, tempHotspotId, (progress) => {
        if (progress < 35) {
          setUploadStatus('preparing');
        } else {
          setUploadStatus('uploading');
        }
        setUploadProgress(Math.round(progress));
      });

      setUploadStatus('success');
      // Update report.imageUrl with persistent cloud/demo URL
      setReport(prev => ({ ...prev, imageUrl: persistentUrl }));
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setUploadStatus('error');
      setUploadError(err.message || 'Photo ready, but cloud upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Instant Photo Selection Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, source: EvidenceSourceType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid photo format.');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      return;
    }

    // 1. Revoke previous blob preview if any
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // 2. INSTANT PHOTO PREVIEW VIA LOCAL OBJECT URL
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setSelectedFile(file);

    const capturedTime = new Date().toISOString();
    setReport(prev => ({
      ...prev,
      photoCapturedAt: capturedTime,
      evidenceSource: source,
      imageUrl: localUrl // Preview displays IMMEDIATELY!
    }));

    // 3. ASYNC BACKGROUND GPS
    handleGetLocation('BROWSER_GPS');

    // 4. ASYNC BACKGROUND COMPRESSION & UPLOAD
    startAsyncUpload(file);

    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Retry Upload Handler if network fails
  const handleRetryUpload = () => {
    if (selectedFile) {
      startAsyncUpload(selectedFile);
    }
  };

  const toggleCategory = (cat: WasteCategory) => {
    setReport(prev => {
      const exists = prev.categories.includes(cat);
      if (exists && prev.categories.length > 1) {
        return { ...prev, categories: prev.categories.filter(c => c !== cat) };
      }
      return { ...prev, categories: [...prev.categories, cat] };
    });
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Submit Pollution Report via hotspotService
  const handleSubmitReport = async () => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setSubmitError(null);

    // Auth state initialization race protection
    if (authLoading) {
      setSubmitError('Checking your sign-in status... Please try again in a moment.');
      return;
    }

    // Live Firebase Auth Source of Truth
    const liveFirebaseUid = auth?.currentUser?.uid;

    // Live Firebase Mode authentication requirement check (NEVER allow unauthenticated/demo writes in Live Mode)
    if (!isDemoMode() && !liveFirebaseUid) {
      setSubmitError('Please sign in before submitting a pollution report.');
      return;
    }

    const liveReporterId = !isDemoMode() ? liveFirebaseUid! : (user?.uid || 'demo-user-1');

    if (import.meta.env.DEV) {
      console.info('[REPORT AUTH DEBUG]', {
        authCurrentUserUid: liveFirebaseUid,
        userProfileUid: user?.uid,
        reporterId: liveReporterId
      });
    }

    setIsSubmitting(true);
    try {
      const newHotspotId = await hotspotService.createHotspot({
        title: report.location?.name ? `Hotspot at ${report.location.name}` : 'Reported Pollution Hotspot',
        description: report.description || 'Reported via TrashChain Field App.',
        location: report.location?.address || 'Pine Street Lot',
        coordinates: report.location ? { lat: report.location.lat, lng: report.location.lng } : { lat: 40.7128, lng: -74.0060 },
        distance: '0.8 km',
        estimatedWaste: report.estimatedWaste || 'Approx. 45 kg',
        category: report.categories[0] || 'mixed',
        severity: report.severity || 'medium',
        status: 'reported',
        reportedAt: new Date().toISOString().split('T')[0],
        reporterId: liveReporterId,
        images: report.imageUrl ? [report.imageUrl] : ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800'],
        beforePhotoUrl: report.imageUrl || '',
        photoCapturedAt: report.photoCapturedAt || new Date().toISOString(),
        gpsAccuracy: report.gpsAccuracy,
        locationCapturedAt: report.locationCapturedAt,
        evidenceSource: report.evidenceSource || 'GALLERY_UPLOAD',
        locationSource: report.locationSource || 'BROWSER_GPS',
        wasteTypes: report.categories,
        isRecurring: report.recurring || false,
        reportedBy: user?.displayName || 'Citizen Volunteer',
        aiAnalysis: report.aiAnalysis
      });

      setCreatedHotspotId(newHotspotId);
      setShowCelebration(true);
      setStep(6);
    } catch (err: any) {
      console.error('[Report] Failed to submit report:', err);
      let humanError = "We couldn't save this report. Please try again.";
      if (err.code === 'permission-denied') {
        humanError = "You don't currently have permission to submit this report.";
      } else if (err.code === 'unauthenticated') {
        humanError = "Your session has expired. Please sign in again.";
      } else if (err.code === 'invalid-argument') {
        humanError = "Some report information is invalid. Please review the form.";
      } else if (err.code === 'unavailable') {
        humanError = "The service is temporarily unavailable. Please try again.";
      }
      setSubmitError(humanError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return !!report.imageUrl && !isUploading && uploadStatus !== 'error';
      case 2: return !!report.location;
      case 3: return report.categories.length > 0 && !!report.severity;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-28">
      
      {/* Reusable Celebration Micro-Interaction */}
      <ImpactCelebration 
        show={showCelebration}
        title="Recovery Chain Initiated"
        message="You just added a real place to the recovery map."
        onClose={() => setShowCelebration(false)}
      />

      {/* 1. REPORT HERO HEADER */}
      <header className="bg-neutral-950 border-b border-neutral-850 px-4 py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                {isDemo ? 'DEMO MODE' : 'LIVE FIREBASE PILOT'}
              </Badge>
              <span className="text-xs font-mono text-neutral-500">FIELD RECOVERY PIPELINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Report a Polluted Space</h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Capture what you see. We'll help turn it into a community recovery mission.
            </p>
          </div>
        </div>
      </header>

      {/* 2. PROGRESS STEP BAR */}
      {step < 6 && (
        <div className="bg-neutral-900/90 border-b border-neutral-850 sticky top-0 z-30 backdrop-blur-md px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button onClick={handleBack} className="p-1.5 hover:bg-neutral-800 rounded-full text-neutral-300">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <span className="text-xs font-mono font-bold text-fresh-400">
                STEP 0{step} OF 05 — {['EVIDENCE', 'LOCATION', 'WASTE & SEVERITY', 'AI ANALYSIS', 'REVIEW'][step - 1]}
              </span>
            </div>

            {/* Desktop Step Dots */}
            <div className="hidden sm:flex gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-fresh-400" : 
                  i < step ? "w-2 bg-fresh-600" : "w-2 bg-neutral-800"
                )} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: EVIDENCE CAPTURE */}
          {step === 1 && (
            <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white">Show Us the Problem</h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                  A clear photo helps the community understand what needs to change.
                </p>
              </div>

              {/* Hidden Dual Inputs */}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={cameraInputRef} 
                onChange={(e) => handleImageUpload(e, 'CAMERA_CAPTURE')} 
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={galleryInputRef} 
                onChange={(e) => handleImageUpload(e, 'GALLERY_UPLOAD')} 
              />

              {/* 1. DROPZONE WHEN NO PHOTO SELECTED */}
              {!report.imageUrl ? (
                <div className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-900 p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-forest-950 text-fresh-400 border border-fresh-500/30 rounded-full flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-lg">Select Evidence Photo</p>
                    <p className="text-xs text-neutral-400">Wide-angle photos recommended for AI scan</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs pt-2 font-mono">
                    <Button 
                      type="button"
                      onClick={() => cameraInputRef.current?.click()} 
                      className="flex-1 bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 text-xs flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Take Photo
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => galleryInputRef.current?.click()} 
                      className="flex-1 border-neutral-700 text-white font-bold py-3 text-xs flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" /> Choose Gallery
                    </Button>
                  </div>
                </div>
              ) : (
                /* 2. INSTANT PREVIEW WITH NON-BLOCKING OVERLAY STATUS */
                <div className="space-y-4">
                  <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl group">
                    <img src={report.imageUrl} alt="Evidence preview" className="w-full h-full object-cover" />
                    
                    {/* Hover Retake / Replace Controls */}
                    <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="bg-neutral-900 border-neutral-700 text-white font-bold text-xs" 
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4 mr-1.5" /> Retake Photo
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="bg-neutral-900 border-neutral-700 text-white font-bold text-xs" 
                        onClick={() => galleryInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4 mr-1.5" /> Choose Gallery
                      </Button>
                    </div>

                    {/* UPLOADING / PREPARING OVERLAY */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-2.5 z-10">
                        <Loader2 className="w-8 h-8 text-fresh-400 animate-spin" />
                        <p className="font-bold text-white text-xs font-mono">
                          {uploadProgress < 15 ? 'Preparing photo...' :
                           uploadProgress < 22 ? 'Loading image...' :
                           uploadProgress < 30 ? 'Compressing image...' :
                           uploadProgress < 35 ? 'Image optimization complete...' :
                           `Uploading evidence... ${uploadProgress}%`}
                        </p>
                        <div className="w-56 max-w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div className="bg-fresh-400 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* ERROR OVERLAY WITH RETRY */}
                    {uploadStatus === 'error' && !isUploading && (
                      <div className="absolute inset-0 bg-coral-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3 z-10">
                        <AlertTriangle className="w-8 h-8 text-coral-400" />
                        <p className="font-bold text-white text-xs font-mono max-w-xs">
                          {uploadError || 'Photo ready, but cloud upload failed.'}
                        </p>
                        <Button 
                          type="button"
                          size="sm" 
                          onClick={handleRetryUpload} 
                          className="bg-coral-600 hover:bg-coral-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Retry Upload
                        </Button>
                      </div>
                    )}

                    {/* SUCCESS BADGE */}
                    {uploadStatus === 'success' && !isUploading && (
                      <div className="absolute top-3 left-3 bg-forest-950/90 border border-fresh-500/40 text-fresh-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg backdrop-blur-md z-10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-fresh-400" /> Evidence Uploaded
                      </div>
                    )}
                  </div>

                  {/* EVIDENCE METADATA PANEL */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 block text-[9px] uppercase">PHOTO</span>
                      <span className="text-fresh-400 font-bold flex items-center gap-1">✓ Captured</span>
                    </div>
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 block text-[9px] uppercase">CAPTURED TIME</span>
                      <span className="text-white font-bold text-[11px]">
                        {new Date(report.photoCapturedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 block text-[9px] uppercase">LOCATION</span>
                      {isLocating ? (
                        <span className="text-amber-400 font-bold animate-pulse text-[11px]">Detecting...</span>
                      ) : report.location && report.gpsAccuracy ? (
                        <span className="text-fresh-400 font-bold text-[11px]">✓ GPS ± {Math.round(report.gpsAccuracy)}m</span>
                      ) : report.location ? (
                        <span className="text-yellow-400 font-bold text-[11px]">Manual Pin</span>
                      ) : (
                        <span className="text-coral-400 font-bold text-[11px]">Unavailable</span>
                      )}
                    </div>
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 block text-[9px] uppercase">SOURCE</span>
                      <span className="text-neutral-200 font-bold text-[11px]">
                        {report.evidenceSource === 'CAMERA_CAPTURE' ? 'Camera' : 'Gallery'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <motion.div key="step2" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white">Where is this location?</h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                  Help volunteers find this exact site on the recovery map.
                </p>
              </div>

              {isFromMap && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-mono flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Location selected directly from the Recovery Map</span>
                </div>
              )}

              {locationError && (
                <div className="p-4 bg-coral-950/60 border border-coral-500/40 rounded-2xl flex items-center justify-between gap-3 text-coral-300 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-coral-400 shrink-0" />
                    <span>{locationError}</span>
                  </div>
                  <Button size="sm" onClick={() => handleGetLocation('BROWSER_GPS')} className="bg-coral-900 border border-coral-500 text-white font-bold text-xs">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Try GPS Again
                  </Button>
                </div>
              )}

              {!report.location ? (
                <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <Button size="lg" onClick={() => handleGetLocation('BROWSER_GPS')} disabled={isLocating} className="w-full sm:w-auto bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 px-8 text-sm">
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Navigation className="w-4 h-4 mr-2" />}
                    {isLocating ? 'Capturing Location...' : 'Use My Current Location'}
                  </Button>
                </div>
              ) : (
                <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden space-y-4 shadow-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase",
                          report.gpsAccuracy ? "bg-fresh-500/10 text-fresh-400 border-fresh-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        )}>
                          {report.gpsAccuracy ? `GPS VERIFIED ± ${Math.round(report.gpsAccuracy)}m` : 'LOCATION NOT VERIFIED'}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          {report.evidenceSource === 'CAMERA_CAPTURE' ? 'Recorded at capture time' : 'Recorded at upload time'}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg">{report.location.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{report.location.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-neutral-700 text-xs font-bold" onClick={() => handleGetLocation('BROWSER_GPS')}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry GPS
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                    <div><span className="text-neutral-500 block text-[10px]">LATITUDE</span> <span className="font-bold text-white">{report.location.lat.toFixed(5)}</span></div>
                    <div><span className="text-neutral-500 block text-[10px]">LONGITUDE</span> <span className="font-bold text-white">{report.location.lng.toFixed(5)}</span></div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: WASTE CATEGORIES & SEVERITY */}
          {step === 3 && (
            <motion.div key="step3" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-8">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white">Classify the Waste</h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                  What kind of debris and severity are we dealing with?
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
                  Waste Categories (Multi-select)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WASTE_CATEGORIES.map(cat => {
                    const isSelected = report.categories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24",
                          isSelected 
                            ? "bg-forest-950/60 border-fresh-500 text-white shadow-lg" 
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        )}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="font-bold text-xs">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                  {SEVERITIES.map(sev => (
                    <button
                      key={sev.id}
                      onClick={() => setReport({...report, severity: sev.id})}
                      className={cn(
                        "py-3 rounded-xl border font-bold capitalize transition-all",
                        report.severity === sev.id 
                          ? `${sev.color} border-2 shadow-lg` 
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                      )}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
                    Estimated Quantity
                  </label>
                  <ImpactBadge type="ESTIMATED" size="sm" />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Approx. 45 kg, or 'about 3 bags'"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white p-4 rounded-xl focus:outline-none focus:border-forest-500 font-mono"
                  value={report.estimatedWaste || ''}
                  onChange={e => setReport({...report, estimatedWaste: e.target.value})}
                />
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-white">Does this place keep becoming dirty?</p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setReport({...report, recurring: !report.recurring})}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors",
                      report.recurring ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-neutral-950 border-neutral-800 text-neutral-400"
                    )}
                  >
                    {report.recurring ? 'Yes, recurring spot' : 'No / First time'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REAL AI VISION ANALYSIS */}
          {step === 4 && (
            <motion.div key="step4" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <Sparkles className="w-12 h-12 text-amber-400 animate-spin-slow" />
                  <h2 className="text-2xl font-black text-white">{aiStepStage}</h2>
                  <p className="text-xs text-neutral-400 max-w-sm font-mono">
                    Evaluating visible debris composition, assessing risk factors, and formulating volunteer safety guidance.
                  </p>
                </div>
              ) : aiError ? (
                <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 text-center space-y-4 shadow-xl">
                  <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">AI Analysis Unavailable</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto">{aiError}</p>
                  </div>
                  <Button onClick={() => setStep(5)} className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 px-6 font-mono">
                    Continue to Review & Submit <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-1 mb-4">
                    <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-[10px] font-mono">
                      {aiResult?.dataClassification || 'AI-ASSISTED ANALYSIS'}
                    </Badge>
                    <h2 className="text-2xl font-black text-white">AI-Assisted Scene Evaluation</h2>
                  </div>

                  <Card className="bg-neutral-900 border-neutral-800 text-white p-6 space-y-5 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 block uppercase">Primary Identified Waste</span>
                        <span className="font-bold text-white text-base">{aiResult?.primaryWasteType || 'Plastic & Mixed Debris'}</span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {aiResult?.confidence || 94}% Confidence
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase block">Detected Categories</span>
                      <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                        {aiResult?.detectedWasteTypes.map((type, idx) => (
                          <span key={idx} className="bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800 text-neutral-200">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-2">
                      <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                        <span className="text-neutral-500 block text-[9px] uppercase">Environmental Impacts</span>
                        <ul className="space-y-1 text-neutral-300 text-[11px] list-disc list-inside font-sans">
                          {aiResult?.environmentalImpacts.map((impact, idx) => (
                            <li key={idx}>{impact}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                        <span className="text-neutral-500 block text-[9px] uppercase">Volunteer Cleanup Guidance</span>
                        <ul className="space-y-1 text-neutral-300 text-[11px] list-disc list-inside font-sans">
                          {aiResult?.cleanupRecommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Prevention Strategy</span>
                      <p className="text-xs text-neutral-300 font-sans">
                        {aiResult?.preventionRecommendations[0] || 'Install visible community waste infrastructure and transform location into a planter hub.'}
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 5: INCIDENT REVIEW */}
          {step === 5 && (
            <motion.div key="step5" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white">Review Pollution Report</h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                  Confirm incident details before adding this hotspot to the recovery map.
                </p>
              </div>

              <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden space-y-4 shadow-2xl p-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{report.location?.name}</h3>
                    <p className="text-xs text-neutral-400">{report.location?.address}</p>
                  </div>
                  <Badge variant="danger" className="bg-coral-500/20 text-coral-300 border-coral-500/30 uppercase text-[10px] font-mono">
                    {report.severity}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">WASTE CATEGORY</span>
                    <span className="font-bold text-neutral-200 capitalize">{report.categories.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">ESTIMATED DEBRIS</span>
                    <span className="font-bold text-fresh-400">{report.estimatedWaste}</span>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 bg-coral-950/60 border border-coral-500/40 rounded-2xl flex items-center gap-3 text-coral-300 text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 text-coral-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleSubmitReport}
                    disabled={isSubmitting || authLoading}
                    className="flex-1 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 font-mono"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : authLoading ? (
                      'Checking Sign-in Status...'
                    ) : (
                      'Submit Pollution Report'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)} className="border-neutral-700 text-xs font-bold font-mono">
                    Edit Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 6: RECOVERY STARTED (SUCCESS STATE) */}
          {step === 6 && (
            <motion.div key="step6" variants={pageVariants} initial="initial" animate="in" exit="out" className="text-center space-y-6 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-forest-900/60 border border-fresh-400 rounded-full flex items-center justify-center mx-auto text-fresh-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-fresh-400 uppercase tracking-widest">Pipeline Active</span>
                <h2 className="text-3xl font-black text-white">Recovery Started!</h2>
                <p className="text-xs text-neutral-400">Hotspot #{createdHotspotId || 'HS-9021'} is now live on the map.</p>
              </div>

              {/* Journey Map */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl font-mono text-xs flex items-center justify-between text-neutral-400">
                <span className="text-fresh-400 font-bold">REPORT ✓</span>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <span className="text-yellow-400 font-bold">MISSION</span>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <span>CLEANUP</span>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <span>TRANSFORM</span>
              </div>

              <div className="space-y-3 pt-2">
                <Button onClick={() => navigate('/missions')} className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3.5">
                  Create Cleanup Mission <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/explore')} className="w-full border-neutral-700 text-white text-xs font-bold py-3.5">
                  View on Recovery Map
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FLOATING ACTION BAR FOR MOBILE / DESKTOP */}
      {step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-950/90 border-t border-neutral-850 backdrop-blur-md z-30 flex justify-center">
          <div className="max-w-3xl w-full flex justify-end gap-3">
            <Button 
              onClick={handleNext}
              disabled={!isStepValid() || isUploading}
              className="w-full sm:w-auto bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 px-8 shadow-lg shadow-forest-600/25"
            >
              Continue to {['Location', 'Waste & Severity', 'AI Analysis', 'Review'][step - 1]} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
