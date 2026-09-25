import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { initialProfile } from '../data/mockData';
import {
  auth,
  ensureAuthUser,
  syncUserProfile,
  updateUserProfileInDb
} from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { logger } from '../lib/logger';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasAdminClaim, setHasAdminClaim] = useState(false);

  useEffect(() => {
    // Purge any legacy client-side localStorage admin bypass
    try {
      localStorage.removeItem('pathshare_is_admin');
    } catch {}

    logger.info('useFirebaseAuth', 'Initializing Firebase Auth state listener');
    
    // Ensure anonymous/authenticated session
    ensureAuthUser().catch((err) => {
      logger.warn('useFirebaseAuth', 'Auth session initialization note:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setFirebaseUid(currentUser.uid);
        try {
          // Verify cryptographic token custom claims for admin privileges
          const tokenResult = await currentUser.getIdTokenResult();
          setHasAdminClaim(Boolean(tokenResult.claims.admin));
        } catch {
          setHasAdminClaim(false);
        }

        try {
          const profile = await syncUserProfile(currentUser.uid, initialProfile);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (err) {
          logger.error('useFirebaseAuth', 'Profile synchronization error:', err);
        }
      } else {
        setHasAdminClaim(false);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const nextProfile = { ...prev, ...updated };
      if (firebaseUid) {
        updateUserProfileInDb(firebaseUid, nextProfile).catch((err) => {
          logger.error('useFirebaseAuth', 'Failed updating profile in Firestore:', err);
        });
      }
      return nextProfile;
    });
  };

  // Strictly enforce cryptographically signed token claim from Firebase Auth
  const isAdmin = hasAdminClaim;

  return {
    user,
    userProfile,
    firebaseUid,
    isInitializing,
    isAdmin,
    updateProfile,
    setUserProfile
  };
}
