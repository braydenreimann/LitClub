// app/threads/[threadId].tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/theme";
import { globalStyles } from "@/styles/globalStyles";
import type { ThreadResponse, CommentResponse, Author } from "@/domain/models/thread-types";
import { getThread } from "@/services/threadsService";
import CommentItem from "@/components/threads/CommentItem";
import AddCommentBar from "@/components/threads/AddCommentBar";
import HiddenToggle from "@/components/threads/HiddenToggle";
import { useCommentsList } from "@/hooks/useCommentsList";

const PAGE_SIZE = 20;

// TEMP current user (until auth)
const CURRENT_AUTHOR: Author = { authorId: "me", username: "You", profilePhotoUrl: null };
// Which identifier are you sending to the backend as userId?
const CURRENT_USER_ID = CURRENT_AUTHOR.username; // or CURRENT_AUTHOR.authorId

export default function ThreadScreen() {
    const { threadId } = useLocalSearchParams<{ threadId: string }>();

    // thread header
    const [thread, setThread] = useState<ThreadResponse | null>(null);
    const [loadingThread, setLoadingThread] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // comments hook (list, pagination, optimistic create)
    const {
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
    } = useCommentsList(threadId ?? "", CURRENT_USER_ID, PAGE_SIZE);

    const [refreshing, setRefreshing] = useState(false);
    const [showHiddenComments, setShowHiddenComments] = useState(false);

    const listRef = useRef<FlatList<CommentResponse>>(null);

    // load thread + initial comments
    useEffect(() => {
        let mounted = true;
        const run = async () => {
            if (!threadId) return;
            setLoadingThread(true);
            setError(null);
            try {
                const t = await getThread(threadId);
                if (!mounted) return;
                setThread(t);
                await loadInitial(); // load comments via hook
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Failed to load thread.");
            } finally {
                if (mounted) setLoadingThread(false);
            }
        };
        run();
        return () => {
            mounted = false;
        };
    }, [threadId, loadInitial]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadInitial();
        } finally {
            setRefreshing(false);
        }
    }, [loadInitial]);

    const header = useMemo(
        () => (
            <View style={styles.postCard}>
                <Text style={styles.title}>{thread?.title ?? "(Untitled thread)"}</Text>
                <Text style={styles.meta}>
                    by {thread?.author?.username ?? "unknown"} • {new Date(thread?.created ?? Date.now()).toLocaleString()}
                </Text>
                <Text style={[globalStyles.body, { marginTop: 8 }]}>{thread?.body}</Text>

                <View style={styles.actions}>
                    <View style={styles.pill}><Text style={styles.pillText}>▲ {thread?.score ?? 0}</Text></View>
                    <View style={styles.pill}><Text style={styles.pillText}>💬 {thread?.commentCount ?? 0}</Text></View>
                </View>

                <Text style={styles.sectionLabel}>Comments</Text>
            </View>
        ),
        [thread]
    );

    const renderItem = useCallback(
        ({ item }: { item: CommentResponse }) => (
            <CommentItem
                comment={item}
                threadId={threadId!}
                currentAuthor={CURRENT_AUTHOR}
                showHiddenComments={showHiddenComments}
                onHiddenBelowZeroChange={markHiddenLocal}
                currentUserId={CURRENT_USER_ID}
            />
        ),
        [threadId, showHiddenComments, markHiddenLocal]
    );

    if (loadingThread) {
        return (
            <View style={[globalStyles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.midBlue} />
                {error ? <Text style={{ marginTop: 12, color: colors.darkest }}>{error}</Text> : null}
            </View>
        );
    }

    const LIST_BOTTOM_PADDING = 96;

    const listFooter = (
        <>
            {token ? (
                <Pressable onPress={loadMore} style={styles.moreBtn}>
                    {loadingMore ? <ActivityIndicator /> : <Text style={styles.moreText}>Load more comments</Text>}
                </Pressable>
            ) : (
                <View style={{ height: 8 }} />
            )}

            <HiddenToggle
                kind="comments"
                count={hiddenCount}
                shown={showHiddenComments}
                onToggle={() => setShowHiddenComments((v) => !v)}
            />

            <View style={{ height: 16 }} />
        </>
    );

    return (
        <View style={globalStyles.container}>
            <FlatList
                ref={listRef}
                data={
                    showHiddenComments
                        ? comments
                        : comments.filter((c) => !c.isDeleted && c.score >= 0)
                }
                keyExtractor={(item) => item.id}
                ListHeaderComponent={header}
                renderItem={renderItem}
                ListFooterComponent={listFooter}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
                removeClippedSubviews
                initialNumToRender={12}
                windowSize={10}
            />

            <View style={styles.addBarWrap}>
                <AddCommentBar
                    threadId={threadId!}
                    author={CURRENT_AUTHOR}
                    onOptimisticCreate={(temp) => {
                        onOptimisticCreate(temp);
                        requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
                    }}
                    onServerConfirm={onServerConfirm}
                    onServerError={onServerError}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: "center", justifyContent: "center" },
    postCard: {
        backgroundColor: "#fff", borderColor: colors.midBlue, borderWidth: 2,
        borderRadius: 12, padding: 12, marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "700", color: colors.midBlue },
    meta: { marginTop: 4, fontSize: 12, color: colors.nextDarkest },
    actions: { marginTop: 10, flexDirection: "row", gap: 8 },
    pill: {
        borderWidth: 1, borderColor: colors.midBlue, borderRadius: 999,
        paddingVertical: 4, paddingHorizontal: 10, backgroundColor: colors.cream,
    },
    pillText: { color: colors.midBlue, fontWeight: "600" },
    sectionLabel: { marginTop: 16, fontSize: 16, fontWeight: "700", color: colors.midBlue },
    moreBtn: {
        alignSelf: "center", marginTop: 12, paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 999, borderWidth: 1, borderColor: colors.midBlue,
    },
    moreText: { color: colors.midBlue, fontWeight: "600" },
    addBarWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
});