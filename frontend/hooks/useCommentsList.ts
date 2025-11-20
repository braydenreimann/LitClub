// hooks/useCommentsList.ts
import { useCallback, useMemo, useRef, useState } from "react";
import type { CommentResponse } from "@/domain/models/thread-types";
import { getTopLevelComments } from "@/services/commentsService";
import { isHiddenByScore } from "@/constants/threadVisibility";

export function useCommentsList(threadId: string, userId?: string, pageSize = 20) {
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // track comments that became hidden locally due to voting below the threshold
    const [locallyHiddenIds, setLocallyHiddenIds] = useState<Set<string>>(new Set());

    const fetchIdRef = useRef(0);

    const loadInitial = useCallback(async () => {
        if (!threadId) return;
        const myId = ++fetchIdRef.current;
        const list = await getTopLevelComments(threadId, pageSize, undefined, userId);
        if (myId !== fetchIdRef.current) return;
        setComments(list.items);
        setToken(list.continuationToken ?? null);
        setLocallyHiddenIds(new Set());
    }, [threadId, pageSize, userId]);

    const loadMore = useCallback(async () => {
        if (!threadId || !token || loadingMore) return;
        setLoadingMore(true);
        const myId = ++fetchIdRef.current;
        try {
            const list = await getTopLevelComments(threadId, pageSize, token, userId);
            if (myId !== fetchIdRef.current) return;
            setComments((prev) => [...prev, ...list.items]);
            setToken(list.continuationToken ?? null);
        } finally {
            if (myId === fetchIdRef.current) setLoadingMore(false);
        }
    }, [threadId, token, loadingMore, pageSize, userId]);

    const hiddenCount = useMemo(() => {
        let serverHidden = 0;
        let localHiddenOnly = 0;
        for (const c of comments) {
            if (c.isDeleted) continue;
            if (isHiddenByScore(c.score)) serverHidden++;
            else if (locallyHiddenIds.has(c.id)) localHiddenOnly++;
        }
        return serverHidden + localHiddenOnly;
    }, [comments, locallyHiddenIds]);

    const onOptimisticCreate = useCallback((temp: CommentResponse) => {
        setComments((prev) => [temp, ...prev]);
    }, []);

    const onServerConfirm = useCallback((tempId: string, saved: CommentResponse) => {
        setComments((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
    }, []);

    const onServerError = useCallback((tempId: string) => {
        setComments((prev) => prev.filter((c) => c.id !== tempId));
    }, []);

    // child reports when its local score crosses below/above the hidden threshold
    const markHiddenLocal = useCallback((commentId: string, hidden: boolean) => {
        setLocallyHiddenIds((prev) => {
            const next = new Set(prev);
            if (hidden) next.add(commentId);
            else next.delete(commentId);
            return next;
        });
    }, []);

    return {
        comments,
        token,
        loadingMore,
        loadInitial,
        loadMore,
        hiddenCount,
        onOptimisticCreate,
        onServerConfirm,
        onServerError,
        markHiddenLocal,
        setComments, // exported for rare advanced needs
    };
}
