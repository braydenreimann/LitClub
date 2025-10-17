import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    bio: string;
    profilePhotoUrl: string;
    preferredGenres: string[];
    privateAccount: boolean;
    publicInteractionRestricted: boolean;
    followingUserIds: string[];
    followerUserIds: string[];
    blockedUserIds: string[];
    litClubIds: string[];
    created: string; // ISO date string, e.g. "2025-10-17T00:37:46.126Z"
}

export interface LibraryBook {
    id: string;
    status: number;               
    startedReading: string;       
    finishedReading: string;      
    currentPage: number;
    percentComplete: number;
    onPedastal: boolean;
}

export interface DisplayBook {
    id: number;
    title: string;
}

export async function getUser(): Promise<User | null> {
    try {
        const sessionString = await AsyncStorage.getItem('session');
        if (!sessionString) return null; // no session stored

        const user: User = JSON.parse(sessionString);
        return user;
    } catch (error) {
        console.error('Error retrieving user from session:', error);
        return null;
    }
}

export async function getBookshelf(userId: string, status: number): Promise<DisplayBook[] | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/libraries/${userId}/libraryBooks`);
        if(!response.ok) {
                console.warn('Failed to fetch bookshelf', response.status);
        return [];
        }

        const unsortedbooks: LibraryBook[] = await response.json();
        let sortedbooks: DisplayBook[] = [];
        let i: number = 1;
        
        unsortedbooks.forEach((book) => {
            if (book.status === status) {
                const bookToAdd: DisplayBook = { id: i, title: book.id };
                i++;
                sortedbooks.push(bookToAdd);
            }
        });

        return sortedbooks;

    } catch (error) {
      console.error('Error fetching bookshelf:', error);
      return null;
    }
}