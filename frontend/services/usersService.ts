import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Edition, Book, LibraryBook, DisplayBook } from '../domain/models';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;

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

export async function getBookFromLibraryBook(bookId: string): Promise<Book> {
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

export async function getTopThree(userId: string): Promise<DisplayBook[] | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/libraries/${userId}/libraryBooks`);
        if (!response.ok) {
            console.warn('Failed to fetch bookshelf', response.status);
            return [];
        }

        let unsortedbooks: LibraryBook[] = []

        const data = await response.json();

        if (Array.isArray(data.libraryBooks)) {
            unsortedbooks = data.libraryBooks;
        }
        const filtered = unsortedbooks.filter((b) => b.onPedastal === true);

        const fullBooks: (Book | null)[] = await Promise.all(
            filtered.map(async (libBook) => {
                try {
                    const book = await getBookFromLibraryBook(libBook.id);
                    return book;
                } catch (err) {
                    console.error(`Failed to fetch book ${libBook.id}`, err);
                    return null; // return null for failed fetches
                }
            })
        );

        // Transform into DisplayBook, skipping any nulls
        const displayBooks: DisplayBook[] = fullBooks
            .filter((b): b is Book => b !== null) // TypeScript type guard
            .map((b, index) => ({
                id: b.id,
                title: b.title,
                coverImageUrl: b.coverImageUrl// use the real book title now
            }));

        return displayBooks;
    } catch (error) {
        console.error('Error fetching bookshelf:', error);
        return null;
    }
}

export async function getBookshelfByStatus(userId: string, status: number): Promise<DisplayBook[] | null> { //Specifically for sorting by status for parallax reading lists.
    try {
        const response = await fetch(`${API_BASE_URL}/libraries/${userId}/libraryBooks`);
        if (!response.ok) {
            console.warn('Failed to fetch bookshelf', response.status);
            return [];
        }

        let unsortedbooks: LibraryBook[] = []

        const data = await response.json();

        if (Array.isArray(data.libraryBooks)) {
            unsortedbooks = data.libraryBooks;
        }

        const filtered = unsortedbooks.filter((b) => b.status === status);

        const fullBooks: (Book | null)[] = await Promise.all(
            filtered.map(async (libBook) => {
                try {
                    const book = await getBookFromLibraryBook(libBook.id);
                    return book;
                } catch (err) {
                    console.error(`Failed to fetch book ${libBook.id}`, err);
                    return null; // return null for failed fetches
                }
            })
        );

        // Transform into DisplayBook, skipping any nulls
        const displayBooks: DisplayBook[] = fullBooks
            .filter((b): b is Book => b !== null) // TypeScript type guard
            .map((b, index) => ({
                id: b.id, 
                title: b.title,
                coverImageUrl: b.coverImageUrl// use the real book title now
            }));

        return displayBooks;
    } catch (error) {
        console.error('Error fetching bookshelf:', error);
        return null;
    }
}