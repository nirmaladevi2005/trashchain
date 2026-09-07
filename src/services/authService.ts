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
import type { DataSourceType, AffiliationType, EnvironmentalRoleType, ParticipantType } from '../types';
import { getEarnedBadges, type BadgeItem } from '../utils/badgeUtils';

export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'ORGANIZATION' | 'ADMIN';

export interface SignUpIdentityData {
  city?: string;
  state?: string;
  country?: string;
  participantType?: ParticipantType | string;
  organizationName?: string;
  organizationType?: string;
  website?: string;
  organizationDescription?: string;
  memberCount?: string;
  institutionName?: string;
  nssUnitName?: string;
  environmentalInterests?: string[];
  participationRoles?: string[];
  publicProfile?: boolean;
  photoURL?: string;

  affiliationType?: AffiliationType;
  chapterName?: string;
  environmentalRole?: EnvironmentalRoleType;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface UserActivityItem {
  id: string;
  type: 'report' | 'mission_organize' | 'mission_join' | 'cleanup_completed' | 'recovery_verified';
  title: string;
  location?: string;
  timestamp: string;
  impactBadge?: string;
  hotspotId?: string;
  missionId?: string;
}

export interface PublicProfileData {
  uid: string;
  displayName: string;
  photoURL?: string;
  city?: string;
  state?: string;
  country?: string;
  participantType?: string;
  organizationName?: string;
  organizationType?: string;
  website?: string;
  organizationDescription?: string;
  memberCount?: string;
  institutionName?: string;
  nssUnitName?: string;
  environmentalInterests?: string[];
  participationRoles?: string[];
  affiliationType?: string;
  chapterName?: string;
  environmentalRole?: string;
  bio?: string;
  publicProfile: boolean;
  verifiedRecoveries: number;
  measuredWasteKg: number;
  completedMissions: number;
  reportsSubmittedCount?: number;
  recoveryChain: {
    id: string;
    title: string;
    recoveredAt: string;
  }[];
  publicAchievements: BadgeItem[];
  activities?: UserActivityItem[];
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
  displayName: 'Alex Chen (Demo Volunteer)',
  email: 'alex.chen@demo.trashchain.org',
  organization: 'BVRIT Hyderabad',
  role: 'VOLUNTEER',
  createdAt: new Date().toISOString(),
  impactScore: 742,
  missionsCompleted: 12,
  hotspotsReported: 8,
  wasteRemovedKg: 340,
  locationsRecovered: 4,
  dataSource: 'DEMO DATA',

  city: 'Hyderabad',
  state: 'Telangana',
  country: 'India',
  participantType: 'NSS Volunteer',
  institutionName: 'BVRIT Hyderabad',
  nssUnitName: 'NSS Unit 02',
  organizationName: 'BVRIT Hyderabad',
  affiliationType: 'NSS Chapter',
  chapterName: 'NSS Unit 02',
  environmentalRole: 'NSS Volunteer',
  bio: 'Passionate about recovering urban waterbodies and plastic waste reduction.',
  environmentalInterests: ['Waste Cleanup', 'Plastic Reduction', 'Water Body Cleanup', 'Monitoring & Verification'],
  participationRoles: ['Report Waste Hotspots', 'Join Cleanup Missions', 'Monitor Cleaned Locations'],
  linkedinUrl: 'https://linkedin.com',
  githubUrl: 'https://github.com',
  publicProfile: false,
};

const DEMO_USER_STORAGE_KEY = 'trashchain_demo_user_profile';
const SESSION_STORAGE_DEMO_KEY = 'trashchain_demo_session';

class AuthService {
  private isDemoSessionActive: boolean = false;
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null, isInitializing: boolean) => void)[] = [];
  private isInitializing: boolean = true;

  constructor() {
    // Restore session-scoped Demo Mode strictly from sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      this.isDemoSessionActive = sessionStorage.getItem(SESSION_STORAGE_DEMO_KEY) === 'true';
    }

    if (this.isDemoSessionActive) {
      this.currentUser = this.loadDemoUserProfile();
      this.isInitializing = false;
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
        } else {
          // Firebase Auth is unauthenticated. Do NOT destroy an active Demo Session!
          if (!this.isDemoSessionActive) {
            this.currentUser = null;
          }
        }
        this.isInitializing = false;
        this.notifyListeners();
      });
    } else {
      this.isInitializing = false;
    }
  }

  private loadDemoUserProfile(): UserProfile {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEMO_USER, ...parsed };
        }
      }
    } catch (e) {
      console.warn('[AuthService] Failed to parse demo user profile from localStorage:', e);
    }
    return { ...DEMO_USER };
  }

  private saveDemoUserProfileToStorage(profile: UserProfile) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(profile));
      }
    } catch (e) {
      console.warn('[AuthService] Failed to save demo user profile to localStorage:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser, this.isInitializing));
  }

  public isDemoSession(): boolean {
    return this.isDemoSessionActive;
  }

  public isAuthInitializing(): boolean {
    return this.isInitializing;
  }

  public subscribe(callback: (user: UserProfile | null, isInitializing: boolean) => void): () => void {
    callback(this.currentUser, this.isInitializing);
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public getCurrentUser(): UserProfile | null {
    if (this.isDemoSessionActive && !this.currentUser) {
      this.currentUser = this.loadDemoUserProfile();
    }
    return this.currentUser;
  }

  private async fetchUserProfile(uid: string, fallbackEmail: string, googlePhotoURL?: string | null): Promise<UserProfile> {
    if (!db) {
      return {
        uid,
        displayName: fallbackEmail.split('@')[0] || 'Field Volunteer',
        email: fallbackEmail,
        photoURL: googlePhotoURL || undefined,
        role: 'CITIZEN',
        createdAt: new Date().toISOString(),
        impactScore: 50,
        missionsCompleted: 0,
        dataSource: 'FIELD DATA',
        publicProfile: false,
      };
    }
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
          organization: data.organization || data.organizationName || '',
          role: (data.role as UserRole) || 'CITIZEN',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          impactScore: data.impactScore || 0,
          missionsCompleted: data.missionsCompleted || 0,
          dataSource: 'FIELD DATA',

          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          participantType: data.participantType || data.affiliationType || 'Individual Citizen',
          organizationName: data.organizationName || data.organization || '',
          organizationType: data.organizationType || '',
          website: data.website || '',
          organizationDescription: data.organizationDescription || '',
          memberCount: data.memberCount || '',
          institutionName: data.institutionName || '',
          nssUnitName: data.nssUnitName || '',
          environmentalInterests: data.environmentalInterests || [],
          participationRoles: data.participationRoles || [],

          affiliationType: data.affiliationType || 'Independent',
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
    const message = err?.message || '';
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';

    console.error('[AuthService] Firebase Auth Error:', { code, message, rawError: err });

    switch (code) {
      case 'auth/email-already-in-use':
        return new Error('This email address is already registered. If you previously registered with Google, please use Continue with Google.');
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.');
      case 'auth/weak-password':
        return new Error('Your password is too weak. Please choose a stronger password.');
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return new Error('Invalid email or password. Please check your credentials and try again.');
      case 'auth/user-disabled':
        return new Error('This user account has been disabled. Please contact support.');
      case 'auth/popup-closed-by-user':
        return new Error('Google Sign-In popup was closed before completing authentication.');
      case 'auth/popup-blocked':
        return new Error('Google Sign-In popup was blocked by your browser. Please allow popups for this site and try again.');
      case 'auth/account-exists-with-different-credential':
        return new Error('An account already exists with this email address under a different login provider.');
      case 'auth/unauthorized-domain':
        return new Error(`Authentication domain "${currentHostname}" is not authorized. Please add "${currentHostname}" to Firebase Console ➔ Authentication ➔ Settings ➔ Authorized domains.`);
      case 'auth/operation-not-allowed':
        return new Error('Email/password sign-up is currently disabled. Please enable Email/Password authentication in Firebase Console.');
      case 'auth/api-key-not-valid':
      case 'auth/invalid-api-key':
        return new Error('Invalid Firebase API key. Please check your environment variables configuration.');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection and try again.');
      default:
        return new Error(message || 'An authentication error occurred. Please try again.');
    }
  }

  public async loginDemoUser(): Promise<UserProfile> {
    console.info('[AuthService] Activating Demo Mode user session');
    this.isDemoSessionActive = true;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_DEMO_KEY, 'true');
    }
    const demoProfile = this.loadDemoUserProfile();
    this.currentUser = demoProfile;
    this.notifyListeners();
    return demoProfile;
  }

  public async logoutDemoUser(): Promise<void> {
    console.info('[AuthService] Clearing Demo Mode user session');
    this.isDemoSessionActive = false;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_DEMO_KEY);
    }
    this.currentUser = null;
    this.notifyListeners();
  }

  public async login(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (isDemoMode() || !auth) {
      console.info('[AuthService] Demo Mode login simulation');
      return this.loginDemoUser();
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const profile = await this.fetchUserProfile(cred.user.uid, cred.user.email || cleanEmail);
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();
    if (isDemoMode() || !auth) {
      console.info('[AuthService] Demo Mode signup simulation');
      return this.loginDemoUser();
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        displayName: cleanName,
        email: cleanEmail,
        photoURL: identityData?.bio /* avatar URL passed if any */ || undefined,
        organization: org || identityData?.organizationName || identityData?.institutionName || '',
        role,
        createdAt: new Date().toISOString(),
        impactScore: 50,
        missionsCompleted: 0,
        dataSource: 'FIELD DATA',
        city: identityData?.city || '',
        state: identityData?.state || '',
        country: identityData?.country || 'India',
        participantType: identityData?.participantType || 'Individual Citizen',
        organizationName: identityData?.organizationName || org || '',
        organizationType: identityData?.organizationType || '',
        website: identityData?.website || '',
        organizationDescription: identityData?.organizationDescription || '',
        memberCount: identityData?.memberCount || '',
        institutionName: identityData?.institutionName || '',
        nssUnitName: identityData?.nssUnitName || '',
        environmentalInterests: identityData?.environmentalInterests || [],
        participationRoles: identityData?.participationRoles || [],

        affiliationType: identityData?.affiliationType || 'Independent',
        chapterName: identityData?.chapterName || '',
        environmentalRole: identityData?.environmentalRole || 'Citizen',
        bio: identityData?.bio || '',
        linkedinUrl: identityData?.linkedinUrl || '',
        githubUrl: identityData?.githubUrl || '',
        publicProfile: identityData?.publicProfile ?? false,
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', cred.user.uid), {
            displayName: cleanName,
            email: cleanEmail,
            organization: newProfile.organization,
            role,
            createdAt: serverTimestamp(),
            impactScore: 50,
            missionsCompleted: 0,
            dataSource: 'FIELD DATA',
            city: newProfile.city,
            state: newProfile.state,
            country: newProfile.country,
            participantType: newProfile.participantType,
            organizationName: newProfile.organizationName,
            organizationType: newProfile.organizationType,
            website: newProfile.website,
            organizationDescription: newProfile.organizationDescription,
            memberCount: newProfile.memberCount,
            institutionName: newProfile.institutionName,
            nssUnitName: newProfile.nssUnitName,
            environmentalInterests: newProfile.environmentalInterests,
            participationRoles: newProfile.participationRoles,
            affiliationType: newProfile.affiliationType,
            chapterName: newProfile.chapterName,
            environmentalRole: newProfile.environmentalRole,
            bio: newProfile.bio,
            linkedinUrl: newProfile.linkedinUrl,
            githubUrl: newProfile.githubUrl,
            publicProfile: newProfile.publicProfile,
          });

          if (newProfile.publicProfile) {
            const publicDocRef = doc(db, 'profiles', cred.user.uid, 'public', 'data');
            await setDoc(publicDocRef, {
              uid: cred.user.uid,
              displayName: cleanName,
              photoURL: newProfile.photoURL || null,
              city: newProfile.city,
              state: newProfile.state,
              country: newProfile.country,
              participantType: newProfile.participantType,
              organizationName: newProfile.organizationName,
              institutionName: newProfile.institutionName,
              nssUnitName: newProfile.nssUnitName,
              environmentalInterests: newProfile.environmentalInterests,
              participationRoles: newProfile.participationRoles,
              publicProfile: true,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }
        } catch (dbErr) {
          console.warn('[AuthService] Firestore setDoc error on signup:', dbErr);
        }
      }
      this.currentUser = newProfile;
      this.notifyListeners();
      return newProfile;
    } catch (err: any) {
      console.error('[AuthService] Signup error:', err);
      throw this.formatAuthError(err);
    }
  }

  public async loginWithGoogle(
    selectedRole: UserRole = 'CITIZEN',
    org?: string,
    identityData?: SignUpIdentityData
  ): Promise<UserProfile> {
    if (isDemoMode() || !auth) {
      console.info('[AuthService] Demo Mode Google Sign-In simulation');
      return this.loginDemoUser();
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const profile = await this.fetchUserProfile(fbUser.uid, fbUser.email || '', fbUser.photoURL);
            if (identityData && Object.keys(identityData).length > 0) {
              await this.updateUserProfile(identityData);
              return this.currentUser || profile;
            }
            this.currentUser = profile;
            this.notifyListeners();
            return profile;
          } else {
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Volunteer',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              organization: org || identityData?.organizationName || identityData?.institutionName || '',
              role: selectedRole,
              createdAt: new Date().toISOString(),
              impactScore: 50,
              missionsCompleted: 0,
              dataSource: 'FIELD DATA',
              city: identityData?.city || '',
              state: identityData?.state || '',
              country: identityData?.country || 'India',
              participantType: identityData?.participantType || 'Individual Citizen',
              organizationName: identityData?.organizationName || org || '',
              organizationType: identityData?.organizationType || '',
              website: identityData?.website || '',
              organizationDescription: identityData?.organizationDescription || '',
              memberCount: identityData?.memberCount || '',
              institutionName: identityData?.institutionName || '',
              nssUnitName: identityData?.nssUnitName || '',
              environmentalInterests: identityData?.environmentalInterests || [],
              participationRoles: identityData?.participationRoles || [],
              publicProfile: identityData?.publicProfile ?? false,
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
              city: newProfile.city,
              state: newProfile.state,
              country: newProfile.country,
              participantType: newProfile.participantType,
              organizationName: newProfile.organizationName,
              organizationType: newProfile.organizationType,
              website: newProfile.website,
              organizationDescription: newProfile.organizationDescription,
              memberCount: newProfile.memberCount,
              institutionName: newProfile.institutionName,
              nssUnitName: newProfile.nssUnitName,
              environmentalInterests: newProfile.environmentalInterests,
              participationRoles: newProfile.participationRoles,
              publicProfile: newProfile.publicProfile,
            });

            if (newProfile.publicProfile) {
              const publicDocRef = doc(db, 'profiles', fbUser.uid, 'public', 'data');
              await setDoc(publicDocRef, {
                uid: fbUser.uid,
                displayName: newProfile.displayName,
                photoURL: newProfile.photoURL || null,
                city: newProfile.city,
                state: newProfile.state,
                country: newProfile.country,
                participantType: newProfile.participantType,
                organizationName: newProfile.organizationName,
                institutionName: newProfile.institutionName,
                nssUnitName: newProfile.nssUnitName,
                environmentalInterests: newProfile.environmentalInterests,
                participationRoles: newProfile.participationRoles,
                publicProfile: true,
                updatedAt: serverTimestamp(),
              }, { merge: true });
            }

            this.currentUser = newProfile;
            this.notifyListeners();
            return newProfile;
          }
        } catch (dbErr) {
          console.warn('[AuthService] Firestore user doc read/write error on Google login:', dbErr);
        }
      }

      const fallbackProfile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Volunteer',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || undefined,
        role: selectedRole,
        createdAt: new Date().toISOString(),
        impactScore: 50,
        missionsCompleted: 0,
        dataSource: 'FIELD DATA',
        city: identityData?.city || '',
        state: identityData?.state || '',
        country: identityData?.country || 'India',
        participantType: identityData?.participantType || 'Individual Citizen',
        environmentalInterests: identityData?.environmentalInterests || [],
        participationRoles: identityData?.participationRoles || [],
        publicProfile: identityData?.publicProfile ?? false,
      };
      this.currentUser = fallbackProfile;
      this.notifyListeners();
      return fallbackProfile;
    } catch (err: any) {
      console.error('[AuthService] Google Sign-In error:', err);
      throw this.formatAuthError(err);
    }
  }

  public async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) return;
    const previousUser = { ...this.currentUser };
    const updatedUser = { ...this.currentUser, ...updates };

    if ('photoURL' in updates && !updates.photoURL) {
      delete updatedUser.photoURL;
    }

    this.currentUser = updatedUser;

    if (this.isDemoSessionActive || isDemoMode() || !db) {
      this.saveDemoUserProfileToStorage(updatedUser);
      this.notifyListeners();
      return;
    }

    try {
      const userDocRef = doc(db, 'users', updatedUser.uid);
      const cleanUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, val]) => {
        if (val !== undefined) {
          cleanUpdates[key] = val;
        } else if (key === 'photoURL') {
          cleanUpdates[key] = null;
        }
      });

      await updateDoc(userDocRef, {
        ...cleanUpdates,
        updatedAt: serverTimestamp(),
      });

      if (updates.publicProfile !== undefined || updates.displayName || 'photoURL' in updates || updates.participantType || updates.city) {
        const publicDocRef = doc(db, 'profiles', updatedUser.uid, 'public', 'data');
        await setDoc(publicDocRef, {
          uid: updatedUser.uid,
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL || null,
          city: updatedUser.city || '',
          state: updatedUser.state || '',
          country: updatedUser.country || '',
          participantType: updatedUser.participantType || '',
          organizationName: updatedUser.organizationName || updatedUser.organization || '',
          institutionName: updatedUser.institutionName || '',
          nssUnitName: updatedUser.nssUnitName || '',
          environmentalInterests: updatedUser.environmentalInterests || [],
          participationRoles: updatedUser.participationRoles || [],
          publicProfile: updatedUser.publicProfile ?? false,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      this.notifyListeners();
    } catch (err) {
      console.error('[AuthService] Error updating user profile:', err);
      this.currentUser = previousUser;
      this.notifyListeners();
      throw err;
    }
  }

  public async updateUserProfilePhoto(photoURL: string | null): Promise<void> {
    await this.updateUserProfile({ photoURL: photoURL || undefined });
  }

  public async getPublicProfile(userId: string): Promise<PublicProfileData> {
    const isCurrent = this.currentUser && (this.currentUser.uid === userId || (this.isDemoSessionActive && (userId === 'demo-user-1' || userId === 'u-1')));

    if (isCurrent && this.currentUser) {
      if (!this.currentUser.publicProfile) {
        return {
          uid: userId,
          displayName: 'Private Profile',
          publicProfile: false,
          verifiedRecoveries: 0,
          measuredWasteKg: 0,
          completedMissions: 0,
          recoveryChain: [],
          publicAchievements: [],
          dataSource: this.currentUser.dataSource || 'DEMO DATA',
        };
      }

      const currentStats = {
        reportsSubmitted: this.currentUser.hotspotsReported || 8,
        missionsCompleted: this.currentUser.missionsCompleted || 12,
        wasteRemovedKg: this.currentUser.wasteRemovedKg || 340,
        locationsRecovered: this.currentUser.locationsRecovered || 4,
        missionsOrganized: 1,
        locationsTransformed: 1,
        chainLength: 4,
      };

      return {
        uid: this.currentUser.uid,
        displayName: this.currentUser.displayName,
        photoURL: this.currentUser.photoURL,
        city: this.currentUser.city,
        state: this.currentUser.state,
        country: this.currentUser.country,
        participantType: this.currentUser.participantType || 'Individual Citizen',
        organizationName: this.currentUser.organizationName || this.currentUser.organization,
        organizationType: this.currentUser.organizationType,
        website: this.currentUser.website,
        organizationDescription: this.currentUser.organizationDescription,
        memberCount: this.currentUser.memberCount,
        institutionName: this.currentUser.institutionName,
        nssUnitName: this.currentUser.nssUnitName,
        environmentalInterests: this.currentUser.environmentalInterests,
        participationRoles: this.currentUser.participationRoles,
        affiliationType: this.currentUser.affiliationType,
        chapterName: this.currentUser.chapterName,
        environmentalRole: this.currentUser.environmentalRole,
        bio: this.currentUser.bio,
        publicProfile: true,
        verifiedRecoveries: currentStats.locationsRecovered,
        measuredWasteKg: currentStats.wasteRemovedKg,
        completedMissions: currentStats.missionsCompleted,
        reportsSubmittedCount: currentStats.reportsSubmitted,
        recoveryChain: [
          { id: 'link-1', title: 'Pine Street Lot', recoveredAt: '2026-03-15' },
          { id: 'link-2', title: 'Oak Alley Waterbody', recoveredAt: '2026-04-02' },
          { id: 'link-3', title: 'Riverbed Clean Zone', recoveredAt: '2026-05-18' },
          { id: 'link-4', title: 'East Park Spot', recoveredAt: '2026-06-20' },
        ],
        publicAchievements: getEarnedBadges(currentStats),
        activities: [
          { id: 'act-1', type: 'report', title: 'Reported pollution hotspot: Pine Street Lot', location: 'Sector 4', timestamp: '2026-03-10', impactBadge: '+50 Pts' },
          { id: 'act-2', type: 'mission_organize', title: 'Organized cleanup mission: Pine St Lot Clearance', location: 'Pine St & 5th Ave', timestamp: '2026-03-15', impactBadge: 'ORGANIZER' },
          { id: 'act-3', type: 'cleanup_completed', title: 'Completed cleanup action: Pine Street Lot', location: 'Pine St & 5th Ave', timestamp: '2026-03-15', impactBadge: '+200 Pts' },
          { id: 'act-4', type: 'recovery_verified', title: 'Verified site recovery: Oak Alley Waterbody', location: 'Oak Alley', timestamp: '2026-04-02', impactBadge: 'VERIFIED RECOVERY' }
        ],
        linkedinUrl: this.currentUser.linkedinUrl,
        githubUrl: this.currentUser.githubUrl,
        dataSource: this.currentUser.dataSource || 'DEMO DATA',
      };
    }

    if (isDemoMode() || !db) {
      if (userId === 'user-1' || userId === 'user-2' || userId === 'user-3' || userId === 'u-2' || userId === 'u-3' || userId.includes('user')) {
        const isUser2 = userId === 'user-2' || userId === 'u-2';
        const isUser3 = userId === 'user-3' || userId === 'u-3';
        const name = isUser2 ? 'Priya Sharma' : isUser3 ? 'David Kim' : 'Sarah Chen';

        const demoStats = {
          reportsSubmitted: isUser2 ? 15 : isUser3 ? 2 : 8,
          missionsCompleted: isUser2 ? 28 : isUser3 ? 5 : 12,
          wasteRemovedKg: isUser2 ? 1200 : isUser3 ? 120 : 450,
          locationsRecovered: isUser2 ? 8 : isUser3 ? 1 : 3,
          missionsOrganized: isUser2 ? 5 : isUser3 ? 0 : 2,
          locationsTransformed: isUser2 ? 3 : isUser3 ? 0 : 1,
          chainLength: isUser2 ? 8 : isUser3 ? 1 : 3,
        };

        return {
          uid: userId,
          displayName: name,
          photoURL: isUser2 ? 'https://i.pravatar.cc/150?u=sarah' : isUser3 ? 'https://i.pravatar.cc/150?u=david' : undefined,
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          participantType: isUser2 ? 'NSS Volunteer' : isUser3 ? 'Individual Citizen' : 'NGO',
          institutionName: isUser2 ? 'BVRIT Hyderabad' : undefined,
          organizationName: isUser2 ? 'BVRIT Hyderabad' : isUser3 ? undefined : 'EcoAlliance NGO',
          affiliationType: 'NSS Chapter',
          environmentalRole: 'Community Leader',
          bio: 'Active environmental worker focusing on waste collection and recycling.',
          environmentalInterests: ['Waste Cleanup', 'Recycling', 'Plastic Reduction', 'Water Body Cleanup'],
          participationRoles: ['Report Waste Hotspots', 'Join Cleanup Missions', 'Monitor Cleaned Locations'],
          publicProfile: true,
          verifiedRecoveries: demoStats.locationsRecovered,
          measuredWasteKg: demoStats.wasteRemovedKg,
          completedMissions: demoStats.missionsCompleted,
          reportsSubmittedCount: demoStats.reportsSubmitted,
          recoveryChain: [
            { id: 'link-1', title: 'Riverbank Rescue', recoveredAt: '2026-02-10' },
            { id: 'link-2', title: 'Downtown Square', recoveredAt: '2026-03-22' },
          ],
          publicAchievements: getEarnedBadges(demoStats),
          activities: [
            { id: 'act-101', type: 'report', title: 'Reported hotspot: Riverbank Plastic Accumulation', location: 'East Riverbank', timestamp: '2026-07-20', impactBadge: '+50 Pts' },
            { id: 'act-102', type: 'mission_join', title: 'Joined mission: Riverbank Rescue Operation', location: 'Sector 4', timestamp: '2026-07-28', impactBadge: 'VOLUNTEER' },
            { id: 'act-103', type: 'recovery_verified', title: 'Site recovery verified: Downtown Square Transformation', location: 'Downtown', timestamp: '2026-08-10', impactBadge: 'VERIFIED RECOVERY' }
          ],
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
      const publicDocRef = doc(db, 'profiles', userId, 'public', 'data');
      const publicSnap = await getDoc(publicDocRef);
      if (publicSnap.exists()) {
        const data = publicSnap.data() as PublicProfileData;
        if (!data.publicProfile) {
          return { uid: userId, displayName: 'Private Profile', publicProfile: false, verifiedRecoveries: 0, measuredWasteKg: 0, completedMissions: 0, recoveryChain: [], publicAchievements: [], dataSource: 'FIELD DATA' };
        }

        const publicStats = {
          reportsSubmitted: data.reportsSubmittedCount || 0,
          missionsCompleted: data.completedMissions || 0,
          wasteRemovedKg: data.measuredWasteKg || 0,
          locationsRecovered: data.verifiedRecoveries || 0,
          missionsOrganized: 0,
          locationsTransformed: 0,
          chainLength: data.recoveryChain?.length || 0,
        };
        return {
          ...data,
          publicAchievements: (data.publicAchievements && data.publicAchievements.length > 0)
            ? data.publicAchievements
            : getEarnedBadges(publicStats)
        };
      }

      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const isPublic = data.publicProfile === true;
        if (!isPublic) {
          return { uid: userId, displayName: 'Private Profile', publicProfile: false, verifiedRecoveries: 0, measuredWasteKg: 0, completedMissions: 0, recoveryChain: [], publicAchievements: [], dataSource: 'FIELD DATA' };
        }

        const userStats = {
          reportsSubmitted: data.hotspotsReported || 0,
          missionsCompleted: data.missionsCompleted || 0,
          wasteRemovedKg: data.wasteRemovedKg || 0,
          locationsRecovered: data.locationsRecovered || 0,
          missionsOrganized: data.missionsOrganized || 0,
          locationsTransformed: data.locationsTransformed || 0,
          chainLength: data.locationsRecovered || 0,
        };

        return {
          uid: userId,
          displayName: data.displayName || 'Volunteer',
          photoURL: data.photoURL || undefined,
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          participantType: data.participantType || data.affiliationType || 'Individual Citizen',
          organizationName: data.organizationName || data.organization || '',
          institutionName: data.institutionName || '',
          nssUnitName: data.nssUnitName || '',
          environmentalInterests: data.environmentalInterests || [],
          participationRoles: data.participationRoles || [],
          affiliationType: data.affiliationType || 'Independent',
          chapterName: data.chapterName || '',
          environmentalRole: data.environmentalRole || 'Citizen',
          bio: data.bio || '',
          publicProfile: true,
          verifiedRecoveries: userStats.locationsRecovered,
          measuredWasteKg: userStats.wasteRemovedKg,
          completedMissions: userStats.missionsCompleted,
          reportsSubmittedCount: userStats.reportsSubmitted,
          recoveryChain: [
            { id: 'l-1', title: 'Pine Street Lot', recoveredAt: '2026-04-10' },
            { id: 'l-2', title: 'Oak Alley', recoveredAt: '2026-05-12' },
          ],
          publicAchievements: getEarnedBadges(userStats),
          activities: [
            { id: 'act-f-1', type: 'report', title: `Reported hotspot in ${data.city || 'local area'}`, timestamp: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-05-01', impactBadge: '+50 Pts' },
            { id: 'act-f-2', type: 'cleanup_completed', title: 'Completed community cleanup mission', timestamp: '2026-05-15', impactBadge: 'VERIFIED' }
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
