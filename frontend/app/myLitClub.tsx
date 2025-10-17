import React from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { Platform, Pressable } from 'react-native';
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
                <EvilIcons name="chevron-left" size={50} color="#193350" marginLeft="20" marginBottom="10" />
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
    
    return (
        //<Stack screenOptions={{ headerShown: false }}>
        //*TODO: make it not look like shit, add a back button or the things at the bottom to go to past pages*/
        //{/*background is cream*/}
            <View style={{ flex: 1, backgroundColor: colors.cream }}> 
                <Header />
                
                <ScrollView>
                    <View style={{flexDirection:'row'} } >
                        <BackButton /> 
                        {/*TODO: eventually we should make 1 back button that world everywhere but that time is not now*/ }
                        <Text style={globalStyles.heading} > Book Club Name </Text>
                    </View>
                    <Text style={globalStyles.body}> 
                        Welcome to this LitClub! Here, we're discussing everything Stephen King -- 
                        working our way through his novels from the beginning to the end. We're happy
                        to have you!
                        
                        </Text> {/*TODO: are they able to change the bio??*/}
                    <View style={litStyles.leaderBanner}>
                        <Foundation name="crown" size={30} color="#193350" margin="5" marginTop="0" />
                        <Text style={globalStyles.subheading}> CLUB LEADER: </Text>
                        <Text style={globalStyles.subheading}>@username</Text>
                        <Foundation name="crown" size={30} color="#193350" margin="5" marginTop="0" />
                </View>
                    {/*currently reading section*/}
                    <View style={litStyles.currentRead}>
                        <View style={litStyles.sideRead}>
                            
                            <View style={globalStyles.card}>  
                                <Text style={[globalStyles.heading, { textAlign: 'center', textAlignVertical: 'center' , paddingTop: 40}]}>
                                    Book Title
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
                    <Text style={globalStyles.subheading}>Upcoming Reads</Text>
                    {/* reading list for the club's upcoming reads*/}
                    <ReadingList /> 
                    <Text style={globalStyles.subheading}>Past Reads</Text>
                    {/* reading list for the Past Reads*/}   
                    <ReadingList />    
                    <Text style={globalStyles.subheading}>Current Members</Text>
                    {/* TODO: INSERT CLUB MEMBERS HERE*/}
                    <ClubMembers />
                </View>        
                
            </ScrollView>
        </View>
    //</Stack>
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
        backgroundColor: colors.teal, //teal
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
        /*whiteSpace: 'nowrap',*/
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