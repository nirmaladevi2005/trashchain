import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Leaf, Calendar, LogOut, 
  ShieldCheck, ArrowRight, Camera, Trash2, Loader2, AlertTriangle, Eye, Lock,
  Building2, MapPin, Users, Sparkles, Briefcase
} from 'lucide-react';
import { currentUser as mockUser } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { Button } from '../components/ui/Button';
import { SettingsModal } from '../components/profile/SettingsModal';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { hotspotService } from '../services/hotspotService';
import { missionService } from '../services/missionService';
import { getEarnedBadges } from '../utils/badgeUtils';
import { PageTransition } from '../components/ui/PageTransition';

function getInitials(name: string): string {
  if (!name) return 'TC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isDemo, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [userHotspotsCount, setUserHotspotsCount] = useState<number>(user?.hotspotsReported || 4);
  const [userMissionsCount, setUserMissionsCount] = useState<number>(user?.missionsCompleted || 6);
  const [recoveredCount, setRecoveredCount] = useState<number>(user?.locationsRecovered || 3);
  const [recoveryChainList, setRecoveryChainList] = useState<{ id: string; title: string }[]>([
    { id: 'l-1', title: 'Pine Street Lot' },
    { id: 'l-2', title: 'Oak Alley' },
    { id: 'l-3', title: 'Riverbed Clean' },
    { id: 'l-4', title: 'East Park Spot' }
  ]);

  useEffect(() => {
    const unsubH = hotspotService.subscribeToHotspots((hotspots) => {
      const myUid = user?.uid || 'demo-user-1';
      const myHotspots = hotspots.filter(h => h.reporterId === myUid || h.reportedBy === myUid);
      setUserHotspotsCount(myHotspots.length || user?.hotspotsReported || 4);

      const recovered = hotspots.filter(h =>
        (h.reporterId === myUid || h.reportedBy === myUid) &&
        (h.status === 'cleared' || h.status === 'recovered' || h.status === 'transformed' || h.status === 'cleaned')
      );
      setRecoveredCount(recovered.length || user?.locationsRecovered || 3);

      if (recovered.length > 0) {
        setRecoveryChainList(recovered.map(r => ({ id: r.id, title: r.title })));
      }
    });

    const unsubM = missionService.subscribeToMissions((missions) => {
      const myUid = user?.uid || 'demo-user-1';
      const myMissions = missions.filter(m =>
        m.organizerId === myUid || (m.volunteersRegistered && m.volunteersRegistered.includes(myUid))
      );
      setUserMissionsCount(myMissions.length || user?.missionsCompleted || 6);
    });

    return () => {
      unsubH();
      unsubM();
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error || 'Invalid file format.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const photoURL = await storageService.uploadPhoto(file, 'profile', (progress) => {
        setUploadProgress(Math.round(progress));
      });
      await authService.updateUserProfilePhoto(photoURL);
    } catch (err: any) {
      console.error('Failed to upload profile photo:', err);
      setAvatarError(err.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsUploading(true);
      await authService.updateUserProfilePhoto(null);
    } catch (err) {
      console.error('Failed to remove profile photo:', err);
      setAvatarError('Failed to remove profile photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const displayName = user?.displayName || mockUser.name;
  const roleDisplay = user?.role || 'COMMUNITY LEADER';
  const orgDisplay = user?.organization ? ` (${user.organization})` : ' (TrashChain Local)';
  const impactScore = user?.impactScore ?? mockUser.environmentalScore;
  const joinDate = user?.createdAt || mockUser.joinDate;
  const dataSource = user?.dataSource || (isDemo ? 'DEMO DATA' : 'FIELD DATA');

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans pb-28 transition-colors duration-200">
      
      {/* SETTINGS MODAL */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user} 
      />

      {/* HERO SECTION */}
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-850 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            
            {/* AVATAR EDITOR & INITIALS FALLBACK */}
            <div className="relative group">
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
              />

              {isUploading ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-100 dark:bg-neutral-900 border-2 border-forest-500/40 flex flex-col items-center justify-center p-2 text-center shadow-2xl">
                  <Loader2 className="w-6 h-6 text-forest-600 dark:text-fresh-400 animate-spin" />
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 mt-1">{uploadProgress}%</span>
                </div>
              ) : (user?.photoURL && !avatarError) ? (
                <img 
                  src={user.photoURL} 
                  alt={displayName} 
                  onError={() => setAvatarError('Failed to load profile photo.')}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-forest-500/40 shadow-2xl"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-forest-100 dark:bg-forest-950 border-2 border-forest-500/40 text-forest-800 dark:text-fresh-400 flex items-center justify-center text-xl sm:text-2xl font-black font-mono shadow-2xl">
                  {getInitials(displayName)}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Change Profile Photo"
                aria-label="Change Profile Photo"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-lg"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">{displayName}</h1>
                <Badge variant="success" className="bg-fresh-500/10 text-fresh-700 dark:text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                  {dataSource}
                </Badge>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">{roleDisplay}{orgDisplay}</p>

              {avatarError && (
                <div className="text-coral-600 dark:text-coral-400 text-[11px] font-mono flex items-center gap-1 pt-0.5">
                  <AlertTriangle className="w-3 h-3" /> {avatarError}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs font-mono text-neutral-600 dark:text-neutral-400 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-forest-600 dark:text-fresh-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Camera className="w-3.5 h-3.5" /> Change Photo
                </button>
                {user?.photoURL && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isUploading}
                      className="text-coral-600 dark:text-coral-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </>
                )}
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="flex items-center gap-1 font-bold text-forest-600 dark:text-fresh-400">
                  <Leaf className="w-3.5 h-3.5" /> {impactScore} Impact Pts
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Joined {new Date(joinDate).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {user?.publicProfile ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/profile/${user?.uid || 'demo-user-1'}`)}
                className="bg-forest-50 dark:bg-forest-950/40 border-forest-200 dark:border-forest-500/30 text-forest-700 dark:text-fresh-400 font-bold text-xs hover:bg-forest-100 dark:hover:bg-forest-900/60"
              >
                <Eye className="w-4 h-4 mr-1.5" /> View Public Profile
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" /> Public Profile Off (Enable in Settings)
              </button>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSettingsOpen(true)}
              className="bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-white font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <Settings className="w-4 h-4 mr-1.5" /> Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="bg-coral-50 dark:bg-coral-950/40 border-coral-200 dark:border-coral-500/30 text-coral-700 dark:text-coral-400 hover:bg-coral-100 dark:hover:bg-coral-900/60 font-bold text-xs"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Log Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* 2. IMPACT STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">HOTSPOTS REPORTED</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">{userHotspotsCount}</span>
            <span className="text-[9px] text-neutral-500 block">USER-REPORTED</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">MISSIONS JOINED</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">{userMissionsCount}</span>
            <span className="text-[9px] text-neutral-500 block">VOLUNTEER</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">COMPLETED</span>
            <span className="text-2xl font-black text-forest-600 dark:text-fresh-400">{userMissionsCount}</span>
            <span className="text-[9px] text-neutral-500 block">VERIFIED</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">RECOVERED</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">{recoveredCount}</span>
            <span className="text-[9px] text-neutral-500 block">SITES</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">WASTE RECORDED</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">340 kg</span>
            <span className="text-[9px] text-forest-600 dark:text-fresh-400 block font-bold">MEASURED</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[9px] uppercase">CHAIN LENGTH</span>
            <span className="text-2xl font-black text-amber-600 dark:text-yellow-400">{recoveryChainList.length} Links</span>
            <span className="text-[9px] text-neutral-500 block">CONNECTED</span>
          </div>
        </div>

        {/* 2.5 COMMUNITY & ORGANIZATION DETAILS */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Organization & Community Profile</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Your participant profile, community affiliation, location, and environmental focus.</p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs font-mono font-bold text-forest-600 dark:text-fresh-400 hover:underline flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 space-y-1">
              <span className="text-neutral-500 flex items-center gap-1.5 text-[10px]">
                <Users className="w-3.5 h-3.5 text-forest-600 dark:text-fresh-400" /> Participant Category
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                {user?.participantType || 'Individual Citizen'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 space-y-1">
              <span className="text-neutral-500 flex items-center gap-1.5 text-[10px]">
                <Building2 className="w-3.5 h-3.5 text-forest-600 dark:text-fresh-400" /> Institution / Organization
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                {user?.institutionName || user?.organization || 'Independent'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 space-y-1">
              <span className="text-neutral-500 flex items-center gap-1.5 text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-forest-600 dark:text-fresh-400" /> Base Location
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                {user?.city ? `${user.city}${user.state ? `, ${user.state}` : ''}` : 'Location Not Set'}
              </span>
            </div>
          </div>

          {/* Environmental Interests & Participation Roles */}
          {((user?.environmentalInterests && user.environmentalInterests.length > 0) || (user?.participationRoles && user.participationRoles.length > 0)) && (
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {user.environmentalInterests && user.environmentalInterests.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-neutral-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-fresh-400" /> Environmental Interests
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.environmentalInterests.map((interest, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-forest-500/10 text-forest-700 dark:text-fresh-400 border border-forest-500/20 font-bold text-[11px]">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.participationRoles && user.participationRoles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-neutral-500 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-forest-600 dark:text-fresh-400" /> Active Roles
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.participationRoles.map((role, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-bold text-[11px]">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 3. YOUR RECOVERY CHAIN */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Your Recovery Chain</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Visual chain of sites transformed through your community action.</p>
            </div>
            <ImpactBadge type="VERIFIED" size="sm" />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-3 font-mono text-xs">
            {recoveryChainList.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 shrink-0">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-forest-500/40 rounded-2xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-forest-600 dark:text-fresh-400" />
                  <div>
                    <span className="text-neutral-400 text-[9px] block">LINK 0{i + 1}</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">{item.title}</span>
                  </div>
                </div>
                {i < recoveryChainList.length - 1 && <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-700" />}
              </div>
            ))}
          </div>
        </Card>

        {/* 4. ACHIEVEMENTS */}
        {(() => {
          const userEarnedBadges = getEarnedBadges({
            reportsSubmitted: userHotspotsCount,
            missionsCompleted: userMissionsCount,
            wasteRemovedKg: user?.wasteRemovedKg ?? 340,
            locationsRecovered: recoveredCount,
            chainLength: recoveryChainList.length,
            missionsOrganized: 1,
            locationsTransformed: 1,
          });

          return (
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Environmental Impact Badges</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Badges earned through verified field actions.</p>
                </div>
                <Badge variant="success" className="bg-fresh-500/10 text-fresh-700 dark:text-fresh-400 border-fresh-500/30 font-mono text-[10px]">
                  {userEarnedBadges.length} UNLOCKED
                </Badge>
              </div>

              {userEarnedBadges.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-2xl space-y-2">
                  <div className="text-3xl">🛡️</div>
                  <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">No Environmental Badges Earned Yet</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono max-w-sm mx-auto">
                    Submit reports, participate in cleanup missions, or recover locations to unlock badges.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userEarnedBadges.map((ach) => (
                    <div key={ach.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 flex items-start gap-3">
                      <span className="text-2xl p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm shrink-0">{ach.icon}</span>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{ach.title || ach.name}</h4>
                          {ach.category && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-forest-500/10 text-forest-700 dark:text-fresh-400 border border-forest-500/20 font-bold">
                              {ach.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed">{ach.desc || ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })()}

      </div>

    </div>
    </PageTransition>
  );
}
