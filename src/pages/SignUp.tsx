import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { useAuth } from '../hooks/useAuth';
import type { UserRole, SignUpIdentityData } from '../services/authService';
import type { ParticipantType } from '../types';
import { PageTransition } from '../components/ui/PageTransition';

const PARTICIPANT_TYPES: { label: string; value: ParticipantType; category: 'individual' | 'nss' | 'org' }[] = [
  { label: 'Individual Citizen', value: 'Individual Citizen', category: 'individual' },
  { label: 'NSS Volunteer', value: 'NSS Volunteer', category: 'nss' },
  { label: 'NGO / Non-Profit', value: 'NGO', category: 'org' },
  { label: 'Community Group', value: 'Community Group', category: 'org' },
  { label: 'School / College', value: 'School / College', category: 'org' },
  { label: 'Resident Welfare Association (RWA)', value: 'Resident Welfare Association (RWA)', category: 'org' },
  { label: 'Municipal / Local Government', value: 'Municipal / Local Government', category: 'org' },
  { label: 'Environmental Organization', value: 'Environmental Organization', category: 'org' },
  { label: 'Corporate / CSR Team', value: 'Corporate / CSR Team', category: 'org' },
  { label: 'Other Organization', value: 'Other Organization', category: 'org' },
];

const ENVIRONMENTAL_INTERESTS_OPTIONS = [
  'Waste Cleanup',
  'Waste Reporting',
  'Recycling',
  'Plastic Reduction',
  'Water Body Cleanup',
  'Tree / Green Space Activities',
  'Waste Segregation',
  'Community Awareness',
  'Monitoring & Verification',
  'Waste Recovery / Upcycling',
];

const PARTICIPATION_ROLES_OPTIONS = [
  'Report Waste Hotspots',
  'Join Cleanup Missions',
  'Organize Cleanup Missions',
  'Monitor Cleaned Locations',
  'Support Waste Recovery',
  'Volunteer with Communities',
  'Track Environmental Impact',
];

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, loginDemoUser, loginWithGoogle, loading, isAuthenticated, isDemo } = useAuth();

  // Wizard Step (1: Account info, 2: Community & Org info)
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');

  // Step 2 Fields
  const [participantType, setParticipantType] = useState<ParticipantType>('Individual Citizen');
  const [organizationName, setOrganizationName] = useState('');
  const organizationType = '';
  const [website, setWebsite] = useState('');
  const organizationDescription = '';
  const [memberCount, setMemberCount] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [nssUnitName, setNssUnitName] = useState('');
  const [environmentalInterests, setEnvironmentalInterests] = useState<string[]>(['Waste Cleanup', 'Waste Reporting']);
  const [participationRoles, setParticipationRoles] = useState<string[]>(['Report Waste Hotspots', 'Join Cleanup Missions']);
  const [publicProfile, setPublicProfile] = useState(false);

  // Status & Error
  const [error, setError] = useState<string | null>(null);
  const [isGoogleAuthPending, setIsGoogleAuthPending] = useState(false);

  if (loading && !isGoogleAuthPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">Initializing session...</p>
        </div>
      </div>
    );
  }

  if ((isAuthenticated || isDemo) && !isGoogleAuthPending) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleInterest = (item: string) => {
    setEnvironmentalInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleRole = (item: string) => {
    setParticipationRoles(prev =>
      prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]
    );
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isGoogleAuthPending) {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please check and try again.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }
    if (!city.trim()) {
      setError('Please enter your City / Town.');
      return;
    }
    if (!state.trim()) {
      setError('Please enter your State.');
      return;
    }

    setStep(2);
  };

  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Conditional Validation for Step 2
    if (participantType === 'NSS Volunteer' && !institutionName.trim()) {
      setError('Please enter your Institution / College Name.');
      return;
    }

    const isOrgCategory = participantType !== 'Individual Citizen' && participantType !== 'NSS Volunteer';
    if (isOrgCategory && !organizationName.trim()) {
      setError(`Please enter your ${participantType} Name.`);
      return;
    }

    // Determine system UserRole enum
    let systemRole: UserRole = 'CITIZEN';
    if (participantType === 'NSS Volunteer') {
      systemRole = 'VOLUNTEER';
    } else if (isOrgCategory) {
      systemRole = 'ORGANIZATION';
    }

    const identityData: SignUpIdentityData = {
      city: city.trim(),
      state: state.trim(),
      country: country.trim() || 'India',
      participantType,
      organizationName: isOrgCategory ? organizationName.trim() : (institutionName.trim() || ''),
      organizationType: organizationType.trim(),
      website: website.trim(),
      organizationDescription: organizationDescription.trim(),
      memberCount: memberCount.trim(),
      institutionName: institutionName.trim(),
      nssUnitName: nssUnitName.trim(),
      environmentalInterests,
      participationRoles,
      publicProfile,
      photoURL: photoURL.trim() || undefined,
      affiliationType: participantType === 'NSS Volunteer' ? 'NSS Chapter' : isOrgCategory ? 'NGO / Non-Profit' : 'Independent',
      environmentalRole: participantType === 'NSS Volunteer' ? 'NSS Volunteer' : isOrgCategory ? 'Community Organizer' : 'Citizen',
    };

    try {
      if (isGoogleAuthPending) {
        await loginWithGoogle(systemRole, identityData.organizationName, identityData);
        setIsGoogleAuthPending(false);
      } else {
        await signup(email.trim(), password, fullName.trim(), systemRole, identityData.organizationName, identityData);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message || 'Failed to complete registration. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      const profile = await loginWithGoogle();
      if (profile) {
        setFullName(profile.displayName || '');
        setEmail(profile.email || '');
        if (profile.photoURL) setPhotoURL(profile.photoURL);
        if (profile.city) setCity(profile.city);
        if (profile.state) setState(profile.state);
        setIsGoogleAuthPending(true);
        setStep(1); // Prompt to verify Step 1 location then Step 2 community info
      }
    } catch (err: any) {
      console.error('Google Sign-Up failed:', err);
      setError(err.message || 'Failed to sign up with Google.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    try {
      await loginDemoUser();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Demo login failed:', err);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC] px-4 py-8 font-sans transition-colors duration-200">
        <div className="w-full max-w-xl bg-white dark:bg-[#121915] p-6 sm:p-8 rounded-3xl shadow-sm border border-[#E2E8F0] dark:border-[#1E2C24] space-y-6">

          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <Link to="/">
              <BrandLogo variant="full" size="lg" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#0F172A] dark:text-white pt-2">
              Join TrashChain Network
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-sans">
              Connect local environmental action with verified community impact.
            </p>
          </div>

          {/* 2-Step Progress Indicator */}
          <div className="flex items-center justify-between border-y border-[#E2E8F0] dark:border-[#1E2C24] py-3 text-xs font-mono">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 font-bold ${step === 1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#64748B] dark:text-[#94A3B8]'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}>1</span>
              Account & Location
            </button>
            <div className="w-12 h-px bg-[#E2E8F0] dark:bg-[#1E2C24]" />
            <div className={`flex items-center gap-2 font-bold ${step === 2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}>2</span>
              Community & Organization
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold leading-normal">{error}</p>
                {(error.includes('not authorized') || error.includes('Firebase Console')) && (
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="text-emerald-700 dark:text-emerald-400 font-bold underline hover:no-underline text-xs block pt-1"
                  >
                    Explore in Demo Mode while domain is configured ➔
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 1: ACCOUNT & LOCATION INFORMATION
             ========================================== */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 text-left">

              {/* Google Sign-Up Shortcut */}
              {!isGoogleAuthPending && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold rounded-xl transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E2E8F0] dark:border-[#1E2C24]" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase font-mono tracking-wider">
                      <span className="bg-white dark:bg-[#121915] px-3 text-[#64748B] dark:text-[#94A3B8]">OR ENTER DETAILS</span>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Alex Rivera"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isGoogleAuthPending}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60"
                  placeholder="alex@example.com"
                  required
                />
              </div>

              {!isGoogleAuthPending && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="Min 6 chars"
                        required={!isGoogleAuthPending}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Re-enter password"
                      required={!isGoogleAuthPending}
                    />
                  </div>
                </div>
              )}

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2C24]">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. Hyderabad"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. Telangana"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="India"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3 text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 pt-3"
              >
                Next: Community & Organization Details <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* ==========================================
              STEP 2: COMMUNITY & ORGANIZATION INFO
             ========================================== */}
          {step === 2 && (
            <form onSubmit={handleCompleteSignUp} className="space-y-5 text-left">

              {/* Participant Type Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                  What best describes you? *
                </label>
                <select
                  value={participantType}
                  onChange={(e) => setParticipantType(e.target.value as ParticipantType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                >
                  {PARTICIPANT_TYPES.map(pt => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Conditional Fields based on Participant Type */}
              {participantType === 'NSS Volunteer' && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    <Building2 className="w-4 h-4" /> NSS Volunteer Credentials
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mb-1">
                      Institution / College Name *
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs"
                      placeholder="e.g. BVRIT Hyderabad"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mb-1">
                      NSS Unit Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={nssUnitName}
                      onChange={(e) => setNssUnitName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs"
                      placeholder="e.g. NSS Unit 02"
                    />
                  </div>
                </div>
              )}

              {participantType !== 'Individual Citizen' && participantType !== 'NSS Volunteer' && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    <Building2 className="w-4 h-4" /> Organization Details
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mb-1">
                      {participantType} Name *
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs"
                      placeholder={`e.g. Green ${participantType}`}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs"
                        placeholder="https://example.org"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Member Count (Optional)
                      </label>
                      <input
                        type="text"
                        value={memberCount}
                        onChange={(e) => setMemberCount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-white dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs"
                        placeholder="e.g. 50+ volunteers"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Environmental Interests Multi-select */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-2 uppercase tracking-wider">
                  Which environmental activities are you interested in?
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl bg-[#F6F8F5] dark:bg-[#0A0F0D]">
                  {ENVIRONMENTAL_INTERESTS_OPTIONS.map(interest => {
                    const isSelected = environmentalInterests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                            : 'bg-white dark:bg-[#121915] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#1E2C24] hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Participation Role Multi-select */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-2 uppercase tracking-wider">
                  What would you like to do on TrashChain?
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl bg-[#F6F8F5] dark:bg-[#0A0F0D]">
                  {PARTICIPATION_ROLES_OPTIONS.map(pRole => {
                    const isSelected = participationRoles.includes(pRole);
                    return (
                      <button
                        type="button"
                        key={pRole}
                        onClick={() => toggleRole(pRole)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                            : 'bg-white dark:bg-[#121915] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#1E2C24] hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                        {pRole}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Option (Default OFF) */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/60 border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="publicProfileCheck"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300"
                />
                <label htmlFor="publicProfileCheck" className="text-xs text-[#0F172A] dark:text-white font-sans cursor-pointer leading-snug">
                  <span className="font-bold block text-emerald-700 dark:text-emerald-400">Public Leaderboard Profile</span>
                  Make my profile visible on the public community leaderboard to showcase verified environmental impact.
                </label>
              </div>

              {/* Step Navigation Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 border-[#E2E8F0] dark:border-[#1E2C24] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3 text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Registration & Launch ➔'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] font-sans pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>

          <div className="border-t border-[#E2E8F0] dark:border-[#1E2C24] pt-4" />

          {/* DEMO PORTAL ENTRY */}
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest block">
              EXPLORE WITHOUT AN ACCOUNT
            </span>
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explore Demo →'}
            </Button>
            <p className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 font-semibold">
              No account required
            </p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
