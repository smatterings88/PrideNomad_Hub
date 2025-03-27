import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserRole } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  userRole: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    userRole: 'Regular User'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        setAuthState({
          user,
          loading: false,
          userRole: role
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          userRole: 'Regular User'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}