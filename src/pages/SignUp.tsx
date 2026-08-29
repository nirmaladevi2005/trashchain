import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Loader2, ShieldCheck, MapPin, 
  Building2, Users, FileText, Globe, Share2, Lock, Eye, CheckCircle2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ImpactCelebration } from '../components/ui/impact/ImpactMoments';
import { BrandLogo } from '../components/ui/BrandLogo';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../lib/firebase';
import type { UserRole, SignUpIdentityData } from '../services/authService';
import type { AffiliationType, EnvironmentalRoleType } from '../types';

const AFFILIATION_OPTIONS: AffiliationType[] = [
  'Independent',
  'NSS Chapter',
  'NGO / Non-Profit',
  'College / Institution',
  'Foundation',
  'Community Group',
  'Corporate / CSR',
  'Other'
];

const ENVIRONMENTAL_ROLES: EnvironmentalRoleType[] = [
  'Citizen',
  'Student',
  'NSS Volunteer',
  'NGO Volunteer',
  'Community Organizer',
  'Environmental Professional',
  'CSR / Organization Representative',
  'Other'
];

function getInitials(name: string): string {
  if (!name) return 'TC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loading } = useAuth();

  // Basic Account Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');

  // Extended Environmental Identity Data
  const [city, setCity] = useState('');
  const [affiliationType, setAffiliationType] = useState<AffiliationType>('Independent');
  const [organizationName, setOrganizationName] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [environmentalRole, setEnvironmentalRole] = useState<EnvironmentalRoleType>('Citizen');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [publicProfile, setPublicProfile] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const validateUrls = (): boolean => {
    if (linkedinUrl && !/^https?:\/\//i.test(linkedinUrl)) {
      setError('LinkedIn URL must start with http:// or https://');
      return false;
    }
    if (githubUrl && !/^https?:\/\//i.test(githubUrl)) {
      setError('GitHub URL must start with http:// or https://');
      return false;
    }
    if (bio.length > 300) {
      setError('Bio must be 300 characters or fewer.');
      return false;
    }
    return true;
  };

  const [showCelebration, setShowCelebration] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateUrls()) return;

    const identityData: SignUpIdentityData = {
      city: city.trim(),
      affiliationType,
      organizationName: organizationName.trim(),
      chapterName: chapterName.trim(),
      environmentalRole,
      bio: bio.trim(),
      linkedinUrl: linkedinUrl.trim(),
      githubUrl: githubUrl.trim(),
      publicProfile
    };

    try {
      await signup(email, password, fullName, role, organizationName, identityData);
      setShowCelebration(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1600);
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      await loginWithGoogle(role, organizationName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans px-4 py-12 transition-colors duration-200">
      <ImpactCelebration 
        show={showCelebration} 
        title="Welcome to the recovery chain." 
        message="Your environmental identity is ready." 
      />
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / MAIN FORM (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-6">
          
          {isDemoMode() && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs font-mono">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">DEMO MODE — DATA IS SIMULATED</p>
                <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                  Running without live Firebase credentials. Account creation will be simulated locally.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <BrandLogo variant="mark" size="lg" />
            <div>
              <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Join TrashChain</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Create your community environmental identity</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-500/30 text-coral-700 dark:text-coral-400 text-xs font-mono rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-3 py-3 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 font-bold text-xs rounded-xl"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200 dark:border-neutral-800" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono"><span className="bg-white dark:bg-neutral-900 px-3 text-neutral-400 font-bold">Or register detailed profile</span></div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            
            {/* 1. ABOUT YOU */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-forest-700 dark:text-fresh-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 1. About You
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="Alex Rivera"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">City / Region</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="e.g. Hyderabad, TS"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">Email *</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="alex@example.org"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">Password *</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* 2. YOUR ROLE & AFFILIATION */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-forest-700 dark:text-fresh-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 2. Role & Community Affiliation
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">System Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="CITIZEN">Citizen Reporter</option>
                    <option value="VOLUNTEER">Field Volunteer</option>
                    <option value="ORGANIZATION">Organization Sponsor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">Environmental Role</label>
                  <select 
                    value={environmentalRole}
                    onChange={(e) => setEnvironmentalRole(e.target.value as EnvironmentalRoleType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    {ENVIRONMENTAL_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">Affiliation Type</label>
                  <select 
                    value={affiliationType}
                    onChange={(e) => setAffiliationType(e.target.value as AffiliationType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    {AFFILIATION_OPTIONS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. YOUR ORGANIZATION & CHAPTER */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-forest-700 dark:text-fresh-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> 3. Organization & Chapter Details (Optional)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">Organization / Institution Name</label>
                  <input 
                    type="text" 
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="e.g. BVRIT Hyderabad / EcoAlliance NGO"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1">Chapter / Unit Name</label>
                  <input 
                    type="text" 
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="e.g. NSS Unit 02 / Hyderabad Youth Chapter"
                  />
                </div>
              </div>
            </div>

            {/* 4. YOUR ENVIRONMENTAL STORY */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-forest-700 dark:text-fresh-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 4. Your Environmental Story & Links (Optional)
              </label>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Short Bio</label>
                  <span className="text-[10px] font-mono text-neutral-400">{bio.length}/300</span>
                </div>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
                  placeholder="Share your interest in waste reduction, waterbody recovery, or community cleanup..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-500" /> LinkedIn URL
                  </label>
                  <input 
                    type="url" 
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-neutral-500" /> GitHub URL
                  </label>
                  <input 
                    type="url" 
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            </div>

            {/* 5. PUBLIC PROFILE PRIVACY */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-forest-700 dark:text-fresh-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> 5. Public Environmental Profile Visibility
              </label>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {publicProfile ? <Eye className="w-4 h-4 text-forest-600 dark:text-fresh-400" /> : <Lock className="w-4 h-4 text-amber-500" />}
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">Create a public environmental profile</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                    Your public profile can show your name, affiliation, environmental role, achievements, and verified impact. Your email and private information will never be shown publicly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPublicProfile(!publicProfile)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest-500 ${
                    publicProfile ? 'bg-forest-600 dark:bg-fresh-500' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                  role="switch"
                  aria-checked={publicProfile}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      publicProfile ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs rounded-xl" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Environmental Account...' : 'Create Account & Join Community'}
            </Button>
          </form>

          <p className="text-center text-xs text-neutral-500 font-mono pt-2">
            Already registered?{' '}
            <Link to="/login" className="text-forest-600 dark:text-fresh-400 font-bold hover:underline">
              Log in to TrashChain
            </Link>
          </p>
        </div>

        {/* RIGHT / LIVE PREVIEW CARD (4 cols) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase">Your TrashChain Identity</span>
              <Badge variant="success" className="bg-fresh-500/10 text-fresh-700 dark:text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                {publicProfile ? 'PUBLIC' : 'PRIVATE'}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-forest-950 border-2 border-forest-500/40 text-fresh-400 flex items-center justify-center text-lg font-black font-mono shadow-md shrink-0">
                {getInitials(fullName || 'Volunteer')}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">{fullName || 'Your Name'}</h3>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" /> {city || 'City / Region'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs font-mono border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Environmental Role:</span>
                <span className="font-bold text-forest-700 dark:text-fresh-400">{environmentalRole}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Affiliation:</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{affiliationType}</span>
              </div>

              {organizationName && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Org:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">{organizationName}</span>
                </div>
              )}

              {chapterName && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Unit/Chapter:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">{chapterName}</span>
                </div>
              )}
            </div>

            {bio && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-150 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 italic">
                "{bio}"
              </div>
            )}

            <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-500/30 text-[10px] font-mono text-forest-800 dark:text-fresh-400 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-600 dark:text-fresh-400 shrink-0 mt-0.5" />
              <span>Verified impact actions and recovery chains will attach to this identity once confirmed in Field Mode.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
