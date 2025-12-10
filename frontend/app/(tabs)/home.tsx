/* app/(tabs)/home.tsx */

import { StyleSheet, View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFocusEffect } from 'expo-router';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';

import { colors } from '../../theme';
import Header from '../../components/headerWithSearch';
import { globalStyles } from '@/styles/globalStyles';
import BookShelf from '@/components/BookShelf';

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header />
      <ScrollView>
        <BookShelf refreshKey={refreshKey} />
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
