import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Shield, Eye, Lock, User, Mail, Award, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import type { UserProfile } from '../../services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [isPublicProfile, setIsPublicProfile] = useState<boolean>(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans"
        >
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-forest-50 dark:bg-neutral-800 text-forest-700 dark:text-fresh-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 id="settings-modal-title" className="text-xl font-bold tracking-tight">Account & Preference Settings</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Manage your app theme and privacy profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Settings"
              className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MODAL BODY */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* 1. APPEARANCE SETTINGS */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Appearance & Color Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 relative",
                    theme === 'light'
                      ? "bg-forest-50 border-forest-500 text-forest-900 ring-2 ring-forest-500/30"
                      : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Sun className="w-5 h-5 text-amber-500" />
                    {theme === 'light' && <Check className="w-4 h-4 text-forest-600 font-bold" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Light Theme</span>
                    <span className="text-[10px] font-mono text-neutral-500">Clean high-contrast daytime UI</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 relative",
                    theme === 'dark'
                      ? "bg-neutral-800 border-fresh-400 text-white ring-2 ring-fresh-400/30"
                      : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Moon className="w-5 h-5 text-purple-400" />
                    {theme === 'dark' && <Check className="w-4 h-4 text-fresh-400 font-bold" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Dark Theme</span>
                    <span className="text-[10px] font-mono text-neutral-400">Low-glare climate-tech style</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. READ-ONLY ACCOUNT INFORMATION */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Account Information (Read-Only)
              </label>
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-850 pb-2">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">{user?.displayName || 'Volunteer'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-850 pb-2">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white">{user?.email || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Account Role
                  </span>
                  <Badge variant="success" className="bg-fresh-500/10 text-fresh-600 dark:text-fresh-400 border-fresh-500/30 text-[10px]">
                    {user?.role || 'CITIZEN'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 3. PRIVACY CONTROL */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Privacy & Data Visibility
              </label>
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 max-w-xs">
                  <div className="flex items-center gap-2">
                    {isPublicProfile ? <Eye className="w-4 h-4 text-forest-600 dark:text-fresh-400" /> : <Lock className="w-4 h-4 text-amber-500" />}
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">Public Profile Visibility</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isPublicProfile 
                      ? 'Your recovery chain impact and leaderboard badge will be visible to community members.' 
                      : 'Your activity statistics remain private to your local account.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPublicProfile(!isPublicProfile)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest-500",
                    isPublicProfile ? "bg-forest-600 dark:bg-fresh-500" : "bg-neutral-300 dark:bg-neutral-700"
                  )}
                  role="switch"
                  aria-checked={isPublicProfile}
                  aria-label="Toggle Public Profile Visibility"
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      isPublicProfile ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

          </div>

          {/* MODAL FOOTER */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <Button onClick={onClose} className="bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white font-bold text-xs px-6 py-2.5">
              Done & Save Preferences
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
