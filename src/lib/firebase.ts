import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Detects whether real Firebase credentials have been configured in the environment.
 * If false, the application gracefully operates in DEMO MODE (local mock persistence).
 */
export const isDemoMode = (): boolean => {
  return !firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === '' || firebaseConfig.apiKey === 'your-api-key';
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let functions: Functions | null = null;

if (!isDemoMode()) {
  try {
    // App Check debug provider initialization for local dev environment
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    console.info('[TrashChain] Initialized in LIVE PILOT MODE connected to Firebase Project:', firebaseConfig.projectId);
  } catch (err) {
    console.error('[TrashChain] Failed to initialize Firebase. Falling back to DEMO MODE:', err);
  }
} else {
  console.info('[TrashChain] No Firebase credentials detected in environment. Running in DEMO MODE — DATA IS NOT REAL FIELD IMPACT.');
}

export { app, auth, db, storage, functions };
