/* begin CommentItem.tsx */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Image } from "react-native";
import { colors } from "@/theme";
import type { CommentResponse, Author } from "@/domain/models/thread-types";
import { addReply, voteComment } from "@/services/commentsService";
import VoteButtons from "@/components/threads/VoteButtons";
import HiddenToggle from "@/components/threads/HiddenToggle";
import ReplyComposer from "@/components/threads/ReplyComposer";
import { useReplies } from "@/hooks/useReplies";
import { isHiddenByScore } from "@/constants/threadVisibility";

type Props = {
    comment: CommentResponse;
    threadId: string;
    currentAuthor: Author;
    currentUserId: string;
    showHiddenComments?: boolean;
    onHiddenScoreChange?: (commentId: string, hidden: boolean) => void;
};

export default function CommentItem({
    comment,
    threadId,
    currentAuthor,
    currentUserId,
    showHiddenComments = false,
    onHiddenScoreChange,
}: Props) {
    const [expanded, setExpanded] = useState(false);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [showHiddenReplies, setShowHiddenReplies] = useState(false);
    const [replyPrefill, setReplyPrefill] = useState<string | null>(null);

    const [localScore, setLocalScore] = useState(comment.score);
    const [localUserVote, setLocalUserVote] = useState<-1 | 0 | 1>((comment.userVote ?? 0) as -1 | 0 | 1);

    const wasHiddenRef = useRef<boolean>(isHiddenByScore(localScore));
    useEffect(() => {
        const isHidden = isHiddenByScore(localScore);
        if (isHidden !== wasHiddenRef.current) {
            wasHiddenRef.current = isHidden;
            onHiddenScoreChange?.(comment.id, isHidden);
        }
    }, [localScore, comment.id, onHiddenScoreChange]);

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
        () => replies.filter((r) => !r.isDeleted && isHiddenByScore(r.score)).length,
        [replies]
    );

    const visibleReplies = useMemo(
        () => replies.filter((r) => !r.isDeleted && (showHiddenReplies || !isHiddenByScore(r.score))),
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

    const handleReplyToChild = useCallback(
        (username: string) => {
            setExpanded(true);
            ensureLoaded();
            setShowReplyBox(true);
            setReplyPrefill(`@${username} `);
        },
        [ensureLoaded]
    );

    // Hide top-level if score <= threshold and hidden-not-shown
    if (comment.isDeleted) return null;
    if (!showHiddenComments && isHiddenByScore(localScore)) return null;

    return (
        <View style={styles.wrap}>
            <View style={styles.headerRow}>
                <Image
                    source={
                        comment.author.profilePhotoUrl
                            ? { uri: comment.author.profilePhotoUrl }
                            : require("@/assets/images/userprofile_icon.png")
                    }
                    style={styles.avatar}
                />
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
                        setReplyPrefill(`@${comment.author.username} `);
                        setShowReplyBox(true);
                        if (!expanded) setExpanded(true);
                        ensureLoaded();
                        // ⛔️ removed any auto-scroll on reply open
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
                    // ⛔️ no onFocus scroll; keep composer in place
                    refocusAfterSubmit={false}
                    initialText={replyPrefill ?? undefined}
                    onSubmitted={() => setReplyPrefill(null)}
                />
            )}

            {expanded && (
                <View style={styles.replies}>
                    {loading && replies.length === 0 ? (
                        <ActivityIndicator color={colors.midBlue} />
                    ) : (
                        visibleReplies.map((r) => (
                            <View key={r.id} style={styles.replyRow}>
                                <Image
                                    source={
                                        r.author.profilePhotoUrl
                                            ? { uri: r.author.profilePhotoUrl }
                                            : require("@/assets/images/userprofile_icon.png")
                                    }
                                    style={styles.replyAvatar}
                                />
                                <View style={styles.replyContent}>
                                    <Text style={styles.username}>{r.author.username}</Text>
                                    <Text style={styles.body}>{r.body}</Text>

                                    <View style={styles.replyMetaRow}>
                                        <VoteButtons
                                            compact
                                            currentVote={(r.userVote ?? 0) as -1 | 0 | 1}
                                            score={r.score}
                                            onChange={(next) => onChangeReplyVote(r.id, next)}
                                        />
                                        <Pressable
                                            onPress={() => handleReplyToChild(r.author.username)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Text style={styles.replyAction}>Reply</Text>
                                        </Pressable>
                                    </View>
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
    wrap: { paddingVertical: 10, borderBottomWidth: 0.8, borderColor: colors.midBlue },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
    avatar: { width: 32, height: 32, borderRadius: 16 },
    username: { fontWeight: "700", color: colors.midBlue },
    body: { color: colors.darkest, marginTop: 6 },
    actionsRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
    action: { color: colors.midBlue, fontSize: 12, fontWeight: "600" },
    viewReplies: { color: colors.midBlue, fontSize: 12, fontWeight: "700" },

    replies: { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.midBlue },
    replyRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 },
    replyAvatar: { width: 24, height: 24, borderRadius: 12 },
    replyContent: { flex: 1 },
    replyMetaRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 12 },
    replyAction: { color: colors.midBlue, fontSize: 12, fontWeight: "600" },
    moreReplies: { color: colors.midBlue, marginTop: 6, fontWeight: "600" },
});

/* end CommentItem.tsx */
