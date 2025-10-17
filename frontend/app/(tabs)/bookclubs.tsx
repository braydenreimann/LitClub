import { View, ScrollView, Text, Pressable, Alert } from 'react-native';
import Header from '../../components/headerWithSearch';
import { globalStyles } from '@/styles/globalStyles';
import { Link } from 'expo-router';

import React from 'react';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';

export default function AllLitClubs() {
  // Example data
  const clubNames = [
    "Horror Fans",
    "The Clue Crew: Mystery Lovers",
    "Live, Laugh, Love: All Suburban Moms",
    "Romantasy Rats",
    "Sleuths Incorporated",
    "Martha Stewart Cookbook Cook Throughs",
    "Richard Siken Enjoyers",
    "The Intersection of Sci Fi and Cool Bugs",
    "Improv Comedy and You: every funny book ever",
    "Actually Interesting Nonfiction",
    "Obama's Book List",
    "Books about Bugs",
    "Gothic Horror Fans",
    "Grass is Green-er: Hank and John Fanclub",
    "Bookish Baddies",
    "ENGL 404",
  ];

  const userClubs = Array.from({ length: clubNames.length }, (_, i) => ({
    id: i,
    clubName: clubNames[i],
  }));

      const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
      });
      React.useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
      }, [fontsLoaded]);

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
          {userClubs.map((userClub) => (
            <Pressable
              key={userClub.id}
              style={globalStyles.litclubCard}
              onPress={() => Alert.alert('LitClub button pressed')}
            >
              <Link href="/myLitClub">
                <Text style={globalStyles.cardFont} adjustsFontSizeToFit>
                  {userClub.clubName}
                </Text>
              </Link>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
