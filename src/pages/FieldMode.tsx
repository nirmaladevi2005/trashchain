import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Camera, CheckCircle2, AlertTriangle, ShieldCheck, 
  Users, ArrowRight, ArrowLeft, Plus, Trash2, 
  Play, Pause, RotateCcw, Check, RefreshCw, FileText, 
  Sparkles, Scale, Info, HardHat, Save, Loader2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { RecoveryCelebration } from '../components/ui/impact/ImpactMoments';
import { missions, hotspots } from '../data/mockData';
import { cn } from '../utils/cn';
import type { 
  FieldActivityStatus, MeasurementMethod, MeasurementUnit, 
  RecurrenceStatus, WasteCategory, WasteRecord, RecoveryRecord
} from '../types';

const STORAGE_KEY = 'trashchain_field_active_activity';

const WASTE_CATEGORIES: { id: WasteCategory; label: string }[] = [
  { id: 'plastic', label: 'Plastic & Bottles' },
  { id: 'mixed', label: 'Mixed Municipal Waste' },
  { id: 'electronic', label: 'E-Waste / Appliances' },
  { id: 'organic', label: 'Organic / Green Waste' },
  { id: 'industrial', label: 'Construction / Debris' },
  { id: 'chemical', label: 'Hazardous / Chemical' },
];

const SAFETY_CHECKLIST_ITEMS = [
  { id: 'gloves', label: 'Protective gloves available for all volunteers' },
  { id: 'bags', label: 'Sturdy waste bags or sorting containers ready' },
  { id: 'water', label: 'Drinking water and first aid kit accessible' },
  { id: 'hazards', label: 'Sharp objects or hazardous materials visually identified' },
  { id: 'briefing', label: 'Team safety briefing and operational roles completed' },
  { id: 'segregation', label: 'Waste segregation plan (recycling vs refuse) understood' },
];

export default function FieldMode() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refId = id || searchParams.get('ref') || 'm-2';
  const refType = searchParams.get('type') === 'hotspot' ? 'hotspot' : 'mission';

  // Find reference item for names/coords
  const mission = missions.find(m => m.id === refId) || missions[1];
  const hotspot = hotspots.find(h => h.id === mission?.hotspotId || h.id === refId) || hotspots[1];

  // Active step in Field Mode: 1: Start, 2: Baseline, 3: Safety, 4: Active Cleanup, 5: Evidence & Proof, 6: Recovery Record
  const [step, setStep] = useState<number>(1);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Step 1: Activity Metadata & GPS
  const [activityId, setActivityId] = useState<string>('TRC-2026-002');
  const [locationName, setLocationName] = useState<string>(hotspot.location || 'Pine St & 5th Ave');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: hotspot.coordinates?.lat || 40.7150,
    lng: hotspot.coordinates?.lng || -74.0100,
    accuracy: 12
  });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'>('idle');
  const [isManualLocation, setIsManualLocation] = useState<boolean>(false);

  // Step 2: Safety Checklist
  const [checkedSafety, setCheckedSafety] = useState<Record<string, boolean>>({});
  const allSafetyChecked = SAFETY_CHECKLIST_ITEMS.every(item => checkedSafety[item.id]);

  // Step 3: Baseline Observation
  const [baselineBeforeImage, setBaselineBeforeImage] = useState<string>(hotspot.images?.[0] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800');
  const [baselineCategories, setBaselineCategories] = useState<WasteCategory[]>(['plastic', 'mixed']);
  const [baselineWeightKg, setBaselineWeightKg] = useState<number>(350);
  const [baselineClusters, setBaselineClusters] = useState<number>(5);
  const [baselineCleanliness, setBaselineCleanliness] = useState<number>(18);
  const [baselineRecurrence, setBaselineRecurrence] = useState<RecurrenceStatus>('significant_recurrence');
  const [baselineAge, setBaselineAge] = useState<string>('Old (> 1 month)');
  const [baselineConditions, setBaselineConditions] = useState<string>('Dry, sunny, heavy accumulation along fence');
  const [baselineMethod, setBaselineMethod] = useState<MeasurementMethod>('visual_estimate');

  // Step 4: Active Cleanup Timer & Waste Logging
  const [activityStatus, setActivityStatus] = useState<FieldActivityStatus>('not_started');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [volunteerCount, setVolunteerCount] = useState<number>(mission?.volunteersRegistered?.length || 12);
  const [hazardsLog, setHazardsLog] = useState<string>('Broken glass near fence');
  const [notesLog, setNotesLog] = useState<string>('Bags staged at curb for municipal disposal.');

  // Structured Waste Removal Records
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([
    { id: 'w-1', type: 'plastic', quantity: 120, unit: 'kg', method: 'weighed_on_scale', notes: 'Weighed on digital hand scale' },
    { id: 'w-2', type: 'mixed', quantity: 15, unit: 'bags', method: 'count_based_estimate', notes: 'Standard 50L refuse bags' }
  ]);
  const [newWasteType, setNewWasteType] = useState<WasteCategory>('plastic');
  const [newWasteQty, setNewWasteQty] = useState<number>(10);
  const [newWasteUnit, setNewWasteUnit] = useState<MeasurementUnit>('kg');
  const [newWasteMethod, setNewWasteMethod] = useState<MeasurementMethod>('weighed_on_scale');
  const [newWasteNotes, setNewWasteNotes] = useState<string>('');

  // Step 5 & 6: After Evidence & Recovery Record
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [recoveryRecord, setRecoveryRecord] = useState<RecoveryRecord | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (activityStatus === 'active') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activityStatus]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.activityId) {
          setActivityId(data.activityId);
          setLocationName(data.locationName || locationName);
          if (data.step) setStep(data.step);
          if (data.elapsedSeconds) setElapsedSeconds(data.elapsedSeconds);
          if (data.wasteRecords) setWasteRecords(data.wasteRecords);
          if (data.activityStatus) setActivityStatus(data.activityStatus);
          setIsSavedLocally(true);
          setLastSavedTime('Restored from storage');
        }
      } catch (e) {
        console.error('Failed to parse saved field activity', e);
      }
    } else {
      // Generate new ID
      const randomNum = Math.floor(100 + Math.random() * 900);
      setActivityId(`TRC-2026-${randomNum}`);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const stateToSave = {
      activityId,
      locationName,
      step,
      elapsedSeconds,
      wasteRecords,
      activityStatus,
      volunteerCount,
      baselineWeightKg,
      baselineCleanliness,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    setIsSavedLocally(true);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [activityId, locationName, step, elapsedSeconds, wasteRecords, activityStatus, volunteerCount, baselineWeightKg]);

  // Request GPS Location
  const handleRequestGps = () => {
    setGpsStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: Number(position.coords.latitude.toFixed(4)),
            lng: Number(position.coords.longitude.toFixed(4)),
            accuracy: Math.round(position.coords.accuracy || 12)
          });
          setGpsStatus('granted');
        },
        (error) => {
          console.warn('Geolocation error or denied:', error.message);
          setGpsStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setGpsStatus('unavailable');
    }
  };

  const handleAddWasteRecord = () => {
    if (newWasteQty <= 0) return;
    const newRec: WasteRecord = {
      id: `w-${Date.now()}`,
      type: newWasteType,
      quantity: Number(newWasteQty),
      unit: newWasteUnit,
      method: newWasteMethod,
      notes: newWasteNotes || undefined
    };
    setWasteRecords(prev => [...prev, newRec]);
    setNewWasteQty(10);
    setNewWasteNotes('');
  };

  const handleDeleteWasteRecord = (recId: string) => {
    setWasteRecords(prev => prev.filter(r => r.id !== recId));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const url = await storageService.uploadAfterPhoto(file, activityId || 'field-activity', (progress) => {
        setUploadProgress(Math.round(progress));
      }, 'recovery');
      setAfterImage(url);
    } catch (err: any) {
      console.error('Failed to upload field activity after photo:', err);
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCompleteActivity = () => {
    setActivityStatus('completed');
    // Generate recovery record
    const newRec: RecoveryRecord = {
      id: `TRC-REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      activityId,
      referenceId: refId,
      locationName,
      baseline: {
        beforeImage: baselineBeforeImage,
        categories: baselineCategories,
        estimatedWeightKg: baselineWeightKg,
        visibleClusters: baselineClusters,
        cleanlinessScore: baselineCleanliness,
        recurrenceStatus: baselineRecurrence,
        approximateAge: baselineAge,
        siteConditions: baselineConditions,
        measurementMethod: baselineMethod
      },
      evidence: {
        afterImage: afterImage || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800',
        coordinates: coords,
        timestamp: new Date().toISOString(),
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        volunteerCount,
        wasteRecords,
        notes: notesLog
      },
      status: 'submitted',
      verificationType: 'ai_assisted_review'
    };
    setRecoveryRecord(newRec);
    setShowCelebration(true);
    setStep(6);
  };

  // Calculate segregated totals
  const weighedKg = wasteRecords.filter(r => r.unit === 'kg' && r.method === 'weighed_on_scale').reduce((sum, r) => sum + r.quantity, 0);
  const estimatedKg = wasteRecords.filter(r => r.unit === 'kg' && r.method !== 'weighed_on_scale').reduce((sum, r) => sum + r.quantity, 0);
  const countedBags = wasteRecords.filter(r => r.unit === 'bags').reduce((sum, r) => sum + r.quantity, 0);
  const countedItems = wasteRecords.filter(r => r.unit === 'items').reduce((sum, r) => sum + r.quantity, 0);

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 pb-32">
      <RecoveryCelebration 
        show={showCelebration} 
        impactScore={250} 
        onClose={() => setShowCelebration(false)} 
      />
      {/* Top Mobile Field Header with Offline Status */}
      <div className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-fresh-400 uppercase tracking-wider">{activityId}</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">FIELD MODE</span>
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">{locationName}</h1>
          </div>
        </div>

        {/* LocalStorage Sync Badges */}
        <div className="flex items-center gap-2 shrink-0">
          {isSavedLocally ? (
            <div className="flex items-center gap-1.5 bg-forest-950/80 border border-forest-500/40 text-fresh-400 px-2.5 py-1 rounded-full text-xs font-mono" title={`Last saved: ${lastSavedTime}`}>
              <Save className="w-3 h-3 text-fresh-400 animate-pulse" />
              <span className="hidden sm:inline font-bold">Saved locally</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-xs font-mono">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Waiting for sync</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Step Progress Bar */}
        <div className="grid grid-cols-6 gap-1.5 bg-neutral-950 p-2 rounded-2xl border border-neutral-800">
          {[
            { s: 1, label: '1. Start' },
            { s: 2, label: '2. Baseline' },
            { s: 3, label: '3. Safety' },
            { s: 4, label: '4. Active' },
            { s: 5, label: '5. Evidence' },
            { s: 6, label: '6. Record' },
          ].map(item => (
            <button
              key={item.s}
              onClick={() => { if (item.s <= Math.max(step, 4)) setStep(item.s); }}
              disabled={item.s > step && step < 4}
              className={cn(
                "py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center",
                step === item.s 
                  ? "bg-forest-600 text-white font-bold shadow-md shadow-forest-900/50 ring-1 ring-fresh-400/30" 
                  : step > item.s 
                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700" 
                    : "bg-neutral-900/50 text-neutral-600 cursor-not-allowed opacity-40"
              )}
            >
              <span className="text-[10px] font-mono block sm:hidden">0{item.s}</span>
              <span className="text-xs font-bold hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>

        {/* STEP 1: START FIELD ACTIVITY & GPS */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <Badge variant="success" className="bg-fresh-500/20 text-fresh-400 border-fresh-500/30 mb-2">Step 1 of 6: Initialization</Badge>
                  <h2 className="text-2xl font-black text-white">Start Field Activity</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Confirm site coordinates and reference metadata before recording baseline environmental conditions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-900 p-4 rounded-2xl border border-neutral-800/80 font-mono text-xs">
                  <div>
                    <span className="text-neutral-500 block mb-0.5">ACTIVITY REFERENCE ID</span>
                    <span className="text-sm font-bold text-white">{activityId}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">MISSION / HOTSPOT REF</span>
                    <span className="text-sm font-bold text-fresh-400 uppercase">{refType}: {refId}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">DATE & TIME</span>
                    <span className="text-sm text-neutral-200">{new Date().toLocaleDateString()} — {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">OFFLINE PERSISTENCE</span>
                    <span className="text-sm text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> localStorage Active</span>
                  </div>
                </div>

                {/* GPS Location Section */}
                <div className="space-y-4 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-fresh-400" /> Site Coordinates & GPS Accuracy
                    </label>
                    <span className="text-xs font-mono text-neutral-400">Accuracy: ± {coords.accuracy}m</span>
                  </div>

                  <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-sm">
                      <div>
                        <p className="text-neutral-400 text-xs">CURRENT RECORDED GPS</p>
                        <p className="font-bold text-white mt-0.5">{coords.lat} N, {coords.lng} W</p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white font-bold"
                        onClick={handleRequestGps}
                        disabled={gpsStatus === 'loading'}
                      >
                        {gpsStatus === 'loading' ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin text-fresh-400" />
                        ) : (
                          <MapPin className="w-4 h-4 mr-2 text-fresh-400" />
                        )}
                        Use My Current Location
                      </Button>
                    </div>

                    {gpsStatus === 'denied' && (
                      <div className="bg-amber-950/50 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>Location permission denied. You may manually verify or adjust coordinates below. The system will never crash if GPS is unavailable.</span>
                      </div>
                    )}
                    {gpsStatus === 'unavailable' && (
                      <div className="bg-neutral-800 p-3 rounded-xl text-xs text-neutral-300">
                        Browser geolocation unavailable on this device. Using reference site coordinates.
                      </div>
                    )}
                    {gpsStatus === 'granted' && (
                      <div className="bg-forest-950/50 border border-forest-500/40 p-3 rounded-xl text-xs text-fresh-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-fresh-400 shrink-0" />
                        <span>High-accuracy GPS lock acquired (± {coords.accuracy} metres).</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button 
                        type="button" 
                        onClick={() => setIsManualLocation(!isManualLocation)}
                        className="text-xs font-bold text-neutral-400 hover:text-white underline decoration-dotted"
                      >
                        {isManualLocation ? "Hide Manual Location Override" : "Manually Adjust Location Name / Coordinates"}
                      </button>

                      {isManualLocation && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-neutral-800">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Site Name</label>
                            <input 
                              type="text" 
                              value={locationName} 
                              onChange={e => setLocationName(e.target.value)} 
                              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:border-fresh-400 outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Latitude</label>
                              <input 
                                type="number" 
                                step="0.0001"
                                value={coords.lat} 
                                onChange={e => setCoords({ ...coords, lat: parseFloat(e.target.value) || coords.lat })} 
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:border-fresh-400 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Longitude</label>
                              <input 
                                type="number" 
                                step="0.0001"
                                value={coords.lng} 
                                onChange={e => setCoords({ ...coords, lng: parseFloat(e.target.value) || coords.lng })} 
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:border-fresh-400 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-lg py-6 rounded-2xl shadow-lg shadow-forest-900"
                  onClick={() => setStep(2)}
                >
                  Confirm Site & Continue to Baseline <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-[11px] text-center text-neutral-500">
                  Data is stored safely in your browser (localStorage). Do not clear browser data until synced.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: BASELINE OBSERVATION CAPTURE */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-2">Step 2 of 6: Baseline Capture</Badge>
                    <h2 className="text-2xl font-black text-white">Baseline Site Observation</h2>
                    <p className="text-sm text-neutral-400 mt-1">
                      Record before conditions prior to any physical cleanup intervention.
                    </p>
                  </div>
                  <ImpactBadge type="ESTIMATED" size="md" />
                </div>

                {/* Before Photo */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-white">1. Baseline Evidence Photo</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-44 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative">
                      <img src={baselineBeforeImage} alt="Baseline" className="w-full h-full object-cover filter grayscale opacity-90" />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                        BEFORE CLEANUP
                      </div>
                    </div>
                    <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-neutral-700 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900 hover:border-fresh-400 transition-all cursor-pointer p-4 text-center">
                      <Camera className="w-8 h-8 text-fresh-400 mb-2" />
                      <span className="font-bold text-sm text-white">Capture / Upload Photo</span>
                      <span className="text-xs text-neutral-400 mt-1">Use camera on mobile or file upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) setBaselineBeforeImage(URL.createObjectURL(f));
                        }} 
                      />
                    </label>
                  </div>
                </div>

                {/* Waste Categories Multi-select */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="block text-sm font-bold text-white">2. Observed Waste Categories (Multi-select)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {WASTE_CATEGORIES.map(cat => {
                      const isSelected = baselineCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) setBaselineCategories(prev => prev.filter(c => c !== cat.id));
                            else setBaselineCategories(prev => [...prev, cat.id]);
                          }}
                          className={cn(
                            "p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between",
                            isSelected 
                              ? "bg-forest-600/30 border-fresh-400 text-white ring-1 ring-fresh-400/50" 
                              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                          )}
                        >
                          <span>{cat.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-fresh-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Quantity & Measurement Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-bold text-white">3. Estimated Weight (kg)</label>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        ESTIMATED ONLY
                      </span>
                    </div>
                    <input 
                      type="number" 
                      value={baselineWeightKg} 
                      onChange={e => setBaselineWeightKg(Number(e.target.value) || 0)} 
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-base font-mono font-bold text-white focus:border-fresh-400 outline-none"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Do not falsely claim measured weight if you are entering an estimate.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1.5">4. Measurement Method</label>
                    <select 
                      value={baselineMethod} 
                      onChange={e => setBaselineMethod(e.target.value as MeasurementMethod)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-fresh-400 outline-none font-medium"
                    >
                      <option value="visual_estimate">Visual Estimate (Field Observation)</option>
                      <option value="count_based_estimate">Count-based Estimate (Bags / Containers)</option>
                      <option value="weighed_on_scale">Weighed on Scale (Calibrated)</option>
                      <option value="other">Other Method</option>
                    </select>
                  </div>
                </div>

                {/* Site Cleanliness, Clusters, Age & Recurrence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="block text-sm font-bold text-white mb-1.5">5. Cleanliness ({baselineCleanliness}/100)</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={baselineCleanliness} 
                      onChange={e => setBaselineCleanliness(Number(e.target.value))}
                      className="w-full accent-fresh-400 mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                      <span>0: Dump</span>
                      <span>100: Pristine</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1.5">6. Visible Clusters</label>
                    <input 
                      type="number" 
                      value={baselineClusters} 
                      onChange={e => setBaselineClusters(Number(e.target.value) || 1)} 
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm font-mono text-white focus:border-fresh-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1.5">7. Waste Age Profile</label>
                    <select 
                      value={baselineAge} 
                      onChange={e => setBaselineAge(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-fresh-400 outline-none"
                    >
                      <option>Recent (&lt; 1 week)</option>
                      <option>1–4 weeks old</option>
                      <option>Old (&gt; 1 month)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1.5">8. Recurrence Severity</label>
                    <select 
                      value={baselineRecurrence} 
                      onChange={e => setBaselineRecurrence(e.target.value as RecurrenceStatus)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-fresh-400 outline-none"
                    >
                      <option value="clean">Clean (No Dumping)</option>
                      <option value="minor_recurrence">Minor Litter (&lt;20 kg)</option>
                      <option value="significant_recurrence">Significant Dumping (&gt;20 kg)</option>
                      <option value="requires_intervention">Critical (Immediate Action)</option>
                    </select>
                  </div>
                </div>

                {/* Site Conditions */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <label className="block text-sm font-bold text-white">8. Environmental Site Conditions</label>
                  <input 
                    type="text" 
                    value={baselineConditions} 
                    onChange={e => setBaselineConditions(e.target.value)} 
                    placeholder="e.g. Dry, windy, overgrown brush, high pedestrian traffic..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-fresh-400 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button className="flex-[2] bg-forest-600 hover:bg-forest-700 text-white font-bold py-4" onClick={() => setStep(3)}>
                    Save Baseline & Continue to Safety <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: MANDATORY SAFETY CHECKLIST */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="danger" className="bg-coral-500/20 text-coral-300 border-coral-500/30 uppercase font-bold">Mandatory Gate</Badge>
                    <span className="text-xs font-mono text-neutral-400">Step 3 of 6</span>
                  </div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <HardHat className="w-6 h-6 text-coral-400" /> Operational Safety Checklist
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    You must acknowledge all field safety requirements before entering active cleanup mode.
                  </p>
                </div>

                <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-2xl text-xs text-amber-200 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5 text-amber-300">Operational Checklist — Not a Legal Certification</p>
                    <p className="text-neutral-300 leading-relaxed">
                      This checklist ensures on-site volunteer awareness regarding waste segregation, hazardous sharps, and hydration. Organizers remain responsible for local compliance.
                    </p>
                  </div>
                </div>

                {/* Checkbox List */}
                <div className="space-y-3">
                  {SAFETY_CHECKLIST_ITEMS.map(item => {
                    const isChecked = !!checkedSafety[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => setCheckedSafety(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 select-none",
                          isChecked 
                            ? "bg-forest-950/60 border-forest-500/80 text-white ring-1 ring-fresh-400/30" 
                            : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                          isChecked ? "bg-fresh-600 border-fresh-400 text-white" : "border-neutral-600 bg-neutral-950"
                        )}>
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-bold leading-snug">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Completed items:</span>
                  <span className={cn("font-bold", allSafetyChecked ? "text-fresh-400" : "text-amber-400")}>
                    {Object.values(checkedSafety).filter(Boolean).length} / {SAFETY_CHECKLIST_ITEMS.length} Required
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    className={cn(
                      "flex-[2] font-bold py-4 transition-all text-white",
                      allSafetyChecked ? "bg-fresh-600 hover:bg-fresh-700 shadow-lg shadow-fresh-900/50" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    )}
                    disabled={!allSafetyChecked}
                    onClick={() => {
                      if (allSafetyChecked) {
                        setActivityStatus('active');
                        setStep(4);
                      }
                    }}
                  >
                    Start Active Cleanup <Play className="w-4 h-4 ml-2 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 4: ACTIVE CLEANUP TRACKER & WASTE LOGGING */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Live Activity Controller Banner */}
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-forest-600/10 rounded-full blur-3xl pointer-events-none" />
              <CardContent className="p-6 md:p-8 space-y-6 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full animate-pulse",
                        activityStatus === 'active' ? "bg-fresh-400" : activityStatus === 'paused' ? "bg-amber-400" : "bg-neutral-500"
                      )} />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Status: <span className={activityStatus === 'active' ? "text-fresh-400" : "text-amber-400"}>{activityStatus.toUpperCase()}</span>
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-white">Active Field Cleanup</h2>
                  </div>

                  {/* Big Timer Display */}
                  <div className="bg-neutral-900 px-6 py-3 rounded-2xl border border-neutral-800 text-center font-mono shrink-0 shadow-inner">
                    <span className="text-xs text-neutral-500 uppercase block font-bold">Elapsed Duration</span>
                    <span className="text-3xl font-black text-white tracking-widest">{formatTime(elapsedSeconds)}</span>
                  </div>
                </div>

                {/* Action Buttons for Field Volunteer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activityStatus === 'active' ? (
                    <Button 
                      variant="outline" 
                      className="bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50 font-bold py-4 text-base"
                      onClick={() => setActivityStatus('paused')}
                    >
                      <Pause className="w-5 h-5 mr-2 fill-current" /> Pause Timer
                    </Button>
                  ) : (
                    <Button 
                      className="bg-fresh-600 hover:bg-fresh-700 text-white font-bold py-4 text-base shadow-md shadow-fresh-900/50"
                      onClick={() => setActivityStatus('active')}
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" /> Resume Activity
                    </Button>
                  )}

                  <Button 
                    variant="outline" 
                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-bold py-4"
                    onClick={() => setVolunteerCount(prev => prev + 1)}
                  >
                    <Users className="w-4 h-4 mr-1.5 text-fresh-400" /> +1 Volunteer ({volunteerCount})
                  </Button>

                  <Button 
                    variant="outline" 
                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-bold py-4 sm:col-span-1"
                    onClick={() => {
                      const note = prompt('Log special hazard or note:', hazardsLog);
                      if (note) setHazardsLog(note);
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-400" /> Log Hazard
                  </Button>

                  <Button 
                    className="bg-forest-600 hover:bg-forest-700 text-white font-bold py-4 text-base sm:col-span-1"
                    onClick={() => {
                      setActivityStatus('paused');
                      setStep(5);
                    }}
                  >
                    Finish & Proof <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* STRUCTURED WASTE REMOVAL FORM */}
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-fresh-400" /> Structured Waste Removal Log
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Record collected items. Maintain scientific separation between measured weight and counted bags.
                    </p>
                  </div>
                  <ImpactBadge type="MEASURED" size="md" />
                </div>

                {/* Add New Waste Row Form */}
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-4">
                  <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Add Collected Waste Entry</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Category</label>
                      <select 
                        value={newWasteType} 
                        onChange={e => setNewWasteType(e.target.value as WasteCategory)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-fresh-400"
                      >
                        {WASTE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Quantity</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={newWasteQty} 
                        onChange={e => setNewWasteQty(Number(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-fresh-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Unit</label>
                      <select 
                        value={newWasteUnit} 
                        onChange={e => setNewWasteUnit(e.target.value as MeasurementUnit)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-fresh-400"
                      >
                        <option value="kg">kg (Weight)</option>
                        <option value="bags">bags (Counted)</option>
                        <option value="items">items (Individual)</option>
                        <option value="litres">litres (Volume)</option>
                        <option value="other">other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Measurement Method</label>
                      <select 
                        value={newWasteMethod} 
                        onChange={e => setNewWasteMethod(e.target.value as MeasurementMethod)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-fresh-400"
                      >
                        <option value="weighed_on_scale">Weighed on Scale</option>
                        <option value="count_based_estimate">Counted Bags/Items</option>
                        <option value="visual_estimate">Visual Estimate</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input 
                      type="text" 
                      placeholder="Optional note (e.g. 'Weighed on digital hook scale', 'Standard 50L refuse bags')..."
                      value={newWasteNotes} 
                      onChange={e => setNewWasteNotes(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-fresh-400"
                    />
                    <Button 
                      size="sm" 
                      className="bg-fresh-600 hover:bg-fresh-700 text-white font-bold px-4 shrink-0"
                      onClick={handleAddWasteRecord}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Record
                    </Button>
                  </div>
                </div>

                {/* Logged Records Table */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Logged Field Waste ({wasteRecords.length})</p>
                  {wasteRecords.length === 0 ? (
                    <div className="text-center py-8 bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-800 text-neutral-500 text-sm">
                      No waste records logged yet. Add collected bags or weighed items above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {wasteRecords.map((rec, i) => {
                        const catLabel = WASTE_CATEGORIES.find(c => c.id === rec.type)?.label || rec.type;
                        const isWeighed = rec.method === 'weighed_on_scale';
                        return (
                          <div key={rec.id} className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-neutral-800 font-mono text-xs text-neutral-400 flex items-center justify-center font-bold">
                                #{i + 1}
                              </span>
                              <div>
                                <span className="font-bold text-white">{catLabel}</span>
                                {rec.notes && <span className="text-xs text-neutral-400 block">{rec.notes}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right font-mono">
                                <span className="text-base font-black text-fresh-400">{rec.quantity} {rec.unit}</span>
                                <span className="block text-[10px] text-neutral-500 uppercase">{rec.method.replace(/_/g, ' ')}</span>
                              </div>
                              <div className="shrink-0">
                                {isWeighed ? <ImpactBadge type="MEASURED" size="sm" showIcon={false} /> : <ImpactBadge type="ESTIMATED" size="sm" showIcon={false} />}
                              </div>
                              <button 
                                onClick={() => handleDeleteWasteRecord(rec.id)}
                                className="p-1.5 text-neutral-500 hover:text-coral-400 rounded-lg hover:bg-neutral-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SCIENTIFIC SEGREGATION SUMMARY BOX */}
                <div className="bg-forest-950/60 border border-forest-500/40 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-forest-500/30 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-fresh-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Segregated Pilot Impact Summary
                    </span>
                    <span className="text-[11px] text-forest-300 font-mono">Scientific Segregation Active</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-neutral-400 block font-bold uppercase">Weighed (Measured)</span>
                      <span className="text-xl font-black text-fresh-400 mt-0.5 block">{weighedKg} kg</span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-neutral-400 block font-bold uppercase">Counted Bags</span>
                      <span className="text-xl font-black text-white mt-0.5 block">{countedBags} bags</span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-neutral-400 block font-bold uppercase">Counted Items</span>
                      <span className="text-xl font-black text-white mt-0.5 block">{countedItems} items</span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-neutral-400 block font-bold uppercase">Estimated Weight</span>
                      <span className="text-xl font-black text-amber-400 mt-0.5 block">{estimatedKg} kg</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-forest-200/90 leading-relaxed font-sans">
                    <strong>Why are these numbers not combined?</strong> To maintain pilot data credibility, TrashChain never automatically converts counted bags or visual estimates into confirmed weights without scientific calibration.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="bg-forest-600 hover:bg-forest-700 text-white font-bold py-4 px-8" onClick={() => { setActivityStatus('paused'); setStep(5); }}>
                    Proceed to After Cleanup Evidence <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 5: AFTER CLEANUP EVIDENCE & PROOF */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <Badge variant="success" className="bg-fresh-500/20 text-fresh-400 border-fresh-500/30 mb-2">Step 5 of 6: Evidence Verification</Badge>
                  <h2 className="text-2xl font-black text-white">After Cleanup Evidence</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Capture geo-verified after photos and review field summary before generating official recovery record.
                  </p>
                </div>

                {/* Viewpoint Guidance Banner */}
                <div className="bg-fresh-950/40 border border-fresh-500/40 p-4 rounded-2xl text-xs text-fresh-200 flex items-center gap-3">
                  <Camera className="w-5 h-5 text-fresh-400 shrink-0" />
                  <span>
                    <strong>Viewpoint Tip:</strong> Try to capture the after photo from approximately the same direction and angle as the before photo for accurate visual verification.
                  </span>
                </div>

                {uploadError && (
                  <div className="p-4 bg-red-950/60 border border-coral-500/40 rounded-2xl flex items-center gap-3 text-coral-300 text-xs">
                    <AlertTriangle className="w-5 h-5 text-coral-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Side-by-Side Before/After */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">1. Baseline Before Photo</label>
                    <div className="h-48 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative">
                      <img src={baselineBeforeImage} alt="Before" className="w-full h-full object-cover filter grayscale opacity-80" />
                      <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                        BEFORE CLEANUP
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-fresh-400 uppercase tracking-wider mb-2">2. Geo-Verified After Photo</label>
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-fresh-500/50 rounded-2xl bg-fresh-950/20 p-4 text-center">
                        <Loader2 className="w-8 h-8 text-fresh-400 animate-spin mb-2" />
                        <span className="font-bold text-sm text-white">Uploading after photo...</span>
                        <div className="w-48 max-w-full bg-neutral-800 h-2 rounded-full overflow-hidden mt-2">
                          <div 
                            className="bg-fresh-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-neutral-400 mt-1 font-mono">{uploadProgress}%</span>
                      </div>
                    ) : afterImage ? (
                      <div className="h-48 rounded-2xl overflow-hidden bg-neutral-900 border border-fresh-500/50 relative group">
                        <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-fresh-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono shadow">
                          AFTER CLEANUP
                        </div>
                        <button 
                          onClick={() => { setAfterImage(null); setUploadError(null); }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold gap-2"
                        >
                          <RotateCcw className="w-4 h-4" /> Replace Photo
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-fresh-500/50 rounded-2xl bg-fresh-950/20 hover:bg-fresh-950/40 hover:border-fresh-400 transition-all cursor-pointer p-4 text-center">
                        <Camera className="w-8 h-8 text-fresh-400 mb-2" />
                        <span className="font-bold text-sm text-white">Upload After Photo</span>
                        <span className="text-xs text-fresh-300/70 mt-1">Camera or file upload supported</span>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Final Activity Summary */}
                <div className="space-y-4 pt-4 border-t border-neutral-800">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Field Activity Summary</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 block mb-0.5">TOTAL DURATION</span>
                      <span className="text-base font-bold text-white">{Math.max(1, Math.round(elapsedSeconds / 60))} mins</span>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 block mb-0.5">VOLUNTEERS</span>
                      <span className="text-base font-bold text-white">{volunteerCount} persons</span>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 block mb-0.5">WEIGHED WASTE</span>
                      <span className="text-base font-bold text-fresh-400">{weighedKg} kg</span>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 block mb-0.5">COUNTED BAGS</span>
                      <span className="text-base font-bold text-white">{countedBags} bags</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Final Field Notes & Municipal Staging</label>
                    <textarea 
                      rows={2} 
                      value={notesLog} 
                      onChange={e => setNotesLog(e.target.value)} 
                      placeholder="e.g. All 12 bags staged next to east gate. Ready for municipal collection."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-fresh-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800" onClick={() => setStep(4)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    className="flex-[2] bg-fresh-600 hover:bg-fresh-700 text-white font-bold py-4 text-base shadow-lg shadow-fresh-900/50"
                    onClick={handleCompleteActivity}
                    disabled={isUploading}
                  >
                    Generate Official Recovery Record <CheckCircle2 className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 6: RECOVERY RECORD GENERATED */}
        {step === 6 && recoveryRecord && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <Card className="bg-neutral-950 border-neutral-800 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-forest-500 via-fresh-500 to-emerald-400" />
              
              <CardContent className="p-6 md:p-10 space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success" className="bg-fresh-500/20 text-fresh-300 border-0 text-xs font-bold uppercase tracking-wider">
                        Official Pilot Document
                      </Badge>
                      <span className="text-xs font-mono text-neutral-500">{recoveryRecord.id}</span>
                    </div>
                    <h2 className="text-3xl font-black text-white">Verified Recovery Record</h2>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1 font-mono">
                    <span className="text-xs text-neutral-400">STATUS: <strong className="text-fresh-400 uppercase">{recoveryRecord.status.replace(/_/g, ' ')}</strong></span>
                    <span className="text-xs text-neutral-400">DATE: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* AI-Assisted Review Disclaimer Box */}
                <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-forest-950 border border-forest-500/40 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-fresh-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">AI-assisted evidence review</h4>
                        <Badge variant="outline" className="text-[10px] bg-neutral-800 text-neutral-300 border-neutral-700">Model v4</Badge>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                        AI assists in visual before/after comparison and GPS metadata cross-referencing. Official verification requires municipal or community human oversight.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <ImpactBadge type="VERIFIED" size="md" />
                  </div>
                </div>

                {/* Evidence Comparison Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase">1. Baseline State (Score: {recoveryRecord.baseline.cleanlinessScore}/100)</span>
                    <div className="h-44 rounded-2xl overflow-hidden bg-black border border-neutral-800">
                      <img src={recoveryRecord.baseline.beforeImage} alt="Before" className="w-full h-full object-cover filter grayscale opacity-75" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono font-bold text-fresh-400 uppercase">2. Post-Cleanup Evidence (Score: 72+/100)</span>
                    <div className="h-44 rounded-2xl overflow-hidden bg-black border border-fresh-500/40 ring-1 ring-fresh-400/30">
                      <img src={recoveryRecord.evidence.afterImage} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Segregated Waste Summary Grid */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">Verified Field Waste Removal Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-500 block font-bold uppercase">Weighed on Scale</span>
                      <span className="text-2xl font-black text-fresh-400 mt-1 block">{weighedKg} kg</span>
                      <span className="text-[10px] text-fresh-500 block mt-0.5">Measured Data</span>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-500 block font-bold uppercase">Counted Bags</span>
                      <span className="text-2xl font-black text-white mt-1 block">{countedBags} bags</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">Standard 50L Refuse</span>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-500 block font-bold uppercase">Counted Items</span>
                      <span className="text-2xl font-black text-white mt-1 block">{countedItems} items</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">Individual Debris</span>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-500 block font-bold uppercase">Estimated Weight</span>
                      <span className="text-2xl font-black text-amber-400 mt-1 block">{estimatedKg} kg</span>
                      <span className="text-[10px] text-amber-500/80 block mt-0.5">Visual Estimate</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Next Steps */}
                <div className="pt-6 border-t border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-forest-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">Record Saved & Ready for Monitoring</p>
                      <p className="text-xs text-neutral-400">Scheduled for 30/60/90-Day recurrence checkpoints.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-initial border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      onClick={() => navigate('/monitoring')}
                    >
                      View 30/60/90-Day Monitoring
                    </Button>
                    <Button 
                      className="flex-1 sm:flex-initial bg-forest-600 hover:bg-forest-700 text-white font-bold"
                      onClick={() => navigate(`/missions/${refId}/prevention`)}
                    >
                      Prevent Next Dump <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
