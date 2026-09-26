import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SupplierNudge } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth & Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Database ID if provided in config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection verification as mandated by skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
testConnection();

// Sign In with Google
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Record profile in Firestore
    if (result.user) {
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Health Officer',
          photoURL: result.user.photoURL || '',
          role: 'officer',
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

// Sign Out
export async function signOutUser() {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Save Nudge to Firestore
export async function saveNudgeToFirestore(nudge: SupplierNudge) {
  try {
    await setDoc(doc(db, 'nudges', nudge.id), {
      ...nudge,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not save nudge to Firestore (offline fallback used):', err);
  }
}

// Update Nudge Status in Firestore
export async function updateNudgeStatusInFirestore(nudgeId: string, status: string) {
  try {
    await updateDoc(doc(db, 'nudges', nudgeId), {
      status,
      acknowledgedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not update nudge in Firestore:', err);
  }
}

// Chat Messages Persistence
export interface ChatMessageDoc {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
  senderName?: string;
}

export async function saveChatMessageToFirestore(msg: ChatMessageDoc) {
  try {
    await setDoc(doc(db, 'chat_messages', msg.id), {
      ...msg,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Could not save chat message to Firestore:', err);
  }
}

export { onAuthStateChanged };
export type { User };
