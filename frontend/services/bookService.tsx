import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, Edition } from '../interfaces/interfaces';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;

export async function getBook(bookId: string): Promise<Book | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`);

        if (!response.ok) {
            console.warn('Failed to fetch book literal', response.status);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const book: Book = data as Book;

        return book;

    } catch (error) {
        console.error('Error fetching book:', error);
        throw error;
    }
}