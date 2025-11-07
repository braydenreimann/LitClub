import { Book } from '../domain/models'
import { client } from 'client';
import { toDomainBook } from '@/api-mappers/books/books-mappers';
import Constants from 'expo-constants';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;


// the interface of represent JSON backend response from /books endpoint
export interface ListBooksResponse {
    books: Book[];
    continuationToken?: string | null;
}


// Fetch a list of books with optional pagination
// pagination means that if there are more books to fetch, the backend will return a continuationToken
export async function getBooks(continuationToken?: string): Promise<ListBooksResponse> {
    try {
        const url = new URL (`${API_BASE_URL}/books`);

        if (continuationToken) {
            url.searchParams.append('continuationToken', continuationToken);
        } 
        //example http://192.168.0.14:5112/books?continuationToken=abc123

        //send request to backend
        const response = await fetch(url.toString());

        // check response status, if not ok, log warning and return empty list
        if (!response.ok) {
            console.warn('Failed to fetch books', response.status);
            return { books: [], continuationToken: null };
        }

        //parse response JSON
        const data = await response.json();
        // If your API returns books and continuationToken, use them directly.
        // Otherwise, adapt as needed.
        return {
            books: data.books ?? [],
            continuationToken: data.continuationToken ?? null,
        };// return the books and continuationToken

    } catch (err) {
        console.error('Error fetching books:', err);
        return { books: [], continuationToken: null };
    }
}


export async function getBook(bookId: string): Promise<Book | null> {
    try {
        /*const { data, error } = await client.GET("/books/{bookId}", {
            params: { path: { bookId } }
        });

        if (!data) {
            console.error('API returned no data for book:', bookId);
            return null;
        }*/

        const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
        
        if (!response.ok) {
            console.warn('Failed to fetch book', response.status);
            return null;
        }

        const data = await response.json();
        return data as Book;
        //return toDomainBook(data);
    } catch (err) {
        console.error('Error fetching book:', err);
        return null;
    }
}