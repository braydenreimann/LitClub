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