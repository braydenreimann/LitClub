
import React from 'react';
import Foundation from '@expo/vector-icons/Foundation'; 
import { Platform, Pressable} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/headerWithSearch';
import { colors, fonts } from '../../theme';
import ReadingList from '../../components/ReadingList'; 
import TopThreeBooks from '../../components/TopThreeBooks';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert,Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Fonts } from '../../constants/theme';



function EditButton() {
    return (
        <Link href="/editProfilePage">
            <Foundation name="pencil" size={24} color="black" />
        </Link>
    );
}





export default function ProfileScreen() {
    {/*for the sake of the litclubs
       WITH BACKEND: implement this as a linked list of a users' joined book clubs */ }
    const clubNames = [
        "Gothic Horror Fans",
        "Grass is Green-er: Hank and John Fanclub",
        "Bookish Baddies" ,
        "ENGL 404",
        "a secret fifth option"
    ]
    const userClubs = Array.from({ length: 5 /*change to dynamic # book clubs*/ }, (_, i) => ({
        id: i,
        clubName: clubNames[i],
    }));


    return (
        <View style={{ flex: 1, backgroundColor: "#E4D7C8" }}> {/*background is cream*/}
            <Header />
            <ScrollView>
                <Text style={globalStyles.heading}> FirstName LastName {"\n"} </Text>
                <View style={globalStyles.profileHeader}>
                    <EvilIcons name="user" size={75} color="black" /> {/* profile icon TODO change to PFP */}
                    <View style={globalStyles.userBio }>
                        <Text style={globalStyles.subheading}> @username </Text>
                        <Text style={globalStyles.body}>this is my bio</Text>
                    </View>
                    <EditButton /> {/*be able to edit the bio */}
                </View>

                <View> {/*this is the part where we show the lists of the books*/}
                    <TopThreeBooks />
                    <Text style={globalStyles.subheading}>Currently Reading</Text>
                    <ReadingList /> {/* reading list for the currently reading*/}
                    <Text style={globalStyles.subheading}>Past Reads</Text>
                    <ReadingList /> {/* reading list for the Past Reads*/}
                    <Text style={globalStyles.subheading}>Saved for Later</Text>
                    <ReadingList /> {/* reading list for the Saved for Later*/}
                </View>

                {/*display the book clubs*/}
                <Text style={globalStyles.subheading}> My LitClubs </Text>
                <View style={globalStyles.cardGroup}>
                  
                    {
                        userClubs.map((userClub) => (
                            <Pressable
                                key={userClub.id}
                                style={globalStyles.litclubCard}
                                onPress={() => { Alert.alert('LitClub button pressed')/*TODO make the buttons go to their clubs*/ }} >
                                <Text style={globalStyles.cardFont} adjustsFontSizeToFit={true} >  {userClub.clubName} </Text>
                        </Pressable>
                    ))
                    }
                    </View>
            </ScrollView>
        </View>
    );
}




{/* /vidya's header and search bar
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

*/}


const globalStyles = StyleSheet.create({
    profileHeader: {
        flexDirection: "row",
        padding: 10,
        alignItems:"center",
    },
    userBio: {
        flexDirection: "column",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: colors.cream,
        padding: 16,
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
        justifyContent:"center",
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
    litclubCard: {
        width: 100,
        height: 100,
        aspectRatio: 1,
        backgroundColor: "#94A694", //sage green
        borderWidth: 4,
        borderRadius: 12,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        marginBottom: 5,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "black",
        textAlign: "center",
        textAlignVertical:"center",
    }
});