/* begin commentsService.ts */

import { client } from "@/api/client";
import type { VoteDirection, CommentResponse, CommentListResponse } from "../../domain/models/thread-types";

/**
 * Fetch replies for a comment.
 * Include userId to get per-reply userVote back from the server.
 */
export async function getReplies(
    threadId: string,
    commentId: string,
    pageSize = 10,
    continuationToken?: string | null,
    userId?: string // NEW
): Promise<CommentListResponse> {
    const { data, error } = await client.GET("/threads/{threadId}/comments/{commentId}/replies", {
        params: {
            path: { threadId, commentId },
            query: {
                pageSize,
                continuationToken: continuationToken ?? undefined,
                userId, // NEW
            },
        },
    });
    if (error || !data) throw new Error("Failed to load replies.");

    const items = (data.items ?? []).filter(Boolean) as CommentResponse[];
    return { items, continuationToken: data.continuationToken ?? null };
}

/**
 * Fetch top-level comments for a thread.
 * Include userId to get per-comment userVote back from the server.
 */
export async function getTopLevelComments(
    threadId: string,
    pageSize = 20,
    continuationToken?: string | null,
    userId?: string // NEW
): Promise<CommentListResponse> {
    const { data, error } = await client.GET("/threads/{threadId}/comments", {
        params: {
            path: { threadId },
            query: {
                pageSize,
                continuationToken: continuationToken ?? undefined,
                userId, // NEW
            },
        },
    });
    if (error || !data) throw new Error("Failed to load comments.");

    const items = (data.items ?? []).filter(Boolean) as CommentResponse[];
    return { items, continuationToken: data.continuationToken ?? null };
}

/**
 * Create a new top-level comment.
 * Send author.profilePhotoUrl as undefined (not null) on the wire.
 */
export async function addTopLevelComment(
    threadId: string,
    author: { authorId: string; username: string; profilePhotoUrl?: string },
    body: string
) {
    const { data, error } = await client.POST("/threads/{threadId}/comments", {
        params: { path: { threadId } },
        body: { author, body, parentCommentId: null },
    });
    if (error || !data) throw new Error("Failed to add comment.");
    return data as CommentResponse;
}

/**
 * Create a reply to a comment.
 */
export async function addReply(
    threadId: string,
    parentCommentId: string,
    author: { authorId: string; username: string; profilePhotoUrl?: string },
    body: string
) {
    const { data, error } = await client.POST("/threads/{threadId}/comments", {
        params: { path: { threadId } },
        body: { author, body, parentCommentId },
    });
    if (error || !data) throw new Error("Failed to add reply.");
    return data as CommentResponse;
}

/** Narrow server number -> union -1 | 0 | 1 */
function toVoteDirection(x: unknown): VoteDirection {
    const n = Number(x);
    if (Number.isNaN(n)) return 0;
    if (n > 0) return 1;
    if (n < 0) return -1;
    return 0;
}

/**
 * Cast/flip/unvote a vote for a comment (works for replies too).
 * NOTE: temporarily includes userId in the request body per your backend.
 */
export async function voteComment(
    threadId: string,
    commentId: string,
    userId: string,
    vote: VoteDirection
): Promise<{ score: number; userVote: VoteDirection }> {
    const { data, error } = await client.POST("/threads/{threadId}/comments/{commentId}/vote", {
        params: { path: { threadId, commentId } },
        body: { userId, vote },
    });

    if (error || !data) throw new Error("Failed to vote.");

    const score = Number((data as any).score ?? 0);
    const userVote = toVoteDirection((data as any).userVote);
    return { score, userVote };
}

/* end commentsService.ts */