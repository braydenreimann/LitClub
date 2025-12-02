// hooks/useReplies.ts
import { useCallback, useRef, useState } from "react";
import type { CommentResponse } from "@/domain/models/thread-types";
import { getReplies } from "@/api/services/commentsService";

/**
 * Encapsulates replies list state, pagination, and optimistic mutations
 * for a given (threadId, commentId, userId).
 */
export function useReplies(threadId: string, commentId: string, userId?: string) {
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fetchIdRef = useRef(0);

    const ensureLoaded = useCallback(async () => {
        if (replies.length > 0) return;
        const myId = ++fetchIdRef.current;
        setLoading(true);
        try {
            const res = await getReplies(threadId, commentId, 10, undefined, userId);
            if (myId !== fetchIdRef.current) return;
            setReplies(res.items);
            setToken(res.continuationToken ?? null);
        } finally {
            if (myId === fetchIdRef.current) setLoading(false);
        }
    }, [threadId, commentId, userId, replies.length]);

    const loadMore = useCallback(async () => {
        if (!token || loading) return;
        const myId = ++fetchIdRef.current;
        setLoading(true);
        try {
            const res = await getReplies(threadId, commentId, 10, token, userId);
            if (myId !== fetchIdRef.current) return;
            setReplies((prev) => [...prev, ...res.items]);
            setToken(res.continuationToken ?? null);
        } finally {
            if (myId === fetchIdRef.current) setLoading(false);
        }
    }, [threadId, commentId, token, loading, userId]);

    // optimistic helpers
    const optimisticAdd = useCallback((temp: CommentResponse) => {
        setReplies((prev) => [temp, ...prev]);
    }, []);

    const confirmReplace = useCallback((tempId: string, saved: CommentResponse) => {
        setReplies((prev) => prev.map((r) => (r.id === tempId ? saved : r)));
    }, []);

    const rollbackRemove = useCallback((tempId: string) => {
        setReplies((prev) => prev.filter((r) => r.id !== tempId));
    }, []);

    // apply vote locally (delta computed from change)
    const applyVote = useCallback((replyId: string, nextVote: -1 | 0 | 1) => {
        setReplies((prev) =>
            prev.map((r) => {
                if (r.id !== replyId) return r;
                const prevVote = (r.userVote ?? 0) as -1 | 0 | 1;
                const delta = nextVote - prevVote;
                return { ...r, userVote: nextVote, score: r.score + delta };
            })
        );
    }, []);

    return {
        replies,
        token,
        loading,
        ensureLoaded,
        loadMore,
        optimisticAdd,
        confirmReplace,
        rollbackRemove,
        applyVote,
        setReplies,
    };
}