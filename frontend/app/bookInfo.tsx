import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { Platform, Pressable, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../components/SearchBar';
import Header from '../components/headerWithSearch';
import { colors, fonts } from '../theme';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import BookStatusDropdown from '@/components/BookStatusDropdown';
import HiddenStatusDropdown from '@/components/HiddenStatusDropdown'
import { Entypo } from '@expo/vector-icons';
import { globalStyles } from '@/styles/globalStyles';

import { Book } from '../domain/models';
import { getBook } from '../services/booksService';
import { getBookCoverUri } from '@/services/imagesService';
import { router } from "expo-router";

// playing around with importing the book
export interface bookImport {
    title: string;
    author: string;
    totalchapters: number;
    genre: string;
    description?: string;
    coverImageUrl?: string;
}

// buttons for the book info screen
function ToCButton() {
    return (
        <Pressable
            style={infoStyle.ToCButton}
            onPress={() => { Alert.alert('Displaying TOC...') }}>
            <Text style={[globalStyles.subheading, { fontSize: 16, color: colors.nextDarkest, fontFamily: fonts.subheading, paddingTop: 5, paddingLeft: 5 }]}>
                Table of Contents
            </Text>
        </Pressable>
    );
}

function BackButton() {
    return (
        <Pressable>
            <Link href="/profile">
                <EvilIcons name="chevron-left" size={50} color="#193350" marginLeft="20" marginBottom="10" />
            </Link>
        </Pressable>
    );
}

export default function BookInfoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [isExpanded, setIsExpanded] = useState(false);
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [coverUri, setCoverUri] = useState<string>("");

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
            const uri = await getBookCoverUri(book?.coverImageUrl);
            if (alive) setCoverUri(uri || "");
        })();

        return () => { alive = false; };
    }, [book?.coverImageUrl]);

    const [isPublic, setIsPublic] = useState(true);

    const handlePrivacyChange = (newPrivacyStatus: string) => {
        setIsPublic(newPrivacyStatus === "Public");
        console.log("Privacy status changed to:", newPrivacyStatus);
        // TODO: Implement function
    };

    const handleStatusChange = (newStatus: string) => {
        console.log("Book status changed to:", newStatus);
        // TODO: Implement function
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}>
            <Header />
            <ScrollView>
                <View style={{ flexDirection: 'row' }} >
                    <BackButton />
                    <Text style={globalStyles.heading}> Book Information </Text>
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

                        <View style={{ flexDirection: "row" }}>
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
                                    const desc = book.description ?? "";
                                    const isLong = desc.length > 50;
                                    return (
                                        <>
                                            <Text style={globalStyles.body}>
                                                {isExpanded || !isLong ? desc : `${desc.slice(0, 50)}...`}
                                            </Text>
                                            {isLong && (
                                                <Pressable onPress={() => setIsExpanded(prev => !prev)}>
                                                    <Text style={{ color: colors.midBlue, marginTop: 4 }}>
                                                        {isExpanded ? "Show less" : "Show more"}
                                                    </Text>
                                                </Pressable>
                                            )}
                                        </>
                                    );
                                })()}

                            </>
                        ) : (
                            <Text style={globalStyles.body}>Book information not available.</Text>
                        )}
                        <ToCButton />
                    </View>
                </View>

                <Pressable
                    onPress={() => {
                        router.push("/threads/35e18343-1b6e-4c5c-bb3a-c84ac0da6414");
                    }} >
                    <Text>This is some text.</Text>
                </Pressable>
                <Pressable
                    style={infoStyle.forumBox}
                    onPress={() => {
                        Alert.alert('Forums to be implemented later...');
                    }} >
                    <Text style={[globalStyles.body, { fontSize: 14, color: colors.midBlue }]}>
                        This is our most recent discussion!
                    </Text>
                </Pressable>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                    {/* Library Status */}
                    <View style={{ flex: 1 }}>
                        <Text style={globalStyles.subheading}>Library Status</Text>
                        <View style={infoStyle.dropdownWrapper}>
                            <BookStatusDropdown onStatusChange={handleStatusChange} />
                            <Entypo name="chevron-down" size={20} color="#224B6F" style={infoStyle.dropdownIcon} />
                        </View>
                    </View>

                    {/* Visibility */}
                    <View style={{ flex: 1 }}>
                        <Text style={globalStyles.subheading}>Visibility</Text>
                        <View style={infoStyle.dropdownWrapper}>
                            <HiddenStatusDropdown onStatusChange={handlePrivacyChange} />
                            <Entypo name="chevron-down" size={20} color="#224B6F" style={infoStyle.dropdownIcon} />
                        </View>
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
        backgroundColor: colors.cream,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.midBlue,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        marginBottom: 20,
    },
    bookImage: {
        width: 120,
        height: 160,
        backgroundColor: colors.teal,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    eyeIcon: {
        position: "absolute",
        top: 8,
        right: 8,
    },
    leaderBanner: {
        flexDirection: "row",
        width: "100%",
        height: 40,
        backgroundColor: colors.yellow,
        fontFamily: "serif",
        fontSize: 30,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
    currentRead: {
        flexDirection: "row",
        justifyContent: "flex-start",
        padding: 15,
    },
    sideSect: {
        flexDirection: "column",
        width: 120,
        marginHorizontal: 20,
    },
    discBox: {
        backgroundColor: "#E4D7C8",
        borderColor: "#193350",
        borderWidth: 4,
        borderRadius: 12,
        margin: 5,
        marginTop: 20,
        height: 120,
        width: "120%",
    },
    ToCButton: {
        backgroundColor: colors.teal,
        borderColor: "black",
        borderWidth: 4,
        borderRadius: 12,
        alignContent: "center",
        justifyContent: "center",
        textAlign: "center",
        margin: 5,
        height: 45,
        width: "120%",
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
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: 5,
        margin: 5,
    },
    forumBox: {
        backgroundColor: colors.cream,
        borderWidth: 2,
        borderColor: colors.nextDarkest,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 20,
        marginVertical: 10,
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 0,
    },
    dropdownWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.midBlue,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    dropdownIcon: {
        marginLeft: 5,
    },
});