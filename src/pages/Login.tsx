import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginDemoUser, loginWithGoogle, loading, isAuthenticated, isDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated || isDemo) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err.message || 'Failed to sign in with Google.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC] px-4 py-8 font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#121915] p-6 sm:p-8 rounded-3xl shadow-sm border border-[#E2E8F0] dark:border-[#1E2C24] space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/">
            <BrandLogo variant="full" size="lg" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#0F172A] dark:text-white pt-2">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-sans">
            Continue your environmental impact journey.
          </p>
        </div>

        {/* Clean Error Message Banner */}
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold leading-normal">{error}</p>
              {error.includes('unavailable on this domain') && (
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-emerald-700 dark:text-emerald-400 font-bold underline hover:no-underline text-xs block"
                >
                  Click here to explore Demo Mode instead ➔
                </button>
              )}
            </div>
          </div>
        )}

        {/* Google Sign-In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
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

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0] dark:border-[#1E2C24]" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase font-mono tracking-wider">
            <span className="bg-white dark:bg-[#121915] px-3 text-[#64748B] dark:text-[#94A3B8]">OR</span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="alex@example.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link will be sent to your registered email.')}
                className="text-[11px] font-sans font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#E2E8F0] dark:border-[#1E2C24] bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="••••••••"
                required
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#15803D] hover:bg-[#166534] text-white font-bold py-3 text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-[#64748B] dark:text-[#94A3B8] font-sans">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Create Account
          </Link>
        </p>

        {/* Separator */}
        <div className="border-t border-[#E2E8F0] dark:border-[#1E2C24] pt-4" />

        {/* 2. DEMO PORTAL ENTRY (PROMINENT BUT NOT OVERPOWERING) */}
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
  );
}
