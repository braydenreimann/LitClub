import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import { Link, router, useRouter } from 'expo-router';
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

export const GENRES = [
    'Fantasy', 'Romance', 'Fiction', 'Science-Fiction', 'Drama', 'Mystery', 'Non-Fiction', 'Thriller', 'Horror', 'Historical', 'Poetry', 'Biography', 'Memoir', 'Young Adult', 'True Crime', 'Science', 'Western Fiction', 'Philopshical', 'Action Fiction'
];

interface GenresSelectorProps {
    selected: string[];
    onChange: (newSelection: string[]) => void;
    maxSelectable?: number;
}

export function GenresSelector({ selected, onChange, maxSelectable = 5 }: GenresSelectorProps) {
    const toggleGenre = (genre: string) => {
        if (selected.includes(genre)) {
            onChange(selected.filter((g) => g !== genre));
        } else if (selected.length < maxSelectable) {
            onChange([...selected, genre]);
        }
    };

    const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
      });
      React.useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
      }, [fontsLoaded]);

    return (
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
                    })
                }
            </View>
    )
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
    borderWidth: 2,
    borderColor: colors.midBlue,
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
    backgroundColor: colors.teal,
    borderColor: colors.midBlue,
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


