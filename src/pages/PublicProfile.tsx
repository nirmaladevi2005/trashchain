import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Building2, Users, Globe, ArrowLeft, 
  Lock, Loader2, ArrowRight, ExternalLink 
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { Button } from '../components/ui/Button';
import { authService, type PublicProfileData } from '../services/authService';

function getInitials(name: string): string {
  if (!name) return 'TC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await authService.getPublicProfile(id);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load public profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-fresh-400 animate-spin" />
          <span className="text-xs font-mono text-neutral-400">Loading Environmental Profile...</span>
        </div>
      </div>
    );
  }

  // PRIVATE PROFILE STATE
  if (!profile || !profile.publicProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans px-4 py-16 flex flex-col items-center justify-center transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">This Profile is Private</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
              This member has set their environmental activity profile to private. Their personal impact records and location details remain confidential.
            </p>
          </div>

          <Button 
            onClick={() => navigate('/leaderboard')} 
            className="w-full flex items-center justify-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Leaderboard
          </Button>
        </div>
      </div>
    );
  }

  // PUBLIC ENVIRONMENTAL PROFILE STATE
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans pb-28 transition-colors duration-200">
      
      {/* 1. HERO SECTION */}
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-850 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <button
            onClick={() => navigate('/leaderboard')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              
              {/* AVATAR / INITIALS */}
              {profile.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-forest-500/40 shadow-2xl shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-forest-100 dark:bg-forest-950 border-2 border-forest-500/40 text-forest-800 dark:text-fresh-400 flex items-center justify-center text-xl sm:text-2xl font-black font-mono shadow-2xl shrink-0">
                  {getInitials(profile.displayName)}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{profile.displayName}</h1>
                  <Badge variant="success" className="bg-fresh-500/10 text-fresh-700 dark:text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                    PUBLIC ENVIRONMENTAL PROFILE
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {profile.dataSource}
                  </Badge>
                </div>

                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-300">
                  {profile.environmentalRole || 'Citizen'} • {profile.affiliationType || 'Independent'}
                  {profile.organizationName ? ` (${profile.organizationName})` : ''}
                </p>

                {profile.city && (
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {profile.city}
                  </p>
                )}
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <div className="flex items-center gap-2">
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                >
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* 2. BIO SECTION */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl space-y-2 shadow-sm">
          <h3 className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">About & Environmental Story</h3>
          <p className="text-sm text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed">
            {profile.bio || 'No public bio yet.'}
          </p>
        </Card>

        {/* 3. VERIFIED IMPACT SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">VERIFIED RECOVERIES</span>
            <span className="text-2xl font-black text-forest-600 dark:text-fresh-400">{profile.verifiedRecoveries} Sites</span>
            <span className="text-[9px] text-neutral-500 block font-bold">VERIFIED FIELD DATA</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">MEASURED WASTE</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">{profile.measuredWasteKg} kg</span>
            <span className="text-[9px] text-forest-600 dark:text-fresh-400 block font-bold">MEASURED</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">MISSIONS COMPLETED</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">{profile.completedMissions}</span>
            <span className="text-[9px] text-neutral-500 block font-bold font-mono">FIELD MODE</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">RECOVERY CHAIN</span>
            <span className="text-2xl font-black text-amber-600 dark:text-yellow-400">{profile.recoveryChain.length} Links</span>
            <span className="text-[9px] text-neutral-500 block">CONNECTED</span>
          </div>
        </div>

        {/* 4. COMMUNITY & AFFILIATION CARD */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Community & Affiliation</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Institutional backing and field identity details.</p>
            </div>
            <Badge variant="success" className="bg-fresh-500/10 text-fresh-700 dark:text-fresh-400 border-fresh-500/30 font-mono text-[10px]">
              COMMUNITY IDENTIFIED
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 space-y-1">
              <span className="text-neutral-500 flex items-center gap-1.5 text-[10px]">
                <Users className="w-3.5 h-3.5 text-forest-600 dark:text-fresh-400" /> Affiliation Type
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white block">{profile.affiliationType || 'Independent'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 space-y-1">
              <span className="text-neutral-500 flex items-center gap-1.5 text-[10px]">
                <Building2 className="w-3.5 h-3.5 text-forest-600 dark:text-fresh-400" /> Organization / Institution
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white block">{profile.organizationName || 'N/A'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 space-y-1">
              <span className="text-neutral-500 flex items-center gap-1.5 text-[10px]">
                <Globe className="w-3.5 h-3.5 text-forest-600 dark:text-fresh-400" /> Chapter / Unit
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white block">{profile.chapterName || 'General Member'}</span>
            </div>
          </div>
        </Card>

        {/* 5. VISUAL RECOVERY CHAIN */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Public Recovery Chain</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Verified sites transformed through this member's community actions.</p>
            </div>
            <ImpactBadge type="VERIFIED" size="sm" />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-3 font-mono text-xs">
            {profile.recoveryChain.map((link, i) => (
              <motion.div 
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 shrink-0"
              >
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-forest-500/40 rounded-2xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-forest-600 dark:text-fresh-400" />
                  <div>
                    <span className="text-neutral-400 text-[9px] block">LINK 0{i + 1} • {link.recoveredAt}</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">{link.title}</span>
                  </div>
                </div>
                {i < profile.recoveryChain.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-700" />
                )}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* 6. PUBLIC ACHIEVEMENTS */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Environmental Badges</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Verified field achievements.</p>
            </div>
            <Badge variant="success" className="bg-fresh-500/10 text-fresh-700 dark:text-fresh-400 border-fresh-500/30 font-mono text-[10px]">
              {profile.publicAchievements.length} UNLOCKED
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profile.publicAchievements.map((ach) => (
              <div key={ach.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 flex items-start gap-3">
                <span className="text-2xl p-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">{ach.icon}</span>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{ach.title}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
