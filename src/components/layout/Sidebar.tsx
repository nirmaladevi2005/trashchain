import { NavLink } from 'react-router-dom';
import { 
  Home, Map, PlusCircle, Target, Trophy, User, 
  Leaf, ShieldCheck, Compass, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import { ThemeToggle } from '../ui/ThemeToggle';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Explore', path: '/explore' },
  { icon: PlusCircle, label: 'Report', path: '/report' },
  { icon: Target, label: 'Missions', path: '/missions' },
  { icon: Compass, label: 'Pilots', path: '/pilots' },
  { icon: ShieldCheck, label: 'Monitoring', path: '/monitoring' },
  { icon: Leaf, label: 'Recovery', path: '/timeline' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function Sidebar() {
  const { user, isDemo } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-850 fixed left-0 top-0 transition-all duration-300 ease-in-out z-40 overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* HEADER */}
      <div className={cn("p-4 flex items-center border-b border-neutral-100 dark:border-neutral-900 transition-all duration-300", isCollapsed ? "justify-center" : "justify-between")}>
        <div className="flex items-center gap-2 text-forest-700 dark:text-fresh-400 overflow-hidden">
          <Leaf className="w-7 h-7 shrink-0" />
          <span 
            className={cn(
              "text-xl font-bold tracking-tight text-neutral-900 dark:text-white truncate transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
            )}
          >
            TrashChain
          </span>
        </div>

        {!isCollapsed && <ThemeToggle />}
      </div>
      
      {/* TOGGLE BUTTON */}
      <div className={cn("px-3 pt-3 flex transition-all duration-300", isCollapsed ? "justify-center" : "justify-end")}>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            aria-label={item.label}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-300 text-xs font-mono group",
              isCollapsed && "justify-center px-0",
              isActive 
                ? "bg-forest-50 dark:bg-forest-950/60 text-forest-700 dark:text-fresh-400 font-bold border border-forest-200 dark:border-fresh-500/30 shadow-sm" 
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span 
              className={cn(
                "truncate transition-all duration-300 whitespace-nowrap",
                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER & CREATOR ATTRIBUTION */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-900 space-y-3 overflow-hidden">
        {isCollapsed && (
          <div className="flex justify-center pb-1">
            <ThemeToggle />
          </div>
        )}

        {!isCollapsed && (
          <div className="bg-forest-900 dark:bg-neutral-900 text-white p-3.5 rounded-2xl relative overflow-hidden border border-forest-800 dark:border-neutral-800 transition-all duration-300">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-mono font-medium text-forest-200 dark:text-neutral-400">Environmental Score</p>
              <span className={cn(
                "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono",
                isDemo ? "bg-amber-500 text-amber-950" : "bg-fresh-500 text-fresh-950"
              )}>
                {user?.dataSource || (isDemo ? 'DEMO DATA' : 'FIELD DATA')}
              </span>
            </div>
            <p className="text-xl font-black mt-1 font-mono text-fresh-400">{user?.impactScore || 1450}</p>
            <p className="text-xs text-neutral-300 mt-0.5 truncate font-sans">{user?.displayName || 'Volunteer'}</p>
          </div>
        )}

        {/* CREATOR ATTRIBUTION (Nirmala Devi Patel) */}
        <div className={cn("pt-1 text-center font-mono text-[10px] text-neutral-500 dark:text-neutral-400 transition-all duration-300", isCollapsed && "text-[9px]")}>
          {!isCollapsed ? (
            <div>
              <span>Created by </span>
              <span className="font-bold text-neutral-900 dark:text-white">Nirmala Devi Patel</span>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <a
                  href="https://www.linkedin.com/in/nirmaladevipatel2005/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 dark:text-blue-400 font-bold"
                >
                  LinkedIn
                </a>
                <span>•</span>
                <a
                  href="https://github.com/nirmaladevi2005"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  GitHub
                </a>
              </div>
            </div>
          ) : (
            <a
              href="https://www.linkedin.com/in/nirmaladevipatel2005/"
              target="_blank"
              rel="noopener noreferrer"
              title="Created by Nirmala Devi Patel (LinkedIn)"
              aria-label="Created by Nirmala Devi Patel"
              className="hover:text-blue-500 font-bold text-neutral-400"
            >
              NDP
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
