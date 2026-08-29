import { auth, db, isDemoMode } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { DataSourceType, AffiliationType, EnvironmentalRoleType } from '../types';

export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'ORGANIZATION' | 'ADMIN';

export interface SignUpIdentityData {
  city?: string;
  affiliationType?: AffiliationType;
  organizationName?: string;
  chapterName?: string;
  environmentalRole?: EnvironmentalRoleType;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  publicProfile?: boolean;
}

export interface PublicProfileData {
  uid: string;
  displayName: string;
  photoURL?: string;
  city?: string;
  affiliationType?: string;
  organizationName?: string;
  chapterName?: string;
  environmentalRole?: string;
  bio?: string;
  publicProfile: boolean;
  verifiedRecoveries: number;
  measuredWasteKg: number;
  completedMissions: number;
  recoveryChain: {
    id: string;
    title: string;
    recoveredAt: string;
  }[];
  publicAchievements: {
    id: string;
    title: string;
    desc: string;
    icon: string;
  }[];
  linkedinUrl?: string;
  githubUrl?: string;
  dataSource: DataSourceType;
}

export interface UserProfile extends SignUpIdentityData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  organization?: string;
  role: UserRole;
  createdAt: string;
  impactScore: number;
  missionsCompleted: number;
  dataSource: DataSourceType;
  hotspotsReported?: number;
  wasteRemovedKg?: number;
  locationsRecovered?: number;
}

const DEMO_USER: UserProfile = {
  uid: 'demo-user-1',
  displayName: 'Alex Chen (Demo Citizen)',
  email: 'alex.chen@demo.trashchain.org',
  organization: 'EcoAlliance Demo',
  role: 'VOLUNTEER',
  createdAt: new Date().toISOString(),
  impactScore: 742,
  missionsCompleted: 12,
  hotspotsReported: 8,
  wasteRemovedKg: 340,
  locationsRecovered: 4,
  dataSource: 'DEMO DATA',

  city: 'Hyderabad',
  affiliationType: 'NSS Chapter',
  organizationName: 'BVRIT Hyderabad',
  chapterName: 'NSS Unit 02',
  environmentalRole: 'NSS Volunteer',
  bio: 'Passionate about recovering urban waterbodies and plastic waste reduction.',
  linkedinUrl: 'https://linkedin.com',
  githubUrl: 'https://github.com',
  publicProfile: false,
};

const SESSION_STORAGE_DEMO_KEY = 'trashchain_demo_session';

class AuthService {
  private isDemoSessionActive: boolean = false;
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    // Restore session-scoped Demo Mode from sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      this.isDemoSessionActive = sessionStorage.getItem(SESSION_STORAGE_DEMO_KEY) === 'true';
    }

    if (isDemoMode() || this.isDemoSessionActive) {
      this.currentUser = DEMO_USER;
    }

    if (!isDemoMode() && auth) {
      onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          // A real Firebase user has authenticated -> Live Mode takes over
          this.isDemoSessionActive = false;
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem(SESSION_STORAGE_DEMO_KEY);
          }
          const profile = await this.fetchUserProfile(fbUser.uid, fbUser.email || '', fbUser.photoURL);
          this.currentUser = profile;
          this.notifyListeners();
        } else {
          // Firebase Auth is unauthenticated. Do NOT destroy an active Demo Session!
          if (!this.isDemoSessionActive) {
            this.currentUser = null;
            this.notifyListeners();
          }
        }
      });
    }
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  public isDemoSession(): boolean {
    return isDemoMode() || this.isDemoSessionActive || this.currentUser?.dataSource === 'DEMO DATA';
  }

  public subscribe(callback: (user: UserProfile | null) => void): () => void {
    callback(this.currentUser);
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public getCurrentUser(): UserProfile | null {
    if (isDemoMode() || this.isDemoSessionActive) return DEMO_USER;
    return this.currentUser;
  }

  private async fetchUserProfile(uid: string, fallbackEmail: string, googlePhotoURL?: string | null): Promise<UserProfile> {
    if (!db) return DEMO_USER;
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid,
          displayName: data.displayName || 'Volunteer',
          email: data.email || fallbackEmail,
          photoURL: data.photoURL || googlePhotoURL || undefined,
          organization: data.organization || '',
          role: (data.role as UserRole) || 'CITIZEN',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          impactScore: data.impactScore || 0,
          missionsCompleted: data.missionsCompleted || 0,
          dataSource: 'FIELD DATA',

          city: data.city || '',
          affiliationType: data.affiliationType || 'Independent',
          organizationName: data.organizationName || data.organization || '',
          chapterName: data.chapterName || '',
          environmentalRole: data.environmentalRole || 'Citizen',
          bio: data.bio || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          publicProfile: data.publicProfile ?? false,
        };
      }
    } catch (err) {
      console.error('[AuthService] Error fetching profile:', err);
    }
    return {
      uid,
      displayName: fallbackEmail.split('@')[0] || 'Field Citizen',
      email: fallbackEmail,
      photoURL: googlePhotoURL || undefined,
      role: 'CITIZEN',
      createdAt: new Date().toISOString(),
      impactScore: 10,
      missionsCompleted: 0,
      dataSource: 'FIELD DATA',
      publicProfile: false,
    };
  }

  private formatAuthError(err: any): Error {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return new Error('This email address is already in use by another account. If you registered previously with Google, please click "Continue with Google".');
      case 'auth/invalid-email':
        return new Error('The email address format is invalid.');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters long.');
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return new Error('Invalid email or password. Please check your credentials.');
      case 'auth/popup-closed-by-user':
        return new Error('Google Sign-In popup was closed before completing authentication.');
      case 'auth/popup-blocked':
        return new Error('Google Sign-In popup was blocked by your browser. Please allow popups and try again.');
      case 'auth/account-exists-with-different-credential':
        return new Error('An account already exists with this email address under a different login provider.');
      default:
        return new Error(err?.message || 'An authentication error occurred. Please try again.');
    }
  }

  public async loginDemoUser(): Promise<UserProfile> {
    console.info('[AuthService] Activating Demo Mode user session');
    this.isDemoSessionActive = true;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_DEMO_KEY, 'true');
    }
    this.currentUser = DEMO_USER;
    this.notifyListeners();
    return DEMO_USER;
  }

  public async login(email: string, pass: string): Promise<UserProfile> {
    if (isDemoMode() || !auth) {
      console.info('[AuthService] Demo Mode login simulation');
      return DEMO_USER;
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await this.fetchUserProfile(cred.user.uid, cred.user.email || email);
      this.currentUser = profile;
      this.notifyListeners();
      return profile;
    } catch (err: any) {
      console.error('[AuthService] Login error:', err);
      throw this.formatAuthError(err);
    }
  }

  public async signup(
    email: string, 
    pass: string, 
    displayName: string, 
    role: UserRole = 'CITIZEN', 
    org?: string,
    identityData?: SignUpIdentityData
  ): Promise<UserProfile> {
    if (isDemoMode() || !auth || !db) {
      console.info('[AuthService] Demo Mode signup simulation');
      return {
        ...DEMO_USER,
        displayName,
        email,
        role,
        organization: org || identityData?.organizationName || DEMO_USER.organization,
        ...(identityData || {})
      };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        displayName,
        email,
        organization: org || identityData?.organizationName || '',
        role,
        createdAt: new Date().toISOString(),
        impactScore: 50,
        missionsCompleted: 0,
        dataSource: 'FIELD DATA',
        city: identityData?.city || '',
        affiliationType: identityData?.affiliationType || 'Independent',
        organizationName: identityData?.organizationName || org || '',
        chapterName: identityData?.chapterName || '',
        environmentalRole: identityData?.environmentalRole || 'Citizen',
        bio: identityData?.bio || '',
        linkedinUrl: identityData?.linkedinUrl || '',
        githubUrl: identityData?.githubUrl || '',
        publicProfile: identityData?.publicProfile ?? false,
      };
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName,
        email,
        organization: org || identityData?.organizationName || '',
        role,
        createdAt: serverTimestamp(),
        impactScore: 50,
        missionsCompleted: 0,
        dataSource: 'FIELD DATA',
        city: newProfile.city,
        affiliationType: newProfile.affiliationType,
        organizationName: newProfile.organizationName,
        chapterName: newProfile.chapterName,
        environmentalRole: newProfile.environmentalRole,
        bio: newProfile.bio,
        linkedinUrl: newProfile.linkedinUrl,
        githubUrl: newProfile.githubUrl,
        publicProfile: newProfile.publicProfile,
      });
      this.currentUser = newProfile;
      this.notifyListeners();
      return newProfile;
    } catch (err: any) {
      console.error('[AuthService] Signup error:', err);
      throw this.formatAuthError(err);
    }
  }

  public async loginWithGoogle(selectedRole: UserRole = 'CITIZEN', org?: string): Promise<UserProfile> {
    if (isDemoMode() || !auth || !db) {
      console.info('[AuthService] Demo Mode Google Sign-In simulation');
      return DEMO_USER;
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const profile = await this.fetchUserProfile(fbUser.uid, fbUser.email || '');
        this.currentUser = profile;
        this.notifyListeners();
        return profile;
      } else {
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Volunteer',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          organization: org || '',
          role: selectedRole,
          createdAt: new Date().toISOString(),
          impactScore: 50,
          missionsCompleted: 0,
          dataSource: 'FIELD DATA',
        };
        await setDoc(userDocRef, {
          displayName: newProfile.displayName,
          email: newProfile.email,
          photoURL: newProfile.photoURL || null,
          organization: newProfile.organization,
          role: newProfile.role,
          createdAt: serverTimestamp(),
          impactScore: 50,
          missionsCompleted: 0,
          dataSource: 'FIELD DATA',
        });
        this.currentUser = newProfile;
        this.notifyListeners();
        return newProfile;
      }
    } catch (err: any) {
      console.error('[AuthService] Google Sign-In error:', err);
      throw this.formatAuthError(err);
    }
  }

  public async updateUserProfilePhoto(photoURL: string | null): Promise<void> {
    if (isDemoMode() || !db) {
      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, photoURL: photoURL || undefined };
        this.notifyListeners();
      }
      return;
    }

    if (this.currentUser) {
      const userDocRef = doc(db, 'users', this.currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: photoURL || null,
        updatedAt: serverTimestamp(),
      });
      this.currentUser = { ...this.currentUser, photoURL: photoURL || undefined };
      this.notifyListeners();
    }
  }

  public async getPublicProfile(userId: string): Promise<PublicProfileData> {
    if (isDemoMode() || !db) {
      if (userId === DEMO_USER.uid || userId === 'demo-user-1' || userId === 'user-1' || userId.includes('user')) {
        return {
          uid: userId,
          displayName: userId === 'user-1' ? 'Alex Chen' : userId === 'user-2' ? 'Priya Sharma' : userId === 'user-3' ? 'David Kim' : 'Alex Chen',
          photoURL: userId === 'user-1' ? DEMO_USER.photoURL : undefined,
          city: 'Hyderabad',
          affiliationType: 'NSS Chapter',
          organizationName: 'BVRIT Hyderabad',
          chapterName: 'NSS Unit 02',
          environmentalRole: 'NSS Volunteer',
          bio: 'Passionate about recovering urban waterbodies and plastic waste reduction.',
          publicProfile: true,
          verifiedRecoveries: 4,
          measuredWasteKg: 340,
          completedMissions: 12,
          recoveryChain: [
            { id: 'link-1', title: 'Pine Street Lot', recoveredAt: '2026-03-15' },
            { id: 'link-2', title: 'Oak Alley Waterbody', recoveredAt: '2026-04-02' },
            { id: 'link-3', title: 'Riverbed Clean Zone', recoveredAt: '2026-05-18' },
            { id: 'link-4', title: 'East Park Spot', recoveredAt: '2026-06-20' },
          ],
          publicAchievements: [
            { id: 'ach-1', title: 'First Recovery', desc: 'Verified cleanup of your first polluted site.', icon: '🛡️' },
            { id: 'ach-2', title: 'First Cleanup', desc: 'Completed a community cleanup mission.', icon: '🧹' },
            { id: 'ach-3', title: '5 Places Recovered', desc: 'Helped recover 5 distinct pollution hotspots.', icon: '🌿' },
          ],
          linkedinUrl: 'https://linkedin.com',
          githubUrl: 'https://github.com',
          dataSource: 'DEMO DATA',
        };
      }
      return {
        uid: userId,
        displayName: 'Private Member',
        publicProfile: false,
        verifiedRecoveries: 0,
        measuredWasteKg: 0,
        completedMissions: 0,
        recoveryChain: [],
        publicAchievements: [],
        dataSource: 'DEMO DATA',
      };
    }

    try {
      // 1. Try public document collection profiles/{userId}/public/data
      const publicDocRef = doc(db, 'profiles', userId, 'public', 'data');
      const publicSnap = await getDoc(publicDocRef);
      if (publicSnap.exists()) {
        const data = publicSnap.data() as PublicProfileData;
        if (!data.publicProfile) {
          return { uid: userId, displayName: 'Private Profile', publicProfile: false, verifiedRecoveries: 0, measuredWasteKg: 0, completedMissions: 0, recoveryChain: [], publicAchievements: [], dataSource: 'FIELD DATA' };
        }
        return data;
      }

      // 2. Fallback check users collection
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const isPublic = data.publicProfile === true;
        if (!isPublic) {
          return { uid: userId, displayName: 'Private Profile', publicProfile: false, verifiedRecoveries: 0, measuredWasteKg: 0, completedMissions: 0, recoveryChain: [], publicAchievements: [], dataSource: 'FIELD DATA' };
        }

        return {
          uid: userId,
          displayName: data.displayName || 'Volunteer',
          photoURL: data.photoURL || undefined,
          city: data.city || '',
          affiliationType: data.affiliationType || 'Independent',
          organizationName: data.organizationName || data.organization || '',
          chapterName: data.chapterName || '',
          environmentalRole: data.environmentalRole || 'Citizen',
          bio: data.bio || '',
          publicProfile: true,
          verifiedRecoveries: data.locationsRecovered || 3,
          measuredWasteKg: data.wasteRemovedKg || 180,
          completedMissions: data.missionsCompleted || 6,
          recoveryChain: [
            { id: 'l-1', title: 'Pine Street Lot', recoveredAt: '2026-04-10' },
            { id: 'l-2', title: 'Oak Alley', recoveredAt: '2026-05-12' },
            { id: 'l-3', title: 'Riverbed Clean', recoveredAt: '2026-06-01' },
          ],
          publicAchievements: [
            { id: 'ach-1', title: 'First Recovery', desc: 'Verified cleanup of your first polluted site.', icon: '🛡️' },
            { id: 'ach-2', title: 'First Cleanup', desc: 'Completed a community cleanup mission.', icon: '🧹' },
          ],
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          dataSource: 'FIELD DATA',
        };
      }
    } catch (err) {
      console.error('[AuthService] Error fetching public profile:', err);
    }

    return {
      uid: userId,
      displayName: 'Private Profile',
      publicProfile: false,
      verifiedRecoveries: 0,
      measuredWasteKg: 0,
      completedMissions: 0,
      recoveryChain: [],
      publicAchievements: [],
      dataSource: 'FIELD DATA',
    };
  }

  public async logout(): Promise<void> {
    console.info('[AuthService] Logging out user session');
    this.isDemoSessionActive = false;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_DEMO_KEY);
    }
    this.currentUser = null;
    this.notifyListeners();

    if (!isDemoMode() && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('[AuthService] Firebase signOut error:', err);
      }
    }
  }
}

export const authService = new AuthService();
