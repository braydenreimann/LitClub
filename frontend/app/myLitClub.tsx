import React, { useEffect, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../components/SearchBar';
import Header from '../components/headerWithSearch';
import { colors, fonts } from '../theme';
import ReadingList from '../components/ReadingList';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import ClubMembers from '@/components/ClubMembers';

import { globalStyles } from '@/styles/globalStyles';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useLitClubs } from '@/LitClubImport/LitClubContext';
import { useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import { Book, User } from '@/domain/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GenresSelector } from '@/components/genresSelector';

type ReadingListProps = {
    status: number;
    books?: Book[];
};


const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const LAN_IP = hostFromExpo ?? '10.0.0.252'
const API_BASE_URL = `http://${LAN_IP}:5112`
const apiUrl = `${API_BASE_URL}/litclubs`;



function Jump2discButton() {
    return (
        <Pressable
            style={litStyles.discButton}
            /*TODO make the buttons go to their clubs*/
            onPress={() => { Alert.alert('jumping to discussion...') }} >
            <Text style={[globalStyles.body, { textAlign: 'center', textAlignVertical: 'center' , fontSize: 12}]}>
                Jump to Discussion
            </Text>
        </Pressable>

    );
}
function BackButton() {
    const router = useRouter();
    return (
        <Pressable>
            <Link href="/bookclubs" onPress={() => router.back()}>
                <EvilIcons name="chevron-left" size={50} color="#193350" style={{ marginLeft: 20, marginBottom: 10, marginTop: 25 }}/>
            </Link>
        </Pressable>

    );
}
//PRE_INTEGRATION: Tis will be a template page for all book clubs to go to
export default function LitClubScreen() { 
    const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
    });
    React.useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { litClubs, loading, error, fetchLitClubs } = useLitClubs();

    const [actionLoading, setActionLoading] = useState(false);
    const [archivedClubIds, setArchivedClubIds] = useState<string[]>([]);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [upcomingBooks, setUpcomingBooks] = useState<Book[]>([]);
    

    useEffect(() => {
    const loadArchivedClubs = async () => {
      const saved = await AsyncStorage.getItem('archivedClubs');
      if (saved) {
        setArchivedClubIds(JSON.parse(saved));
      }
    };
    loadArchivedClubs();
  }, []);

  //save when changed
  useEffect(() => {
    AsyncStorage.setItem('archivedClubs', JSON.stringify(archivedClubIds));
  }, [archivedClubIds]);

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

    useEffect(() => {
        const loadSelectedBooks = async () => {
            const saved = await AsyncStorage.getItem('selectedBooksForClub');
            if (saved) {
                const books: Book[] = JSON.parse(saved);

                if (books.length > 0) {
                    setCurrentBook(books[0] ?? null);
                    setUpcomingBooks(books.slice(1));
                }
            }
        };
        loadSelectedBooks();
    }, []);

    const club = litClubs.find(c => c.id === id);

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} />
    }

    if (error) {
        return (
            <Text style={{ color: 'red', padding: 20 }}>Error: {error}</Text>
        );
    }

    if (!litClubs.length) {
        return <Text style={{ padding: 20 }}>No LitClubs found.</Text>
    }

    if (!club) {
        return <Text style={{ padding: 20 }}>Club not found.</Text>
    }

    const currentUserId = user?.id ?? ''; //pull from async storage session
    const isOwner = club.ownerUserId === currentUserId;

    //leave a club if you dont own the club
    async function handleLeaveClub() {
        Alert.alert(
            "Leave Club",
            "Are you sure you want to leave this club?",
            [
                {text: "Cancel", style: "cancel"},
                {text: "Leave", style: "destructive", onPress: async () => {
                        if (!club) {
                            Alert.alert('Club not found.');
                            return;
                        }
                        try {
                            setActionLoading(true);
                            const res = await fetch(`http://{LAN_IP}:5112/litclubs/${club.id}/leave`, {
                                method: 'POST',
                            });
                            if (!res.ok) {
                                Alert.alert('Failed to leave club.');
                            } else {
                                await fetchLitClubs(); // Refresh club list after leaving
                                router.replace('/bookclubs'); // Navigate back after leaving
                            }
                        } catch (error) {
                            Alert.alert('Error leaving club:', (error as Error).message);
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    }
    
    //delete club if you own the club
    async function handleDeleteClub() {
        Alert.alert(
            "Delete Club",
            "Are you sure you want to delete this club? It will delete for all users in this club.",
            [
                {text: "Cancel", style: "cancel"},
                {text: "Delete", style: "destructive", onPress: async () => {
                        if (!club) {
                            Alert.alert('Club not found.');
                            return;
                        }
                        try {
                            setActionLoading(true);
                            const res = await fetch(`http://${LAN_IP}:5112/litclubs/${club.id}`, {
                                method: 'DELETE',
                            });
                            if (!res.ok) {
                                Alert.alert('Failed to delete club.');
                            } else {
                                await fetchLitClubs(); // Refresh club list after leaving
                                router.replace('/bookclubs'); // Navigate back after leaving
                            }
                        } catch (error) {
                            Alert.alert('Error deleting club:', (error as Error).message);
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    }

    const isArchived = archivedClubIds.includes(club.id);

    const handleArchiveToggle = async () => {
        if (isArchived) { // unarchive
            setArchivedClubIds(prev => prev.filter(id => id !== club.id));
            Alert.alert('Club unarchived.');
        } else { // archive
            setArchivedClubIds(prev => [...prev, club.id]);
            Alert.alert('Club archived.');
        }

        await AsyncStorage.setItem('archivedClubs', JSON.stringify(
            isArchived
                ? archivedClubIds.filter(id => id !== club.id)
                : [...archivedClubIds, club.id]
        ));

        router.replace('/bookclubs');
    }; // help from AI to make archiving function

    return (
            <ScrollView style={{ flex: 1, backgroundColor: colors.cream }}> 
                    <View style={{flexDirection:'row', paddingTop: 25 } } >
                        <BackButton /> 
                        <Text style={[globalStyles.heading, { paddingTop: 0 }]}>{club.name}</Text>
                    </View>

                    <Text style={[globalStyles.body, {margin: 20}]}> 
                        {club.description}
                    </Text>

                    <View style={litStyles.leaderBanner}>
                        <Foundation name="crown" size={30} color="#193350" style={{ marginLeft: 20, marginBottom: 10, marginTop: 25 }}/>
                        <Text style={globalStyles.subheading}> CLUB LEADER: </Text>
                        <Text style={globalStyles.subheading}>@{club.ownerUserId}</Text>
                        <Foundation name="crown" size={30} color="#193350" style={{ marginLeft: 20, marginBottom: 10, marginTop: 25 }} />
                    </View>

                    {/*currently reading section*/}
                    <View style={litStyles.currentRead}>
                        <View style={litStyles.sideRead}>
                            
                            <View style={globalStyles.card}>  
                                {currentBook ? (
                                    <Text style={[globalStyles.subheading, {textAlign: 'center', paddingTop: 50, fontSize: 18}]}>
                                        {currentBook.title}
                                    </Text>
                                ) : (
                                    <Text style={[globalStyles.subheading, {textAlign: 'center', paddingTop: 50, fontSize: 18}]}>
                                        Current Book Not Found
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={litStyles.sideRead}>
                            <View style={litStyles.discBox}>
                                <Text style={[globalStyles.subheading, { textAlign: 'left', textAlignVertical: 'center', paddingTop: 20, paddingLeft: 5, fontSize: 18}]}>
                                    This is our most recent discussion!
                                </Text>
                            </View>
                            <Jump2discButton />
                        </View>            
                    </View>
                <View> 

                    {/* AI help for integrating this */}
                    <Text style={[globalStyles.subheading, {margin: 20}]}>Preferred Genres</Text> 
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20 }}>
                        {(club.preferredGenres || []).map((genre, idx) => (
                        <Text key={idx} style={[globalStyles.body, { marginRight: 10 }]}>#{genre}</Text>
                        ))}
                    </View>

                    <Text style={[globalStyles.subheading, {margin: 20}]}>Upcoming Reads</Text>
                    {/* reading list for the club's upcoming reads*/}
                    <ReadingList status={0} /> 
                    <Text style={[globalStyles.subheading, {margin: 20}]}>Past Reads</Text>
                    {/* reading list for the Past Reads*/}   
                    <ReadingList status={1} />    
                    <Text style={[globalStyles.subheading, {margin: 20}]}>Current Members</Text>
                    {/* TODO: INSERT CLUB MEMBERS HERE*/}
                    <ClubMembers 
                        memberUserIds={club.memberUserIds ?? []} 
                        ownerUserId={club.ownerUserId} 
                    />
                </View> 

                <Pressable
                    disabled={actionLoading}
                    onPress={isOwner ? handleDeleteClub : handleLeaveClub}
                    style={[litStyles.deleteButton, { backgroundColor: colors.midBlue}]}
                >
                    <Text style={[globalStyles.body, { color: 'white', textAlign: 'center', textAlignVertical: 'center' }]}>
                        {actionLoading 
                            ? "Processing..."
                            : isOwner 
                                ? "Delete Club" 
                                : "Leave Club"
                        }
                    </Text>
                </Pressable>    

                <Pressable
                    disabled={actionLoading}
                    onPress={handleArchiveToggle}
                    style={[litStyles.archiveButton, { backgroundColor: colors.yellow}]}
                >
                    <Text style={[globalStyles.body, { color: colors.darkest, textAlign: 'center', textAlignVertical: 'center' }]}>
                        {isArchived ? "Unarchive Club" : "Archive Club"
                        }
                    </Text>
                </Pressable> 
                
        </ScrollView>
    );
}


/*BREAKDOWN:
    header
    BIG header text with the book club's name
    fun banner with the club leader's username
    currently reading book
    jump to discussion button that WILL eventually do the forums
    upcoming reads scrolly section
    past reads scrolly section
*/



const litStyles = StyleSheet.create({
    leaderBanner: {
        flexDirection:"row",
        width: "100%",
        height: 40,
        backgroundColor: colors.yellow,
        fontFamily: fonts.subheading,
        fontSize: 30,
        justifyContent:"center",
        alignItems: "center",
        marginTop: 15,
        
    },
    currentRead: {
        flexDirection: "row",
        justifyContent: "flex-start",
        padding: 15,
    },
    sideRead: {
        flexDirection: "column",
        width: 120,
        marginHorizontal:20,
    },
    discBox: {
        backgroundColor: colors.cream,
        borderColor: colors.nextDarkest,
        borderWidth: 4,
        borderRadius: 20,
        margin: 5,
        height: 120,
        width: "120%",
        fontFamily: fonts.body,
    },
    discButton: {
        backgroundColor: colors.teal,
        borderColor: colors.darkest,
        borderWidth:4,
        borderRadius: 12,
        alignContent: "center",
        justifyContent:"center",
        textAlign: "center",
        margin: 5,
        height: 45,
        width:"120%",
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
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: 5,
        margin: 5,
    },
    card: {
        fontFamily: fonts.heading,
        width: 120,
        height: 180,
        backgroundColor: colors.teal,
        borderColor: "black",
        margin: 15,
    },
    cardFont: {
        fontFamily: fonts.body,
        color: colors.darkest,
        lineHeight: 22,
        textAlign: "center",
        textAlignVertical: "center",

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
        marginBottom: 40,
    },
});
