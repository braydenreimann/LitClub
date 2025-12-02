// /frontend/services/librariesService.ts

import { client } from 'client';
import { LibraryBook, DisplayBook, Book } from '../domain/models';
import { toDomainLibraryBook } from '@/api/mappers/libraries-mappers';
import { getBook } from './booksService';
import type { components } from '@/schema/openapi-types';

// Backend enum: 0 | 1 | 2 | 3
type ShelfStatus = components['schemas']['ShelfStatusContract'];
type AddLibraryBookBody = components['schemas']['AddLibraryBookBody'];
type EditLibraryBookBody = components['schemas']['EditLibraryBookBody'];
type DeleteLibraryBookParams =
    components['paths']['/libraries/{ownerId}/libraryBooks/{libraryBookId}']['delete']['parameters']['path'];

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Get a single LibraryBook by owner + libraryBookId.
 */
export async function getLibraryBook(
    ownerId: string,
    libraryBookId: string
): Promise<LibraryBook | null> {
    try {
        const { data, error } = await client.GET(
            '/libraries/{ownerId}/libraryBooks/{libraryBookId}',
            {
                params: { path: { ownerId, libraryBookId } },
            }
        );

        if (error || !data) {
            console.warn('Failed to fetch library book', error);
            return null;
        }

        return toDomainLibraryBook(data);
    } catch (err) {
        console.error('Error fetching library book:', err);
        throw err;
    }
}

/**
 * Get all LibraryBooks for an owner.
 */
export async function getLibraryBooks(ownerId: string): Promise<LibraryBook[]> {
    try {
        const { data, error } = await client.GET(
            '/libraries/{ownerId}/libraryBooks',
            {
                params: { path: { ownerId } },
            }
        );

        if (error || !data) {
            console.warn('Failed to fetch library books', error);
            return [];
        }

        const items = data.libraryBooks ?? [];
        return items.map(toDomainLibraryBook);
    } catch (err) {
        console.error('Error fetching library books:', err);
        return [];
    }
}

/**
 * Find a LibraryBook for a given owner + bookId, if it exists.
 */
export async function getLibraryBookForBook(
    ownerId: string,
    bookId: string
): Promise<LibraryBook | null> {
    const all = await getLibraryBooks(ownerId);
    const match = all.find((lb) => lb.bookId === bookId);
    return match ?? null;
}

// ---------------------------------------------------------------------------
// Creating / editing LibraryBooks (status changes)
// ---------------------------------------------------------------------------

/**
 * Create a new LibraryBook for a given book with an initial status.
 * POST /libraries/{ownerId}/libraryBooks
 */
export async function createLibraryBook(
    ownerId: string,
    bookId: string,
    status: ShelfStatus
): Promise<LibraryBook | null> {
    try {
        const body: AddLibraryBookBody = {
            bookId,
            status,
            startedReading: null,
            finishedReading: null,
            currentPage: null,
            percentComplete: null,
            onPedastal: false,
        };

        const { data, error } = await client.POST(
            '/libraries/{ownerId}/libraryBooks',
            {
                params: { path: { ownerId } },
                body,
            }
        );

        if (error || !data) {
            console.error('Failed to create library book', error);
            return null;
        }

        return toDomainLibraryBook(data);
    } catch (err) {
        console.error('Error creating library book:', err);
        return null;
    }
}

/**
 * Edit the status of an existing LibraryBook.
 * PATCH /libraries/{userId}/libraryBooks/{libraryBookId}
 *
 * NOTE: The OpenAPI path type requires { ownerId, userId, libraryBookId }.
 * In this app, ownerId === userId, so we pass both.
 */
export async function editLibraryBookStatus(
    userId: string,
    libraryBookId: string,
    status: ShelfStatus
): Promise<LibraryBook | null> {
    try {
        const body: EditLibraryBookBody = {
            status,
            startedReading: null,
            finishedReading: null,
            currentPage: null,
            percentComplete: null,
            onPedastal: null,
        };

        const { data, error } = await client.PATCH(
            '/libraries/{userId}/libraryBooks/{libraryBookId}',
            {
                params: {
                    path: {
                        ownerId: userId,      // 🔧 added to satisfy OpenAPI types
                        userId,
                        libraryBookId,
                    },
                },
                body,
            }
        );

        if (error || !data) {
            console.error('Failed to edit library book status', error);
            return null;
        }

        return toDomainLibraryBook(data);
    } catch (err) {
        console.error('Error editing library book status:', err);
        return null;
    }
}

/**
 * High-level helper for the user story:
 *
 * "As a reader, I would like to select books to place on my bookshelf
 *  in a specified booklist (Currently Reading, Past Reads, Future Reads, Not in Library)"
 *
 * - If a LibraryBook doesn't exist yet for (ownerId, bookId), it creates one.
 * - If it exists, it updates the status.
 */
export async function setBookShelfStatus(
    ownerId: string,
    bookId: string,
    status: ShelfStatus
): Promise<LibraryBook | null> {
    const existing = await getLibraryBookForBook(ownerId, bookId);

    if (!existing) {
        return createLibraryBook(ownerId, bookId, status);
    }

    return editLibraryBookStatus(ownerId, existing.id, status);
}

/**
 * Remove a LibraryBook entirely.
 */
export async function deleteLibraryBook(
    ownerId: string,
    libraryBookId: string
): Promise<boolean> {
    try {
        const params: DeleteLibraryBookParams = { ownerId, libraryBookId };
        const { error } = await client.DELETE(
            '/libraries/{ownerId}/libraryBooks/{libraryBookId}',
            { params: { path: params } }
        );

        if (error) {
            console.error('Failed to delete library book', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Error deleting library book:', err);
        return false;
    }
}

/**
 * Remove a book from the user's library by bookId (finds the LibraryBook and deletes it).
 */
export async function removeBookFromLibrary(
    ownerId: string,
    bookId: string
): Promise<boolean> {
    const existing = await getLibraryBookForBook(ownerId, bookId);
    if (!existing) {
        return true; // nothing to remove
    }

    return deleteLibraryBook(ownerId, existing.id);
}

// ---------------------------------------------------------------------------
// Helpers for building lists / homepage sections
// ---------------------------------------------------------------------------

/**
 * Get DisplayBooks for all LibraryBooks with onPedastal === true.
 */
// export async function getTopThree(
//     ownerId: string
// ): Promise<DisplayBook[] | null> {
//     try {
//         const libraryBooks = await getLibraryBooks(ownerId);
//         const filtered = libraryBooks.filter((b) => b.onPedastal === true);

//         const fullBooks: (Book | null)[] = await Promise.all(
//             filtered.map(async (libBook) => {
//                 if (!libBook.bookId) {
//                     return null;
//                 }
//                 try {
//                     const book = await getBook(libBook.bookId);
//                     return book;
//                 } catch (err) {
//                     console.error(`Failed to fetch book ${libBook.bookId}`, err);
//                     return null;
//                 }
//             })
//         );

//         const displayBooks: DisplayBook[] = fullBooks
//             .filter((b): b is Book => b !== null)
//             .map((b) => ({
//                 id: b.id,
//                 title: b.title,
//                 coverImageUrl: b.coverImageUrl,
//             }));

//         return displayBooks;
//     } catch (error) {
//         console.error('Error fetching top three books:', error);
//         return null;
//     }
// }

/**
 * Get DisplayBooks for all LibraryBooks with a given status.
 * This powers the Currently Reading / Past Reads / Future Reads lists.
 */
export async function getBookshelfByStatus(
    ownerId: string,
    status: ShelfStatus
): Promise<DisplayBook[] | null> {
    try {
        const libraryBooks = await getLibraryBooks(ownerId);
        const filtered = libraryBooks.filter((b) => b.status === status);

        const fullBooks: (Book | null)[] = await Promise.all(
            filtered.map(async (libBook) => {
                if (!libBook.bookId) {
                    return null;
                }
                try {
                    const book = await getBook(libBook.bookId);
                    return book;
                } catch (err) {
                    console.error(`Failed to fetch book ${libBook.bookId}`, err);
                    return null;
                }
            })
        );

        const displayBooks: DisplayBook[] = fullBooks
            .filter((b): b is Book => b !== null)
            .map((b) => ({
                id: b.id,
                title: b.title,
                coverImageUrl: b.coverImageUrl,
            }));

        return displayBooks;
    } catch (error) {
        console.error('Error fetching bookshelf by status:', error);
        return null;
    }
}
