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