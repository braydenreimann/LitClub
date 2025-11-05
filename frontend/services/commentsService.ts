import { client } from "client";
import type { VoteDirection, CommentResponse, CommentListResponse } from "../domain/models/thread-types";

export async function getReplies(
    threadId: string,
    commentId: string,
    pageSize = 10,
    continuationToken?: string | null
): Promise<CommentListResponse> {
    const { data, error } = await client.GET("/threads/{threadId}/comments/{commentId}/replies", {
        params: {
            path: { threadId, commentId },
            query: { pageSize, continuationToken: continuationToken ?? undefined },
        },
    });
    if (error || !data) throw new Error("Failed to load replies.");

    const items = (data.items ?? []).filter(Boolean) as CommentResponse[];
    return { items, continuationToken: data.continuationToken ?? null };
}

export async function getTopLevelComments(
    threadId: string,
    pageSize = 20,
    continuationToken?: string | null
): Promise<CommentListResponse> {
    const { data, error } = await client.GET("/threads/{threadId}/comments", {
        params: {
            path: { threadId },
            query: { pageSize, continuationToken: continuationToken ?? undefined },
        },
    });
    if (error || !data) throw new Error("Failed to load comments.");

    const items = (data.items ?? []).filter(Boolean) as CommentResponse[];
    return { items, continuationToken: data.continuationToken ?? null };
}

export async function voteComment(
    threadId: string,
    commentId: string,
    dir: VoteDirection // 1 | -1
): Promise<void> {
    await client.POST("/threads/{threadId}/comments/{commentId}/vote", {
        params: { path: { threadId, commentId } },
        body: { vote: dir },
    });
}