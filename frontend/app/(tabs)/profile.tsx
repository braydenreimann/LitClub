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
import SearchBar from '@/components/SearchBar';
import Header from '../../components/headerWithSearch';

export default function ProfileScreen() {
  return (
    // TO DO: insert header at the top, which will include the logo and search bar
    <View style={{ flex: 1 }}>
      <Header />

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

    </View>
  );
}

const styles = StyleSheet.create({
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#E4D7C8',
    justifyContent: 'flex-start',
  },
  headerImage: {
    width: 80,
    height: 180,
    resizeMode: 'contain',
  },
  header: {
    backgroundColor: '#94a694',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 70,
    paddingLeft: 20,
    height: 120,
  },
});