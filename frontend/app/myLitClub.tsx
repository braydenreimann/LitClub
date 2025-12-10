/* app/myLitClub.tsx */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Foundation from '@expo/vector-icons/Foundation';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { colors, fonts } from '@/theme';
import BookShelf from '@/components/BookShelf';
import ClubMembers from '@/components/ClubMembers';
import { globalStyles } from '@/styles/globalStyles';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLitClubs } from '@/context/LitClubsContext';
import type { Book, User } from '@/domain/models';
import { client } from '@/api/client';
import { leaveLitClub } from '@/api/services/litClubsService';
import { pushBookDetail } from '@/navigation/routes';
import { useFocusEffect } from 'expo-router';
import { getUserFromId } from '@/api/services/usersService';

SplashScreen.preventAutoHideAsync();

function Jump2discButton() {
    return (
        <Pressable
            style={litStyles.discButton}
            onPress={() => {
                // TODO: wire to discussion thread route
                Alert.alert('Jumping to discussion...');
            }}
        >
            <Text
                style={[
                    globalStyles.body,
                    {
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        fontSize: 12,
                    },
                ]}
            >
                Jump to Discussion
            </Text>
        </Pressable>
    );
}

function BackButton() {
    const router = useRouter();
    return (
        <Pressable>
            <Link href="/litClubs" onPress={() => router.back()}>
                <EvilIcons
                    name="chevron-left"
                    size={50}
                    color="#193350"
                    style={{ marginLeft: 20, marginBottom: 10, marginTop: 25 }}
                />
            </Link>
        </Pressable>
    );
}

// LitClub detail page
export default function LitClubScreen() {
    const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
    });

    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const { litClubs, loading, error, fetchLitClubs } = useLitClubs();

    const [actionLoading, setActionLoading] = useState(false);
    const [archivedClubIds, setArchivedClubIds] = useState<string[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [upcomingBooks, setUpcomingBooks] = useState<Book[]>([]); // still loaded, not yet rendered

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    // Load archived clubs from local storage
    useEffect(() => {
        const loadArchivedClubs = async () => {
            try {
                const saved = await AsyncStorage.getItem('archivedClubs');
                if (saved) {
                    setArchivedClubIds(JSON.parse(saved));
                }
            } catch (err) {
                console.error('Error loading archived clubs:', err);
            }
        };
        loadArchivedClubs();
    }, []);

    // Persist archived clubs when they change
    useEffect(() => {
        AsyncStorage.setItem('archivedClubs', JSON.stringify(archivedClubIds)).catch(
            (err) => console.error('Error saving archived clubs:', err)
        );
    }, [archivedClubIds]);

    // Load current user from session
    useEffect(() => {
        const loadSession = async () => {
            try {
                const sessionString = await AsyncStorage.getItem('session');
                if (!sessionString) return;

                const session: User = JSON.parse(sessionString);
                setUser(session);
            } catch (err) {
                console.error('Error loading session:', err);
            }
        };

        loadSession();
    }, []);

    // Load selected books for this club from local storage
    useEffect(() => {
        const loadSelectedBooks = async () => {
            try {
                const saved = await AsyncStorage.getItem('selectedBooksForClub');
                if (saved) {
                    const books: Book[] = JSON.parse(saved);
                    if (books.length > 0) {
                        setCurrentBook(books[0] ?? null);
                        setUpcomingBooks(books.slice(1));
                    }
                }
            } catch (err) {
                console.error('Error loading selected books for club:', err);
            }
        };
        loadSelectedBooks();
    }, []);

    // Refresh reading lists when this screen regains focus
    useFocusEffect(
        React.useCallback(() => {
            setRefreshKey((k) => k + 1);
            return undefined;
        }, [])
    );

    const club = litClubs.find((c) => c.id === id);

    useEffect(() => {
        if (!club?.ownerUserId) return;

        const fetchOwner = async () => {
            const user = await getUserFromId(club.ownerUserId);
            setOwnerUser(user);
        };

        fetchOwner();
    }, [club?.ownerUserId]);

    const currentUserId = user?.id ?? '';
    const isOwner = club ? club.ownerUserId === currentUserId : false;
    const isArchived = club ? archivedClubIds.includes(club.id) : false;

    const [ownerUser, setOwnerUser] = useState<User | null>(null);


    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} />;
    }

    if (error) {
        return (
            <Text style={{ color: 'red', padding: 20 }}>
                Error: {error}
            </Text>
        );
    }

    if (!litClubs.length) {
        return <Text style={{ padding: 20 }}>No LitClubs found.</Text>;
    }
    if (!club) {
        return <Text style={{ padding: 20 }}>Club not found.</Text>;
    }

    // Leave a club (for non-owners)
    async function handleLeaveClub() {
        if (!currentUserId) {
            Alert.alert('Error', 'You must be logged in to leave a club.');
            return;
        }

        if (!club) {
            Alert.alert('Error', 'Club not found.');
            return;
        }

        Alert.alert('Leave Club', 'Are you sure you want to leave this club?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Leave',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setActionLoading(true);

                        const result = await leaveLitClub({
                            litClubId: club.id,
                            userId: currentUserId,
                        });

                        if (!result) {
                            Alert.alert('Failed to leave club.');
                            return;
                        }

                        await fetchLitClubs();
                        router.replace('/litClubs');
                    } catch (error) {
                        Alert.alert('Error leaving club', (error as Error).message);
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    }

    // Delete a club (for owners) via client.DELETE
    async function handleDeleteClub() {
        if (!club) {
            Alert.alert('Error', 'Club not found.');
            return;
        }
        Alert.alert(
            'Delete LitClub',
            'Are you sure you want to delete this club? It will be deleted for all members.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(true);

                            const { error } = await client.DELETE('/litclubs/{litClubId}', {
                                params: { path: { litClubId: club.id } },
                            });

                            if (error) {
                                console.error('Error deleting LitClub:', error);
                                Alert.alert('Failed to delete club.');
                                return;
                            }

                            await fetchLitClubs();
                            router.replace('/litClubs');
                        } catch (error) {
                            Alert.alert('Error deleting club', (error as Error).message);
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    }

    const handleArchiveToggle = async () => {
        const nextArchived = isArchived
            ? archivedClubIds.filter((x) => x !== club.id)
            : [...archivedClubIds, club.id];

        setArchivedClubIds(nextArchived);
        try {
            await AsyncStorage.setItem('archivedClubs', JSON.stringify(nextArchived));
        } catch (err) {
            console.error('Error persisting archived clubs:', err);
        }

        Alert.alert(isArchived ? 'Club unarchived.' : 'Club archived.');
        router.replace('/litClubs');
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.cream }}>
            <View style={{ flexDirection: 'row', paddingTop: 25 }}>
                <BackButton />
                <Text style={[globalStyles.heading, { paddingTop: 6, fontSize: 24 }]}>
                    {club.name}
                </Text>
            </View>

            <View style={litStyles.leaderBanner}>
                <Foundation
                    name="crown"
                    size={30}
                    color="#193350"
                    style={{ marginLeft: 20, marginBottom: 10, marginTop: 25 }}
                />
                <Text style={[globalStyles.subheading, { fontSize: 16 }]}> CLUB LEADER: </Text>
                <Text style={[globalStyles.subheading, { fontSize: 16 }]}>
                    {ownerUser ? ownerUser.firstName : "Loading..."}
                    {' '}
                    {ownerUser ? ownerUser.lastName : "Loading..."}
                    {' | '}
                    @{ownerUser ? ownerUser.userName : "Loading..."}
                </Text>
                <Foundation
                    name="crown"
                    size={30}
                    color="#193350"
                    style={{ marginLeft: 20, marginBottom: 10, marginTop: 25 }}
                />
            </View>
            <Text style={[globalStyles.body, { margin: 20 }]}>
                {club.description}
            </Text>

            {/* Currently reading section */}
            { /*
                <View style={litStyles.currentRead}>
                <View style={litStyles.sideRead}>
                    <View style={globalStyles.card}>
                        {currentBook ? (
                            <Text
                                style={[
                                    globalStyles.subheading,
                                    {
                                        textAlign: 'center',
                                        paddingTop: 50,
                                        fontSize: 18,
                                    },
                                ]}
                            >
                                {currentBook.title}
                            </Text>
                        ) : (
                            <Text
                                style={[
                                    globalStyles.subheading,
                                    {
                                        textAlign: 'center',
                                        paddingTop: 50,
                                        fontSize: 18,
                                    },
                                ]}
                            >
                                Current Book Not Found
                            </Text>
                        )}
                    </View>
                </View>
                <View style={litStyles.sideRead}>
                    <View style={litStyles.discBox}>
                        <Text
                            style={[
                                globalStyles.subheading,
                                {
                                    textAlign: 'left',
                                    textAlignVertical: 'center',
                                    paddingTop: 20,
                                    paddingLeft: 5,
                                    fontSize: 18,
                                },
                            ]}
                        >
                            This is our most recent discussion!
                        </Text>
                    </View>
                    <Jump2discButton />
                </View>
            </View> */}

            <View>
                {/* Preferred Genres */}
                <Text style={litStyles.sectionHeader}>
                    Preferred Genres
                </Text>

                <View
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginHorizontal: 20,
                    }}
                >
                    {(club.preferredGenres || []).map((genre, idx) => (
                        <View
                            key={idx}
                            style={{
                                backgroundColor: colors.sage,
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                borderRadius: 20,
                                marginRight: 8,
                                marginBottom: 8,
                            }}
                        >
                            <Text
                                style={[
                                    globalStyles.body,
                                    { color: colors.darkest },
                                ]}
                            >
                                {genre}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Club Library reading lists */}
                <BookShelf
                    title="Club Bookshelf"
                    ownerId={club.id}
                    refreshKey={refreshKey}
                    onBookPress={(bookId) =>
                        pushBookDetail(router, bookId, club.id, club.name, club.ownerUserId)
                    }
                />

                {/* Members */}
                <Text style={litStyles.sectionHeader}>
                    Current Members
                </Text>
                <ClubMembers
                    ownerUserId={club.ownerUserId}
                    memberUserIds={club.memberUserIds ?? []}
                />
            </View>

            {/* Delete / Leave */}
            <Pressable
                disabled={actionLoading}
                onPress={isOwner ? handleDeleteClub : handleLeaveClub}
                style={[litStyles.deleteButton, { backgroundColor: colors.midBlue }]}
            >
                <Text
                    style={[
                        globalStyles.body,
                        {
                            color: 'white',
                            textAlign: 'center',
                            textAlignVertical: 'center',
                        },
                    ]}
                >
                    {actionLoading
                        ? 'Processing...'
                        : isOwner
                            ? 'Delete Club'
                            : 'Leave Club'}
                </Text>
            </Pressable>

            {/* Archive / Unarchive */}
            <Pressable
                disabled={actionLoading}
                onPress={handleArchiveToggle}
                style={[litStyles.archiveButton, { backgroundColor: colors.yellow }]}
            >
                <Text
                    style={[
                        globalStyles.body,
                        {
                            color: colors.darkest,
                            textAlign: 'center',
                            textAlignVertical: 'center',
                        },
                    ]}
                >
                    {isArchived ? 'Unarchive Club' : 'Archive Club'}
                </Text>
            </Pressable>


            {(isOwner || (!club.privateClub && club.memberUserIds?.includes(currentUserId))) && (
                <View style={{ marginHorizontal: 30, marginBottom: 40 }}>
                    <Text style={[globalStyles.subheading, { marginBottom: 10 }]}>
                        {isOwner ? 'Invite Code' : 'Club Invite Code'}
                    </Text>

                    <View style={litStyles.invite}>
                        <Text style={[globalStyles.body, { fontSize: 16 }]}>
                            {club.id}
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

/* BREAKDOWN:
   - Header + back button
   - Club name & description
   - Leader banner
   - Currently reading section
   - Upcoming & Past reads (via ReadingList)
   - Members list
   - Delete/Leave + Archive controls
*/

const litStyles = StyleSheet.create({
    leaderBanner: {
        flexDirection: 'row',
        width: '100%',
        height: 40,
        backgroundColor: colors.yellow,
        fontFamily: fonts.subheading,
        fontSize: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    currentRead: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 15,
    },
    sideRead: {
        flexDirection: 'column',
        width: 120,
        marginHorizontal: 20,
    },
    discBox: {
        backgroundColor: colors.cream,
        borderColor: colors.nextDarkest,
        borderWidth: 4,
        borderRadius: 20,
        margin: 5,
        height: 120,
        width: '120%',
        fontFamily: fonts.body,
    },
    discButton: {
        backgroundColor: colors.teal,
        borderColor: colors.darkest,
        borderWidth: 4,
        borderRadius: 12,
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: 5,
        height: 45,
        width: '120%',
        fontFamily: fonts.body,
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
    card: {
        fontFamily: fonts.heading,
        width: 120,
        height: 180,
        backgroundColor: colors.teal,
        borderColor: 'black',
        margin: 15,
    },
    cardFont: {
        fontFamily: fonts.body,
        color: colors.darkest,
        lineHeight: 22,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    deleteButton: {
        marginTop: 40,
        marginHorizontal: 30,
        padding: 15,
        borderRadius: 12,
    },
    archiveButton: {
        marginTop: 25,
        marginHorizontal: 30,
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    invite: {
        backgroundColor: colors.cream,
        padding: 12,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.darkest,
        marginBottom: 40,
    },
    sectionHeader: {
        paddingLeft: 20,
        marginBottom: 10,
        marginTop: 10,
        fontSize: 20,
        fontFamily: fonts.subheading,
        color: colors.midBlue
    }
});
