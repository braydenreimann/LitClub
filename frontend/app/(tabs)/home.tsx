//initial set up code borrowed from expo router template
// https://docs.expo.dev/tutorial/create-your-first-app/

import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';

import { colors, fonts } from '../../theme';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Header from '../../components/headerWithSearch';
import ReadingList from '@/components/ReadingList';
import { ScrollView } from 'react-native';
import { globalStyles } from '@/styles/globalStyles';

SplashScreen.preventAutoHideAsync();


export default function HomeScreen() {

  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });
  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header />
      <ScrollView>
        <View style={{ paddingLeft: 25, paddingTop: 45 }}>
          <Text style={globalStyles.heading}>
            My Bookshelf
          </Text>
        </View>

        { /*Shelf One*/}
        <Text style={[globalStyles.subheading, { fontSize: 25, paddingTop: 25, paddingHorizontal: 25 }]}>
          Currently Reading
        </Text>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList status = {1} />
        </View>

        { /*Shelf Two*/}
        <Text style={[globalStyles.subheading, { fontSize: 25, paddingTop: 25, paddingHorizontal: 25 }]}>
          Dog-Eared Books
        </Text>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList status = {2}/>
        </View>

        { /*Shelf Three*/}
        <Text style={[globalStyles.subheading, { fontSize: 25, paddingTop: 25, paddingHorizontal: 25 }]}>
          Past Reads
        </Text>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList status = {0}/>
        </View>

        { /*Shelf Four*/}
        <Text style={[globalStyles.subheading, { fontSize: 25, paddingTop: 25, paddingHorizontal: 25 }]}>
          Want to Read
        </Text>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList status = {3} />
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
