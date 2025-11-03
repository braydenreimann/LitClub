import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { client } from 'client';

import {
  toLoginRequest,
  toCreateAccountRequest,
  type LoginInput,
  type CreateAccountInput
} from '../api-mappers/auth/auth-mappers';

// ---- Context types
type AuthContextType = {
  signIn: (input: LoginInput) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  register: (payload: CreateAccountInput) => Promise<boolean>;
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

  const signIn = async (input: LoginInput): Promise<boolean> => {
    try {
      const body = toLoginRequest(input);
      const { data, error } = await client.POST("/users/login", { body });

      if (error) {
        console.warn(`Login failed. ${error.detail}`);
        return false;
      }

      const sessionData = JSON.stringify(data);
      setSession(sessionData);
      await AsyncStorage.setItem('session', sessionData);

      return true;
    } catch (e) {
      console.error('Sign-in failed unexpectedly', e);
      return false;
    }
  };

  const register = async (input: CreateAccountInput): Promise<boolean> => {
    try {
      const body = toCreateAccountRequest(input);
      const { data, error } = await client.POST("/users/register", { body });

      // This error handling should be improved, but is sufficient for demo
      if (error) {
        if (error.status === 409) {
          console.warn('Username or email already exists.');
          return false;
        }

        console.warn(`Login failed. ${error.detail}`);
        return false;
      }

      const serialized = JSON.stringify(data);
      setSession(serialized);
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
