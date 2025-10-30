import { Book } from '../domain/models'
import { client } from 'client';
import { toDomainBook } from '@/api-mappers/books/books-mappers';

export async function getBook(bookId: string): Promise<Book | null> {
    try {
        const { data, error } = await client.GET("/books/{bookId}", {
            params: { path: { bookId } }
        });

        if (!data) {
            console.error('API returned no data for book:', bookId);
            return null;
        }

        return toDomainBook(data);

    } catch (err) {
        console.error('Error fetching book:', err);
        throw err;
    }
}