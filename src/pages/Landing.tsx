import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, MapPin,
  Sparkles, Users, Flame, Globe2, Brain, FileText,
  CheckCircle2, Target, Menu, X, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ScoreReveal } from '../components/ui/impact/ImpactMoments';
import { BrandLogo } from '../components/ui/BrandLogo';
import { CustomCursor } from '../components/ui/CustomCursor';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ui/ScrollReveal';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';
import { PageTransition } from '../components/ui/PageTransition';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { PersonalFooter } from '../components/layout/PersonalFooter';

// 6-Step Journey Data
const JOURNEY_STEPS = [
  { step: '01', title: 'Report', desc: 'Spot pollution and log evidence with GPS location.', icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { step: '02', title: 'Analyze', desc: 'Gemini AI evaluates waste categories and risk levels.', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { step: '03', title: 'Plan', desc: 'OpenAI formulates actionable cleanup & safety plans.', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { step: '04', title: 'Mobilize', desc: 'Convert reports into organized volunteer missions.', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { step: '05', title: 'Recover', desc: 'Remove debris and install physical site barriers.', icon: Flame, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { step: '06', title: 'Monitor', desc: 'Track post-cleanup health to prevent repeat dumping.', icon: ShieldCheck, color: 'text-sky-500', bg: 'bg-sky-500/10' },
];

const BEFORE_AFTER_DATA = [
  {
    stage: 'BEFORE',
    status: 'Polluted Illegal Dump Site',
    badge: 'CRITICAL HOTSPOT',
    badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    desc: 'Unmanaged roadside accumulation of plastic and hazardous debris threatening soil health.',
    stats: '105 kg Dumping Rate'
  },
  {
    stage: 'AFTER',
    status: 'Cleaned & Remediated Site',
    badge: 'VERIFIED RECOVERY',
    badgeColor: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    desc: 'Community volunteer mission safely removed 340 kg of waste. Verified through GPS timestamps.',
    stats: '100% Waste Removed'
  },
  {
    stage: 'FUTURE',
    status: 'Transformed Community Place',
    badge: 'AI TRANSFORMATION',
    badgeColor: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30',
    img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
    desc: 'Community Mini Garden & Composting Hub installed. Repeat dumping risk cut by 65%.',
    stats: '65% Dumping Cut'
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isDemoSession, loading: authLoading, loginDemoUser, logoutDemoUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const isDemo = isDemoSession;

  const handleExploreDemo = async () => {
    await loginDemoUser();
    navigate('/dashboard');
  };

  const handleExitDemoToLogin = async () => {
    await logoutDemoUser();
    navigate('/login');
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <PageTransition>
      <ScrollProgress />
      <div className="min-h-screen bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC] font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden transition-colors duration-200">
      <CustomCursor />
      
      {/* 1. LANDING PAGE TOP NAVIGATION BAR (ONLY ON LANDING /) */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0F0D]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E2C24] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo variant="full" size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-mono font-semibold text-[#64748B] dark:text-[#94A3B8]">
            <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Home</Link>
            <Link to="/explore" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Explore</Link>
            <Link to="/missions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Missions</Link>
            <Link to="/report" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Report</Link>
            <Link to="/timeline" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Timeline</Link>
            <Link to="/leaderboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Leaderboard</Link>
            <a href="#about-section" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</a>
          </div>

          {/* Right Actions: Theme Toggle -> Auth State Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeToggle />

            {authLoading ? (
              <div className="w-20 h-8 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : isDemoSession ? (
              <>
                <Badge variant="warning" className="bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/30 text-[10px] font-mono px-2.5 py-1">
                  DEMO MODE
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs rounded-xl px-3.5 py-2 transition-all"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExitDemoToLogin}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs rounded-xl px-3.5 py-2 transition-all"
                >
                  Log In
                </Button>
              </>
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs rounded-xl px-3.5 py-2 transition-all"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs rounded-xl px-3.5 py-2 transition-all"
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs rounded-xl px-3 py-2 transition-all"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExploreDemo}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs rounded-xl px-3.5 py-2 transition-all"
                >
                  Explore Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs rounded-xl px-3.5 py-2 transition-all"
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs rounded-xl px-4 py-2 shadow-sm transition-all"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0F172A] dark:text-white rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#121915] px-4 pt-3 pb-6 space-y-3 font-mono text-sm">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#0F172A] dark:text-white font-semibold">Home</Link>
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#0F172A] dark:text-white font-semibold">Explore</Link>
            <Link to="/missions" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#0F172A] dark:text-white font-semibold">Missions</Link>
            <Link to="/report" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#0F172A] dark:text-white font-semibold">Report</Link>
            <Link to="/timeline" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#0F172A] dark:text-white font-semibold">Timeline</Link>
            <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#0F172A] dark:text-white font-semibold">Leaderboard</Link>
            <a href="#about-section" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#0F172A] dark:text-white font-semibold">About</a>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2C24] space-y-2">
              {authLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : isDemoSession ? (
                <>
                  <div className="flex justify-center py-1">
                    <Badge variant="warning" className="bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/30 text-[10px] font-mono px-2.5 py-1">
                      DEMO MODE
                    </Badge>
                  </div>
                  <Button
                    onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                    className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3 text-xs rounded-xl"
                  >
                    Go to Dashboard (Demo)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await handleExitDemoToLogin();
                    }}
                    className="w-full border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white font-bold py-3 text-xs rounded-xl"
                  >
                    Log In to Live Mode
                  </Button>
                </>
              ) : isAuthenticated ? (
                <>
                  <Button
                    onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                    className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3 text-xs rounded-xl"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                    className="w-full border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white font-bold py-3 text-xs rounded-xl"
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await handleSignOut();
                    }}
                    className="w-full border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold py-3 text-xs rounded-xl"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await handleExploreDemo();
                    }}
                    className="w-full border-[#E2E8F0] dark:border-[#1E2C24] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold py-3 text-xs rounded-xl"
                  >
                    Explore Demo →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                    className="w-full border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#0F172A] dark:text-white font-bold py-3 text-xs rounded-xl"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}
                    className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3 text-xs rounded-xl shadow-sm"
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. CINEMATIC SPLIT HERO SECTION (HIGHLY VISIBLE IMAGERY AT 40-60% STRENGTH) */}
      <section className="relative min-h-[85vh] py-16 flex flex-col justify-between px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* SPLIT VISUAL BACKGROUND: POLLUTED (LEFT) / RESTORED (RIGHT) */}
        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 pointer-events-none z-0">
          {/* Left Polluted Image */}
          <div className="relative h-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1400"
              alt="Polluted dumping area"
              className="w-full h-full object-cover filter contrast-110 brightness-90"
            />
          </div>
          {/* Right Restored Image */}
          <div className="relative h-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1400"
              alt="Restored environmental space"
              className="w-full h-full object-cover filter brightness-95"
            />
          </div>
        </div>

        {/* CONTROLLED OVERLAY FOR CRISP TEXT READABILITY (40-60% STRENGTH) */}
        <div className="absolute inset-0 bg-[#F6F8F5]/75 dark:bg-[#0A0F0D]/75 pointer-events-none z-0 transition-colors duration-200" />

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto w-full relative z-10 my-auto pt-4">
          <div className="max-w-3xl space-y-6 text-left">
            
            {/* CLEAN COMPACT SYSTEM STATUS PILL */}
            <ScrollReveal variant="fade-up" delay={0.05}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>TRASHCHAIN RECOVERY NETWORK</span>
                <span className="text-neutral-400">•</span>
                <span className="font-bold">{isDemo ? 'DEMO MODE' : 'LIVE FIREBASE CONNECTED'}</span>
              </div>
            </ScrollReveal>

            {/* Headline */}
            <ScrollReveal variant="fade-up" delay={0.15}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] font-display text-[#0F172A] dark:text-white">
                Turn Pollution<br />
                into{' '}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Possibility
                </span>
              </h1>
            </ScrollReveal>

            {/* Supporting Copy */}
            <ScrollReveal variant="fade-up" delay={0.25}>
              <p className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] max-w-xl font-sans leading-relaxed">
                TrashChain connects communities to report pollution, organize recovery, and prevent the cycle from repeating.
              </p>
            </ScrollReveal>

            {/* Hero CTAs */}
            <ScrollReveal variant="fade-up" delay={0.35}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/report')}
                  className="bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3.5 px-7 text-base rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  Report an Issue <ArrowRight className="w-5 h-5" />
                </Button>

                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/explore')}
                  className="border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#121915] text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold py-3.5 px-7 text-base rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  Explore Map <Globe2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </Button>
              </div>
            </ScrollReveal>

            {/* Community Social Proof */}
            <ScrollReveal variant="fade-up" delay={0.45}>
              <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-mono pt-3 border-t border-[#E2E8F0] dark:border-[#1E2C24] max-w-md">
                <div className="flex -space-x-2 overflow-hidden shrink-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div className="w-7 h-7 rounded-full bg-forest-700 text-white flex items-center justify-center text-[10px] font-bold">NP</div>
                  <div className="w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-bold">AS</div>
                </div>
                <span>
                  <strong className="text-[#0F172A] dark:text-white font-bold">2,847+ changemakers</strong> making our planet cleaner
                </span>
                <Badge variant="warning" className="text-[9px] font-mono">{isDemo ? 'DEMO DATA' : 'FIELD DATA'}</Badge>
              </div>
            </ScrollReveal>

          </div>
        </div>

        {/* HERO BOTTOM: FLOATING STATISTICS CONTAINER (4 COLUMNS) */}
        <div className="max-w-7xl mx-auto w-full relative z-10 pt-10">
          <ScrollReveal variant="fade-up" delay={0.5}>
            <div className="bg-white/90 dark:bg-[#121915]/90 backdrop-blur-md border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-left">
              <div className="space-y-1 border-r border-[#E2E8F0] dark:border-[#1E2C24] pr-4 last:border-r-0">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
                  <ShieldCheck className="w-4 h-4" /> Locations Cleaned
                </div>
                <div className="text-3xl font-black text-[#0F172A] dark:text-white">
                  <ScoreReveal value={4} />
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Verified clean sites</p>
              </div>

              <div className="space-y-1 border-r border-[#E2E8F0] dark:border-[#1E2C24] pr-4 last:border-r-0">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
                  <Flame className="w-4 h-4" /> Waste Removed
                </div>
                <div className="text-3xl font-black text-[#0F172A] dark:text-white">
                  <ScoreReveal value={340} suffix=" kg" />
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Total debris diverted</p>
              </div>

              <div className="space-y-1 border-r border-[#E2E8F0] dark:border-[#1E2C24] pr-4 last:border-r-0">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase">
                  <Target className="w-4 h-4" /> Missions
                </div>
                <div className="text-3xl font-black text-[#0F172A] dark:text-white">
                  <ScoreReveal value={12} />
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Organized field events</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase">
                  <Users className="w-4 h-4" /> Active Volunteers
                </div>
                <div className="text-3xl font-black text-[#0F172A] dark:text-white">
                  <ScoreReveal value={84} />
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Registered citizens</p>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. SECTION 2 — "FROM PROBLEM TO POSSIBILITY" (6 CONNECTED PROCESS CARDS) */}
      <section className="py-24 px-4 border-t border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#121915] transition-colors duration-200">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <ScrollReveal variant="fade-up" className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
              HOW TRASHCHAIN WORKS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#0F172A] dark:text-white font-display">
              From Problem to{' '}
              <span className="text-emerald-600 dark:text-emerald-400">Possibility</span>
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-base">
              A simple 6-step journey from reporting to recovery
            </p>
          </ScrollReveal>

          {/* SIX PROCESS CARDS */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {JOURNEY_STEPS.map((stg) => {
              const Icon = stg.icon;
              return (
                <StaggerItem key={stg.step}>
                  <div className="bg-[#F6F8F5] dark:bg-[#0A0F0D] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stg.bg)}>
                        <Icon className={cn("w-6 h-6", stg.color)} />
                      </div>
                      <span className="text-2xl font-black font-mono text-neutral-300 dark:text-neutral-700">{stg.step}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F172A] dark:text-white text-xl font-display">{stg.title}</h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed font-sans">{stg.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Centered CTA */}
          <ScrollReveal variant="fade-up" className="pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/report')}
              className="bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3.5 px-8 text-base rounded-xl shadow-sm"
            >
              Start Your Journey <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </ScrollReveal>

        </div>
      </section>

      {/* 4. SECTION 3 — "BREAKING THE CYCLE OF REPEATED WASTE" (ABOUT SECTION) */}
      <section id="about-section" className="py-24 px-4 border-t border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] transition-colors duration-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT: Large Environmental Visual */}
          <div className="lg:col-span-6">
            <ScrollReveal variant="slide-right">
              <div className="relative h-96 sm:h-[440px] rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E2C24] shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200"
                  alt="Environmental Recovery Transformation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0D]/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 dark:bg-[#121915]/90 backdrop-blur-md rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] text-[#0F172A] dark:text-white font-mono text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Transformation</span>
                  </div>
                  <Badge variant="warning" className="text-[9px] font-mono">{isDemo ? 'DEMO DATA' : 'FIELD DATA'}</Badge>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT: Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <ScrollReveal variant="fade-up">
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-xs font-mono">
                BREAKING THE REPEATED DUMPING CYCLE
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] dark:text-white font-display mt-2 leading-tight">
                Breaking the Cycle of<br />
                <span className="text-emerald-600 dark:text-emerald-400">Repeated Waste</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.1}>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-base leading-relaxed font-sans">
                People clean a polluted area. After some time, trash is dumped there again. TrashChain is built to break this endless cycle through AI planning, community action, and post-cleanup surveillance monitoring.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.2}>
              <div className="space-y-3 font-sans text-sm text-[#0F172A] dark:text-neutral-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Multimodal Gemini AI for waste assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>OpenAI Recovery Planner for step-by-step cleanup guides</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Community volunteer mobilization and mission tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Biweekly surveillance monitoring to prevent repeat dumping</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.3}>
              <Button
                onClick={() => navigate('/about')}
                className="bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3 px-6 text-sm rounded-xl shadow-sm"
              >
                Learn More About TrashChain <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 5. SECTION 4 — DARK AI ENVIRONMENTAL-TECH SECTION */}
      <section className="py-24 px-4 border-t border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#121915] transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-16">
          <ScrollReveal variant="fade-up" className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="purple" className="text-xs font-mono">
              AI RECOVERY INTELLIGENCE
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] dark:text-white">
              AI That Turns Evidence Into Action
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm sm:text-base font-sans">
              Two specialized AI layers working together to analyze waste photos and formulate clear recovery steps.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
            {/* Gemini Vision Layer */}
            <ScrollReveal variant="slide-right">
              <div className="p-8 bg-[#F6F8F5] dark:bg-[#0A0F0D] border border-purple-500/30 rounded-2xl space-y-4 shadow-sm h-full">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">GEMINI VISION ANALYSIS</span>
                  <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mt-1">"What did I find?"</h3>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Scans evidence photos to identify waste categories (plastic, hazardous, municipal), estimates volume, and identifies immediate risk factors.
                </p>
                <div className="p-3 bg-white dark:bg-[#121915] rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] text-[11px] text-purple-700 dark:text-purple-300">
                  ✓ Multimodal Vision Assessment • Instant Risk Rating
                </div>
              </div>
            </ScrollReveal>

            {/* OpenAI Planner Layer */}
            <ScrollReveal variant="slide-left">
              <div className="p-8 bg-[#F6F8F5] dark:bg-[#0A0F0D] border border-indigo-500/30 rounded-2xl space-y-4 shadow-sm h-full">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">OPENAI RECOVERY PLANNER</span>
                  <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mt-1">"What should I do next?"</h3>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Generates customized step-by-step cleanup guides, equipment lists, volunteer recommendations, safety rules, and long-term site barrier ideas.
                </p>
                <div className="p-3 bg-white dark:bg-[#121915] rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] text-[11px] text-indigo-700 dark:text-indigo-300">
                  ✓ Action Plan Generation • Prevention Recommendations
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 6. SECTION 5 — RECOVERY PROOF COMPARISON */}
      <section className="py-24 px-4 border-t border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="fade-up" className="text-center space-y-3 mb-12">
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-mono text-xs">
              FIELD STAGE PROGRESSION
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#0F172A] dark:text-white">Track the Transformation</h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm max-w-xl mx-auto">
              Real site data showing how reported hotspots move from pollution to community transformation.
            </p>
          </ScrollReveal>

          <div className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Tabs */}
            <div className="flex rounded-xl bg-[#F6F8F5] dark:bg-[#0A0F0D] p-1.5 border border-[#E2E8F0] dark:border-[#1E2C24] max-w-md mx-auto">
              {BEFORE_AFTER_DATA.map((item, idx) => (
                <button
                  key={item.stage}
                  onClick={() => setActiveTab(idx)}
                  className={cn(
                    "flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer",
                    activeTab === idx ? "bg-white dark:bg-[#121915] text-[#0F172A] dark:text-white shadow-sm" : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  )}
                >
                  {item.stage}: {item.status.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Active Tab Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="relative h-64 rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E2C24]">
                <img
                  src={BEFORE_AFTER_DATA[activeTab].img}
                  alt={BEFORE_AFTER_DATA[activeTab].status}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border",
                    BEFORE_AFTER_DATA[activeTab].badgeColor
                  )}>
                    {BEFORE_AFTER_DATA[activeTab].badge}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-left font-mono">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    Stage {activeTab + 1} of 3
                  </span>
                  <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white font-sans">{BEFORE_AFTER_DATA[activeTab].status}</h3>
                </div>

                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-sans">
                  {BEFORE_AFTER_DATA[activeTab].desc}
                </p>

                <div className="p-3 bg-[#F6F8F5] dark:bg-[#0A0F0D] rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] text-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px] uppercase">Key Metric</span>
                  <span className="font-bold text-[#0F172A] dark:text-white text-base">{BEFORE_AFTER_DATA[activeTab].stats}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 6 — FINAL CINEMATIC CTA */}
      <section className="py-24 px-4 max-w-4xl mx-auto text-center space-y-6 relative">
        <ScrollReveal variant="fade-up">
          <h2 className="text-4xl sm:text-6xl font-black text-[#0F172A] dark:text-white leading-tight font-display">
            Don't Just Clean It.<br />
            <span className="text-emerald-600 dark:text-emerald-400">Transform It.</span>
          </h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-base max-w-lg mx-auto pt-2">
            Choose a polluted place. Start a recovery. Help give it a better future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              size="lg"
              onClick={() => navigate('/report')}
              className="w-full sm:w-auto bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3.5 px-8 text-base rounded-xl shadow-sm"
            >
              Start Your Journey <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#121915] text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold py-3.5 px-8 text-base rounded-xl"
            >
              Explore the Map
            </Button>
          </div>
        </ScrollReveal>
      </section>

      {/* 8. PERSONAL DEVELOPER FOOTER */}
      <div className="px-4 pb-8 max-w-7xl mx-auto">
        <PersonalFooter />
      </div>

    </div>
    </PageTransition>
  );
}
