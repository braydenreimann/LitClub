// components/threads/CommentItem.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, LayoutChangeEvent } from "react-native";
import { colors } from "@/theme";
import type { CommentResponse, Author } from "@/domain/models/thread-types";
import { addReply, voteComment } from "@/services/commentsService";
import VoteButtons from "@/components/threads/VoteButtons";
import HiddenToggle from "@/components/threads/HiddenToggle";
import ReplyComposer from "@/components/threads/ReplyComposer";
import { useReplies } from "@/hooks/useReplies";

type Props = {
    comment: CommentResponse;
    threadId: string;
    currentAuthor: Author;
    currentUserId: string;
    showHiddenComments?: boolean;
    onHiddenBelowZeroChange?: (commentId: string, hidden: boolean) => void;
    scrollParentTo?: (y: number) => void; // ⬅️ NEW
};

export default function CommentItem({
    comment,
    threadId,
    currentAuthor,
    currentUserId,
    showHiddenComments = false,
    onHiddenBelowZeroChange,
    scrollParentTo,
}: Props) {
    const [expanded, setExpanded] = useState(false);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [showHiddenReplies, setShowHiddenReplies] = useState(false);

    const [localScore, setLocalScore] = useState(comment.score);
    const [localUserVote, setLocalUserVote] = useState<-1 | 0 | 1>((comment.userVote ?? 0) as -1 | 0 | 1);

    const wasHiddenRef = useRef<boolean>(localScore < 0);
    useEffect(() => {
        const isHidden = localScore < 0;
        if (isHidden !== wasHiddenRef.current) {
            wasHiddenRef.current = isHidden;
            onHiddenBelowZeroChange?.(comment.id, isHidden);
        }
    }, [localScore, comment.id, onHiddenBelowZeroChange]);

    const {
        replies,
        token,
        loading,
        ensureLoaded,
        loadMore,
        optimisticAdd,
        confirmReplace,
        rollbackRemove,
        applyVote,
    } = useReplies(threadId, comment.id, currentUserId);

    const hiddenRepliesCount = useMemo(
        () => replies.filter((r) => r.score < 0 && !r.isDeleted).length,
        [replies]
    );

    const visibleReplies = useMemo(
        () => replies.filter((r) => !r.isDeleted && (showHiddenReplies || r.score >= 0)),
        [replies, showHiddenReplies]
    );

    const toggleExpand = useCallback(async () => {
        if (expanded) {
            setExpanded(false);
            return;
        }
        setExpanded(true);
        await ensureLoaded();
    }, [expanded, ensureLoaded]);

    const onChangeTopLevelVote = useCallback(
        async (nextVote: -1 | 0 | 1) => {
            const prev = localUserVote;
            const delta = nextVote - prev;

            if (delta !== 0) setLocalScore((s) => s + delta);
            setLocalUserVote(nextVote);
            try {
                const res = await voteComment(threadId, comment.id, currentUserId, nextVote);
                setLocalScore(res.score);
                setLocalUserVote(res.userVote as -1 | 0 | 1);
            } catch {
                if (delta !== 0) setLocalScore((s) => s - delta);
                setLocalUserVote(prev);
            }
        },
        [threadId, comment.id, currentUserId, localUserVote]
    );

    const onChangeReplyVote = useCallback(
        async (replyId: string, nextVote: -1 | 0 | 1) => {
            applyVote(replyId, nextVote);
            try {
                const res = await voteComment(threadId, replyId, currentUserId, nextVote);
                applyVote(replyId, res.userVote as -1 | 0 | 1);
            } catch {
                applyVote(replyId, 0);
            }
        },
        [threadId, currentUserId, applyVote]
    );

    const submitReply = useCallback(
        async (body: string) => {
            if (!expanded) setExpanded(true);

            const now = Date.now();
            const temp: CommentResponse = {
                id: `temp-reply-${now}`,
                threadId,
                author: { ...currentAuthor, profilePhotoUrl: currentAuthor.profilePhotoUrl ?? null },
                body,
                parentCommentId: comment.id,
                created: new Date(now).toISOString(),
                updated: null,
                score: 0,
                isDeleted: false,
                replyCount: 0,
                userVote: 0,
            };

            optimisticAdd(temp);
            try {
                const cleanedAuthor = {
                    authorId: currentAuthor.authorId,
                    username: currentAuthor.username,
                    profilePhotoUrl: currentAuthor.profilePhotoUrl ?? undefined,
                };
                const saved = await addReply(threadId, comment.id, cleanedAuthor, body);
                confirmReplace(temp.id, saved);
                setShowReplyBox(false);
            } catch {
                rollbackRemove(temp.id);
            }
        },
        [expanded, threadId, currentAuthor, comment.id, optimisticAdd, confirmReplace, rollbackRemove]
    );

    // measure our top Y to allow scrolling into view on input focus
    const topYRef = useRef(0);
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        topYRef.current = e.nativeEvent.layout.y;
    }, []);

    // hide top-level if score < 0 and hidden-not-shown
    if (comment.isDeleted) return null;
    if (!showHiddenComments && localScore < 0) return null;

    return (
        <View style={styles.wrap} onLayout={onLayout}>
            <View style={styles.headerRow}>
                <Text style={styles.username}>{comment.author.username}</Text>
            </View>

            <Text style={styles.body}>{comment.body}</Text>

            <View style={styles.actionsRow}>
                <VoteButtons
                    currentVote={localUserVote}
                    score={localScore}
                    onChange={onChangeTopLevelVote}
                />

                <Pressable
                    onPress={() => {
                        setShowReplyBox((s) => !s);
                        if (!expanded) setExpanded(true);
                        ensureLoaded();
                        // scroll into view when opening the composer
                        scrollParentTo?.(topYRef.current);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={styles.action}>Reply</Text>
                </Pressable>

                {comment.replyCount > 0 && (
                    <Pressable onPress={toggleExpand} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.viewReplies}>
                            {expanded ? "Hide replies" : `View replies (${comment.replyCount})`}
                        </Text>
                    </Pressable>
                )}
            </View>

            {showReplyBox && (
                <ReplyComposer
                    onSubmit={submitReply}
                    onFocus={() => scrollParentTo?.(topYRef.current)}
                    refocusAfterSubmit={false}   // ⬅️ prevent re-opening keyboard
                />
            )}
            {expanded && (
                <View style={styles.replies}>
                    {loading && replies.length === 0 ? (
                        <ActivityIndicator color={colors.midBlue} />
                    ) : (
                        visibleReplies.map((r) => (
                            <View key={r.id} style={styles.replyRow}>
                                <Text style={styles.username}>{r.author.username}</Text>
                                <Text style={styles.body}>{r.body}</Text>

                                <View style={styles.replyMetaRow}>
                                    <VoteButtons
                                        compact
                                        currentVote={(r.userVote ?? 0) as -1 | 0 | 1}
                                        score={r.score}
                                        onChange={(next) => onChangeReplyVote(r.id, next)}
                                    />
                                </View>
                            </View>
                        ))
                    )}

                    <HiddenToggle
                        kind="replies"
                        count={hiddenRepliesCount}
                        shown={showHiddenReplies}
                        onToggle={() => setShowHiddenReplies((v) => !v)}
                    />

                    {token && !loading && (
                        <Pressable onPress={loadMore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.moreReplies}>View more replies…</Text>
                        </Pressable>
                    )}
                    {loading && replies.length > 0 && <ActivityIndicator style={{ marginTop: 6 }} />}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#e6e2da" },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
    username: { fontWeight: "700", color: colors.midBlue },
    body: { color: colors.darkest, marginTop: 2 },
    actionsRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
    action: { color: colors.midBlue, fontSize: 12, fontWeight: "600" },
    viewReplies: { color: colors.midBlue, fontSize: 12, fontWeight: "700" },

    replies: { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.midBlue },
    replyRow: { marginTop: 10 },
    replyMetaRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 12 },
    moreReplies: { color: colors.midBlue, marginTop: 6, fontWeight: "600" },
});