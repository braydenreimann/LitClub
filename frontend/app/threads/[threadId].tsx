/* begin [threadId].tsx */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/theme";
import { globalStyles } from "@/styles/globalStyles";
import type { ThreadResponse, CommentResponse, Author } from "@/domain/models/thread-types";
import type { User } from "@/domain/models";
import { getThread } from "@/services/threadsService";
import CommentItem from "@/components/threads/CommentItem";
import AddCommentBar from "@/components/threads/AddCommentBar";
import HiddenToggle from "@/components/threads/HiddenToggle";
import { useCommentsList } from "@/hooks/useCommentsList";
import { MessageCircle } from "lucide-react-native"; //npm install lucide-react-native
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { isHiddenByScore } from "@/constants/threadVisibility";
import { getUser } from "@/services/usersService";

const PAGE_SIZE = 20;

export default function ThreadScreen() {
    const { threadId } = useLocalSearchParams<{ threadId: string }>();

    const [thread, setThread] = useState<ThreadResponse | null>(null);
    const [loadingThread, setLoadingThread] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const adjustThreadCommentCount = useCallback((delta: number) => {
        setThread((prev) => {
            if (!prev) return prev;
            const base = typeof prev.commentCount === "number" ? prev.commentCount : 0;
            const next = Math.max(0, base + delta);
            if (next === base) return prev;
            return { ...prev, commentCount: next };
        });
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const user = await getUser();
            if (!cancelled) setCurrentUser(user);
            if (!cancelled) setLoadingUser(false);
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const CURRENT_AUTHOR = useMemo<Author | null>(() => {
        if (!currentUser) return null;
        return {
            authorId: currentUser.id,
            username: currentUser.userName ?? currentUser.username,
            profilePhotoUrl: currentUser.profilePhotoUrl || null,
        };
    }, [currentUser]);
    const CURRENT_USER_ID = currentUser?.id ?? "";

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

    const { keyboardHeight, keyboardShown } = useKeyboardHeight();
    const [commentBarFocused, setCommentBarFocused] = useState(false);

    useEffect(() => {
        let mounted = true;
        const run = async () => {
            if (!threadId || !currentUser) {
                setLoadingThread(false);
                return;
            }
            setLoadingThread(true);
            setError(null);
            try {
                const t = await getThread(threadId);
                if (!mounted) return;
                setThread(t);
                await loadInitial();
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Failed to load thread.");
            } finally {
                if (mounted) setLoadingThread(false);
            }
        };
        run();
        return () => { mounted = false; };
    }, [threadId, loadInitial, currentUser]);

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
            <>
                <View style={styles.postCard}>
                    <Text style={styles.title}>{thread?.title ?? "(Untitled thread)"}</Text>
                    <Text style={styles.meta}>
                        by {thread?.author?.username ?? "unknown"} • {new Date(thread?.created ?? Date.now()).toLocaleString()}
                    </Text>
                    <Text style={[styles.body]}>{thread?.body}</Text>

                    <View style={styles.actions}>
                        <View style={[styles.pill, styles.pillRow]}>
                            <MessageCircle size={14} color={colors.midBlue} />
                            <Text style={styles.pillText}>{thread?.commentCount ?? 0}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.commentsHeader}>Comments</Text>
            </>
        ),
        [thread]
    );

    const renderItem = useCallback(
        ({ item }: { item: CommentResponse }) => (
            <CommentItem
                comment={item}
                threadId={threadId!}
                currentAuthor={CURRENT_AUTHOR!}
                showHiddenComments={showHiddenComments}
                onHiddenScoreChange={markHiddenLocal}
                currentUserId={CURRENT_USER_ID}
            />
        ),
        [threadId, showHiddenComments, markHiddenLocal, CURRENT_AUTHOR, CURRENT_USER_ID]
    );

    if (loadingThread || loadingUser) {
        return (
            <View style={[globalStyles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.midBlue} />
                {error ? <Text style={{ marginTop: 12, color: colors.darkest }}>{error}</Text> : null}
            </View>
        );
    }

    if (!currentUser) {
        return (
            <View style={[globalStyles.container, styles.center]}>
                <Text style={{ color: colors.darkest }}>You must be logged in to view this thread.</Text>
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
                        : comments.filter((c) => !c.isDeleted && !isHiddenByScore(c.score))
                }
                keyExtractor={(item) => item.id}
                ListHeaderComponent={header}
                renderItem={renderItem}
                ListFooterComponent={listFooter}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{
                    paddingBottom: LIST_BOTTOM_PADDING + (keyboardShown ? keyboardHeight : 0),
                }}
                removeClippedSubviews
                initialNumToRender={12}
                windowSize={10}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
            />

            <View
                pointerEvents="box-none"
                style={[
                    styles.addBarWrap,
                    { bottom: keyboardShown && commentBarFocused ? keyboardHeight : 0 },
                ]}
            >
                <AddCommentBar
                    threadId={threadId!}
                    author={CURRENT_AUTHOR!}
                    onOptimisticCreate={(temp) => {
                        onOptimisticCreate(temp);
                        adjustThreadCommentCount(1);
                        requestAnimationFrame(() =>
                            listRef.current?.scrollToOffset({ offset: 0, animated: true })
                        );
                    }}
                    onServerConfirm={onServerConfirm}
                    onServerError={(tempId, err) => {
                        onServerError(tempId);
                        adjustThreadCommentCount(-1);
                    }}
                    onFocusChange={setCommentBarFocused}   // keep lifting only for main composer
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: "center", justifyContent: "center" },
    postCard: {
        backgroundColor: "#fff",
        borderColor: colors.midBlue,
        borderWidth: 2,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "700", color: colors.midBlue },
    meta: { marginTop: 4, fontSize: 12, color: colors.nextDarkest },
    actions: { marginTop: 10, flexDirection: "row", gap: 8 },
    description: {
        marginTop: 8,
        fontSize: 12,
        lineHeight: 18,
    },
    body: { color: colors.darkest, marginTop: 12, marginBottom: 8 },
    pill: {
        borderWidth: 1,
        borderColor: colors.midBlue,
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    pillText: { color: colors.midBlue, fontWeight: "600" },
    commentsHeader: {
        marginTop: 8,
        marginBottom: 4,
        fontSize: 18,
        fontWeight: "700",
        color: colors.midBlue,
    },
    moreBtn: {
        alignSelf: "center",
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.midBlue,
    },
    moreText: { color: colors.midBlue, fontWeight: "600" },
    addBarWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
    pillRow: { flexDirection: "row", alignItems: "center", gap: 6 },
});

/* end [threadId].tsx */
