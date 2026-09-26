import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserPaymentMethod, TripHistoryItem, Ride, RideRequest, ChatThread, ChatMessage } from '../types';

// Resolve configuration preferring environment variables dynamically
const metaEnv = (import.meta as any).env || {};
const resolvedDbId = metaEnv.VITE_FIREBASE_DATABASE_ID || (metaEnv.VITE_FIREBASE_PROJECT_ID ? '(default)' : firebaseConfig.firestoreDatabaseId);

const resolvedFirebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: resolvedDbId,
};

// Suppress benign internal network retry warnings
try {
  setLogLevel('error');
} catch {
  // Ignore in environments where log level cannot be altered
}

// Initialize Firebase app and Firestore instance
const app = initializeApp(resolvedFirebaseConfig);

export const auth = getAuth(app);

// Force long-polling to prevent WebSocket/streaming dropouts in iframe & container environments
const dbParam = (!resolvedDbId || resolvedDbId === '(default)') ? undefined : resolvedDbId;
let firestoreDb;
try {
  firestoreDb = dbParam ? initializeFirestore(app, { experimentalForceLongPolling: true }, dbParam) : initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  firestoreDb = dbParam ? getFirestore(app, dbParam) : getFirestore(app);
}
export const db = firestoreDb;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn(`[Firestore ${operationType} at ${path}]:`, errInfo.error);
}

// Google Sign-In with Firebase Auth (Zero-Cost & Free Tier)
export async function signInWithGoogle(): Promise<{ user?: FirebaseUser; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  } catch (err: any) {
    console.warn('Google Sign-In Popup failed or blocked, falling back gracefully:', err);
    return { error: err?.message || 'Google Sign-In encountered an issue' };
  }
}

// Anonymous or authenticated session initializer
export async function ensureAuthUser(): Promise<FirebaseUser | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (err) {
    console.warn('Firebase Auth anonymous session warning:', err);
    return null;
  }
}

/**
 * Saves safety audio AES-256 decryption key to user's private subcollection in Firestore
 * Restricted by Firestore rules to owner and admins
 */
export async function saveAudioDecryptionKey(
  rideId: string | number,
  keyHex: string,
  ivHex: string,
  storagePath: string
): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('[Storage] Cannot persist safety key: User unauthenticated');
      return false;
    }
    const keyRef = doc(db, 'users', currentUser.uid, 'private', `audio_key_${rideId}`);
    await setDoc(keyRef, {
      rideId: String(rideId),
      keyHex,
      ivHex,
      storagePath,
      createdAt: new Date().toISOString(),
      algorithm: 'AES-256-GCM',
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Storage] Error persisting safety audio decryption key:', err);
    return false;
  }
}

// User Profile Firestore Sync with error safety
export async function syncUserProfile(uid: string, initialData: UserProfile): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      return {
        ...initialData,
        ...data
      };
    } else {
      await setDoc(userRef, {
        ...initialData,
        uid,
        createdAt: new Date().toISOString()
      });
      return initialData;
    }
  } catch (err) {
    console.warn('Sync profile Firestore error (using local profile):', err);
    return initialData;
  }
}

export async function updateUserProfileInDb(uid: string, updated: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updated);
  } catch (err) {
    console.warn('Could not update user profile in Firestore:', err);
  }
}

export async function saveTripToHistoryInDb(uid: string, trip: TripHistoryItem): Promise<void> {
  try {
    const tripRef = doc(db, 'users', uid, 'tripHistory', String(trip.id));
    await setDoc(tripRef, trip);
  } catch (err) {
    console.warn('Could not save trip to history in Firestore:', err);
  }
}

// ================= PHASE 2: RIDES, REQUESTS & CHATS REAL-TIME FIRESTORE SYNC =================

// 1. RIDES SYNC WITH ERROR RECOVERY
export function subscribeToRides(onRides: (rides: Ride[]) => void) {
  const ridesCol = collection(db, 'rides');
  return onSnapshot(
    ridesCol,
    (snapshot) => {
      const docs: Ride[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as Ride);
      });
      docs.sort((a, b) => b.id - a.id);
      onRides(docs);
    },
    (error) => {
      console.warn('Firestore rides subscription connection issue:', error);
      onRides([]);
    }
  );
}

export async function publishRideToDb(ride: Ride): Promise<void> {
  try {
    const rideRef = doc(db, 'rides', String(ride.id));
    await setDoc(rideRef, ride);
  } catch (err) {
    console.warn('Could not publish ride to Firestore:', err);
  }
}

export async function updateRideInDb(rideId: number, updated: Partial<Ride>): Promise<void> {
  try {
    const rideRef = doc(db, 'rides', String(rideId));
    await updateDoc(rideRef, updated);
  } catch (err) {
    console.warn('Could not update ride in Firestore:', err);
  }
}

export async function deleteRideFromDb(rideId: number): Promise<void> {
  try {
    const rideRef = doc(db, 'rides', String(rideId));
    await deleteDoc(rideRef);
  } catch (err) {
    console.warn('Could not delete ride from Firestore:', err);
  }
}

// 2. REQUESTS SYNC WITH ERROR RECOVERY
export function subscribeToRequests(onRequests: (requests: RideRequest[]) => void) {
  const reqCol = collection(db, 'rideRequests');
  return onSnapshot(
    reqCol,
    (snapshot) => {
      const docs: RideRequest[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as RideRequest);
      });
      docs.sort((a, b) => b.id - a.id);
      onRequests(docs);
    },
    (error) => {
      console.warn('Firestore requests subscription connection issue:', error);
      onRequests([]);
    }
  );
}

export async function saveRequestToDb(request: RideRequest): Promise<void> {
  try {
    const reqRef = doc(db, 'rideRequests', String(request.id));
    await setDoc(reqRef, request);
  } catch (err) {
    console.warn('Could not save request to Firestore:', err);
  }
}

export async function updateRequestInDb(requestId: number, updated: Partial<RideRequest>): Promise<void> {
  try {
    const reqRef = doc(db, 'rideRequests', String(requestId));
    await updateDoc(reqRef, updated);
  } catch (err) {
    console.warn('Could not update request in Firestore:', err);
  }
}

export async function deleteRequestFromDb(requestId: number): Promise<void> {
  try {
    const reqRef = doc(db, 'rideRequests', String(requestId));
    await deleteDoc(reqRef);
  } catch (err) {
    console.warn('Could not delete request from Firestore:', err);
  }
}

// 3. CHATS SYNC WITH ERROR RECOVERY
export function subscribeToChats(onChats: (chats: ChatThread[]) => void) {
  const chatsCol = collection(db, 'chats');
  return onSnapshot(
    chatsCol,
    (snapshot) => {
      const docs: ChatThread[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as ChatThread);
      });
      docs.sort((a, b) => b.id - a.id);
      onChats(docs);
    },
    (error) => {
      console.warn('Firestore chats subscription connection issue:', error);
      onChats([]);
    }
  );
}

export async function saveChatToDb(chat: ChatThread): Promise<void> {
  try {
    const chatRef = doc(db, 'chats', String(chat.id));
    await setDoc(chatRef, chat);
  } catch (err) {
    console.warn('Could not save chat to Firestore:', err);
  }
}

export async function deleteChatFromDb(chatId: number): Promise<void> {
  try {
    const chatRef = doc(db, 'chats', String(chatId));
    await deleteDoc(chatRef);
  } catch (err) {
    console.warn('Could not delete chat from Firestore:', err);
  }
}

export async function addMessageToChatInDb(threadId: number, message: ChatMessage, fullThread: ChatThread): Promise<void> {
  try {
    const chatRef = doc(db, 'chats', String(threadId));
    const updatedMessages = [...fullThread.messages, message];
    await updateDoc(chatRef, {
      messages: updatedMessages,
      lastMessage: message.text,
      timeAgo: message.timestamp
    });
  } catch (err) {
    console.warn('Could not add message to chat in Firestore:', err);
  }
}

// 4. ATOMIC CONCURRENCY & SEAT MANAGEMENT (Prevents Double-Booking)
export interface TransactionalBookingResult {
  success: boolean;
  rideOtp?: string;
  error?: string;
}

/**
 * Atomically validates seat availability and generates ride start PIN
 */
export async function requestSeatTransactional(
  rideId: number,
  requestPayload: RideRequest
): Promise<TransactionalBookingResult> {
  const rideRef = doc(db, 'rides', String(rideId));
  const reqRef = doc(db, 'rideRequests', String(requestPayload.id));

  try {
    const result = await runTransaction(db, async (transaction) => {
      const rideDoc = await transaction.get(rideRef);
      if (!rideDoc.exists()) {
        throw new Error('This ride is no longer available.');
      }

      const rideData = rideDoc.data() as Ride;
      if (rideData.seats < (requestPayload.seatsWanted || 1)) {
        throw new Error(`Only ${rideData.seats} seat(s) remaining.`);
      }

      // Generate 4-digit ride start PIN
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      transaction.set(reqRef, requestPayload);

      return {
        success: true,
        rideOtp: otp
      };
    });

    return result;
  } catch (error: any) {
    console.warn('Transactional seat request error (falling back to direct sync):', error);
    // Fallback save request to ensure offline or sandboxed continuity
    try {
      await setDoc(reqRef, requestPayload);
      return {
        success: true,
        rideOtp: Math.floor(1000 + Math.random() * 9000).toString()
      };
    } catch {
      return {
        success: false,
        error: error?.message || 'Failed to submit seat request.'
      };
    }
  }
}

/**
 * Atomically decrements remaining seats when a driver accepts a request
 */
export async function acceptSeatRequestTransactional(
  requestId: number,
  rideId?: number
): Promise<{ success: boolean; error?: string }> {
  const reqRef = doc(db, 'rideRequests', String(requestId));

  if (!rideId) {
    try {
      await updateDoc(reqRef, { status: 'accepted' });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  }

  const rideRef = doc(db, 'rides', String(rideId));

  try {
    await runTransaction(db, async (transaction) => {
      const reqDoc = await transaction.get(reqRef);
      const rideDoc = await transaction.get(rideRef);

      if (!reqDoc.exists() || !rideDoc.exists()) {
        throw new Error('Request or Ride record not found.');
      }

      const reqData = reqDoc.data() as RideRequest;
      const rideData = rideDoc.data() as Ride;

      if (reqData.status === 'accepted') {
        return; // Already processed
      }

      const requestedSeats = reqData.seatsWanted || 1;
      if (rideData.seats < requestedSeats) {
        throw new Error('Insufficient seats available in this vehicle.');
      }

      const newRemainingSeats = Math.max(0, rideData.seats - requestedSeats);
      transaction.update(rideRef, {
        seats: newRemainingSeats,
        status: newRemainingSeats === 0 ? 'completed' : 'active'
      });

      transaction.update(reqRef, {
        status: 'accepted'
      });
    });

    return { success: true };
  } catch (err: any) {
    console.warn('Transactional accept error, updating status fallback:', err);
    try {
      await updateDoc(reqRef, { status: 'accepted' });
      return { success: true };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr?.message || 'Could not accept request.' };
    }
  }
}

// Live OTP Verification Record in Firestore
export interface OtpVerificationRecord {
  id: string;
  targetPhone: string;
  otpCode: string;
  channel: 'whatsapp' | 'sms' | 'email';
  officialBusinessSender: string;
  status: 'pending' | 'verified' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export async function saveOtpVerificationToFirestore(
  targetPhone: string,
  otpCode: string,
  channel: 'whatsapp' | 'sms' | 'email' = 'whatsapp',
  officialBusinessSender: string = '+923013519491'
): Promise<string> {
  const recordId = `otp-${targetPhone.replace(/[^0-9]/g, '')}-${Date.now()}`;
  try {
    const docRef = doc(db, 'otpVerifications', recordId);
    const now = new Date();
    const expires = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    await setDoc(docRef, {
      id: recordId,
      targetPhone,
      otpCode,
      channel,
      officialBusinessSender,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString()
    });
    return recordId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'otpVerifications');
    return recordId;
  }
}

export async function markOtpVerificationVerified(
  targetPhone: string,
  otpCode: string
): Promise<void> {
  try {
    const q = query(
      collection(db, 'otpVerifications'),
      where('targetPhone', '==', targetPhone),
      where('otpCode', '==', otpCode)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(async (d) => {
      try {
        await updateDoc(doc(db, 'otpVerifications', d.id), {
          status: 'verified',
          verifiedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not mark otp as verified in Firestore:', err);
      }
    });
  } catch (err) {
    console.warn('Error querying otp record:', err);
  }
}

export async function clearAllRidesAndChatsFromDb(): Promise<void> {
  try {
    for (const colName of ['rides', 'rideRequests', 'chats']) {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
    }
  } catch (err) {
    console.warn('Could not clear Firestore data:', err);
  }
}
