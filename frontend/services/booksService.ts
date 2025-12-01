// /frontend/services/booksService.ts

import { client } from 'client';
import type { Book } from '@/domain/models';
import { toDomainBook, toDomainBooks } from '@/api-mappers/books/books-mappers';

// Domain-facing list shape (frontend)
export type ListBooksResult = {
    books: Book[];
    continuationToken?: string | null;
};

// Fetch a list of books with optional pagination
export async function getBooks(
    continuationToken?: string
): Promise<ListBooksResult> {
    try {
        const { data, error } = await client.GET('/books', {
            params: {
                query: continuationToken ? { continuationToken } : {},
            },
        });

        if (error || !data) {
            console.warn('Failed to fetch books', error?.status);
            return { books: [], continuationToken: null };
        }

        return {
            books: toDomainBooks(data),
            continuationToken: data.continuationToken ?? null,
        };
    } catch (err) {
        console.error('Error fetching books:', err);
        return { books: [], continuationToken: null };
    }
}

export async function getBook(bookId: string): Promise<Book | null> {
    try {
        const { data, error } = await client.GET('/books/{bookId}', {
            params: { path: { bookId } },
        });

        if (error || !data) {
            console.warn('Failed to fetch book', error?.status);
            return null;
        }

        return toDomainBook(data);
    } catch (err) {
        console.error('Error fetching book:', err);
        return null;
    }
}