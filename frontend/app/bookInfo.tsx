import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Platform, Pressable, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '../components/SearchBar';
import Header from '../components/headerWithSearch';
import { colors, fonts } from '../theme';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import BookStatusDropdown from '@/components/BookStatusDropdown';
import HiddenStatusDropdown from '@/components/HiddenStatusDropdown'
import { Entypo } from '@expo/vector-icons'; // for dropdown arrow
import { globalStyles } from '@/styles/globalStyles';

import { Book } from '../interfaces/interfaces';
import { getBook } from '../services/bookService';

//playing around with importing the book

export interface bookImport {
    title: string;
    author: string;
    totalchapters: number;
    genre: string;
    description?: string;
}



//buttons for the book info screen
function ToCButton() {
    return (
        <Pressable
            style={infoStyle.ToCButton}
            onPress={() => { Alert.alert('Displaying TOC...')/*TODO make the buttons go to their clubs*/ }} >
            <Text style={[globalStyles.subheading, {fontSize: 16, color: colors.nextDarkest, fontFamily: fonts.subheading, paddingTop: 5, paddingLeft: 5}]}>Table of Contents</Text>
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

export default function BookInfoScreen() { //PRE_INTEGRATION: Tis will be a template page for all book clubs to go to

    const { id } = useLocalSearchParams<{ id: string}>(); // When button pressed, params are sent. This function saves those params for usage. Needs to be type string.

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { //fetch book for the page
        const fetchBook = async () => {
            try {
                const data = await getBook(id);
                setBook(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    const handlePrivacyChange = (newPrivacyStatus: string) => {
        setIsPublic(newPrivacyStatus === "Public");
        console.log("Privacy status changed to:", newPrivacyStatus);
        // TODO: send newPrivacyStatus to Cosmos DB later
    };
    const handleStatusChange = (newStatus: string) => {
        console.log("Book status changed to:", newStatus);
        // TODO: send newStatus to Cosmos DB later
    };

   const [isPublic, setIsPublic] = useState(true);

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}> {/*background is cream*/}
            <Header />
            {/*TODO: make it not look like shit, add a back button or the things at the bottom to go to past pages*/}
            <ScrollView>
                <View style={{flexDirection:'row'} } >
                    <BackButton /> {/*TODO: eventually we should make 1 back button that world everywhere but that time is not now*/ }
                    <Text style={globalStyles.heading} > Book Information </Text>
                </View>

                <View style={infoStyle.currentRead}>
                    <View style={infoStyle.sideSect} >

{/* Book Container */}
      <View style={infoStyle.bookContainer}>
        {/* Placeholder for book image */}
        <View style={infoStyle.bookImage}>
          <Entypo
            name={isPublic ? "eye" : "eye-with-line"}
            size={24}
            color={isPublic ? colors.midBlue : colors.midBlue}
            style={infoStyle.eyeIcon}
          />
        </View>

      </View>


                        <View style={{ flexDirection: "row" }}>
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                            <FontAwesome name="star" size={24} color={colors.midBlue} />
                        </View>
                    </View>

                    <View style={infoStyle.sideSect}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.midBlue} />
                        ) : book ? (
                            <>
                                <Text style={globalStyles.heading}>{book.title}</Text>
                                <Text style={globalStyles.subheading}>{book.author}</Text>
                                <Text style={globalStyles.body}>{book.description}</Text>
                            </>
                        ) : (
                            <Text style={globalStyles.body}>Book information not available.</Text>
                        )}
                        <ToCButton />
                    </View>
                </View>
                    <Pressable
                    style={infoStyle.forumBox}
                    onPress={() => { Alert.alert('Forums to be implemented later...')/*TODO make the buttons go to their clubs}*/ }} >
                        <Text style={[globalStyles.body, {fontSize: 14, color: colors.midBlue}]}>This is our most recent discussion!</Text>
                    </Pressable>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>

  {/* Library Status */}
  <View style={{ flex: 1 }}>
    <Text style={globalStyles.subheading}>Library Status</Text>
    <View style={infoStyle.dropdownWrapper}>
      <BookStatusDropdown onStatusChange={handleStatusChange} />
      <Entypo name="chevron-down" size={20} color="#224B6F" style={infoStyle.dropdownIcon} />
    </View>
  </View>

  {/* Visibility */}
  <View style={{ flex: 1 }}>
    <Text style={globalStyles.subheading}>Visibility</Text>
    <View style={infoStyle.dropdownWrapper}>
      <HiddenStatusDropdown onStatusChange={handlePrivacyChange} />
      <Entypo name="chevron-down" size={20} color="#224B6F" style={infoStyle.dropdownIcon} />
    </View>
  </View>
</View>

        </ScrollView>
    </View>
    );
}


const infoStyle = StyleSheet.create({

    bookContainer: {
    width: 150,
    height: 220,
    backgroundColor: colors.cream,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.midBlue,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  bookImage: {
    width: 120,
    height: 160,
    backgroundColor: colors.teal,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },

    leaderBanner: {
        flexDirection:"row",
        width: "100%",
        height: 40,
        backgroundColor: colors.yellow, //easter yellow
        fontFamily: "serif",
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
    sideSect: {
        flexDirection: "column",
        width: 120,
        marginHorizontal:20,
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
    ToCButton: {
        backgroundColor: colors.teal,
        borderColor: "black",
        borderWidth:4,
        borderRadius: 12,
        alignContent: "center",
        justifyContent:"center",
        textAlign: "center",
        margin: 5,
        height: 45,
        width:"120%",

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
    forumBox: {
        backgroundColor: colors.cream,
        borderWidth: 2,
        borderColor: colors.nextDarkest,
    },

    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // adjust spacing if needed
        gap: 20, // space between dropdowns
        marginVertical: 10,
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 0, // dropdowns don’t stretch
    },
    dropdownWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.midBlue,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    dropdownIcon: {
        marginLeft: 5,
    },
});