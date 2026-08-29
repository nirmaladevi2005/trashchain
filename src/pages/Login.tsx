import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TreePine, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { CelebrationAmbience } from '../components/ui/impact/ImpactMoments';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginDemoUser, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message || 'Failed to sign in with Google.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-12 relative overflow-hidden transition-colors">
      <CelebrationAmbience intensity="subtle" />
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 relative z-20">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-forest-100 text-forest-600 rounded-xl flex items-center justify-center mb-3 shadow-inner">
            <TreePine className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">TrashChain Recovery Network</h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
            Community-driven pollution recovery, AI vision analysis, and field missions.
          </p>
        </div>

        {/* 1. PRIMARY HACKATHON DEMO CTA (NO ACCOUNT REQUIRED) */}
        <div className="mb-6 p-4 bg-forest-50/70 border border-forest-200 rounded-2xl space-y-2 text-center shadow-sm">
          <Button 
            type="button" 
            onClick={handleDemoLogin}
            disabled={loading}
            aria-label="Explore Demo without an account"
            className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-3.5 px-4 rounded-xl text-base shadow-md flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Explore Demo →'}
          </Button>
          <p className="text-xs font-mono font-semibold text-forest-800">
            No account required
          </p>
        </div>

        {/* 2. LIVE PILOT ACCESS DIVIDER */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
            <span className="bg-white px-3 text-neutral-500 font-bold">Live Pilot Access</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-xl">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <Button 
          type="button" 
          variant="outline" 
          aria-label="Continue with Google Sign-In"
          className="w-full flex items-center justify-center gap-3 py-3 border-neutral-200 text-neutral-800 hover:bg-neutral-50 font-semibold mb-4 text-xs"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </Button>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-700 mb-1 uppercase">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500 transition-shadow"
              placeholder="alex@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-700 mb-1 uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing In...' : 'Sign In with Email'}
          </Button>
        </form>

        {/* 3. JUDGE-FRIENDLY GUIDANCE NOTE */}
        <div className="mt-6 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-center space-y-1">
          <p className="text-xs font-bold text-neutral-800">Want to explore the live Firebase experience?</p>
          <p className="text-[11px] text-neutral-500">Use the test account provided in the hackathon submission.</p>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-forest-600 font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
