import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Shield, Eye, Lock, Check, AlertTriangle, Building2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { authService } from '../../services/authService';
import type { UserProfile } from '../../services/authService';
import type { ParticipantType } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

const PARTICIPANT_TYPES: { label: string; value: ParticipantType }[] = [
  { label: 'Individual Citizen', value: 'Individual Citizen' },
  { label: 'NSS Volunteer', value: 'NSS Volunteer' },
  { label: 'NGO / Non-Profit', value: 'NGO' },
  { label: 'Community Group', value: 'Community Group' },
  { label: 'School / College', value: 'School / College' },
  { label: 'Resident Welfare Association (RWA)', value: 'Resident Welfare Association (RWA)' },
  { label: 'Municipal / Local Government', value: 'Municipal / Local Government' },
  { label: 'Environmental Organization', value: 'Environmental Organization' },
  { label: 'Corporate / CSR Team', value: 'Corporate / CSR Team' },
  { label: 'Other Organization', value: 'Other Organization' },
];

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [isPublicProfile, setIsPublicProfile] = useState<boolean>(user?.publicProfile ?? false);

  const [city, setCity] = useState<string>(user?.city || '');
  const [state, setState] = useState<string>(user?.state || '');
  const [country, setCountry] = useState<string>(user?.country || 'India');
  const [participantType, setParticipantType] = useState<ParticipantType>((user?.participantType as ParticipantType) || 'Individual Citizen');
  const [organizationName, setOrganizationName] = useState<string>(user?.organizationName || user?.organization || '');
  const [institutionName, setInstitutionName] = useState<string>(user?.institutionName || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setIsPublicProfile(user.publicProfile ?? false);
      setCity(user.city || '');
      setState(user.state || '');
      setCountry(user.country || 'India');
      setParticipantType((user.participantType as ParticipantType) || 'Individual Citizen');
      setOrganizationName(user.organizationName || user.organization || '');
      setInstitutionName(user.institutionName || '');
    }
    setErrorMsg(null);
  }, [user, isOpen]);

  const handleTogglePublicProfile = async () => {
    setErrorMsg(null);
    const nextVal = !isPublicProfile;
    setIsPublicProfile(nextVal);
    try {
      await authService.updateUserProfile({ publicProfile: nextVal });
    } catch (err: any) {
      console.error('[SettingsModal] Failed to update public profile:', err);
      setIsPublicProfile(!nextVal);
      setErrorMsg(err?.message || 'Failed to update public profile setting.');
    }
  };

  const handleSaveAndDone = async () => {
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await authService.updateUserProfile({
        publicProfile: isPublicProfile,
        city: city.trim(),
        state: state.trim(),
        country: country.trim() || 'India',
        participantType,
        organizationName: organizationName.trim(),
        institutionName: institutionName.trim(),
        organization: organizationName.trim() || institutionName.trim() || user?.organization || '',
      });
      onClose();
    } catch (err: any) {
      console.error('[SettingsModal] Failed to save preferences:', err);
      setErrorMsg(err?.message || 'Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

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
                <h2 id="settings-modal-title" className="text-xl font-bold tracking-tight">Account & Community Settings</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Manage theme, organization & privacy preferences</p>
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
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-coral-950/60 border border-coral-200 dark:border-coral-500/40 rounded-xl flex items-center gap-2 text-coral-800 dark:text-coral-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-coral-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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

            {/* 2. COMMUNITY & ORGANIZATION EDITABLE FIELDS */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Organization & Community Profile
              </label>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                    Participant Type
                  </label>
                  <select
                    value={participantType}
                    onChange={(e) => setParticipantType(e.target.value as ParticipantType)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
                  >
                    {PARTICIPANT_TYPES.map(pt => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                </div>

                {participantType === 'NSS Volunteer' ? (
                  <div>
                    <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                      Institution / College Name
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
                      placeholder="e.g. BVRIT Hyderabad"
                    />
                  </div>
                ) : participantType !== 'Individual Citizen' ? (
                  <div>
                    <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                      Organization / Group Name
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
                      placeholder="e.g. EcoAlliance NGO"
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
                      placeholder="Hyderabad"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
                      placeholder="Telangana"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PRIVACY CONTROL */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Privacy & Leaderboard Visibility
              </label>
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 max-w-xs">
                  <div className="flex items-center gap-2">
                    {isPublicProfile ? <Eye className="w-4 h-4 text-forest-600 dark:text-fresh-400" /> : <Lock className="w-4 h-4 text-amber-500" />}
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">Public Profile Visibility</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isPublicProfile
                      ? 'Your recovery chain impact and leaderboard badge will be visible on the public community leaderboard.'
                      : 'Your activity statistics remain private to your local account.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePublicProfile}
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
            <Button
              onClick={handleSaveAndDone}
              disabled={isSaving}
              className="bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white font-bold text-xs px-6 py-2.5"
            >
              {isSaving ? 'Saving...' : 'Done & Save Preferences'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
