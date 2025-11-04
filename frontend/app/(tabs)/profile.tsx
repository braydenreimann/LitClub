
import React, { useEffect, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { Platform, Pressable } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/headerWithSearch';
import { colors, fonts } from '../../theme';
import ReadingList from '../../components/ReadingList';
import TopThreeBooks from '../../components/TopThreeBooks';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Fonts } from '../../constants/theme';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { User } from '../../domain/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../../styles/globalStyles';
import { useLitClubs } from '../../LitClubImport/LitClubContext';


function EditButton() {
    return (
        <Link href="/editProfilePage">
            <Foundation name="pencil" size={30} color="black" marginLeft="20" marginTop="10" />
        </Link>
    );
}
function SettingsButton() {
    return (
        <Link href="/settingsPage">
            <EvilIcons name="gear" size={50} color="black" marginLeft="20" marginBottom="10" />
        </Link>

    );
}
function StatsButton() {
    return (
        <Link href="/statsPage">
            <Foundation name="book-bookmark" size={30} color="black" marginLeft="20" marginTop="10" />
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

    useEffect(() => { //chat-gpt is a quadrillion dollar idea
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



    const [user, setUser] = useState<User | null>(null)
    const { litClubs, loading, error } = useLitClubs();

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

    const userId = user?.id ?? '';
    const userClubs = litClubs.filter(c => c.memberUserIds?.includes(userId));
    const leaderClubs = litClubs.filter(c => c.ownerUserId === userId);
    const archivedClubs = litClubs.filter(c => c.privateClub); // example filter

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}>
            <Header />
            <ScrollView>
                <Text style={globalStyles.heading}> {user ? `${user.firstName} ${user.lastName}` : 'Loading...'} {"\n"} </Text>
                <View style={profStyles.profileHeader}>
                    {/* profile icon TODO change to PFP */}
                    <EvilIcons name="user" size={75} color="black" />
                    <View style={[profStyles.userBio, { flexShrink: 1, maxWidth: '90%' }]}>
                        <Text style={globalStyles.subheading}>
                            {user ? `@${user.userName}` : 'Loading...'}
                        </Text>

                        <Text
                            style={[globalStyles.body, { flexShrink: 1, flexWrap: 'wrap' }]}
                            numberOfLines={0}
                        >
                            {user ? user.bio : 'Loading...'}
                        </Text>
                    </View>

                    {/*be able to edit the bio */}
                    <View style={profStyles.userBio}>
                        <SettingsButton />
                        <EditButton />
                    </View>
                    <StatsButton />
                </View>

                {/*this is the part where we show the lists of the books*/}
                <View>
                    <TopThreeBooks />
                    <Text style={globalStyles.subheading}>Currently Reading</Text>
                    {/* reading list for the currently reading*/}
                    <ReadingList status={1} />
                    <Text style={globalStyles.subheading}>Past Reads</Text>
                    {/* reading list for the Past Reads*/}
                    <ReadingList status={0} />
                    <Text style={globalStyles.subheading}>Saved for Later</Text>
                    <ReadingList status={2} />
                    <Text style={globalStyles.subheading}>Want to Read</Text>
                    <ReadingList status={3} />
                </View>

                {/*display the book clubs*/}
                <Text style={globalStyles.subheading}>My LitClubs</Text>
                { /*format the GROUP of cards correctly*/}
                <View style={globalStyles.cardGroup}>
                    {loading ? (
                        <Text>Loading clubs...</Text>
                    ) : error ? (
                        <Text style={{ color: 'red' }}>Error loading clubs: {error}</Text>
                    ) : leaderClubs.length ? (
                        leaderClubs.map((club) => (
                            
                            <Pressable
                                key={club.id}
                                style={profStyles.litclubCard}
                                onPress={() => Alert.alert(`Opening ${club.name}`)}
                            >
                                <Link href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name }, }} asChild >
                                    <Text style={globalStyles.cardFont} adjustsFontSizeToFit={true} > {club.name} </Text>
                                </Link>
                            </Pressable>

                        ))
                    ) : ( <Text>No owned LitClubs yet.</Text> )
                    }
                </View>
                <Text style={globalStyles.subheading}>Active LitClubs</Text>
                { /*format the GROUP of cards correctly*/}
                <View style={globalStyles.cardGroup}> 
                    {userClubs.length ? (
                        userClubs.map((club) => (
                            
                            <Pressable
                                key={club.id}
                                style={profStyles.litclubCard}
                                onPress={() => Alert.alert(`Opening ${club.name}`)}
                            >
                                <Link href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name }, }} asChild >
                                    <Text style={globalStyles.cardFont} adjustsFontSizeToFit={true} > {club.name} </Text>
                                </Link>
                            </Pressable>

                        ))
                    ) : ( <Text>No active LitClubs.</Text> )
                    }
                </View>
                <Text style={globalStyles.subheading}>Archived LitClubs</Text>
                { /*format the GROUP of cards correctly*/}
                <View style={globalStyles.cardGroup}>
                    {archivedClubs.length ? (
                        archivedClubs.map((club) => (
                            <Pressable
                                key={club.id}
                                style={[profStyles.litclubCard, { backgroundColor: colors.midBlue }]}
                                onPress={() => {
                                    /*TODO make the buttons go to their clubs*/
                                    Alert.alert(`Opening archived club ${club.name}`)
                                }} >
                                <Link href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name }, }} asChild>
                                    <Text style={[globalStyles.cardFont,
                                    {
                                        textDecorationLine: 'line-through',

                                    }]} adjustsFontSizeToFit={true}>
                                        {club.name}
                                    </Text>
                                </Link>
                            </Pressable>

                        ))
                    ) : (
                        <Text>No archived LitClubs.</Text>
                    )                        
                    }
                </View>

                <View style = {{paddingBottom:20}}></View>
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
    }
});