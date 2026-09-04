import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

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
  '/timeline': {
    title: 'Recovery Timeline',
    subtitle: 'Verified before-and-after environmental site transformations.',
  },
  '/monitoring': {
    title: 'Field Surveillance & Prevention',
    subtitle: 'Track site recurrence risk and biweekly surveillance checkpoints.',
  },
  '/profile': {
    title: 'Citizen Profile & Impact',
    subtitle: 'Your environmental impact score, achievements, and field history.',
  },
  '/leaderboard': {
    title: 'Community Leaderboard',
    subtitle: 'Top environmental changemakers and community rankings.',
  },
};

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isDemo, logout, logoutDemoUser } = useAuth();

  const handleSignOut = async () => {
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
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0A0F0D]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E2C24] px-4 py-3.5 md:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* LEFT: Compact Page Title & Subtitle */}
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white truncate font-display">
              {headerInfo.title}
            </h1>
            <Badge variant="warning" className="bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/30 text-[9px] font-mono shrink-0">
              {dataSource}
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate font-sans">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* RIGHT: Status Badge, User Info, Sign Out & Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
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
            className="border-[#E2E8F0] dark:border-[#1E2C24] bg-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
