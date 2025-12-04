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
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { colors, fonts } from "../theme";
import { globalStyles } from "@/styles/globalStyles";
import { Book, LitClub, User } from "@/domain/models";
import {
    getThreadsForChapter,
    type ThreadSummary,
} from "@/api/services/threadsService";
import { getUser } from "@/api/services/usersService";
import { listLitClubs } from "@/api/services/litClubsService";
import {
    getLibraryBookForBook,
    removeBookFromLibrary,
    setBookShelfStatus,
} from "@/api/services/librariesService";

// Backend enum: 0 | 1 | 2 | 3
type ShelfStatus = 0 | 1 | 2 | 3;

type ShelfStatusOption = {
    label: string;
    value: ShelfStatus | "remove";
};

const shelfStatusOptions: ShelfStatusOption[] = [
    {
        label: "Currently Reading",
        value: 1,
    },
    {
        label: "Future Reads",
        value: 3,
    },
    {
        label: "Past Reads",
        value: 0,
    },
    {
        label: "Remove from Bookshelf",
        value: "remove",
    },
];

function mapStatusToLabel(status: ShelfStatus | null): string {
    switch (status) {
        case 1:
            return "Currently Reading";
        case 3:
            return "Future Reads";
        case 0:
            return "Past Reads";
        case 2:
            return "On Hiatus";
        default:
            return "Add to Bookshelf";
    }
}

type TabKey = "library" | "litclub";

export interface BookTableOfContentsTabsProps {
    bookId: string;
    book: Book;
    /**
     * Optional LitClub context.
     * When provided, "My LitClub" tab will load chapter threads for this club.
     */
    litClubId?: string | null;
    litClubName?: string | null;
    litClubOwnerId?: string | null;
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
    litClubName,
    litClubOwnerId,
}: BookTableOfContentsTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>(
        litClubId ? "litclub" : "library"
    );
    const [user, setUser] = useState<User | null>(null);
    const [litClubMenuOpen, setLitClubMenuOpen] = useState(false);
    const [availableLitClubs, setAvailableLitClubs] = useState<LitClub[]>([]);
    const [litClubLoading, setLitClubLoading] = useState(false);
    const [litClubError, setLitClubError] = useState<string | null>(null);
    const [selectedLitClubId, setSelectedLitClubId] = useState<string | null>(
        litClubId ?? null
    );
    const [litClubTriggerLayout, setLitClubTriggerLayout] = useState<{
        height: number;
        y: number;
        width: number;
        x: number;
    }>({ height: 0, y: 0, width: 0, x: 0 });
    const [shelfStatus, setShelfStatus] = useState<ShelfStatus | null>(null);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusSaving, setStatusSaving] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [triggerLayout, setTriggerLayout] = useState<{
        height: number;
        y: number;
        width: number;
        x: number;
    }>({
        height: 0,
        y: 0,
        width: 0,
        x: 0,
    });
    const [statusByOwner, setStatusByOwner] = useState<Record<string, ShelfStatus | null>>({});

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

    // Load user from session
    useEffect(() => {
        const loadUser = async () => {
            try {
                const sessionUser = await getUser();
                if (sessionUser) {
                    setUser(sessionUser);
                }
            } catch (err) {
                console.error("Error loading user:", err);
            }
        };

        loadUser();
    }, []);


    useEffect(() => {
        setStatusMenuOpen(false);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "library") {
            setLitClubMenuOpen(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (litClubId) {
            setSelectedLitClubId(litClubId);
        }
    }, [litClubId]);

    useEffect(() => {
        if (litClubId) {
            setActiveTab("litclub");
        }
    }, [litClubId]);

    useEffect(() => {
        if (!user?.id) return;

        let alive = true;
        setLitClubLoading(true);
        setLitClubError(null);

        (async () => {
            try {
                const clubs = await listLitClubs();
                if (!alive) return;

                const memberships = clubs.filter(
                    (club) =>
                        club.memberUserIds?.includes(user.id) ||
                        user.litClubIds?.includes(club.id)
                );

                setAvailableLitClubs(memberships);

                if (!selectedLitClubId && memberships.length > 0) {
                    if (memberships[0]) {
                        setSelectedLitClubId(memberships[0].id);
                    }
                }
            } catch (err) {
                if (!alive) return;
                console.error("Failed to load LitClubs:", err);
                setLitClubError("Unable to load your LitClubs right now.");
            } finally {
                if (!alive) return;
                setLitClubLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [user?.id]);

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

    const handleSelectLitClub = (clubId: string) => {
        setSelectedLitClubId(clubId);
        setActiveTab("litclub");
        setLitClubMenuOpen(false);
        setChapterThreads((prev) => ({
            ...prev,
            litclub: {},
        }));
        setExpandedChapters({});
        setChapterThreadsError((prev) => ({
            ...prev,
            litclub: {},
        }));
        setChapterThreadsLoading((prev) => ({
            ...prev,
            litclub: {},
        }));
    };

    const handleShelfStatusSelect = async (option: ShelfStatusOption) => {
        if (!book || !ownerForStatus) {
            setStatusError("Unable to update bookshelf right now.");
            return;
        }

        if (!canEditStatus) {
            setStatusError("You don't have permission to edit this bookshelf.");
            return;
        }

        setStatusSaving(true);
        setStatusError(null);
        try {
            if (option.value === "remove") {
                const removed = await removeBookFromLibrary(ownerForStatus, book.id);
                if (!removed) {
                    throw new Error("Failed to remove from bookshelf");
                }
                setStatusByOwner((prev) => ({
                    ...prev,
                    [ownerForStatus]: null,
                }));
            } else {
                const nextStatus = option.value as ShelfStatus;
                await setBookShelfStatus(ownerForStatus, book.id, nextStatus);
                setStatusByOwner((prev) => ({
                    ...prev,
                    [ownerForStatus]: nextStatus,
                }));
            }
            setStatusMenuOpen(false);
        } catch (err) {
            console.error("Failed to update shelf status:", err);
            setStatusError("Could not update your bookshelf. Please try again.");
        } finally {
            setStatusSaving(false);
        }
    };

    const loadThreadsForChapter = async (chapterNumber: number, tab: TabKey) => {
        if (!bookId) return;
        const effectiveLitClubId = selectedLitClubId ?? litClubId ?? null;

        // If LitClub tab is active but we don't have a litClubId, no API call.
        if (tab === "litclub" && !effectiveLitClubId) {
            setChapterThreadsError((prev) => ({
                ...prev,
                litclub: {
                    ...prev.litclub,
                    [chapterNumber]: "Select a LitClub to view threads.",
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
                litClubId: tab === "litclub" ? effectiveLitClubId ?? undefined : undefined,
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

    const effectiveLitClubId = selectedLitClubId ?? litClubId ?? null;
    const selectedClub =
        availableLitClubs.find((club) => club.id === effectiveLitClubId) ?? null;
    const selectedClubName = selectedClub?.name ?? litClubName ?? null;
    const selectedClubOwnerId =
        selectedClub?.ownerUserId ?? litClubOwnerId ?? null;
    const isSelectedClubOwner = !!selectedClubOwnerId && selectedClubOwnerId === user?.id;
    const ownerForStatus =
        activeTab === "litclub" ? effectiveLitClubId ?? null : user?.id ?? null;
    const canEditStatus =
        activeTab === "library"
            ? !!user
            : !!effectiveLitClubId && isSelectedClubOwner;
    const currentStatus =
        ownerForStatus && ownerForStatus in statusByOwner
            ? statusByOwner[ownerForStatus] ?? null
            : null;

    // Determine the status for the selected LitClub specifically (may differ from currentStatus when in "library" tab)
    const litClubStatus =
        effectiveLitClubId && effectiveLitClubId in statusByOwner
            ? statusByOwner[effectiveLitClubId] ?? null
            : null;

    const litClubLabel = litClubLoading
        ? "Loading your LitClubs..."
        : selectedClubName
            ? selectedClubName
            : litClubId
                ? "LitClub selected"
                : availableLitClubs.length === 0
                    ? "No LitClubs found"
                    : "Select a LitClub";

    // helper to check valid enum statuses
    const isValidStatus = (s: any) => s === 0 || s === 1 || s === 2 || s === 3;

    // Load bookshelf status for this book (for the current owner context)
    useEffect(() => {
        if (!book || !ownerForStatus) {
            setStatusLoading(false);
            return;
        }

        let alive = true;
        setStatusLoading(true);
        setStatusError(null);

        (async () => {
            try {
                const existing = await getLibraryBookForBook(ownerForStatus, book.id);
                if (!alive) return;
                setStatusByOwner((prev) => ({
                    ...prev,
                    [ownerForStatus]: (existing?.status ?? null) as ShelfStatus | null,
                }));
            } catch (err) {
                if (!alive) return;
                console.error("Error loading shelf status:", err);
                setStatusError("Unable to load bookshelf status right now.");
            } finally {
                if (!alive) return;
                setStatusLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [ownerForStatus, book?.id]);

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
                {activeTab === "litclub" && (
                    <View style={styles.litClubSelectContainer}>
                        <Text style={[globalStyles.subheading, styles.statusHeading]}>
                            My LitClub
                        </Text>

                        <Pressable
                            style={[
                                styles.statusTrigger,
                                litClubMenuOpen && styles.statusTriggerActive,
                            ]}
                            onPress={() => {
                                if (litClubLoading) return;
                                setLitClubMenuOpen((prev) => !prev);
                            }}
                            onLayout={(e) =>
                                setLitClubTriggerLayout({
                                    height: e.nativeEvent.layout.height,
                                    y: e.nativeEvent.layout.y,
                                    width: e.nativeEvent.layout.width,
                                    x: e.nativeEvent.layout.x,
                                })
                            }
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.statusLabel}>{litClubLabel}</Text>
                            </View>
                            <FontAwesome
                                name={litClubMenuOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={colors.darkest}
                            />
                        </Pressable>

                        {litClubMenuOpen && (
                            <View
                                style={[
                                    styles.statusDropdown,
                                    {
                                        top:
                                            litClubTriggerLayout.y +
                                            litClubTriggerLayout.height +
                                            6,
                                        left: litClubTriggerLayout.x,
                                        width: Math.max(litClubTriggerLayout.width, 220),
                                        zIndex: 999,
                                    },
                                ]}
                            >
                                {litClubLoading ? (
                                    <View style={styles.overlayLoadingRow}>
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.midBlue}
                                        />
                                        <Text style={styles.overlayLoadingText}>
                                            Loading clubs...
                                        </Text>
                                    </View>
                                ) : litClubError ? (
                                    <Text style={styles.overlayError}>{litClubError}</Text>
                                ) : availableLitClubs.length === 0 ? (
                                    <Text style={styles.overlayEmpty}>
                                        Join a LitClub to view club threads.
                                    </Text>
                                ) : (
                                    availableLitClubs.map((club) => {
                                        const isSelected = club.id === selectedLitClubId;
                                        return (
                                            <Pressable
                                                key={club.id}
                                                style={({ pressed }) => [
                                                    styles.statusOption,
                                                    isSelected && {
                                                        backgroundColor: colors.sage,
                                                    },
                                                    pressed && { backgroundColor: colors.sage },
                                                ]}
                                                onPress={() => handleSelectLitClub(club.id)}
                                            >
                                                <Text
                                                    style={[
                                                        globalStyles.subheading,
                                                        { fontSize: 15 },
                                                    ]}
                                                >
                                                    {club.name}
                                                </Text>
                                            </Pressable>
                                        );
                                    })
                                )}
                            </View>
                        )}

                        {litClubError && (
                            <Text style={styles.statusErrorText}>{litClubError}</Text>
                        )}
                    </View>
                )}

                <View style={styles.statusContainer}>
                    <Text style={[globalStyles.subheading, styles.statusHeading]}>
                        {activeTab === "library" ? "Bookshelf Status" : "LitClub Status"}
                    </Text>

                    {canEditStatus ? (
                        <Pressable
                            style={[
                                styles.statusTrigger,
                                statusMenuOpen && styles.statusTriggerActive,
                            ]}
                            onPress={() => {
                                if (statusLoading || statusSaving) return;
                                setStatusMenuOpen((prev) => !prev);
                            }}
                            onLayout={(e) =>
                                setTriggerLayout({
                                    height: e.nativeEvent.layout.height,
                                    y: e.nativeEvent.layout.y,
                                    width: e.nativeEvent.layout.width,
                                    x: e.nativeEvent.layout.x,
                                })
                            }
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.statusLabel}>
                                    {statusLoading
                                        ? "Checking status..."
                                        : mapStatusToLabel(currentStatus)}
                                </Text>
                            </View>
                            <FontAwesome
                                name={statusMenuOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={colors.darkest}
                            />
                        </Pressable>
                    ) : (
                        <View style={[styles.statusTrigger, { opacity: 0.8 }]}>
                            <Text style={styles.statusLabel}>
                                {statusLoading
                                    ? "Checking status..."
                                    : mapStatusToLabel(currentStatus)}
                            </Text>
                        </View>
                    )}

                    {/*
                        New: If we're in a LitClub and the current user is NOT the club owner,
                        show a hint under the selector.
                    */}
                    {activeTab === "litclub" && !!selectedClubName && !isSelectedClubOwner && (
                        <Text style={[styles.statusErrorText, { color: colors.nextDarkest }]}>
                            Only the LitClub's owner can change the status of this book in the LitClub!
                        </Text>
                    )}

                    {canEditStatus && statusMenuOpen && (
                        <View
                            style={[
                                styles.statusDropdown,
                                {
                                    top: triggerLayout.y + triggerLayout.height + 6,
                                    left: triggerLayout.x,
                                    width: Math.max(triggerLayout.width, 200),
                                    zIndex: 999,
                                },
                            ]}
                        >
                            {shelfStatusOptions.map((option) => (
                                <Pressable
                                    key={option.label}
                                    style={({ pressed }) => [
                                        styles.statusOption,
                                        currentStatus === option.value && {
                                            backgroundColor: colors.sage,
                                        },
                                        pressed && { backgroundColor: colors.sage },
                                    ]}
                                    onPress={() => handleShelfStatusSelect(option)}
                                >
                                    <Text style={[globalStyles.subheading, { fontSize: 15 }]}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {statusError && (
                        <Text style={styles.statusErrorText}>{statusError}</Text>
                    )}
                </View>

                {/*
                    LitClub-specific message / behavior:
                    - If activeTab === 'litclub' and there's a selected club but the book is NOT on any shelf (status invalid),
                      we show only the message telling the user that the book is not on that club's bookshelves.
                    - If the book is on the club's shelf and status === Future Reads (3), show the message
                      "[LitClub Name] has not started reading this book yet!" above the ToC, but still show the full ToC/threads.
                */}

                {/* If litclub tab and selected club exists but book isn't in the club at all */}
                {activeTab === "litclub" && !!selectedClubName && !isValidStatus(litClubStatus) ? (
                    <View style={{ marginTop: 12, padding: 12 }}>
                        <Text style={[globalStyles.body, { fontStyle: "italic", color: colors.nextDarkest }]}>
                            This book is not on any of {selectedClubName}'s bookshelves.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.sectionHeaderCard}>
                            <Text style={[globalStyles.subheading, styles.tocTitle]}>
                                Chapters & Threads
                            </Text>
                        </View>

                        <View style={styles.tocDivider} />

                        {/* If this is a LitClub and the book is a future read (status === 3), show the message above the ToC */}
                        {activeTab === "litclub" && isValidStatus(litClubStatus) && litClubStatus === 3 && (
                            <View style={{ marginTop: 8, marginBottom: 8 }}>
                                <Text style={[globalStyles.body, { fontStyle: "italic", color: colors.nextDarkest }]}>
                                    {selectedClubName ? `${selectedClubName} has not started reading this book yet!` : "This LitClub has not started reading this book yet!"}
                                </Text>
                            </View>
                        )}

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
                                        const storedThreads =
                                            chapterThreads[activeTab][chapterNumber] ?? [];
                                        const isLoadingThreads =
                                            chapterThreadsLoading[activeTab][chapterNumber] ?? false;
                                        const threadsError =
                                            chapterThreadsError[activeTab][chapterNumber] ?? null;

                                        const isLitClubTab = activeTab === "litclub";
                                        const hasLitClubContext =
                                            !!effectiveLitClubId && typeof effectiveLitClubId === "string";

                                        // Filter threads by context:
                                        // - My Library: only global threads (no litClubId)
                                        // - My LitClub: only threads for this litClubId
                                        const threads: ThreadSummary[] =
                                            activeTab === "library"
                                                ? storedThreads.filter(
                                                    (t) => !t.litClubId
                                                )
                                                : activeTab === "litclub"
                                                    ? storedThreads.filter(
                                                        (t) =>
                                                            !!t.litClubId &&
                                                            !!effectiveLitClubId &&
                                                            t.litClubId === effectiveLitClubId
                                                    )
                                                    : storedThreads;

                                        return (
                                            <View key={chapterNumber}>
                                                <View style={styles.chapterRowOuter}>
                                                    {/* Main chapter row */}
                                                    <Pressable
                                                        style={styles.chapterRow}
                                                        onPress={() => toggleExpandChapter(chapterNumber)}
                                                    >
                                                        <View style={styles.chapterLeft}>
                                                            <Pressable
                                                                onPress={() =>
                                                                    toggleExpandChapter(chapterNumber)
                                                                }
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
                                                                onChange={() =>
                                                                    toggleChapterCheckbox(chapterNumber)
                                                                }
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
                                                                    Select a LitClub to see your club threads.
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
                                                                                {thread.title ||
                                                                                    "(Untitled thread)"}
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
                    </>
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
        overflow: "visible",
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
        color: colors.darkest,
    },
    statusContainer: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 10,
        position: "relative",
        zIndex: 10,
        backgroundColor: colors.sage,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.darkest,
        shadowColor: colors.darkest,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        marginVertical: 8,
    },
    litClubSelectContainer: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 10,
        position: "relative",
        zIndex: 3000,
        backgroundColor: colors.cream,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.darkest,
        shadowColor: colors.darkest,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        marginTop: 4,
        marginBottom: 8,
    },
    statusHeading: {
        fontSize: 18,
    },
    statusTrigger: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.darkest,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: colors.cream,
    },
    statusTriggerActive: {
        borderColor: colors.midBlue,
        shadowColor: colors.midBlue,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    statusLabel: {
        fontFamily: fonts.subheading,
        fontSize: 15,
        color: colors.darkest,
    },
    statusDropdown: {
        position: "absolute",
        borderWidth: 2,
        borderColor: colors.darkest,
        borderRadius: 12,
        backgroundColor: colors.cream,
        overflow: "hidden",
        zIndex: 2000,
        elevation: 12,
        shadowColor: colors.darkest,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    statusOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.darkest,
    },
    statusErrorText: {
        color: "red",
        marginTop: 4,
    },
    overlayLoadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    overlayLoadingText: {
        color: colors.nextDarkest,
    },
    overlayError: {
        color: "red",
    },
    overlayEmpty: {
        color: colors.nextDarkest,
        fontStyle: "italic",
    },
    sectionHeaderCard: {
        marginTop: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.darkest,
        backgroundColor: colors.teal,
        shadowColor: colors.darkest,
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
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
