// /frontend/app/(whatever)/HomeScreen.tsx (path may differ)

import { StyleSheet, View, ScrollView, Text } from 'react-native';
import React, { useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFocusEffect } from 'expo-router';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';

import { colors } from '../../theme';
import Header from '../../components/headerWithSearch';
import ReadingList from '@/components/ReadingList';
import { globalStyles } from '@/styles/globalStyles';

SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });

  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Refetch lists whenever this tab/screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey((k) => k + 1);
      return undefined;
    }, [])
  );

  // Status mapping (from backend ShelfStatusContract: 0 | 1 | 2 | 3)
  // 0 = Past Reads
  // 1 = Currently Reading
  // 2 = (Hiatus / Not in use yet)
  // 3 = Future Reads

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header />
      <ScrollView>
        <View style={{ paddingLeft: 25, paddingTop: 45 }}>
          <Text style={globalStyles.heading}>My Bookshelf</Text>
        </View>

        {/* Shelf One */}
        <Text
          style={[
            globalStyles.subheading,
            { paddingTop: 25, paddingHorizontal: 25 },
          ]}
        >
          Currently Reading
        </Text>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList status={1} refreshKey={refreshKey} />
        </View>

        {/* Shelf Two */}
        <Text
          style={[
            globalStyles.subheading,
            { paddingTop: 25, paddingHorizontal: 25 },
          ]}
        >
          Future Reads
        </Text>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList status={2} refreshKey={refreshKey} />
        </View>

        {/* Shelf Three */}
        <Text
          style={[
            globalStyles.subheading,
            { paddingTop: 25, paddingHorizontal: 25 },
          ]}
        >
          Past Reads
        </Text>
        <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 5 }}>
          <ReadingList status={3} refreshKey={refreshKey} />
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
