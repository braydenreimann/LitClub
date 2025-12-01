import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Header from '../components/headerWithSearch';
import { colors, fonts } from '../theme';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import BookStatusDropdown from '@/components/BookStatusDropdown';
import HiddenStatusDropdown from '@/components/HiddenStatusDropdown';
import { Entypo } from '@expo/vector-icons';
import { globalStyles } from '@/styles/globalStyles';

import { Book } from '../domain/models';
import { getBook } from '../services/booksService';
import { getUriRead } from '@/services/imagesService';
import BookTableOfContentsTabs from '@/components/BookTableOfContentsTabs';

// playing around with importing the book
export interface bookImport {
    title: string;
    author: string;
    totalchapters: number;
    genre: string;
    description?: string;
    coverImageUrl?: string;
}

function BackButton() {
    const router = useRouter(); // Initialize the router hook

    const handlePress = () => {
        router.back(); // Call the back function
    };

    return (
        <Pressable onPress={handlePress}>
            <EvilIcons
                name="chevron-left"
                size={50}
                color="#193350"
                style={{ marginLeft: 20, marginBottom: 10, marginTop: 15 }} // Use style object for multiple styles
            />
        </Pressable>
    );
}

export default function BookInfoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [isExpanded, setIsExpanded] = useState(false);
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [coverUri, setCoverUri] = useState<string>('');

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
        fetchBook();
    }, [id]);

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

    const [isPublic, setIsPublic] = useState(true);

    const handlePrivacyChange = (newPrivacyStatus: string) => {
        setIsPublic(newPrivacyStatus === 'Public');
        console.log('Privacy status changed to:', newPrivacyStatus);
        // TODO: Implement function
    };

    const handleStatusChange = (newStatus: string) => {
        console.log('Book status changed to:', newStatus);
        // TODO: Implement function
    };

    {/*TODO: make it not look like shit, add a back button or the things at the bottom to go to past pages*/ }
    {/*TODO: eventually we should make 1 back button that world everywhere but that time is not now*/ }
    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}>
            <ScrollView>
                <View style={{ flexDirection: 'row' }}>
                    <BackButton />
                    <Text style={[globalStyles.heading, { marginTop: 15 }]}>
                        {' '}
                        Book Information{' '}
                    </Text>
                </View>

                <View style={infoStyle.currentRead}>
                    <View style={infoStyle.sideSect}>
                        {/* Book Container */}
                        <View style={infoStyle.bookContainer}>
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

                        <View style={{ flexDirection: 'row' }}>
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                        </View>
                    </View>

                    <View style={infoStyle.sideSect}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.midBlue} />
                        ) : book ? (
                            <>
                                <Text style={globalStyles.heading}>{book.title}</Text>
                                <Text style={globalStyles.subheading}>{book.author}</Text>

                                {(() => {
                                    const desc =
                                        (book.description ?? '') +
                                        ' Sample Text Sample Text Sample Text';
                                    const isLong = desc.length > 50;
                                    return (
                                        <>
                                            <Text style={globalStyles.body}>
                                                {isExpanded || !isLong
                                                    ? desc
                                                    : `${desc.slice(0, 50)}...`}
                                            </Text>
                                            {isLong && (
                                                <Pressable
                                                    onPress={() => setIsExpanded(prev => !prev)}
                                                >
                                                    <Text
                                                        style={{ color: colors.midBlue, marginTop: 4 }}
                                                    >
                                                        {isExpanded ? 'Show less' : 'Show more'}
                                                    </Text>
                                                </Pressable>
                                            )}
                                        </>
                                    );
                                })()}
                            </>
                        ) : (
                            <Text style={globalStyles.body}>
                                Book information not available.
                            </Text>
                        )}
                    </View>
                </View>

                {/*
                right now: you can see cover, name, and author
                take out summary
                page count
                chapter count
                summary (no summary available rn)
                genre
                all in csv
                 */}
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

                {/* NEW: embedded tabs + table of contents (My Library / My LitClub) */}
                {book && id && (
                    <BookTableOfContentsTabs
                        bookId={id}
                        book={book}
                    />
                )}

                {/*<Pressable style={infoStyle.forumBox}
                    onPress={() => {
                        router.push("/threads/thread-1"); //needs to change later to be dynamic
                    }} >
                    <Text
                        style={[globalStyles.subheading, { fontSize: 18, color: colors.darkest, textAlign: "center"}]}
                    >- View the chapter 1 thread- </Text>
                </Pressable>*/}

                <View style={infoStyle.dropdownRow}>
                    {/* Library Status */}
                    <View style={infoStyle.column}>
                        <Text style={[globalStyles.subheading, { fontSize: 18 }]}>
                            Library Status
                        </Text>
                        <BookStatusDropdown onStatusChange={handleStatusChange} />
                    </View>

                    {/* Visibility */}
                    <View style={infoStyle.column}>
                        <Text style={[globalStyles.subheading, { fontSize: 18 }]}>
                            Visibility
                        </Text>
                        <HiddenStatusDropdown onStatusChange={handlePrivacyChange} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const infoStyle = StyleSheet.create({
    bookContainer: {
        width: 150,
        height: 220,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    bookImage: {
        width: 150,
        height: 220,
        backgroundColor: colors.teal,
        borderRadius: 12,
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
    currentRead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        gap: 20,
    },
    sideSect: {
        flex: 1,
        alignItems: 'flex-start',
    },
    discBox: {
        backgroundColor: colors.cream,
        borderColor: '#193350',
        borderWidth: 4,
        borderRadius: 12,
        margin: 5,
        marginTop: 20,
        height: 120,
        width: '120%',
    },
    ToCButton: {
        backgroundColor: colors.teal,
        borderColor: colors.darkest,
        borderLeftWidth: 30,
        borderWidth: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical: 10,
        marginHorizontal: 10,
    },
    scrollContainer: {
        overflowX: 'scroll',
        overflowY: 'hidden',
        padding: 10,
    },
    scrollingWrapper: {
        flex: 1,
    },
    cardGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 5,
        margin: 5,
    },
    forumBox: {
        backgroundColor: colors.sage,
        borderWidth: 4,
        borderRightWidth: 20,
        borderColor: colors.darkest,
        borderRadius: 12,
        padding: 12,
        textAlign: 'center',
        marginVertical: 10,
        marginHorizontal: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 20,
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },

    column: {
        flex: 1,
        marginHorizontal: 5,
    },

    dropdownWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.midBlue,
        borderRadius: 10,
        backgroundColor: colors.cream,
    },
    dropdownRow: {
        flexDirection: 'row', // horizontal layout
        justifyContent: 'center', // center horizontally
        alignItems: 'flex-start', // align items to top
        gap: 20, // space between the two dropdowns
        marginVertical: 15,
        paddingHorizontal: 10, // optional, so it doesn’t hit screen edges
    },
    bookStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // evenly space items
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: colors.sage, // matches background
        paddingVertical: 4,
    },

    bookStat: {
        width: 100,
        alignItems: 'center',
        flex: 1, // optional: lets each stat take equal space
    },

    bookStatLabel: {
        fontFamily: fonts.heading, // same font as header
        fontSize: 18, // smaller size
        color: colors.midBlue,
        marginBottom: 4,
    },

    bookStatValue: {
        fontFamily: fonts.subheading,
        fontSize: 16,
        color: colors.darkest,
        textAlign: 'center',
    },
});