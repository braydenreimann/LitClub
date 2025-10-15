//initial set up code borrowed from expo router template
// https://docs.expo.dev/tutorial/create-your-first-app/

import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Header from '../../components/headerWithSearch';
import ReadingList from '@/components/ReadingList';
import { ScrollView } from 'react-native';


export default function HomeScreen() {

  return (
    <View style={{ flex: 1, backgroundColor: "#E4D7C8" }}>
      <Header />
      <ScrollView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: 'System' }}>
            My Bookshelf
          </ThemedText>
        </ThemedView>

        { /*Shelf One*/}
        <ThemedText type="defaultSemiBold" style={{ fontFamily: 'System', fontSize: 25, paddingTop: 45, paddingHorizontal: 25 }}>
          Currently Reading
        </ThemedText>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList />
        </View>

        { /*Shelf Two*/}
        <ThemedText type="defaultSemiBold" style={{ fontFamily: 'System', fontSize: 25, paddingHorizontal: 25, paddingTop: 45 }}>
          Dog-Eared Books
        </ThemedText>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList />
        </View>

        { /*Shelf Three*/}
        <ThemedText type="defaultSemiBold" style={{ fontFamily: 'System', fontSize: 25, paddingHorizontal: 25, paddingTop: 45 }}>
          Past Reads
        </ThemedText>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList />
        </View>

        { /*Shelf Four*/}
        <ThemedText type="defaultSemiBold" style={{ fontFamily: 'System', fontSize: 25, paddingHorizontal: 25, paddingTop: 45 }}>
          My Personalized Bookshelf
        </ThemedText>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: 25,
    paddingTop: 50,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
