import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

// 1️⃣ Define the shape of your auth context
type AuthContextType = {
  signIn: (email?: string, password?: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  session: string | null;
  isLoading: boolean;
};

// 2️⃣ Create the context with a default (empty) value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3️⃣ Provider component — wraps your app and holds the state
export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage when the app starts
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('session');
        if (storedSession) {
          setSession(storedSession);
        }
      } catch (err) {
        console.error('Error loading session', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  // Sign in: simulation with fake user
  const signIn = async (email?: string, password?: string): Promise<boolean> => {
  try {
    const fakeSession = 'user-session-token';
    setSession(fakeSession);
    await AsyncStorage.setItem('session', fakeSession);
    return true; 
  } catch (err) {
    console.error('Sign-in failed', err);
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
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4️⃣ Hook to access the session anywhere in your app
export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession must be used within a <SessionProvider />');
  }
  return context;
}