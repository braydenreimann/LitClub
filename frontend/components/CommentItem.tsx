import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "@/theme";
import type { CommentResponse } from "../domain/models/thread-types";
import { getReplies, voteComment } from "@/services/commentsService";

type Props = {
    comment: CommentResponse;
    threadId: string;
};

export default function CommentItem({ comment, threadId }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [localScore, setLocalScore] = useState(comment.score);

    const toggleExpand = useCallback(async () => {
        if (expanded) {
            setExpanded(false);
            return;
        }
        // first expand → fetch first page of replies
        setExpanded(true);
        if (replies.length === 0) {
            setLoading(true);
            try {
                const res = await getReplies(threadId, comment.id, 10);
                setReplies(res.items);
                setToken(res.continuationToken ?? null);
            } finally {
                setLoading(false);
            }
        }
    }, [expanded, replies.length, threadId, comment.id]);

    const loadMoreReplies = useCallback(async () => {
        if (!token || loading) return;
        setLoading(true);
        try {
            const res = await getReplies(threadId, comment.id, 10, token);
            setReplies(prev => [...prev, ...res.items]);
            setToken(res.continuationToken ?? null);
        } finally {
            setLoading(false);
        }
    }, [threadId, comment.id, token, loading]);

    const upvote = useCallback(async () => {
        try {
            await voteComment(threadId, comment.id, 1);  // upvote
            // non-live: apply local optimistic bump only (no auto refetch)
            setLocalScore(s => s + 1);
        } catch { }
    }, [threadId, comment.id]);

    const downvote = useCallback(async () => {
        try {
            await voteComment(threadId, comment.id, -1); // downvote
            setLocalScore(s => s - 1);
        } catch { }
    }, [threadId, comment.id]);

    // Hide negatives per your rule
    if (localScore < 0 || comment.isDeleted) return null;

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                <Text style={styles.username}>{comment.author.username}</Text>
                <Text style={styles.body}>{comment.body}</Text>
            </View>

            <View style={styles.metaRow}>
                <Text style={styles.meta}>▲ {localScore}</Text>
                <Pressable onPress={upvote}><Text style={styles.action}>Upvote</Text></Pressable>
                <Pressable onPress={downvote}><Text style={styles.action}>Downvote</Text></Pressable>

                {comment.replyCount > 0 && (
                    <Pressable onPress={toggleExpand}>
                        <Text style={styles.viewReplies}>
                            {expanded ? "Hide replies" : `View replies (${comment.replyCount})`}
                        </Text>
                    </Pressable>
                )}
            </View>

            {expanded && (
                <View style={styles.replies}>
                    {loading && replies.length === 0 ? (
                        <ActivityIndicator color={colors.midBlue} />
                    ) : (
                        replies.map(r => (
                            r.score >= 0 && !r.isDeleted ? (
                                <View key={r.id} style={styles.replyRow}>
                                    <Text style={styles.username}>{r.author.username}</Text>
                                    <Text style={styles.body}>{r.body}</Text>
                                </View>
                            ) : null
                        ))
                    )}

                    {token && !loading && (
                        <Pressable onPress={loadMoreReplies}>
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
    row: { flexDirection: "row", flexWrap: "wrap" },
    username: { fontWeight: "700", color: colors.midBlue, marginRight: 6 },
    body: { color: colors.darkest, flexShrink: 1 },
    metaRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 12 },
    meta: { color: colors.nextDarkest, fontSize: 12 },
    action: { color: colors.midBlue, fontSize: 12, fontWeight: "600" },
    viewReplies: { color: colors.midBlue, fontSize: 12, fontWeight: "700" },
    replies: { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.midBlue },
    replyRow: { marginTop: 6, flexDirection: "row", flexWrap: "wrap" },
    moreReplies: { color: colors.midBlue, marginTop: 6, fontWeight: "600" },
});