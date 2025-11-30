/* begin threadsService.ts */

import { client } from "client";
import type { ThreadResponse, Author } from "../domain/models/thread-types";

export async function getThread(threadId: string): Promise<ThreadResponse> {
    const { data, error } = await client.GET("/threads/{threadId}", {
        params: { path: { threadId } },
    });
    if (error || !data) throw new Error("Failed to load thread.");
    return data as ThreadResponse;
}

export async function createThread(params: {
    author: Author;
    title: string;
    body: string;
    bookId?: string | null;
    litClubId?: string | null;
    afterChapter: number;
    chapterNumber?: number | null;
}): Promise<ThreadResponse> {
    const { author, title, body, bookId, litClubId, afterChapter, chapterNumber } = params;

    const { data, error } = await client.POST("/threads", {
        body: {
            author: {
                authorId: author.authorId,
                username: author.username,
                profilePhotoUrl: author.profilePhotoUrl ?? undefined,
            },
            title,
            body,
            bookId: bookId ?? null,
            litClubId: litClubId ?? null,
            afterChapter,
            chapterNumber: chapterNumber ?? null,
        },
    });

    if (error || !data) throw new Error("Failed to create thread.");
    return data as ThreadResponse;
}

export async function deleteThread(threadId: string): Promise<void> {
    const { error } = await client.DELETE("/threads/{threadId}", {
        params: { path: { threadId } },
    });
    if (error) throw new Error("Failed to delete thread.");
}

/**
 * Lightweight view of a thread for TOC listings.
 */
export type ThreadSummary = {
    id: string;
    title: string;
    upvotes: number;
    commentCount: number;
};

/**
 * Fetch threads for a given book + chapter.
 *
 * - For "My Library", call with bookId + afterChapter and NO litClubId.
 * - For "My LitClub", call with bookId + afterChapter + litClubId.
 */
export async function getThreadsForChapter(params: {
    bookId: string;
    afterChapter: number;
    litClubId?: string | null;
}): Promise<ThreadSummary[]> {
    const { bookId, afterChapter, litClubId } = params;

    if (!bookId) {
        throw new Error("bookId is required to load chapter threads.");
    }

    const query: Record<string, any> = {
        bookId,
        afterChapter,
    };

    if (litClubId) {
        query.litClubId = litClubId;
    }

    const { data, error } = await client.GET("/threads", {
        params: {
            query,
        },
    });

    if (error || !data) {
        throw new Error(`Failed to load threads for chapter ${afterChapter}.`);
    }

    const list = Array.isArray((data as any).items)
        ? ((data as any).items as ThreadResponse[])
        : Array.isArray(data)
            ? (data as ThreadResponse[])
            : [];

    return list
        .map((t) => ({
            id: (t as any).id ?? (t as any).threadId ?? "",
            title: t.title ?? "(Untitled thread)",
            upvotes: (t as any).score ?? (t as any).Score ?? 0,
            commentCount: (t as any).commentCount ?? 0,
        }))
        .filter((t) => t.id);
}

/* end threadsService.ts */