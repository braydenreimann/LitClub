import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

export interface CreateAccountPayload {
  firstName: string;
  lastName?: string;
  userName: string;
  email: string;
  password: string;
  bio?: string;
  profilePhotoUrl?: string | null;
  preferredGenres?: string[] | null;
  privateAccount: boolean;
  publicInteractionRestricted: boolean;
}

// Try to infer the Metro host (works with Expo Go LAN)
const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;

// ---- Context types
type AuthContextType = {
  signIn: (email?: string, password?: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  register: (payload: CreateAccountPayload) => Promise<boolean>;
  session: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- Provider
export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('session');
        if (storedSession) setSession(storedSession);
      } catch (err) {
        console.error('Error loading session', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = async (email?: string, password?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // include userName: null to force the email branch
        body: JSON.stringify({ userName: null, email, password }),
      });

      if (!response.ok) {
        const msg = await response.text().catch(() => '');
        console.warn('Login failed', response.status, msg);
        return false;
      }

      const data = await response.json();
      const sessionData = JSON.stringify(data); // demo: store entire user
      setSession(sessionData);
      await AsyncStorage.setItem('session', sessionData);
      return true;
    } catch (err) {
      console.error('Sign-in failed', err);
      return false;
    }
  };

  const register = async (payload: CreateAccountPayload): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        console.warn('Username or email already exists.');
        return false;
      }
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        console.warn('Register failed', res.status, msg);
        return false;
      }

      const data = await res.json();
      const serialized = JSON.stringify(data);
      setSession(serialized); // auto-login for demo
      await AsyncStorage.setItem('session', serialized);
      return true;
    } catch (err) {
      console.error('Register failed', err);
      return false;
    }
  };

  const signOut = async (): Promise<boolean> => {
    try {
      setSession(null);
      await AsyncStorage.removeItem('session');
      return true;
    } catch (err) {
      console.error('Sign-out failed', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, register, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---- Hook
export function useSession() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useSession must be used within a <SessionProvider />');
  return context;
}
