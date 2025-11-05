import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/theme";
import { globalStyles } from "@/styles/globalStyles";
import type { ThreadResponse, CommentResponse } from "../../domain/models/thread-types";
import { getThread } from "@/services/threadsService";
import { getTopLevelComments } from "@/services/commentsService";
import CommentItem from "@/components/CommentItem";

const PAGE_SIZE = 20;

export default function ThreadScreen() {
    const { threadId } = useLocalSearchParams<{ threadId: string }>();
    const [thread, setThread] = useState<ThreadResponse | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadInitial = useCallback(async () => {
        if (!threadId) return;
        setLoading(true);
        setError(null);
        try {
            const [t, list] = await Promise.all([
                getThread(threadId),
                getTopLevelComments(threadId, PAGE_SIZE),
            ]);
            setThread(t);
            setComments(list.items);
            setToken(list.continuationToken ?? null);
        } catch (e: any) {
            setError(e?.message || "Failed to load thread.");
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadInitial();
        setRefreshing(false);
    }, [loadInitial]);

    const loadMore = useCallback(async () => {
        if (!threadId || !token || loadingMore) return;
        setLoadingMore(true);
        try {
            const list = await getTopLevelComments(threadId, PAGE_SIZE, token);
            setComments(prev => [...prev, ...list.items]);
            setToken(list.continuationToken ?? null);
        } finally {
            setLoadingMore(false);
        }
    }, [threadId, token, loadingMore]);

    useEffect(() => { loadInitial(); }, [loadInitial]);

    const header = useMemo(() => (
        <View style={styles.postCard}>
            <Text style={styles.title}>{thread?.title ?? "(Untitled thread)"}</Text>
            <Text style={styles.meta}>
                by {thread?.author?.username ?? "unknown"} • {new Date(thread?.created ?? Date.now()).toLocaleString()}
            </Text>
            <Text style={[globalStyles.body, { marginTop: 8 }]}>{thread?.body}</Text>

            <View style={styles.actions}>
                <View style={styles.pill}>
                    <Text style={styles.pillText}>▲ {thread?.score ?? 0}</Text>
                </View>
                <View style={styles.pill}>
                    <Text style={styles.pillText}>💬 {thread?.commentCount ?? 0}</Text>
                </View>
            </View>

            <Text style={styles.sectionLabel}>Comments</Text>
        </View>
    ), [thread]);

    if (loading) {
        return (
            <View style={[globalStyles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.midBlue} />
                {error ? <Text style={{ marginTop: 12, color: colors.darkest }}>{error}</Text> : null}
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={header}
                renderItem={({ item }) => (
                    <CommentItem
                        comment={item}
                        threadId={threadId!}
                    />
                )}
                ListFooterComponent={
                    token ? (
                        <Pressable onPress={loadMore} style={styles.moreBtn}>
                            {loadingMore
                                ? <ActivityIndicator />
                                : <Text style={styles.moreText}>Load more comments</Text>}
                        </Pressable>
                    ) : <View style={{ height: 16 }} />
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 32 }}
            />
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
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.midBlue,
    },
    meta: {
        marginTop: 4,
        fontSize: 12,
        color: colors.nextDarkest,
    },
    actions: {
        marginTop: 10,
        flexDirection: "row",
        gap: 8,
    },
    pill: {
        borderWidth: 1,
        borderColor: colors.midBlue,
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: colors.cream,
    },
    pillText: {
        color: colors.midBlue,
        fontWeight: "600",
    },
    sectionLabel: {
        marginTop: 16,
        fontSize: 16,
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
});