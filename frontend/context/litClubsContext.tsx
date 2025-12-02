// /frontend/LitClubImport/LitClubContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { LitClub } from '@/domain/models';
import { listLitClubs } from '@/services/litClubsService';

// Shape of the context
interface LitClubContextType {
  litClubs: LitClub[];
  fetchLitClubs: () => Promise<void>;
  addLitClub: (newClub: LitClub) => void;
  loading: boolean;
  error: string | null;
}

// Default context value
const LitClubContext = createContext<LitClubContextType>({
  litClubs: [],
  fetchLitClubs: async () => { },
  addLitClub: () => { },
  loading: false,
  error: null,
});

// Hook for consuming the context
export const useLitClubs = () => useContext(LitClubContext);

// Provider component
export const LitClubProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [litClubs, setLitClubs] = useState<LitClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLitClubs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const clubs = await listLitClubs();
      setLitClubs(clubs);
    } catch (err) {
      console.error('Error fetching LitClubs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addLitClub = useCallback((newClub: LitClub) => {
    setLitClubs((prev) => [...prev, newClub]);
  }, []);

  useEffect(() => {
    // Fetch on mount
    void fetchLitClubs();
  }, [fetchLitClubs]);

  return (
    <LitClubContext.Provider
      value={{
        litClubs,
        fetchLitClubs,
        addLitClub,
        loading,
        error,
      }}
    >
      {children}
    </LitClubContext.Provider>
  );
};