/*
{
  "litClubs": [
    {
      "id": "string",
      "name": "string",
      "ownerUserId": "string",
      "description": "string",
      "preferredGenres": [
        "string"
      ],
      "privateClub": true,
      "memberUserIds": [
        "string"
      ],
      "libraryId": "string",
      "created": "2025-10-17T02:47:38.701Z"
    }
  ],
  "continuationToken": "string"
}
*/

import Constants from 'expo-constants';
import React, { createContext, Key, useContext, useEffect, useState, type PropsWithChildren } from 'react';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const LAN_IP = hostFromExpo ?? '10.0.0.252'
const API_BASE_URL = `http://${LAN_IP}:5112`
const apiUrl = `${API_BASE_URL}/litclubs`;

//define waht a single LitClub looks like (mirrors API resp)
export interface LitClub {
  id: string;
  name: string;
  ownerUserId: string;
  description: string;
  preferredGenres?: string[] | null;
  privateClub: boolean;
  memberUserIds: string[] | null;
  libraryId: string;
}

// defines shape of context, data/functions are available
interface LitClubContextType {
  litClubs: LitClub[];
  fetchLitClubs: () => Promise<void>; //manually refetch from API
  loading: boolean; //true while fetching data
  error: string | null; 
}

// create the context with default values, pulled from interface above
// looked online and apparently this is what i need to do to fix this is so tsx doesnt throw errors bruhhhhh
const LitClubContext = createContext<LitClubContextType>({
  litClubs: [],
  fetchLitClubs: async () => {},
  loading: false,
  error: null,
});

// helper func for components to access the context
export const useLitClubs = () => useContext(LitClubContext);

//provider is the main bulk, wraps the app to share the context
export const LitClubProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // local state for lit clubs, loading statuses, and errors
  const [litClubs, setLitClubs] = useState<LitClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  // function to fetch litclubs from backend
  const fetchLitClubs = async () => {
    setLoading(true); //loading spinner
    setError(null); //clear prev errors

    try {
      //const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(apiUrl, { //make api request
        headers: {
          'Content-Type': 'application/json', //output is json
          //...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      //HTTP errors
      if (!response.ok) {
        throw new Error (`Error: ${response.status}`);
      }

      //parse JSON response
      const data = await response.json();

      //store array of lit clubs into state
      //if resp is empty, default to empty array
      setLitClubs(data.litClubs || []);
    } catch (err: any) {
        setError(err.message);
    } finally {
        //stop loading obviously
        setLoading(false);
    }
  };

  //fetch lit clubs when this provider first mounts
  useEffect(() => {
    fetchLitClubs();
  }, []);

  // React Context Provider allows wrapping code so anything inside can see or use the data given
  return (
    <LitClubContext.Provider value={{ litClubs, fetchLitClubs, loading, error }}>
      {children}
    </LitClubContext.Provider>
  );
};