import { LibraryBook } from '../domain/models'
import { client } from 'client';
import { toDomainLibraryBook } from '@/api-mappers/libraries/libraries-mappers';

export async function getLibraryBook(ownerId: string, libraryBookId: string): Promise<LibraryBook | null> {
    try {
        const { data, error } = await client.GET("/libraries/{ownerId}/libraryBooks/{libraryBookId}", {
            params: { path: { ownerId, libraryBookId } },
        });

        if (error) {
            console.warn('Failed to fetch book literal', error.status);
            throw new Error(`HTTP error! Status: ${error.status}`);
        }

        if (!data) {
            console.error('No library data returned:', { ownerId, libraryBookId });
            return null;
        }

        return toDomainLibraryBook(data!);

    } catch (err) {
        console.error('Error fetching book:', err);
        throw err;
    }
}