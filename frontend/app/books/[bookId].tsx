import React, { useEffect, useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { colors, fonts } from '../../theme';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from 'react-native';

import { globalStyles } from '@/styles/globalStyles';

import { Book } from '../../domain/models';
import { getBook } from '../../api/services/booksService';
import { getUriRead } from '@/api/services/imagesService';
import BookTableOfContentsTabs from '@/components/BookTableOfContentsTabs';

export default function BookInfoScreen() {
    const params = useLocalSearchParams<{
        bookId: string | string[];
        litClubId?: string | string[];
        litClubName?: string | string[];
        litClubOwnerId?: string | string[];
    }>();
    const bookId = Array.isArray(params.bookId) ? params.bookId[0] : params.bookId;
    const litClubIdParam = Array.isArray(params.litClubId) ? params.litClubId[0] : params.litClubId;
    const litClubNameParam = Array.isArray(params.litClubName) ? params.litClubName[0] : params.litClubName;
    const litClubOwnerIdParam = Array.isArray(params.litClubOwnerId) ? params.litClubOwnerId[0] : params.litClubOwnerId;

    const [isExpanded, setIsExpanded] = useState(false);
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [coverUri, setCoverUri] = useState<string>('');

    // Fetch book data
    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            try {
                const data = await getBook(bookId);
                setBook(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (bookId) {
            fetchBook();
        }
    }, [bookId]);

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
                                        : require('@/assets/images/turkstra.jpg')
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

                {/* Embedded tabs + table of contents */}
                {book && bookId && (
                    <BookTableOfContentsTabs
                        bookId={bookId}
                        book={book}
                        litClubId={litClubIdParam}
                        litClubName={litClubNameParam}
                        litClubOwnerId={litClubOwnerIdParam}
                    />
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
});
