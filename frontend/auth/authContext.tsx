import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { client } from 'client';
import { components } from 'schema/openapi-types';

type LoginRequest = components["schemas"]["LoginRequest"];
type SignUpRequest = components["schemas"]["CreateAccountRequest"]

export interface CreateAccountPayload {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  bio?: string;
  profilePhotoUrl?: string | null;
  preferredGenres?: string[] | null;
  privateAccount: boolean;
  publicInteractionRestricted: boolean;
}

// ---- Context types
type AuthContextType = {
  signIn: (email: string, password: string) => Promise<boolean>;
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

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const loginRequest: LoginRequest =
      {
        userName: null,
        email: email,
        password: password
      }

      const { data, error } = await client.POST("/users/login",
        {
          body: loginRequest
        }
      );

      if (error) {
        // Handle login error
      }

      // if (!response.ok) {
      //   const msg = await response.text().catch(() => '');
      //   console.warn('Login failed', response.status, msg);
      //   return false;
      // }

      const sessionData = JSON.stringify(data);
      console.error(sessionData);

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
      const signUpRequest: SignUpRequest =
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        userName: payload.userName,
        email: payload.email,
        password: payload.password,
        bio: payload.bio,
        preferredGenres: payload.preferredGenres,
        privateAccount: payload.privateAccount,
        publicInteractionRestricted: payload.publicInteractionRestricted,
      }

      const { data, error } = await client.POST("/users/register",
        {
          body: signUpRequest
        }
      );

      if (error) {
        // Handle login error 
      }

      // if (res.status === 409) {
      //   console.warn('Username or email already exists.');
      //   return false;
      // }
      // if (!res.ok) {
      //   const msg = await res.text().catch(() => '');
      //   console.warn('Register failed', res.status, msg);
      //   return false;
      // }

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
