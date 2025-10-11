import React from 'react';


//here is me playing around with shit that I don't understand



function EditButton() {
    return (
        <button>
        //image:pencil
            Edit
        </button>
    );
}

//overall profile page
export default function profile() {
    return (
        //header
        <div>
            <h1>firstname lastname</h1>
            <img className="profile"/> 
            <h2>@user.username</h2>
            <p> user.bio</p>
            <EditButton />
        </div>
        //book sections
        <div>
        </div>
     
    );
}
function BookSection({ title, books }) {
    return (
        <div>
            <h1>
            title
            </h1>
            //implement scrollable menu like https://www.w3schools.com/howto/howto_css_menu_horizontal_scroll.asp in CSS
            <p>
                book1
                book2
                book3
            </p>

        </div>
    );
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
//past reacds centered heading
//scroll left right past reads
//divider
//saved for later centered heading
//scroll left right saved for later
//divider
//your LitClubs
//footer with the default buttons on it



//initial set up code borrowed from expo router template
// https://docs.expo.dev/tutorial/create-your-first-app/

import { Platform, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { Image } from 'expo-image';
//import ProfilePic from '@../../assets/images/userprofile_icon.png';

export default function ProfileScreen() {
    return (
        // TO DO: insert header at the top, which will include the logo and search bar

        <ParallaxScrollView
            headerImage={
                <Image
                    source={require('@/assets/images/header-image-temporary.png')}
                    style={styles.headerImage}
                />
            }
            headerBackgroundColor={{
                dark: '#211F3E',
                light: '#E4D7C8',
            }}
        >
            <ThemedView style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('@/assets/images/userprofile_icon.png')}
                        style={styles.image}
                    />
                </View>
                <ThemedText type="title">Firstname Lastname</ThemedText>
                <ThemedText type="subtitle">@username</ThemedText>

            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E4D7C8',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    imageContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    image: {
        width: 150,
        height: 150,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        borderRadius: 75,
    },
    text: {
        color: '#211F3E',
    },
    headerImage: {
        width: '100%',
        height: 140,
        resizeMode: 'contain',
    },
});