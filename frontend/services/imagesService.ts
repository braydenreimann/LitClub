import { client } from 'client';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Edition, Book, LibraryBook, DisplayBook } from '../domain/models';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;

export async function getUriRead(Path: string | undefined): Promise<string> {
    if (Path === undefined) {
        return "";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generate-sas-read/${Path}`)
        
        if (!response.ok) {
            console.warn('Failed to fetch Uri for read', response.status)
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json();

        return data.sasUri;

    } catch (err) {
        console.error('Error retrieving image:', err);
        throw err;
    }
}

export async function getUriWrite(Path: string | undefined): Promise<string> {
    if (Path === undefined) {
        return "";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generate-sas-write/${Path}`)

        if (!response.ok) {
            console.warn('Failed to fetch Uri for write', response.status)
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json();

        return data.sasUri;

    } catch (err) {
        console.error('Error retrieving image:', err);
        throw err;
    }
}