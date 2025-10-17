import { View, ScrollView, Text, Pressable, Alert } from 'react-native';
import Header from '../components/headerWithSearch';
import { globalStyles } from '@/styles/globalStyles';
import { Link } from 'expo-router';
import {colors} from '../theme'

import React from 'react';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';

export default function BookReccs() {
  // Example data
  const bookNames = [
    "Books for dummies",
    "Six of Crows",
    "Crooked Kingdom", 
    "Crabs and Carcinization",
    "The inevitability of crabs",
    "We will all turn into Crabs",
    "Fish",
    "Fish 2",
    "Fish 3: The Threquel",
    "To Fish or Not To Fish",
    "Hamlet",
    "Hamlet 2",
    "Macbeth",
    "A Midsummer Night's Dream",
    "Anything Goes",
    "Ninth House",
    "Doors of Sleep", 
    "Crush",
    "War of the Foxes",
    "I do Know Some Things",
    "Mister Magic",
    "Hell Bent",
    "Fun Home", 
    "Tomorrow and Tomorrow and Tomorrow",
    "Today", 
    "Black Sun",
    "Say Nothing",
    "Dead interesting",
    "Weyward",
    "On Earth We're Briefly Gorgeous",
    "Body's a Bad Monster",
    "The Raven Boys"
  ];

  const allBooks = Array.from({ length: bookNames.length }, (_, i) => ({
    id: i,
    bookName: bookNames[i],
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
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* HEADER at the top */}
      <Header />

      {/* SCROLLABLE content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* MAIN HEADING */}
        <Text style={globalStyles.heading}>Book Recommendations:</Text>

        {/* CARD GROUP */}
        <View style={globalStyles.cardGroup}>
          {allBooks.map((book) => (
            <Pressable
              key={book.id}
              style={globalStyles.litclubCard}
              onPress={() => Alert.alert('LitClub button pressed')}
            >
              <Link href="/bookInfo">
                <Text style={globalStyles.cardFont} adjustsFontSizeToFit>
                  {book.bookName}
                </Text>
              </Link>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
