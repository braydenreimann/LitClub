// /frontend/services/librariesService.ts

import { client } from '@/api/client';
import { LibraryBook, DisplayBook, Book } from '../../domain/models';
import { toDomainLibraryBook } from '@/api/mappers/libraries-mappers';
import { getBook } from './booksService';
import type { components } from '@/api/schema/openapi-types';
import { ShelfStatus as DomainShelfStatus } from '@/domain/shelfStatus';
import { notifyBookshelfUpdate } from '@/utils/bookshelfEvents';

// Backend enum: 0 | 1 | 2 | 3
type ShelfStatusContract = components['schemas']['ShelfStatusContract'];
type AddLibraryBookBody = components['schemas']['AddLibraryBookBody'];
type EditLibraryBookBody = components['schemas']['EditLibraryBookBody'];
type EditCompletedChaptersBody = {
    completedChapters: boolean[];
};

const toContractStatus = (
    status: DomainShelfStatus
): ShelfStatusContract => status as ShelfStatusContract;

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
    status: DomainShelfStatus
): Promise<LibraryBook | null> {
    try {
        const body: AddLibraryBookBody = {
            bookId,
            status: toContractStatus(status),
            startedReading: null,
            finishedReading: null,
            currentPage: null,
            percentComplete: null,
            onPedastal: false,
            completedChapters: [],
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

//check if a book is on pedestal
export async function checkIfBookOnPedestal(
    ownerId: string,
    bookId: string
) : Promise<boolean> {
    try {
        const libraryBook = await getLibraryBookForBook(ownerId, bookId);
        return libraryBook ? libraryBook.onPedastal : false;
    } catch (err) {
        console.error('Error checking if book is on pedestal:', err);
        return false;
    }
} 

//add book to pedestal
export async function addBookToPedestal(
    ownerId: string,
    bookId: string
): Promise<LibraryBook | null> {
    try {
        const existing = await getLibraryBookForBook(ownerId, bookId);
        
        if (!existing) {
            console.error('LibraryBook does not exist. Cannot add to pedestal.');
            return null;
        }
        
        const body: EditLibraryBookBody = {
            status: toContractStatus(existing.status as DomainShelfStatus),
            startedReading: null,
            finishedReading: null,
            currentPage: null,
            percentComplete: null,
            onPedastal: true,
        };

        const { data, error } = await client.PATCH(
            '/libraries/{userId}/libraryBooks/{libraryBookId}',
            {
                params: {
                    path: {
                        userId: ownerId,
                        libraryBookId: existing.id,
                    },
                },
                body,
            }
        );

        if (error || !data) {
            console.error('Failed to add book to pedestal', error);
            return null;
        }

        return toDomainLibraryBook(data);
    } catch (err) {
        console.error('Error adding book to pedestal:', err);
        return null;
    }
}

//remove book from pedestal
export async function removeBookFromPedestal(
    ownerId: string,
    bookId: string
): Promise<LibraryBook | null> {
    try {
        const existing = await getLibraryBookForBook(ownerId, bookId);
        
        if (!existing) {
            console.error('LibraryBook does not exist. Cannot remove from pedestal.');
            return null;
        }
        
        const body: EditLibraryBookBody = {
            status: toContractStatus(existing.status as DomainShelfStatus),
            startedReading: null,
            finishedReading: null,
            currentPage: null,
            percentComplete: null,
            onPedastal: false,
        };

        const { data, error } = await client.PATCH(
            '/libraries/{userId}/libraryBooks/{libraryBookId}',
            {
                params: {
                    path: {
                        userId: ownerId,
                        libraryBookId: existing.id,
                    },
                },
                body,
            }
        );

        if (error || !data) {
            console.error('Failed to remove book from pedestal', error);
            return null;
        }

        return toDomainLibraryBook(data);
    } catch (err) {
        console.error('Error removing book from pedestal:', err);
        return null;
    }
}

export async function updateCompletedChapters(
    ownerId: string,
    libraryBookId: string,
    completedChapters: boolean[]
): Promise<LibraryBook | null> {
    try {
        const body: EditCompletedChaptersBody = { completedChapters };

        const { data, error } = await client.PATCH(
            '/libraries/{ownerId}/libraryBooks/{libraryBookId}/completedChapters',
            {
                params: {
                    path: { ownerId, libraryBookId },
                },
                body,
            }
        );

        if (error || !data) {
            console.error('Failed to update completed chapters', error);
            return null;
        }

        return toDomainLibraryBook(data as any);
    } catch (err) {
        console.error('Error updating completed chapters:', err);
        return null;
    }
}

//get all books on pedestal
export async function getBooksOnPedestal(
    ownerId: string
): Promise<DisplayBook[] | null> {
    try {
        const libraryBooks = await getLibraryBooks(ownerId);
        const pedestalBooks = libraryBooks.filter((b) => b.onPedastal);

        const fullBooks: (Book | null)[] = await Promise.all(
            pedestalBooks.map(async (libBook) => {
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
        console.error('Error fetching books on pedestal:', error);
        return null;
    }
}

/**
 * Edit the status of an existing LibraryBook.
 * PATCH /libraries/{userId}/libraryBooks/{libraryBookId}
 */
export async function editLibraryBookStatus(
    userId: string,
    libraryBookId: string,
    status: DomainShelfStatus
): Promise<LibraryBook | null> {
    try {
        const body: EditLibraryBookBody = {
            status: toContractStatus(status),
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
    status: DomainShelfStatus
): Promise<LibraryBook | null> {
    const existing = await getLibraryBookForBook(ownerId, bookId);
    const previousStatus = (existing?.status as DomainShelfStatus | null) ?? null;

    if (!existing) {
        const created = await createLibraryBook(ownerId, bookId, status);
        if (created) {
            notifyBookshelfUpdate({
                ownerId,
                bookId,
                previousStatus,
                nextStatus: created.status as DomainShelfStatus,
            });
        }
        return created;
    }

    const updated = await editLibraryBookStatus(ownerId, existing.id, status);
    if (updated) {
        notifyBookshelfUpdate({
            ownerId,
            bookId,
            previousStatus,
            nextStatus: updated.status as DomainShelfStatus,
        });
    }
    return updated;
}

/**
 * Remove a LibraryBook entirely.
 */
export async function deleteLibraryBook(
    ownerId: string,
    libraryBookId: string
): Promise<boolean> {
    try {
        const { error } = await client.DELETE(
            '/libraries/{ownerId}/libraryBooks/{libraryBookId}',
            {
                params: {
                    path: {
                        ownerId,
                        libraryBookId,
                    },
                },
            }
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

    const deleted = await deleteLibraryBook(ownerId, existing.id);
    if (deleted) {
        notifyBookshelfUpdate({
            ownerId,
            bookId,
            previousStatus: (existing.status as DomainShelfStatus) ?? null,
            nextStatus: null,
        });
    }
    return deleted;
}

// ---------------------------------------------------------------------------
// Helpers for building lists / homepage sections
// ---------------------------------------------------------------------------

/**
 * Get DisplayBooks for all LibraryBooks with a given status.
 * This powers the Currently Reading / Past Reads / Future Reads lists.
 */
export async function getBookshelfByStatus(
    ownerId: string,
    status: DomainShelfStatus
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
