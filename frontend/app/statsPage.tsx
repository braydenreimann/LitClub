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
function BackButton() {
    return (
        <Pressable>
            <Link href="/profile">
                <EvilIcons name="chevron-left" size={50} color="#193350" marginLeft="20" marginBottom="10" />
            </Link>
        </Pressable>

    );
}

export default function StatsScreen() { //PRE_INTEGRATION: Tis will be a template page for all book clubs to go to
    return (
        <View style={{ flex: 1, backgroundColor: "#E4D7C8" }}> {/*background is cream*/}
            <Header />
            {/*TODO: make it not look like shit, add a back button or the things at the bottom to go to past pages*/}
            <ScrollView>
                <View style={{ flexDirection: 'row' }} >
                    <BackButton /> {/*TODO: eventually we should make 1 back button that world everywhere but that time is not now*/}
                    <Text style={globalStyles.heading} > Reading Statistics </Text>
                </View>
                <Text style={globalStyles.body}> this is the bio for my LitClub! </Text> {/*TODO: are they able to change the bio??*/}
                <View style={globalStyles.leaderBanner}>
                    <Foundation name="crown" size={30} color="#193350" margin="5" marginTop="0" />
                    <Text style={globalStyles.subheading}> CLUB LEADER: </Text>
                    <Text style={globalStyles.subheading}>@username</Text>
                    <Foundation name="crown" size={30} color="#193350" margin="5" marginTop="0" />
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
        flexDirection: "row",
        width: "100%",
        height: 40,
        backgroundColor: "#F7C76C", //easter yellow
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
    sideRead: {
        flexDirection: "column",
        width: 120,
        marginHorizontal: 20,
    },
    discBox: {
        backgroundColor: "#E4D7C8", //cream
        borderColor: "#193350",//second-to-darkest blue
        borderWidth: 4,
        borderRadius: 12,
        margin: 5,
        marginTop: 20,
        height: 120,
        width: "120%",
    },
    discButton: {
        backgroundColor: "#629FAE", //teal
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
        margin: 15,
    },
    cardFont: {
        fontFamily: Fonts.sans,
        color: colors.darkest,
        lineHeight: 22,
        textAlign: "center",
        textAlignVertical: "center",

    },
});