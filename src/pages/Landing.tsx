import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TreePine, ArrowRight, ShieldCheck, MapPin, 
  Sparkles, Users, ArrowUpRight, Flame, Globe2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { ScoreReveal, CelebrationAmbience } from '../components/ui/impact/ImpactMoments';
import { BrandLogo } from '../components/ui/BrandLogo';
import { isDemoMode } from '../lib/firebase';
import { cn } from '../utils/cn';

const RECOVERY_STAGES = [
  { step: '01', title: 'Detect', desc: 'Community members log pollution hotspots with GPS coordinates and photographic evidence.', icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { step: '02', title: 'Mobilize', desc: 'Volunteers and local groups organize targeted cleanup missions with clear waste targets.', icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { step: '03', title: 'Recover', desc: 'Field Mode tracks real waste removed, segregated weights, and safety protocols.', icon: Flame, color: 'text-fresh-400', bg: 'bg-fresh-500/10 border-fresh-500/30' },
  { step: '04', title: 'Transform', desc: 'AI analyzes site conditions and recommends sustainable barrier interventions to stop dumping.', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { step: '05', title: 'Monitor', desc: 'Biweekly 30/60/90-day surveillance verifies whether waste recurrence has been prevented.', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
];

const BEFORE_AFTER_DATA = [
  {
    stage: 'BEFORE',
    status: 'Polluted Illegal Dump Site',
    badge: 'CRITICAL HOTSPOT',
    badgeColor: 'bg-coral-500/20 text-coral-300 border-coral-500/30',
    img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    desc: 'Unmanaged urban lot accumulating 105 kg/month mixed plastic and debris. 78% risk of toxic runoff.',
    stats: '105 kg Dumping Rate'
  },
  {
    stage: 'AFTER',
    status: 'Cleaned & Remediated Site',
    badge: 'VERIFIED RECOVERY',
    badgeColor: 'bg-fresh-500/20 text-fresh-300 border-fresh-500/30',
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    desc: 'Community volunteer mission removed 340 kg waste. Verified through GPS photo timestamps.',
    stats: '100% Waste Removed'
  },
  {
    stage: 'FUTURE',
    status: 'Transformed Community Place',
    badge: 'AI TRANSFORMATION',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
    desc: 'Community Mini Garden & Segregation Hub installed. Projected repeat dumping reduction: 65%.',
    stats: '65% Dumping Reduction'
  }
];

const PREVENTION_IDEAS = [
  { icon: '🌱', title: 'Community Mini Garden', desc: 'Converts empty dumping edges into raised planter beds, creating positive public ownership.', risk: '65% Reduction' },
  { icon: '🎨', title: 'Public Mural & Barrier', desc: 'Adds vibrant community artwork and physical fencing to signal active surveillance.', risk: '58% Reduction' },
  { icon: '♻️', title: 'Segregation & Compost Hub', desc: 'Establishes organic composting bins to divert food waste away from illegal roadside dumping.', risk: '72% Reduction' }
];

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);
  const isDemo = isDemoMode();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-forest-500 selection:text-white">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <BrandLogo variant="full" size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-300">
            <Link to="/explore" className="hover:text-fresh-400 transition-colors">Explore Map</Link>
            <Link to="/missions" className="hover:text-fresh-400 transition-colors">Missions</Link>
            <Link to="/report" className="hover:text-fresh-400 transition-colors">Report Hotspot</Link>
            <Link to="/monitoring" className="hover:text-fresh-400 transition-colors">Surveillance</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-3 py-2">
              Log in
            </Link>
            <Link to="/report">
              <Button size="sm" className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md">
                Start Recovering <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. CINEMATIC 2-COLUMN HERO SECTION */}
      <header className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-neutral-850">
        <CelebrationAmbience intensity="subtle" />
        
        {/* Background Visual Layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/40 via-neutral-950 to-neutral-950 pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 30%, #34d399 0%, transparent 65%), linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)',
            backgroundSize: '100% 100%, 36px 36px, 36px 36px'
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT COLUMN: HERO CONTENT */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Status Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-forest-950/90 border border-forest-500/40 text-fresh-400 text-xs font-mono font-bold shadow-lg"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-fresh-400 animate-ping shrink-0" />
                <span>TRASHCHAIN RECOVERY NETWORK</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-300 font-sans">{isDemo ? 'DEMO PILOT MODE' : 'LIVE FIREBASE CONNECTED'}</span>
              </motion.div>

              {/* Primary Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] font-display"
              >
                Don't Just Clean It.<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fresh-400 via-emerald-300 to-forest-400">
                  Transform It.
                </span>
              </motion.h1>

              {/* Supporting Statement */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2 text-base sm:text-lg text-neutral-300 font-normal leading-relaxed"
              >
                <p className="font-semibold text-white">
                  Report pollution. Coordinate recovery. Measure impact. Prevent recurrence.
                </p>
                <p className="text-sm text-neutral-400">
                  Community-powered environmental recovery turning neglected waste sites into verified community spaces.
                </p>
              </motion.div>

              {/* Hero CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="bg-forest-600 hover:bg-forest-700 text-white font-bold py-4 px-8 text-base shadow-xl shadow-forest-600/30 tracking-wide rounded-2xl flex items-center justify-center gap-2"
                >
                  Explore Demo →
                </Button>

                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/report')}
                  className="border-neutral-700 bg-neutral-900/80 hover:bg-neutral-850 text-white font-bold py-4 px-8 text-base rounded-2xl flex items-center justify-center gap-2"
                >
                  Start a Recovery <ArrowRight className="w-5 h-5 text-fresh-400" />
                </Button>
              </motion.div>

              {/* Trust Badge Line */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 text-xs text-neutral-400 font-mono pt-2"
              >
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-fresh-400" /> Geo-Verified</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-400" /> Community-Powered</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-400" /> AI-Assisted</span>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: ANIMATED ENVIRONMENTAL RECOVERY NETWORK VISUAL */}
            <div className="lg:col-span-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md overflow-hidden min-h-[420px] flex flex-col justify-between"
              >
                {/* Background Radar Waves */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-72 h-72 rounded-full border border-fresh-400 animate-ping" />
                  <div className="w-96 h-96 rounded-full border border-forest-500 absolute" />
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-coral-500 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-fresh-500" />
                    <span className="text-xs font-mono font-bold text-neutral-300">LIVE RECOVERY PIPELINE</span>
                  </div>
                  <ImpactBadge type={isDemo ? "ESTIMATED" : "VERIFIED"} size="sm" />
                </div>

                {/* Floating Hotspot Nodes Network */}
                <div className="relative my-8 h-56 flex items-center justify-center z-10">
                  
                  {/* Connected SVG lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                    <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="#34d399" strokeWidth="2" />
                    <line x1="50%" y1="50%" x2="70%" y2="80%" stroke="#a855f7" strokeWidth="2" strokeDasharray="2 2" />
                  </svg>

                  {/* Hotspot 1: Reported */}
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[5%] bg-neutral-950/90 border border-coral-500/50 p-3 rounded-2xl shadow-lg flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-coral-500/20 text-coral-400 flex items-center justify-center font-bold text-xs">
                      01
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[9px] text-coral-400 uppercase font-bold block">REPORTED HOTSPOT</span>
                      <span className="text-xs font-bold text-white block">Pine Street Dump</span>
                      <span className="text-[10px] text-neutral-400">105 kg Waste</span>
                    </div>
                  </motion.div>

                  {/* Hotspot 2: Active Mission */}
                  <motion.div 
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-[40%] left-[38%] bg-neutral-950/90 border border-amber-500/50 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-20"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      02
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[9px] text-amber-400 uppercase font-bold block">ACTIVE MISSION</span>
                      <span className="text-xs font-bold text-white block">EcoAlliance Cleanup</span>
                      <span className="text-[10px] text-neutral-400">12 Volunteers Active</span>
                    </div>
                  </motion.div>

                  {/* Hotspot 3: Verified Recovery */}
                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[15%] right-[5%] bg-neutral-950/90 border border-fresh-500/50 p-3 rounded-2xl shadow-lg flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-fresh-500/20 text-fresh-400 flex items-center justify-center font-bold text-xs">
                      03
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[9px] text-fresh-400 uppercase font-bold block">VERIFIED RECOVERY</span>
                      <span className="text-xs font-bold text-white block">340 kg Removed</span>
                      <span className="text-[10px] text-neutral-400">GPS Timestamped</span>
                    </div>
                  </motion.div>

                  {/* Hotspot 4: AI Transformation */}
                  <motion.div 
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute bottom-[5%] right-[15%] bg-neutral-950/90 border border-purple-500/50 p-3 rounded-2xl shadow-lg flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      04
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[9px] text-purple-400 uppercase font-bold block">AI TRANSFORMATION</span>
                      <span className="text-xs font-bold text-white block">Mini Garden Hub</span>
                      <span className="text-[10px] text-neutral-400">65% Dumping Cut</span>
                    </div>
                  </motion.div>

                </div>

                {/* Footer Metrics */}
                <div className="grid grid-cols-3 gap-3 border-t border-neutral-800 pt-4 relative z-10 font-mono text-center">
                  <div className="p-2 rounded-xl bg-neutral-950/50 border border-neutral-850">
                    <span className="text-[9px] text-neutral-400 block">TOTAL RECOVERED</span>
                    <span className="text-sm font-black text-fresh-400">3,450 kg</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-950/50 border border-neutral-850">
                    <span className="text-[9px] text-neutral-400 block">ACTIVE MISSIONS</span>
                    <span className="text-sm font-black text-amber-400">14 Pilots</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-950/50 border border-neutral-850">
                    <span className="text-[9px] text-neutral-400 block">RECURRENCE CUT</span>
                    <span className="text-sm font-black text-purple-400">78% Rate</span>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </header>

      {/* 3. RECOVERY JOURNEY: 5 CONNECTED STAGES */}
      <section className="py-20 px-4 max-w-6xl mx-auto border-b border-neutral-850">
        <div className="text-center space-y-3 mb-16">
          <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30">
            End-to-End System
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">From Pollution to Recovery</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            A continuous community process ensuring cleaned places stay clean forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {RECOVERY_STAGES.map((stg) => {
            const Icon = stg.icon;
            return (
              <div 
                key={stg.step} 
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-300 hover:translate-y-[-4px]",
                  stg.bg
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-neutral-400">{stg.step}</span>
                  <Icon className={cn("w-5 h-5", stg.color)} />
                </div>
                <h3 className="font-bold text-white text-base mb-1">{stg.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">{stg.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BEFORE / AFTER / FUTURE COMPARISON */}
      <section className="py-20 px-4 max-w-5xl mx-auto border-b border-neutral-850">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10">
            Real Site Progression
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">See What Recovery Looks Like</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            How TrashChain transforms illegal dump sites into vibrant community spaces.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-neutral-950 p-1.5 border border-neutral-800 max-w-md mx-auto">
            {BEFORE_AFTER_DATA.map((item, idx) => (
              <button
                key={item.stage}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all",
                  activeTab === idx ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {item.stage}: {item.status.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Active Tab Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="relative h-64 rounded-2xl overflow-hidden border border-neutral-800">
              <img 
                src={BEFORE_AFTER_DATA[activeTab].img} 
                alt={BEFORE_AFTER_DATA[activeTab].status} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-3 left-3">
                <span className={cn(
                  "text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border",
                  BEFORE_AFTER_DATA[activeTab].badgeColor
                )}>
                  {BEFORE_AFTER_DATA[activeTab].badge}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-fresh-400 uppercase tracking-widest">
                  Stage {activeTab + 1} of 3
                </span>
                <h3 className="text-2xl font-bold text-white">{BEFORE_AFTER_DATA[activeTab].status}</h3>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed">
                {BEFORE_AFTER_DATA[activeTab].desc}
              </p>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 font-mono text-xs text-neutral-300">
                <span className="text-neutral-500 block text-[10px] uppercase">Key Metric</span>
                <span className="font-bold text-white text-base">{BEFORE_AFTER_DATA[activeTab].stats}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ENVIRONMENTAL IMPACT METRICS */}
      <section className="py-20 px-4 max-w-6xl mx-auto border-b border-neutral-850">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30">
            Impact Intelligence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Measure the Recovery</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            Transparent metrics tracking community effort and environmental progress.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-neutral-900 border-neutral-800 text-white p-6 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-mono uppercase">Locations Recovered</span>
              {isDemo ? (
                <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">DEMO DATA</Badge>
              ) : (
                <ImpactBadge type="VERIFIED" size="sm" />
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-fresh-400">
              <ScoreReveal value={4} />
            </div>
            <p className="text-[11px] text-neutral-500">Verified clean sites</p>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white p-6 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-mono uppercase">Waste Removed</span>
              {isDemo ? (
                <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">DEMO DATA</Badge>
              ) : (
                <ImpactBadge type="MEASURED" size="sm" />
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-fresh-400">
              <ScoreReveal value={340} suffix=" kg" />
            </div>
            <p className="text-[11px] text-neutral-500">Total debris diverted</p>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white p-6 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-mono uppercase">Cleanup Missions</span>
              {isDemo ? (
                <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">DEMO DATA</Badge>
              ) : (
                <ImpactBadge type="USER-REPORTED" size="sm" />
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
              <ScoreReveal value={12} />
            </div>
            <p className="text-[11px] text-neutral-500">Organized field events</p>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white p-6 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-mono uppercase">Volunteers</span>
              {isDemo ? (
                <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">DEMO DATA</Badge>
              ) : (
                <ImpactBadge type="USER-REPORTED" size="sm" />
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-purple-400">
              <ScoreReveal value={84} />
            </div>
            <p className="text-[11px] text-neutral-500">Active community members</p>
          </Card>
        </div>
      </section>

      {/* 6. AI PREVENTION SECTION */}
      <section className="py-20 px-4 max-w-5xl mx-auto border-b border-neutral-850">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10">
            AI-Assisted Prevention
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Cleaning Is Only the Beginning.</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            TrashChain uses AI analysis to help communities decide what a recovered place should become — and how to reduce the chance of dumping returning.
          </p>
        </div>

        {/* Live AI Recommendation Preview Box */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-purple-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase">AI Prevention Recommendation</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Pine Street Lot Transformation</h3>
            </div>
            <ImpactBadge type="PROJECTED" size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Recurrence Risk</span>
              <span className="text-2xl font-black text-coral-400">78%</span>
              <span className="text-[10px] text-neutral-400 block mt-1">High risk of repeat dumping</span>
            </div>
            <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">AI Recommendation</span>
              <span className="text-lg font-bold text-purple-300 block">Community Mini Garden</span>
              <span className="text-[10px] text-neutral-400 block mt-1">Raised planter barriers</span>
            </div>
            <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Projected dumping reduction</span>
              <span className="text-2xl font-black text-fresh-400">65%</span>
              <span className="text-[10px] text-neutral-400 block mt-1">Econometric estimate</span>
            </div>
          </div>
        </div>

        {/* 3 Recommendation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREVENTION_IDEAS.map((idea) => (
            <div key={idea.title} className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 hover:border-purple-500/50 transition-colors">
              <div className="text-3xl">{idea.icon}</div>
              <h4 className="font-bold text-white text-base">{idea.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">{idea.desc}</p>
              <div className="pt-2">
                <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
                  Projected: {idea.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LIVE SATELLITE EXPERIENCE PREVIEW */}
      <section className="py-20 px-4 max-w-5xl mx-auto border-b border-neutral-850 text-center space-y-8">
        <div className="space-y-3">
          <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30">
            Real Geospatial Intelligence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Explore the Recovery Map</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            Interact with live satellite imagery tracking active hotspots, cleanup missions, and transformed sites.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-2xl relative">
          <div className="h-72 rounded-2xl bg-neutral-950 border border-neutral-800 relative overflow-hidden flex flex-col items-center justify-center p-6 space-y-4">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />
            <Globe2 className="w-12 h-12 text-fresh-400 animate-pulse" />
            <h3 className="text-xl font-bold text-white">Interactive Satellite Map</h3>
            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-coral-500"></span> Active Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Reported</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Mission</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-fresh-500"></span> Recovered</span>
            </div>
            <Button onClick={() => navigate('/explore')} className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs px-6 py-3">
              Open Recovery Map <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* 8. COMMUNITY SECTION */}
      <section className="py-20 px-4 max-w-5xl mx-auto border-b border-neutral-850 text-center space-y-8">
        <div className="space-y-3">
          <Badge variant="outline" className="border-neutral-700 text-neutral-300">
            Community Ecosystem
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Built by People Who Refuse to Walk Past the Problem.
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            Citizens, students, NSS units, community groups, and local NGOs collaborating on field recovery.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs">
          {['Citizens', 'Students', 'NSS Units', 'Community Groups', 'Local NGOs', 'Organizations'].map((cat) => (
            <div key={cat} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 font-bold">
              {cat}
            </div>
          ))}
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-2xl mx-auto text-left space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Community Pilot Story</span>
          <h4 className="font-bold text-white text-base">Pine Street Lot Recovery Chain</h4>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            "Before TrashChain, this corner was an illegal dumping site for over two years. Reporting it and holding a volunteer cleanup transformed it into a space residents actually maintain."
          </p>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="py-24 px-4 max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
          Your Street.<br />
          Your Community.<br />
          <span className="text-fresh-400">Your Chain.</span>
        </h2>
        <p className="text-neutral-300 text-base max-w-lg mx-auto">
          Choose a polluted place. Start a recovery. Help give it a better future.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/report')}
            className="w-full sm:w-auto bg-forest-600 hover:bg-forest-700 text-white font-bold py-4 px-8 text-base shadow-xl"
          >
            Start Recovering a Space <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/explore')}
            className="w-full sm:w-auto border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-white font-bold py-4 px-8 text-base"
          >
            Explore the Map
          </Button>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-neutral-950 border-t border-neutral-850 py-12 px-4 text-neutral-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-base">
              <TreePine className="w-5 h-5 text-fresh-400" /> TrashChain
            </div>
            <p className="text-neutral-400 text-[11px]">Transforming polluted spaces into verified community recoveries.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-semibold text-neutral-300">
            <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link to="/report" className="hover:text-white transition-colors">Report</Link>
            <Link to="/missions" className="hover:text-white transition-colors">Missions</Link>
            <Link to="/monitoring" className="hover:text-white transition-colors">Surveillance</Link>
            <Link to="/timeline" className="hover:text-white transition-colors">Timeline</Link>
            <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          </div>

          <div className="text-neutral-500 font-mono text-[11px] text-center md:text-right space-y-1">
            <div>Created by <span className="font-bold text-neutral-300">Nirmala Devi Patel</span></div>
            <div className="flex items-center justify-center md:justify-end gap-3 text-[10px]">
              <a
                href="https://www.linkedin.com/in/nirmaladevipatel2005/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-bold"
              >
                LinkedIn
              </a>
              <span>•</span>
              <a
                href="https://github.com/nirmaladevi2005"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:underline font-bold"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
