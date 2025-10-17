import { View, ScrollView, Text, Pressable, Alert } from 'react-native';
import Header from '../../components/headerWithSearch';
import { globalStyles } from '@/styles/globalStyles';
import { Link } from 'expo-router';

import React from 'react';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useLitClubs } from '@/LitClubImport/LitClubContext';


export default function AllLitClubs() {
  // Example data
  const { litClubs, loading, error } = useLitClubs();

  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });
  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading clubs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error loading clubs: {error}</Text>
      </View>
    );
  }

  if (!litClubs.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No Clubs Found.</Text>
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: "#E4D7C8" }}>
      {/* HEADER at the top */}
      <Header />

      {/* SCROLLABLE content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* MAIN HEADING */}
        <Text style={globalStyles.heading}>All Available Lit Clubs</Text>

        {/* CARD GROUP */}
        <View style={globalStyles.cardGroup}>
          {litClubs.map((club) => (
            <Pressable
              key={club.id}
              style={globalStyles.litclubCard}
              onPress={() => Alert.alert('LitClub button pressed')}
            >
              <Link href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name },}} asChild>
                <Text style={globalStyles.cardFont} adjustsFontSizeToFit>
                  {club.name}
                </Text>
              </Link>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
