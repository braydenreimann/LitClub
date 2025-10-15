import React from 'react';
import { StyleSheet } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation'; //imported from react
import { Platform} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
//import ProfilePic from '@../../assets/images/userprofile_icon.png';
import SearchBar from '../../components/SearchBar';
import Header from '@/components/headerWithSearch';
import { colors, fonts } from '../../theme';
import ReadingList from '@/components/ReadingList'; //pull in Vidya's reading list
import TopThreeBooks from '@/components/TopThreeBooks';
import { View, Text, FlatList, ScrollView } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';



function EditButton() {
    return (
        <button>
            <Foundation name="pencil" size={24} color="black" />
            Edit
        </button>
    );
}



export default function ProfileScreen() {
    return (
        <View>
            <Text style={globalStyles.heading}> FirstName LastName {"\n"} </Text>
            <EvilIcons name="user" size={24} color="black" /> {/* profile icon */ }
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

            <View> {/* book clubs*/}



            </View>

        </View>
    )
}




//vidya's header and search bar
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



//initial set up code borrowed from expo router template
// https://docs.expo.dev/tutorial/create-your-first-app/



export const globalStyles = StyleSheet.create({
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
});