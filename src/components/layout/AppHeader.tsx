import { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LogOut, Menu, X, Home, Map, PlusCircle, Target, User,
  Compass, ShieldCheck, Leaf, Trophy, Info
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const ROUTE_HEADERS: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Environmental Command Center',
    subtitle: 'Live environmental impact, active missions, and field tracking.',
  },
  '/explore': {
    title: 'Recovery Map Intelligence',
    subtitle: 'Geospatial tracking of reported hotspots, active missions, and verified clean sites.',
  },
  '/report': {
    title: 'Report Pollution Hotspot',
    subtitle: 'Log pollution evidence, capture GPS coordinates, and generate AI recovery plans.',
  },
  '/missions': {
    title: 'Community Recovery Missions',
    subtitle: 'Organize and join targeted volunteer cleanup missions.',
  },
  '/pilots': {
    title: 'Environmental Pilot Projects',
    subtitle: 'Community-led pilot locations transforming polluted hotspots into community assets.',
  },
  '/monitoring': {
    title: 'Surveillance & Monitoring',
    subtitle: 'Long-term recurrence risk tracking and biweekly field surveillance checkpoints.',
  },
  '/timeline': {
    title: 'Recovery Timeline',
    subtitle: 'Verified before-and-after environmental site transformations.',
  },
  '/profile': {
    title: 'Citizen Profile & Impact',
    subtitle: 'Your environmental impact score, achievements, and field history.',
  },
  '/leaderboard': {
    title: 'Community Leaderboard',
    subtitle: 'Top environmental changemakers and community rankings.',
  },
  '/about': {
    title: 'About TrashChain',
    subtitle: 'Breaking the pollution cycle through cleanup, recovery, and transformation.',
  },
};

const CORE_NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Explore', path: '/explore' },
  { icon: PlusCircle, label: 'Report', path: '/report' },
  { icon: Target, label: 'Missions', path: '/missions' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const IMPACT_NAV_ITEMS = [
  { icon: Compass, label: 'Pilot', path: '/pilots' },
  { icon: ShieldCheck, label: 'Monitoring', path: '/monitoring' },
  { icon: Leaf, label: 'Recovery', path: '/timeline' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Info, label: 'About', path: '/about' },
];

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isDemo, logout, logoutDemoUser } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    setIsDrawerOpen(false);
    if (isDemo) {
      await logoutDemoUser();
    } else {
      await logout();
    }
    navigate('/login');
  };

  // Find header info for current pathname or fallback to default
  const pathname = location.pathname;
  let headerInfo = ROUTE_HEADERS[pathname];

  if (!headerInfo) {
    if (pathname.startsWith('/missions/')) {
      headerInfo = {
        title: 'Mission Details & Operations',
        subtitle: 'Field instructions, volunteer roster, and safety requirements.',
      };
    } else if (pathname.startsWith('/profile/')) {
      headerInfo = {
        title: 'Public Citizen Profile',
        subtitle: 'Verified community contributions and environmental rank.',
      };
    } else {
      headerInfo = {
        title: 'TrashChain Operations',
        subtitle: 'Community-powered environmental recovery platform.',
      };
    }
  }

  const dataSource = user?.dataSource || (isDemo ? 'DEMO DATA' : 'FIELD DATA');

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0F0D]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E2C24] px-4 py-3 sm:py-3.5 md:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* LEFT: Compact Page Title & Subtitle */}
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-[#0F172A] dark:text-white truncate font-display">
              {headerInfo.title}
            </h1>
            <Badge variant="warning" className="bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/30 text-[9px] font-mono shrink-0">
              {dataSource}
            </Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] truncate font-sans">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* RIGHT: Status Badge, User Info, Theme Toggle & Mobile Menu Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#0F172A] dark:text-neutral-300 bg-[#F6F8F5] dark:bg-[#121915] px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">{user?.displayName?.split(' ')[0] || (isDemo ? 'Demo Citizen' : 'Volunteer')}</span>
          </div>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            title="Sign Out"
            className="hidden md:flex border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold rounded-xl px-2.5 py-1.5 items-center gap-1.5 transition-all min-h-[38px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>

          {/* MOBILE HAMBURGER MENU BUTTON */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-xs font-bold font-mono min-h-[40px] shadow-sm shrink-0 active:scale-95 transition-all"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>

      </div>

      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-4/5 max-w-sm h-full bg-[#0A0F0D] border-l border-[#1E2C24] text-white flex flex-col justify-between p-5 overflow-y-auto shadow-2xl z-10"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[#1E2C24] pb-4">
                  <BrandLogo variant="full" size="md" />
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-xl border border-neutral-800"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Section 1: CORE NAV */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-forest-400 uppercase tracking-widest px-2 block">
                    Core Operations
                  </span>
                  <div className="space-y-1">
                    {CORE_NAV_ITEMS.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs font-mono transition-all min-h-[48px]",
                          isActive
                            ? "bg-forest-600/20 text-fresh-400 font-bold border border-forest-500/30"
                            : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        )}
                      >
                        <item.icon className="w-4 h-4 text-forest-400 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>

                {/* Section 2: IMPACT NAV */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest px-2 block">
                    Impact & Transformation
                  </span>
                  <div className="space-y-1">
                    {IMPACT_NAV_ITEMS.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs font-mono transition-all min-h-[48px]",
                          isActive
                            ? "bg-forest-600/20 text-fresh-400 font-bold border border-forest-500/30"
                            : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        )}
                      >
                        <item.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer: User Profile Summary & Sign Out */}
              <div className="pt-6 border-t border-[#1E2C24] space-y-3">
                <div className="flex items-center justify-between bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white font-mono">{user?.displayName || (isDemo ? 'Demo Citizen' : 'Volunteer')}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">{user?.email || 'Field Volunteer'}</p>
                  </div>
                  <Badge variant="warning" className="text-[9px] font-mono uppercase">{dataSource}</Badge>
                </div>

                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full bg-rose-950/30 border-rose-500/30 text-rose-300 hover:bg-rose-900/40 text-xs font-bold font-mono py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Session
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
