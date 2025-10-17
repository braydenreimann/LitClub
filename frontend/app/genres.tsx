import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import { Link, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';


import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/headerWithSearch';
import ReadingList from '@/components/ReadingList';
import { ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native'
import { colors, fonts } from '../theme.js'
import { globalStyles } from '@/styles/globalStyles';

const Stack = createNativeStackNavigator();

const GENRES = [
    'Fantasy', 'Romance', 'Fiction', 'Science-Fiction', 'Drama', 'Mystery', 'Non-Fiction', 'Thriller', 'Horror', 'Historical', 'Poetry', 'Biography', 'Memoir', 'Young Adult', 'True Crime', 'Science', 'Western Fiction', 'Philopshical', 'Action Fiction'
];

function GenreSelection() {
    const [selected, setSelected] = useState<string[]>([]);
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
      });
      React.useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
      }, [fontsLoaded]);

    //check if the genre selected, if it is, remove it from the selected array
    // if not, check if user has picked fewer than 5 genres -> if yes, add genre to selected, if no, ignore the tap
    const toggleGenre = (genre: string) => {
        setSelected((prev: string[]) => {
            if (prev.includes(genre)) {
                return prev.filter((g) => g !== genre);
            } else if (prev.length < 5) {
                return [...prev, genre];
            } else {
                return prev;
            }
        });
    };

    const handleContinue = () => {
        console.log('Selected genres:', selected);
        router.push('/home'); //navigate to the next screen (which is home page)
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.cream }}>
            <Text style={[globalStyles.heading, {padding: 25}]}>Select your top 5 genres</Text>

            <View style={styles.genreContainer}>
                {GENRES.map((genre) => {
                    const isSelected = selected.includes(genre);
                    return (
                        <TouchableOpacity key={genre} onPress={() => toggleGenre(genre)} style={[styles.genreButton, isSelected && styles.genreSelected]}>
                            <Text style={[globalStyles.body, isSelected && styles.genreTextSelected]}>
                                {genre}
                            </Text>
                        </TouchableOpacity>
                    );
                    }   )
                }
            </View>

            <Text style={[globalStyles.body, { fontSize: 12, paddingTop: 15, paddingLeft: 5, paddingBottom:10 }]}> {selected.length}/5 selected</Text>

            <TouchableOpacity onPress={handleContinue} disabled={selected.length === 0} style={[styles.continueButton, selected.length === 0 && { backgroundColor: '#ccc'},]}>
                <Text style={[globalStyles.subheading, {fontSize: 16, paddingTop: 5, }]}>Continue</Text>
            </TouchableOpacity>
        </ScrollView>
    )
    
}

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // hide the header
      }}
    >
      <Stack.Screen name="RecommendedBooks" component={GenreSelection} />
    </Stack.Navigator>
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
    backgroundColor: colors.cream,
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
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genreButton: {
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    margin: 6,
  },
  genreText: {
    color: '#333',
  },
  genreTextSelected: {
    color: '#fff', 
    fontWeight: '600',
  },
  genreSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  continueButton: {
    borderRadius: 20,
    width: 120,
    backgroundColor: colors.teal,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
  }
});


