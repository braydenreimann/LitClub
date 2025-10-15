
import React from 'react';
import { StyleSheet } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation'; 
import { Platform} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../../components/SearchBar';
import Header from '../../components/headerWithSearch';
import Header from '@/components/headerWithSearch';
import { colors, fonts } from '../../theme';
import ReadingList from '../../components/ReadingList'; 
import TopThreeBooks from '../../components/TopThreeBooks';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import ReadingList from '@/components/ReadingList'; //pull in Vidya's reading list
import TopThreeBooks from '@/components/TopThreeBooks';
import { View, Text, FlatList, ScrollView } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';



function EditButton() {
    return (
        <Link href="/editProfilePage">
            <Foundation name="pencil" size={24} color="black" />
        </Link>
    );
}



export default function ProfileScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: "#E4D7C8" }}>
            <Header />
            <ScrollView>
                <Text style={globalStyles.heading}> FirstName LastName {"\n"} </Text>
                <EvilIcons name="user" size={24} color="black" /> {/* profile icon */}
                <Text style={globalStyles.subheading}> @username {"\n"} </Text>
                <Text style={globalStyles.body}>this is my bio</Text>
                <EditButton /> {/*be able to edit the bio */}

                <View> {/*this is the part where we show the lists of the books*/}
                    <TopThreeBooks />
                    <Text style={globalStyles.subheading}>Currently Reading</Text>
                    <ReadingList /> {/* reading list for the currently reading*/}
                    <Text style={globalStyles.subheading}>Past Reads</Text>
                    <ReadingList /> {/* reading list for the Past Reads*/}
                    <Text style={globalStyles.subheading}>Saved for Later</Text>
                    <ReadingList /> {/* reading list for the Saved for Later*/}
                </View>

                

                {/* book clubs*/}

            </ScrollView>
            <View> {/* book clubs*/}



            </View>

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
        //whiteSpace: 'nowrap',
        padding: 10,
    }, 
    scrollingWrapper: {
        flex: 1,
    },
    card: {
        width: 120,
        height: 180,
        marginRight: 10,
        backgroundColor: "teal",
        borderColor: "black",
    },
    clubCard: {
        width: 100,
        height: 100,
        marginRight: 6,
        marginLeft: 6,
        backgroundColor: "sage",
        borderColor:"black",
    }
});