import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Edition, Book } from '../domain/models';


const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;

export async function searchBooks(query: string): Promise<Book[] | null> { //searchs both by book and author to return list of books for search bar.
	try {
		const response = await fetch(`${API_BASE_URL}/books/search?query=${encodeURIComponent(query)}`);

		if (!response.ok) {
			throw new Error("searchBooks failed")
		}
		const books = await response.json() as Book[];
		return books;
	}
	catch (error) {
		console.error('Error fetching book:', error);
		return null;
	}
}

export async function searchUsers(query: string): Promise<User[] | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`);

		if (!response.ok) {
			throw new Error("searchusers failed")
		}
		const users = await response.json() as User[];
		return users;
	}
	catch (error) {
		console.error('Error fetching User', error);
		return null;
	}
}