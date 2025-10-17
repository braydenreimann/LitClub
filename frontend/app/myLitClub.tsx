import React from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Link, Stack } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../components/SearchBar';
import Header from '../components/headerWithSearch';
import { colors, fonts } from '../theme';
import ReadingList from '../components/ReadingList';
import TopThreeBooks from '../components/TopThreeBooks';
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
    return (
        <Pressable>
            <Link href="/profile">
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
    const { litClubs, loading, error } = useLitClubs();

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

    return (
            <ScrollView style={{ flex: 1, backgroundColor: colors.cream }}> 
                    <View style={{flexDirection:'row', paddingTop: 25 } } >
                        <BackButton /> 
                        <Text style={[globalStyles.heading, { paddingTop: 0 }]}>{club.name}</Text>
                    </View>

                    <Text style={globalStyles.body}> 
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
                                <Text style={[globalStyles.heading, { textAlign: 'center', textAlignVertical: 'center' , paddingTop: 50, fontSize: 28}]}>
                                    Current Book
                                </Text>
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
                    <Text style={globalStyles.subheading}>Preferred Genres</Text> 
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20 }}>
                        {(club.preferredGenres || []).map((genre, idx) => (
                        <Text key={idx} style={[globalStyles.body, { marginRight: 10 }]}>#{genre}</Text>
                        ))}
                    </View>

                    <Text style={globalStyles.subheading}>Upcoming Reads</Text>
                    {/* reading list for the club's upcoming reads*/}
                    <ReadingList status={0} /> 
                    <Text style={globalStyles.subheading}>Past Reads</Text>
                    {/* reading list for the Past Reads*/}   
                    <ReadingList status={0} />    
                    <Text style={globalStyles.subheading}>Current Members</Text>
                    {/* TODO: INSERT CLUB MEMBERS HERE*/}
                    <ClubMembers />
                </View>        
                
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
});