import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        "relative flex items-center justify-center p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-forest-500",
        isDark 
          ? "bg-neutral-800 text-amber-400 hover:bg-neutral-750 border border-neutral-700" 
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300",
        className
      )}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun 
          className={cn(
            "w-5 h-5 absolute transition-all duration-300 transform",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          )} 
        />
        <Moon 
          className={cn(
            "w-5 h-5 absolute transition-all duration-300 transform",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )} 
        />
      </div>
      {showLabel && (
        <span className="ml-2.5 text-xs font-mono font-bold">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
