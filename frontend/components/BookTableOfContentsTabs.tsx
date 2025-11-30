/* begin BookTableOfContentsTabs.tsx */

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
    ChevronDown,
    ChevronUp,
    MessageCircle,
    ArrowBigUp,
} from "lucide-react-native";
import { router } from "expo-router";

import { colors, fonts } from "../theme";
import { globalStyles } from "@/styles/globalStyles";
import { Book } from "@/domain/models";
import {
    getThreadsForChapter,
    type ThreadSummary,
} from "@/services/threadsService";

type TabKey = "library" | "litclub";

export interface BookTableOfContentsTabsProps {
    bookId: string;
    book: Book;
    /**
     * Optional LitClub context.
     * When provided, "My LitClub" tab will load chapter threads for this club.
     */
    litClubId?: string | null;
}

type CheckedChaptersState = { [chapterNumber: number]: boolean };
type ExpandedChaptersState = { [chapterNumber: number]: boolean };

type ChapterThreadsMap = {
    library: { [chapterNumber: number]: ThreadSummary[] };
    litclub: { [chapterNumber: number]: ThreadSummary[] };
};

type ChapterThreadsLoadingMap = {
    library: { [chapterNumber: number]: boolean };
    litclub: { [chapterNumber: number]: boolean };
};

type ChapterThreadsErrorMap = {
    library: { [chapterNumber: number]: string | null };
    litclub: { [chapterNumber: number]: string | null };
};

const CustomCheckbox = ({
    value,
    onChange,
}: {
    value: boolean;
    onChange: () => void;
}) => (
    <Pressable onPress={onChange} style={styles.checkboxPressable}>
        <Ionicons
            name={value ? "checkbox" : "square-outline"}
            size={24}
            color={value ? colors.midBlue : colors.darkest}
        />
    </Pressable>
);

function BookTableOfContentsTabs({
    bookId,
    book,
    litClubId,
}: BookTableOfContentsTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("library");

    const [checkedChapters, setCheckedChapters] =
        useState<CheckedChaptersState>({});
    const [expandedChapters, setExpandedChapters] =
        useState<ExpandedChaptersState>({});

    const [chapterThreads, setChapterThreads] = useState<ChapterThreadsMap>({
        library: {},
        litclub: {},
    });

    const [chapterThreadsLoading, setChapterThreadsLoading] =
        useState<ChapterThreadsLoadingMap>({
            library: {},
            litclub: {},
        });

    const [chapterThreadsError, setChapterThreadsError] =
        useState<ChapterThreadsErrorMap>({
            library: {},
            litclub: {},
        });

    const totalChapters = book?.totalChapters ?? 0;

    // For now, both tabs share the same checkbox state.
    const storageKey = `book-${bookId}-checkedChapters`;

    // Load checkbox state from storage
    useEffect(() => {
        const loadChecked = async () => {
            try {
                const saved = await AsyncStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved) as CheckedChaptersState;
                    setCheckedChapters(parsed);
                }
            } catch (e) {
                console.warn("Failed to load checked chapters", e);
            }
        };
        if (bookId) {
            loadChecked();
        }
    }, [bookId, storageKey]);

    // Save checkbox state
    useEffect(() => {
        const saveChecked = async () => {
            try {
                await AsyncStorage.setItem(storageKey, JSON.stringify(checkedChapters));
            } catch (e) {
                console.warn("Failed to save checked chapters", e);
            }
        };

        if (bookId) {
            saveChecked();
        }
    }, [bookId, storageKey, checkedChapters]);

    const toggleChapterCheckbox = (chapterNumber: number) => {
        setCheckedChapters((prev) => {
            const next: CheckedChaptersState = { ...prev };
            const currentlyChecked = !!prev[chapterNumber];

            if (currentlyChecked) {
                // Uncheck this chapter and all after it
                for (let i = chapterNumber; i <= totalChapters; i++) {
                    next[i] = false;
                }
            } else {
                // Check this chapter and all previous
                for (let i = 1; i <= chapterNumber; i++) {
                    next[i] = true;
                }
            }

            return next;
        });
    };

    const onPressChapter = (chapterNumber: number) => {
        // Preserve the original behavior: jump directly to the main chapter thread page
        router.push(`/threads/thread-${chapterNumber}`);
    };

    const loadThreadsForChapter = async (chapterNumber: number, tab: TabKey) => {
        if (!bookId) return;

        // If LitClub tab is active but we don't have a litClubId, no API call.
        if (tab === "litclub" && !litClubId) {
            setChapterThreads((prev) => ({
                ...prev,
                litclub: {
                    ...prev.litclub,
                    [chapterNumber]: [],
                },
            }));
            return;
        }

        setChapterThreadsLoading((prev) => ({
            ...prev,
            [tab]: {
                ...prev[tab],
                [chapterNumber]: true,
            },
        }));
        setChapterThreadsError((prev) => ({
            ...prev,
            [tab]: {
                ...prev[tab],
                [chapterNumber]: null,
            },
        }));

        try {
            const threads = await getThreadsForChapter({
                bookId,
                afterChapter: chapterNumber,
                litClubId: tab === "litclub" ? litClubId ?? undefined : undefined,
            });

            setChapterThreads((prev) => ({
                ...prev,
                [tab]: {
                    ...prev[tab],
                    [chapterNumber]: threads,
                },
            }));
        } catch (e: any) {
            console.warn("Failed to load chapter threads", e);
            setChapterThreadsError((prev) => ({
                ...prev,
                [tab]: {
                    ...prev[tab],
                    [chapterNumber]: e?.message || "Failed to load threads.",
                },
            }));
        } finally {
            setChapterThreadsLoading((prev) => ({
                ...prev,
                [tab]: {
                    ...prev[tab],
                    [chapterNumber]: false,
                },
            }));
        }
    };

    const toggleExpandChapter = (chapterNumber: number) => {
        const isCurrentlyExpanded = !!expandedChapters[chapterNumber];

        setExpandedChapters((prev) => ({
            ...prev,
            [chapterNumber]: !isCurrentlyExpanded,
        }));

        // If we're expanding and haven't loaded yet for this tab, fetch threads
        const threadsForTab = chapterThreads[activeTab][chapterNumber];
        const isLoadingForTab = chapterThreadsLoading[activeTab][chapterNumber];

        if (!isCurrentlyExpanded && !threadsForTab && !isLoadingForTab) {
            void loadThreadsForChapter(chapterNumber, activeTab);
        }
    };

    const onPressThread = (thread: ThreadSummary) => {
        if (!thread.id) return;
        router.push(`/threads/${thread.id}`);
    };

    const contextLabel = activeTab === "library" ? "All Readers" : "LitClub Threads";

    return (
        <View style={styles.container}>
            {/* Tabs header */}
            <View style={styles.tabHeader}>
                <Pressable
                    style={[styles.tab, activeTab === "library" && styles.activeTab]}
                    onPress={() => setActiveTab("library")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "library" && styles.activeTabText,
                        ]}
                    >
                        My Library
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.tab, activeTab === "litclub" && styles.activeTab]}
                    onPress={() => setActiveTab("litclub")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "litclub" && styles.activeTabText,
                        ]}
                    >
                        My LitClub
                    </Text>
                </Pressable>
            </View>

            {/* Divider between tabs and content */}
            <View style={styles.headerDivider} />

            {/* Chapter discussions area (same structure for both tabs, different context) */}
            <View style={styles.tocContainer}>
                <Text style={[globalStyles.subheading, styles.tocTitle]}>
                    Chapter Discussions
                </Text>
                <Text style={[globalStyles.body, styles.contextLabel]}>
                    {contextLabel}
                </Text>

                <View style={styles.tocDivider} />

                {totalChapters === 0 ? (
                    <Text
                        style={[
                            globalStyles.body,
                            { fontStyle: "italic", color: colors.nextDarkest },
                        ]}
                    >
                        No chapters available.
                    </Text>
                ) : (
                    <View>
                        {Array.from({ length: totalChapters }, (_, i) => i + 1).map(
                            (chapterNumber) => {
                                const isExpanded = !!expandedChapters[chapterNumber];
                                const threads =
                                    chapterThreads[activeTab][chapterNumber] ?? [];
                                const isLoadingThreads =
                                    chapterThreadsLoading[activeTab][chapterNumber] ?? false;
                                const threadsError =
                                    chapterThreadsError[activeTab][chapterNumber] ?? null;

                                const isLitClubTab = activeTab === "litclub";
                                const hasLitClubContext =
                                    !!litClubId && typeof litClubId === "string";

                                return (
                                    <View key={chapterNumber}>
                                        <View style={styles.chapterRowOuter}>
                                            {/* Main chapter row */}
                                            <Pressable
                                                style={styles.chapterRow}
                                                onPress={() => onPressChapter(chapterNumber)}
                                            >
                                                <View style={styles.chapterLeft}>
                                                    <Pressable
                                                        onPress={() => toggleExpandChapter(chapterNumber)}
                                                        style={styles.expandButton}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp
                                                                size={18}
                                                                color={colors.darkest}
                                                                strokeWidth={2.5}
                                                            />
                                                        ) : (
                                                            <ChevronDown
                                                                size={18}
                                                                color={colors.darkest}
                                                                strokeWidth={2.5}
                                                            />
                                                        )}
                                                    </Pressable>
                                                    <Text
                                                        style={[
                                                            globalStyles.subheading,
                                                            styles.chapterLabel,
                                                        ]}
                                                    >
                                                        Chapter {chapterNumber}
                                                    </Text>
                                                </View>

                                                <View style={styles.chapterRight}>
                                                    <CustomCheckbox
                                                        value={!!checkedChapters[chapterNumber]}
                                                        onChange={() => toggleChapterCheckbox(chapterNumber)}
                                                    />
                                                </View>
                                            </Pressable>

                                            {/* Expanded thread list */}
                                            {isExpanded && (
                                                <View style={styles.chapterThreadsContainer}>
                                                    {isLitClubTab && !hasLitClubContext ? (
                                                        <Text
                                                            style={[
                                                                globalStyles.body,
                                                                styles.emptyThreadsText,
                                                            ]}
                                                        >
                                                            Open this book from a LitClub to see your club
                                                            threads.
                                                        </Text>
                                                    ) : isLoadingThreads ? (
                                                        <View style={styles.threadLoadingRow}>
                                                            <ActivityIndicator
                                                                size="small"
                                                                color={colors.midBlue}
                                                            />
                                                            <Text
                                                                style={[
                                                                    globalStyles.body,
                                                                    styles.threadLoadingText,
                                                                ]}
                                                            >
                                                                Loading threads...
                                                            </Text>
                                                        </View>
                                                    ) : threadsError ? (
                                                        <Text
                                                            style={[
                                                                globalStyles.body,
                                                                styles.threadErrorText,
                                                            ]}
                                                        >
                                                            {threadsError}
                                                        </Text>
                                                    ) : threads.length === 0 ? (
                                                        <Text
                                                            style={[
                                                                globalStyles.body,
                                                                styles.emptyThreadsText,
                                                            ]}
                                                        >
                                                            No threads for this chapter yet.
                                                        </Text>
                                                    ) : (
                                                        threads.map((thread) => (
                                                            <Pressable
                                                                key={thread.id}
                                                                style={styles.threadRow}
                                                                onPress={() => onPressThread(thread)}
                                                            >
                                                                <View style={styles.threadTextColumn}>
                                                                    <Text
                                                                        style={[
                                                                            globalStyles.body,
                                                                            styles.threadTitle,
                                                                        ]}
                                                                        numberOfLines={1}
                                                                    >
                                                                        {thread.title || "(Untitled thread)"}
                                                                    </Text>
                                                                </View>
                                                                <View style={styles.threadMeta}>
                                                                    <View style={styles.threadMetaItem}>
                                                                        <ArrowBigUp
                                                                            size={14}
                                                                            color={colors.midBlue}
                                                                            strokeWidth={2.4}
                                                                        />
                                                                        <Text style={styles.threadMetaText}>
                                                                            {thread.upvotes ?? 0}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.threadMetaItem}>
                                                                        <MessageCircle
                                                                            size={14}
                                                                            color={colors.midBlue}
                                                                            strokeWidth={2.4}
                                                                        />
                                                                        <Text style={styles.threadMetaText}>
                                                                            {thread.commentCount ?? 0}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            </Pressable>
                                                        ))
                                                    )}
                                                </View>
                                            )}
                                        </View>

                                        {/* Divider between chapters */}
                                        {chapterNumber < totalChapters && (
                                            <View style={styles.rowDivider} />
                                        )}
                                    </View>
                                );
                            }
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

export default BookTableOfContentsTabs;

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginHorizontal: 10,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: colors.darkest,
        backgroundColor: colors.cream,
        overflow: "hidden",
    },
    tabHeader: {
        flexDirection: "row",
        backgroundColor: colors.sage,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 3,
        borderBottomColor: colors.darkest,
    },
    activeTab: {
        backgroundColor: colors.teal,
    },
    tabText: {
        fontFamily: fonts.subheading,
        fontSize: 16,
        color: colors.nextDarkest,
    },
    activeTabText: {
        color: colors.darkest,
    },
    headerDivider: {
        height: 3,
        backgroundColor: colors.darkest,
    },
    tocContainer: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.cream,
    },
    tocTitle: {
        fontSize: 20,
        color: colors.midBlue,
    },
    contextLabel: {
        marginTop: 2,
        marginBottom: 4,
        fontSize: 13,
        color: colors.nextDarkest,
        fontFamily: fonts.body,
    },
    bookTitle: {
        marginBottom: 8,
        color: colors.darkest,
    },
    tocDivider: {
        height: 2,
        backgroundColor: colors.darkest,
        marginVertical: 6,
    },
    chapterRowOuter: {
        backgroundColor: colors.cream,
    },
    chapterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: colors.teal,
    },
    chapterLeft: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
    },
    chapterRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    expandButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginRight: 4,
    },
    chapterLabel: {
        fontSize: 18,
        color: colors.darkest,
    },
    rowDivider: {
        height: 2,
        backgroundColor: colors.darkest,
    },
    checkboxPressable: {
        padding: 4,
    },
    chapterThreadsContainer: {
        backgroundColor: colors.cream,
        borderTopWidth: 2,
        borderTopColor: colors.darkest,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    threadLoadingRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        gap: 8,
    },
    threadLoadingText: {
        marginLeft: 8,
        color: colors.nextDarkest,
    },
    threadErrorText: {
        color: "red",
    },
    emptyThreadsText: {
        color: colors.nextDarkest,
        fontStyle: "italic",
    },
    threadRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    threadTextColumn: {
        flex: 1,
        paddingRight: 8,
    },
    threadTitle: {
        fontSize: 14,
        color: colors.darkest,
    },
    threadMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    threadMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    threadMetaText: {
        fontSize: 12,
        color: colors.midBlue,
        fontFamily: fonts.subheading,
    },
});

/* end BookTableOfContentsTabs.tsx */