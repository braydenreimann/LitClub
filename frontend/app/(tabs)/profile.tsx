import React, { useEffect, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import Header from '../../components/headerWithSearch';
import { colors, fonts } from '../../theme';
import ReadingList from '../../components/ReadingList';
import TopThreeBooks from '../../components/TopThreeBooks';
import { View, Text, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { User } from '../../domain/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../../styles/globalStyles';
import { useLitClubs } from '../../context/litClubsContext';
import { getUriRead } from '../../services/imagesService';
import { getUserFromId } from '../../services/usersService';

function EditButton() {
    return (
        <Pressable onPress={() => router.push('/editProfile')}>
            <Foundation name="pencil" size={20} color={colors.darkest} />
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

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}>
            <Header />
            <ScrollView>

                {/* Name + action icons row */}
                <View style={profStyles.nameRow}>
                    <View style={profStyles.nameSection}>
                        <Text style={globalStyles.heading} numberOfLines={1} ellipsizeMode="tail">
                            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                        </Text>
                        {/*<Text style={globalStyles.body}>he/him</Text>*/}
                    </View>

                    <View style={profStyles.iconRow}>
                        <SettingsButton />
                        <StatsButton />
                        <EditButton />
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

                    <View style={[profStyles.userBio, { flexShrink: 1, maxWidth: '90%' }]}>
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


                {/* Books Section */}
                <View>
                    <TopThreeBooks />
                    <Text style={[globalStyles.subheading, { marginLeft: 10 }]}>Currently Reading</Text>
                    <ReadingList status={1} />
                    <Text style={[globalStyles.subheading, { marginLeft: 10 }]}>Future Reads</Text>
                    <ReadingList status={2} />
                    <Text style={[globalStyles.subheading, { marginLeft: 10 }]}>Past Reads</Text>
                    <ReadingList status={0} />
                </View>

                {/* Memberships */}
                <Text style={globalStyles.subheading}> LitClub Memberships </Text>
                <View style={globalStyles.cardGroup}>
                    {loading ? (
                        <Text>Loading clubs...</Text>
                    ) : error ? (
                        <Text style={{ color: 'red' }}>Error loading clubs: {error}</Text>
                    ) : userClubs.length ? (
                        userClubs.map((club) => (
                            <Pressable
                                key={club.id}
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
                        leaderClubs.map((club) => (
                            <Pressable
                                key={club.id}
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
});
