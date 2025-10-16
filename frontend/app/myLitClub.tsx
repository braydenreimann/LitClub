import React from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { Platform, Pressable } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../components/SearchBar';
import Header from '../components/headerWithSearch';
import { colors, fonts } from '../theme';
import ReadingList from '../components/ReadingList';
import TopThreeBooks from '../components/TopThreeBooks';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Fonts } from '../constants/theme';


function Jump2discButton() {
    return (
        <Pressable
            style={globalStyles.discButton}
            onPress={() => { Alert.alert('jumping to discussion...')/*TODO make the buttons go to their clubs*/ }} >
            <Text>Jump To Discussion</Text>
        </Pressable>

    );
}

export default function LitClubScreen() { //PRE_INTEGRATION: Tis will be a template page for all book clubs to go to
    return (
    <View style={{ flex: 1, backgroundColor: "#E4D7C8" }}> {/*background is cream*/}
            <Header />
            {/*TODO: make it not look like shit, add a back button or the things at the bottom to go to past pages*/}
        <ScrollView>
                <Text style={globalStyles.heading}> Book Club Name </Text>
                <Text style={globalStyles.body}> this is the bio for my LitClub! </Text> {/*TODO: are they able to change the bio??*/}
            <View style={globalStyles.leaderBanner}>
                    <Text> CLUB LEADER: </Text>
                    <EvilIcons name="user" size={75} color="black" /> {/* profile icon TODO change to PFP */}
                    <Text style={globalStyles.subheading}>@username</Text>
            </View>
                {/*currently reading section*/}
                <View style={globalStyles.currentRead}>
                    <View style={globalStyles.sideRead}>
                        {/*TODO: replace this card with the appropriate image*/}
                        <View style={globalStyles.card}>  </View>
                        <Text>Book Title</Text>
                    </View>
                    <View style={globalStyles.sideRead}>
                        <View style={globalStyles.discBox}>
                            <Text>This is our most recent discussion!</Text>
                        </View>
                        <Jump2discButton />
                    </View>

                  

                </View>





            <View> {/*this is the part where we show the lists of the books*/}
                <Text style={globalStyles.subheading}>Upcoming Reads</Text>
                <ReadingList /> {/* reading list for the club's upcoming reads*/}
                <Text style={globalStyles.subheading}>Past Reads</Text>
                <ReadingList /> {/* reading list for the Past Reads*/}
                
            </View>

          
            
        </ScrollView>
    </View>
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



const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.cream,
        padding: 16,
    },
    leaderBanner: {
        flexDirection:"row",
        width: "100%",
        height: 40,
        backgroundColor: "#F7C76C", //easter yellow
        fontFamily: "serif",
        fontSize: 30,
    },
    currentRead: {
        flexDirection:"row",
    },
    sideRead: {
        flexDirection:"column",
    },
    discBox: {
        backgroundColor: "#E4D7C8", //cream
        borderColor: "#193350",//second-to-darkest blue
        borderWidth: 4,
        borderRadius:12,
    },
    discButton: {
        backgroundColor: "#629FAE", //teal
        borderColor: "black",
        borderWidth:4,
        borderRadius: 12,
    },
    heading: {
        fontFamily: fonts.heading,
        fontSize: 32,
        color: colors.midBlue,
        marginBottom: 8,
    },
    subheading: {
        fontFamily: fonts.subheading,
        fontSize: 22,
        color: colors.midBlue,
        alignContent: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    body: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.darkest,
        lineHeight: 22,
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
        width: 120,
        height: 180,
        backgroundColor: "teal",
        borderColor: "black",
    },
    cardFont: {
        fontFamily: Fonts.sans,
        color: colors.darkest,
        lineHeight: 22,
        textAlign: "center",
        textAlignVertical: "center",

    },
});