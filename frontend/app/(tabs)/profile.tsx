import React from 'react';
import StyleSheet from '../../styles/globalStyles';
import Foundation from '@expo/vector-icons/Foundation'; //imported from react
import { Platform} from 'react-native';
import ParallaxScrollView from '../../components/parallax-scroll-view';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { Image } from 'expo-image';
//import ProfilePic from '@../../assets/images/userprofile_icon.png';
import SearchBar from '@/components/SearchBar';
import Header from '../headerWithSearch';
import { colors, fonts } from '../theme';


function EditButton() {
    return (
        <button>
            <Foundation name="pencil" size={24} color="black" />
            Edit
        </button>
    );
}

type Books = { //allow the books to be displayed on the screen
    title: string;
    coverUrl: string;
}

type SectionProps = { //a section has a title ans list of books in that section
    name: string;
    list: Books[];
}

function BookSection({name, list}: SectionProps) {
    return (
        <View style={styles}>
            <Heading> {name}</Heading>
            //implement scrollable menu like https://www.w3schools.com/howto/howto_css_menu_horizontal_scroll.asp in CSS
                for(let i = 0; i < list.length; i++) {
                    <View style={styles.scrollingWrapper}>
            <ScrollView style={styles.scrollContainer} horizontal={true} showsHorizontalScrollIndicator={true}>
                {/* cards that scroll horizontally */}
                <View style={styles.card}>
                    <Text>{list[i].name}</Text>
                    //add the cover image
                </View>
            } //exit javascript mode
        </View>
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



export default function ProfileScreen() {
    return (
        // TO DO: insert header at the top, which will include the logo and search bar
        <View>
         <Header />
        <ParallaxScrollView>
            <ThemedView style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('@/assets/images/userprofile_icon.png')}
                        style={styles.image}
                    />
                </View>
                <heading type="title">Firstname Lastname</heading>
                <ThemedText type="subtitle">@username</ThemedText>
                <EditButton />   
          


<BookSection
name="Your Top Three"
list={{"Six of Crows","https://upload.wikimedia.org/wikipedia/en/1/10/Six_of_Crows_by_Leigh_Bardugo_book_cover.jpeg"}, 
{"Atonement", "https://upload.wikimedia.org/wikipedia/en/6/6d/Atonement_%28novel%29.jpg"},
{"The Fault in Our Stars","https://upload.wikimedia.org/wikipedia/en/a/a9/The_Fault_in_Our_Stars.jpg" }   }
/>

<BookSection
name="Currently Reading"
list={{"Gideon the Ninth", "https://m.media-amazon.com/images/I/81UgIZXiolL._UF1000,1000_QL80_.jpg"} 
}
/>

<BookSection
name="Past Reads"
list={{}
}
/>

<BookSection
name="Saved for Later"
list{{}
}
/>


  </ThemedView>
        </ParallaxScrollView>
        </View>
    );
}




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
        whiteSpace: 'nowrap',
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