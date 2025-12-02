//frontend/app / bookInfo.tsx(path may differ)

import React, { useEffect, useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { colors, fonts } from '../theme';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { globalStyles } from '@/styles/globalStyles';

import { Book, User } from '../domain/models';
import { getBook } from '../services/booksService';
import { getUser } from '../services/usersService';
import { getUriRead } from '@/services/imagesService';
import BookTableOfContentsTabs from '@/components/BookTableOfContentsTabs';
import {
    getLibraryBookForBook,
    removeBookFromLibrary,
    setBookShelfStatus,
} from '../services/librariesService';

// at top or bottom of bookInfo.tsx
export const options = {
    title: 'Book Information',
    headerBackTitleVisible: false,
};

// Backend enum: 0 | 1 | 2 | 3
type ShelfStatus = 0 | 1 | 2 | 3;

type ShelfStatusOption = {
    label: string;
    value: ShelfStatus | 'remove';
};

const shelfStatusOptions: ShelfStatusOption[] = [
    {
        label: 'Currently Reading',
        value: 1,
    },
    {
        label: 'Future Reads',
        value: 3,
    },
    {
        label: 'Past Reads',
        value: 0,
    },
    {
        label: 'Remove from Bookshelf',
        value: 'remove',
    },
];

function mapStatusToLabel(status: ShelfStatus | null): string {
    switch (status) {
        case 1:
            return 'Currently Reading';
        case 3:
            return 'Future Reads';
        case 0:
            return 'Past Reads';
        case 2:
            return 'On Hiatus';
        default:
            return 'Add to Bookshelf';
    }
}

export default function BookInfoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [isExpanded, setIsExpanded] = useState(false);
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [coverUri, setCoverUri] = useState<string>('');

    const [user, setUser] = useState<User | null>(null);
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

    // Load user from session
    useEffect(() => {
        const loadUser = async () => {
            try {
                const sessionUser = await getUser();
                if (sessionUser) {
                    setUser(sessionUser);
                }
            } catch (err) {
                console.error('Error loading user:', err);
            }
        };

        loadUser();
    }, []);

    // Fetch book data
    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            try {
                const data = await getBook(id);
                setBook(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchBook();
        }
    }, [id]);

    // Load cover image
    useEffect(() => {
        let alive = true;

        (async () => {
            const uri = await getUriRead(book?.coverImageUrl);
            if (alive) setCoverUri(uri || '');
        })();

        return () => {
            alive = false;
        };
    }, [book?.coverImageUrl]);

    // Load bookshelf status for this book
    useEffect(() => {
        if (!user || !book) return;

        let alive = true;
        setStatusLoading(true);
        setStatusError(null);

        (async () => {
            try {
                const existing = await getLibraryBookForBook(user.id, book.id);
                if (!alive) return;
                setShelfStatus(existing?.status ?? null);
            } catch (err) {
                if (!alive) return;
                console.error('Error loading shelf status:', err);
                setStatusError('Unable to load bookshelf status right now.');
            } finally {
                if (!alive) return;
                setStatusLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [user, book]);

    useEffect(() => {
        if (book && !user) {
            setStatusLoading(false);
        }
    }, [book, user]);

    const handleShelfStatusSelect = async (option: ShelfStatusOption) => {
        if (!user || !book) {
            setStatusError('Sign in to save your bookshelf status.');
            return;
        }

        setStatusSaving(true);
        setStatusError(null);
        try {
            if (option.value === 'remove') {
                const removed = await removeBookFromLibrary(user.id, book.id);
                if (!removed) {
                    throw new Error('Failed to remove from bookshelf');
                }
                setShelfStatus(null);
            } else {
                const nextStatus = option.value as ShelfStatus;
                await setBookShelfStatus(user.id, book.id, nextStatus);
                setShelfStatus(nextStatus);
            }
            setStatusMenuOpen(false);
        } catch (err) {
            console.error('Failed to update shelf status:', err);
            setStatusError('Could not update your bookshelf. Please try again.');
        } finally {
            setStatusSaving(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}>
            <ScrollView>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.midBlue} />
                ) : book ? (
                    <>
                        <View style={infoStyle.titleBlock}>
                            <Text style={[globalStyles.heading, { textAlign: 'center' }]}>
                                {book.title}
                            </Text>
                            <Text style={[globalStyles.subheading, { textAlign: 'center' }]}>
                                {book.author}
                            </Text>
                        </View>

                        <View style={infoStyle.coverContainer}>
                            <Image
                                source={
                                    coverUri
                                        ? { uri: coverUri }
                                        : require('../assets/images/turkstra.jpg')
                                }
                                style={infoStyle.bookImage}
                                contentFit="cover"
                                transition={150}
                            />
                        </View>

                        <View style={infoStyle.descriptionBlock}>
                            <Text style={[globalStyles.subheading, { fontSize: 16, paddingBottom: 6 }]}>
                                Description
                            </Text>
                            {(() => {
                                const desc =
                                    (book.description ?? '') +
                                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
                                const isLong = desc.length > 100;
                                return (
                                    <>
                                        <Text style={globalStyles.body}>
                                            {isExpanded || !isLong
                                                ? desc
                                                : `${desc.slice(0, 100)}...`}
                                        </Text>
                                        {isLong && (
                                            <Pressable onPress={() => setIsExpanded((prev) => !prev)}>
                                                <Text style={{ color: colors.midBlue, marginTop: 4 }}>
                                                    {isExpanded ? 'Show less' : 'Show more'}
                                                </Text>
                                            </Pressable>
                                        )}
                                    </>
                                );
                            })()}
                        </View>
                    </>
                ) : (
                    <Text style={globalStyles.body}>Book information not available.</Text>
                )}

                <View style={{ height: 4, backgroundColor: colors.darkest }} />
                {book && (
                    <View style={infoStyle.bookStatsContainer}>
                        <View style={infoStyle.bookStat}>
                            <Text style={infoStyle.bookStatLabel}>Pages</Text>
                            <Text style={infoStyle.bookStatValue}>{'313'}</Text>
                        </View>

                        <View style={infoStyle.bookStat}>
                            <Text style={infoStyle.bookStatLabel}>Chapters</Text>
                            <Text style={infoStyle.bookStatValue}>
                                {book.totalChapters ?? 'N/A'}
                            </Text>
                        </View>

                        <View style={infoStyle.bookStat}>
                            <Text style={infoStyle.bookStatLabel}>Genre</Text>
                            <Text style={infoStyle.bookStatValue}>
                                {book.genre ?? 'N/A'}
                            </Text>
                        </View>
                    </View>
                )}
                <View style={{ height: 4, backgroundColor: colors.darkest }} />

                {/* Shelf status selector */}
                {book && (
                    <View style={infoStyle.statusContainer}>
                        <Text style={[globalStyles.subheading, { fontSize: 18 }]}>
                            Bookshelf status
                        </Text>

                        <Pressable
                            style={[
                                infoStyle.statusTrigger,
                                statusMenuOpen && infoStyle.statusTriggerActive,
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
                                <Text style={infoStyle.statusLabel}>
                                    {statusLoading
                                        ? 'Checking status...'
                                        : mapStatusToLabel(shelfStatus)}
                                </Text>
                            </View>
                            <FontAwesome
                                name={statusMenuOpen ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color={colors.darkest}
                            />
                        </Pressable>

                        {statusMenuOpen && (
                            <View
                                style={[
                                    infoStyle.statusDropdown,
                                    {
                                        top: triggerLayout.y + triggerLayout.height + 6,
                                        left: triggerLayout.x,
                                        width: Math.max(triggerLayout.width, 200),
                                    },
                                ]}
                            >
                                {shelfStatusOptions.map((option) => (
                                    <Pressable
                                        key={option.label}
                                        style={({ pressed }) => [
                                            infoStyle.statusOption,
                                            shelfStatus === option.value && {
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
                            <Text style={{ color: 'red', marginTop: 8 }}>{statusError}</Text>
                        )}
                    </View>
                )}
                <View style={{ height: 4, backgroundColor: colors.darkest }} />

                {/* Embedded tabs + table of contents */}
                {book && id && (
                    <BookTableOfContentsTabs bookId={id} book={book} />
                )}
            </ScrollView>
        </View>
    );
}

const infoStyle = StyleSheet.create({
    bookContainer: {
        width: 220,
        height: 320,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookImage: {
        width: 220,
        height: 320,
        backgroundColor: colors.teal,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    leaderBanner: {
        flexDirection: 'row',
        width: '100%',
        height: 40,
        backgroundColor: colors.yellow,
        fontFamily: 'serif',
        fontSize: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    bookStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: colors.sage,
        paddingVertical: 4,
    },
    bookStat: {
        width: 100,
        alignItems: 'center',
        flex: 1,
    },
    bookStatLabel: {
        fontFamily: fonts.heading,
        fontSize: 18,
        color: colors.midBlue,
        marginBottom: 4,
    },
    bookStatValue: {
        fontFamily: fonts.subheading,
        fontSize: 16,
        color: colors.darkest,
        textAlign: 'center',
    },
    statusContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.cream,
        gap: 10,
        position: 'relative',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 8,
    },
    titleBlock: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 8,
    },
    coverContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    descriptionBlock: {
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    statusTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.darkest,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: colors.sage,
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
        position: 'absolute',
        borderWidth: 2,
        borderColor: colors.darkest,
        borderRadius: 12,
        backgroundColor: colors.cream,
        overflow: 'hidden',
        zIndex: 20,
        elevation: 6,
        shadowColor: colors.darkest,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center', // centers labels and icons vertically
        paddingHorizontal: 12,
        paddingVertical: 6,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.darkest,
    },
});