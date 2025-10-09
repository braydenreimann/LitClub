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
                dark: '#94a694',
                light: '#e4dbc8',
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