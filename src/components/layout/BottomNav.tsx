import { NavLink } from 'react-router-dom';
import { Home, Map, PlusCircle, Target, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ThemeToggle } from '../ui/ThemeToggle';

const mobileNavItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Explore', path: '/explore' },
  { icon: PlusCircle, label: 'Report', path: '/report' },
  { icon: Target, label: 'Missions', path: '/missions' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-850 pb-safe z-50 transition-colors duration-200">
      <div className="flex items-center justify-around px-2 py-1.5">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center p-1.5 rounded-lg min-w-[56px] transition-colors",
              isActive 
                ? "text-forest-600 dark:text-fresh-400 font-bold" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono">{item.label}</span>
          </NavLink>
        ))}
        <div className="p-1">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
