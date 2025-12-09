import { ShelfStatus } from '@/domain/shelfStatus';

export type BookshelfUpdate = {
    ownerId: string;
    bookId: string;
    previousStatus: ShelfStatus | null;
    nextStatus: ShelfStatus | null;
};

type BookshelfListener = (update: BookshelfUpdate) => void;

const listeners = new Set<BookshelfListener>();

export function subscribeToBookshelfUpdates(
    listener: BookshelfListener
): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function notifyBookshelfUpdate(update: BookshelfUpdate) {
    listeners.forEach((listener) => {
        try {
            listener(update);
        } catch (err) {
            console.error('Bookshelf listener failed', err);
        }
    });
}
