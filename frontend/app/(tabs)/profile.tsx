import React, { use, useCallback, useEffect, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { Pressable } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import Header from '../../components/headerWithSearch';
import { colors, fonts } from '../../theme';
import BookShelf from '@/components/BookShelf';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { User } from '../../domain/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../../styles/globalStyles';
import { useLitClubs } from '@/context/LitClubsContext';
import { getUriRead } from '../../api/services/imagesService';
import { getUserFromId } from '../../api/services/usersService';
import { FontAwesome } from '@expo/vector-icons';
import { getBooksOnPedestal } from '@/api/services/librariesService';
import { DisplayBook } from '@/domain/models';

function EditButton() {
    return (
        <Pressable onPress={() => router.push('/editProfile')}>
            <Foundation name="pencil" size={20} color={colors.darkest} />
        </Pressable>
    );
}

function SignOutButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable onPress={onPress}>
            <FontAwesome name="sign-out" size={20} color={colors.darkest} />
        </Pressable>
    );
}

function SettingsButton() {
    return (
        <EvilIcons name="gear" size={30} color={colors.darkest} />
    );
}
function StatsButton() {
    return (
        <Link href="/statsPage">
            <Foundation name="book-bookmark" size={30} color={colors.darkest} />
        </Link>
    );
}

export default function ProfileScreen() {
    /*for the sake of the litclubs
      WITH BACKEND: implement this as a linked list of a users' joined book clubs */

    const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
    });
    React.useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    useEffect(() => {
        const loadArchivedClubs = async () => {
            const saved = await AsyncStorage.getItem('archivedClubs');
            if (saved) {
                setArchivedClubIds(JSON.parse(saved));
            }
        };
        loadArchivedClubs();
    }, []);

    useEffect(() => {
        // Define an async function inside useEffect
        const loadSession = async () => {
            try {
                const sessionString = await AsyncStorage.getItem('session');
                if (!sessionString) return; // no session stored

                const session: User = JSON.parse(sessionString);
                setUser(session); // update state
            } catch (error) {
                console.error('Error loading session:', error);
            }
        };

        loadSession(); // call the async function
    }, []);

    const [user, setUser] = useState<User | null>(null);
    const pronouns =
        user?.pronouns && user.pronouns.length > 0
            ? user.pronouns.join('/')
            : '';
    const { litClubs, loading, error } = useLitClubs();
    const [archivedClubIds, setArchivedClubIds] = useState<string[]>([]);

    const [profileUri, setProfileUri] = useState<string>("");

    const [pedestalBooks, setPedestalBooks] = useState<DisplayBook[]>([]);
    const [pedestalLoading, setPedestalLoading] = useState(false);
    const [bookshelfRefreshKey, setBookshelfRefreshKey] = useState(0);

    useEffect(() => {
        let alive = true; // to prevent state updates after unmount

        const loadUser = async () => {
            try {
                // Load session from AsyncStorage
                const sessionString = await AsyncStorage.getItem('session');
                if (!sessionString) return;

                const session: User = JSON.parse(sessionString);

                // Fetch fresh user from backend using ID
                const freshUser = await getUserFromId(session.id);
                if (!freshUser) return;

                if (!alive) return;

                setUser(freshUser);

                // Fetch profile photo URI if available
                if (freshUser.profilePhotoUrl) {
                    const uri = await getUriRead(freshUser.profilePhotoUrl);
                    if (alive) setProfileUri(uri || "");
                }
            } catch (err) {
                console.error('Failed to load user:', err);
            }
        };

        loadUser();

        return () => {
            alive = false;
        };
    }, []);

    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const confirmLogout = () => {
        setLogoutModalVisible(true);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('session');
        setLogoutModalVisible(false);
        router.replace('/');
    };
    useFocusEffect(
        useCallback(() => {
            const fetchPedestalBooks = async () => {
                if (!user?.id) return;
                setPedestalLoading(true);
                try {
                    const books = await getBooksOnPedestal(user.id);
                    setPedestalBooks(books ?? []);
                } catch (err) {
                    console.error('Error loading pedestal books:', err);
                } finally {
                    setPedestalLoading(false);
                }
            };

            if (user?.id) {
                fetchPedestalBooks();
                setBookshelfRefreshKey((k) => k + 1);
            }
        }, [user?.id])
    );

    const userId = user?.id ?? '';
    const safeClubs = Array.isArray(litClubs) ? litClubs : [];

    const userClubs = safeClubs.filter(c => c.memberUserIds?.includes(userId) && !archivedClubIds.includes(c.id));
    const leaderClubs = safeClubs.filter(c => c.ownerUserId === userId && !archivedClubIds.includes(c.id));
    const archivedClubs = safeClubs.filter(c => archivedClubIds.includes(c.id)); // example filter

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading clubs...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>Error loading clubs: {error}</Text>
            </View>
        );
    }

    if (!litClubs.length) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No Clubs Found.</Text>
            </View>
        );
    }

    const renderPedestalBooks = () => {
        if (pedestalLoading) {
            return <Text>Loading pedestal books...</Text>;
        }

        if (pedestalBooks.length === 0) {
            return <Text style={[globalStyles.body, { paddingLeft: 15 }]}>No books on your pedestal yet.</Text>;
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10, gap: 12 }}
            >
                {pedestalBooks.map((book) => (
                    <PedestalBookCard key={book.id} book={book} />
                ))}
            </ScrollView>
        );
    };

    function PedestalBookCard({ book }: { book: DisplayBook }) {
        const [coverUri, setCoverUri] = useState<string>('');

        useEffect(() => {
            let alive = true;
            (async () => {
                const uri = await getUriRead(book.coverImageUrl);
                if (alive) setCoverUri(uri || '');
            })();
            return () => { alive = false; };
        }, [book.coverImageUrl]);

        return (
            <Link href={`/books/${book.id}`} asChild>
                <Pressable style={profStyles.pedestalBook}>
                    <Image
                        source={
                            coverUri
                                ? { uri: coverUri }
                                : require('@/assets/images/turkstra.jpg')
                        }
                        style={profStyles.pedestalBookImage}
                        contentFit="cover"
                    />
                    <Text
                        style={profStyles.pedestalBookTitle}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {book.title}
                    </Text>
                </Pressable>
            </Link>
        );
    }



    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}>
            <Header />
            <ScrollView>

                {/* Name + action icons row */}
                <View style={profStyles.nameRow}>
                    <View style={profStyles.nameSection}>
                        <Text style={[globalStyles.heading, { fontSize: 25 }]} numberOfLines={1} ellipsizeMode="tail">
                            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                        </Text>
                        {/*<Text style={globalStyles.body}>he/him</Text>*/}
                    </View>

                    <View style={profStyles.iconRow}>
                        {/*<SettingsButton />*/}
                        <EditButton />
                        {/*<StatsButton />*/}
                        <SignOutButton onPress={confirmLogout} />

                    </View>
                </View>

                {/* Header row: photo + bio + quick actions */}
                <View style={profStyles.profileHeader}>
                    <Image
                        source={profileUri
                            ? { uri: profileUri }
                            : require('../../assets/images/turkstra.jpg')}
                        style={profStyles.profileImage}
                    />

                    <View style={[profStyles.userBio, { flexShrink: 1, maxWidth: '90%', marginLeft: 15, marginTop: 10 }]}>
                        <Text style={globalStyles.subheading}>
                            {user ? `@${user.userName}` : 'Loading...'}
                            {pronouns ? <Text style={globalStyles.body}>{`  ${pronouns}`}</Text> : null}
                        </Text>

                        <Text
                            style={[globalStyles.body, { flexShrink: 1, flexWrap: 'wrap' }]}
                            numberOfLines={0}
                        >
                            {user ? user.bio : 'Loading...'}
                        </Text>
                    </View>

                </View>
                {/* ⬆️ close the header row here so the rest stacks vertically */}

                {/* Pedestal Section */}
                <View style={[profStyles.pedestalContainer, { marginTop: 20, marginBottom: 30 }]}>
                    <Text style={[globalStyles.subheading, { color: colors.cream, marginLeft: 10, marginBottom: 20 }]}>Pedestal</Text>
                    {renderPedestalBooks()}
                </View>


                {/* Books Section */}
                <View style={{ marginTop: 10 }}>
                    <BookShelf refreshKey={bookshelfRefreshKey} />
                </View>

                {/* Memberships */}
                <Text style={globalStyles.subheading}> LitClub Memberships </Text>
                <View style={globalStyles.cardGroup}>
                    {loading ? (
                        <Text>Loading clubs...</Text>
                    ) : error ? (
                        <Text style={{ color: 'red' }}>Error loading clubs: {error}</Text>
                    ) : userClubs.length ? (
                        userClubs.map((club, index) => (
                            <Pressable
                                key={`${club.id}-${index}`}
                                style={profStyles.litclubCard}
                            >
                                <Link
                                    href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name } }}
                                    asChild
                                >
                                    <Text style={globalStyles.cardFont} adjustsFontSizeToFit>
                                        {club.name}
                                    </Text>
                                </Link>
                            </Pressable>
                        ))
                    ) : (
                        <Text>No memberships yet.</Text>
                    )}
                </View>

                {/* Leaderships */}
                <Text style={globalStyles.subheading}> LitClub Leaderships </Text>
                <View style={globalStyles.cardGroup}>
                    {leaderClubs.length ? (
                        leaderClubs.map((club, index) => (
                            <Pressable
                                key={`${club.id}-${index}`}
                                style={profStyles.litclubCard}
                                onPress={() => Alert.alert(`Opening ${club.name}`)}
                            >
                                <Link
                                    href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name } }}
                                    asChild
                                >
                                    <Text style={globalStyles.cardFont} adjustsFontSizeToFit>
                                        {club.name}
                                    </Text>
                                </Link>
                            </Pressable>
                        ))
                    ) : (
                        <Text>You're not leading any clubs yet.</Text>
                    )}
                </View>

                {/* Archived Clubs */}
                <Text style={globalStyles.subheading}> Archived LitClubs </Text>
                <View style={globalStyles.cardGroup}>
                    {archivedClubs.length ? (
                        archivedClubs.map((club) => (
                            <Pressable
                                key={club.id}
                                style={[profStyles.litclubCard, { backgroundColor: colors.midBlue }]}
                                onPress={() => Alert.alert(`Opening archived club ${club.name}`)}
                            >
                                <Link
                                    href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name } }}
                                    asChild
                                >
                                    <Text
                                        style={[globalStyles.cardFont, { textDecorationLine: 'line-through' }]}
                                        adjustsFontSizeToFit
                                    >
                                        {club.name}
                                    </Text>
                                </Link>
                            </Pressable>
                        ))
                    ) : (
                        <Text style={[globalStyles.body, { paddingLeft: 15 }]}>No archived clubs.</Text>
                    )}
                </View>
            </ScrollView>

            {logoutModalVisible && (
                <View style={profStyles.modalOverlay}>
                    <View style={profStyles.modalContainer}>
                        <Text style={profStyles.modalTitle}>Log Out?</Text>
                        <Text style={profStyles.modalText}>
                            Are you sure you want to log out?
                        </Text>

                        <View style={profStyles.modalButtons}>
                            <Pressable
                                style={[profStyles.modalButton, profStyles.confirmButton]}
                                onPress={handleLogout}
                            >
                                <Text style={profStyles.modalButtonText}>Yes</Text>
                            </Pressable>

                            <Pressable
                                style={[profStyles.modalButton, profStyles.cancelButton]}
                                onPress={() => setLogoutModalVisible(false)}
                            >
                                <Text style={profStyles.modalButtonText}>No</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}


        </View>
    );
}

/* /vidya's header and search bar
  //profile photo left aligned
  //big text fitstname last name
  //smaller text @username
  //normal small text bio
  //divider
  //top three centered heading
  //three books
  //currently reading centered heading
  //iew all currently reading
  //divider
  //past reads centered heading
  //scroll left right past reads
  //divider
  //saved for later centered heading
  //scroll left right saved for later
  //divider
  //your LitClubs
  //footer with the default buttons on it
*/

const profStyles = StyleSheet.create({
    profileHeader: {
        flexDirection: "row",
        padding: 10,
        alignItems: "stretch",
        justifyContent: "space-around",
    },
    userBio: {
        flexDirection: "column",
        alignItems: "stretch",
    },
    profileImage: {
        width: 100,
        height: 100,
        backgroundColor: colors.teal,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    subheading: {
        fontFamily: fonts.subheading,
        fontSize: 22,
        color: colors.midBlue,
        alignContent: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    scrollContainer: {
        overflowX: 'scroll',
        overflowY: 'hidden',
        /*whiteSpace: 'nowrap',*/
        padding: 20,
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
    card: {
        width: 120,
        height: 180,
        backgroundColor: colors.midBlue,
        borderColor: colors.darkest,
    },
    cardFont: {
        fontFamily: fonts.body,
        color: colors.darkest,
        lineHeight: 22,
        textAlign: "center",
        textAlignVertical: "center",
    },
    litclubCard: {
        width: 100,
        height: 100,
        aspectRatio: 1,
        backgroundColor: colors.sage,
        borderWidth: 4,
        borderRadius: 12,
        //marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        marginBottom: 5,
        alignItems: "center",
        justifyContent: "center",
        borderColor: colors.midBlue,
        textAlign: "center",
        textAlignVertical: "center",
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    nameSection: {
        flexShrink: 1,
        flexWrap: 'wrap',
        maxWidth: '70%',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },
    pedestalContainer: {
        backgroundColor: colors.midBlue,
        paddingVertical: 15,
        marginBottom: 10,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    modalContainer: {
        width: '85%',
        backgroundColor: colors.cream,
        borderRadius: 16,
        padding: 20,
        borderWidth: 3,
        borderColor: colors.midBlue,
        shadowColor: colors.darkest,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    modalTitle: {
        fontSize: 22,
        fontFamily: fonts.subheading,
        color: colors.darkest,
        marginBottom: 10,
        textAlign: 'center',
    },

    modalText: {
        fontSize: 16,
        fontFamily: fonts.body,
        color: colors.darkest,
        marginBottom: 20,
        textAlign: 'center',
    },

    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.darkest,
    },

    confirmButton: {
        backgroundColor: colors.sage,
    },

    cancelButton: {
        backgroundColor: colors.midBlue,
    },

    modalButtonText: {
        fontSize: 16,
        fontFamily: fonts.body,
        color: colors.darkest,
        textAlign: 'center',
    },

    pedestalBook: {
        width: 120,
        alignItems: 'center',
    },
    pedestalBookImage: {
        width: 100,
        height: 150,
        borderRadius: 8,
        backgroundColor: colors.teal,
    },
    pedestalBookTitle: {
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.cream,
        textAlign: 'center',
        marginTop: 6,
        width: 100,
    },
});
