import { View, ScrollView, Text, Pressable, Alert, ActivityIndicator, Dimensions } from 'react-native';
import Header from '../components/headerWithSearch';
import { globalStyles } from '@/styles/globalStyles';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import {colors} from '../theme'
import { StyleSheet } from 'react-native';

import React, { use, useEffect, useState } from 'react';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { Book } from '@/domain/models';
import { getBooks } from '@/services/booksService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const NUM_COLUMNS = 3;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS; // 3 cards per row with margins

export default function bookPicksForClubs() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const preselected: Book[] = params?.preselected ? JSON.parse(params.preselected as string) : []; //match same formate

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>(preselected);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const { books: fetchedBooks } = await getBooks();
        setBooks(fetchedBooks);
      } catch (err) {
        console.error('Error loading book recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });
  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

// Toggle book selection handler  
    const toggleSelect = (book: Book) => {
        if (selectedBooks.find(b => b.id === book.id)) {
            setSelectedBooks(selectedBooks.filter(b => b.id !== book.id));
        } else {
            if (selectedBooks.length >= 10) {
                Alert.alert('Selection Limit', 'You can select up to 10 books only.');
                return;
            }
            setSelectedBooks([...selectedBooks, book]);
        }   
    };

  const handleConfirmSelection = async () => {
    router.push({
      pathname: '/createLitClub',
      params: { selectedBooks: JSON.stringify(selectedBooks)}
    })
  };
  
  if (loading) {
    return (
      <View style={[globalStyles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={colors.darkest}/>
      </View>
    );
  }
  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.heading, {textAlign:'center', alignContent: 'center', justifyContent: 'center'}]}>Select Books for Your Club to Read</Text>
      <Text style={[globalStyles.body, {textAlign: 'center', marginBottom: 20}]}> Pick between 1 and 10 books </Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.gridContainer}>
            {books.map(book => {
              const isSelected = selectedBooks.some(b => b.id === book.id);
              return (
                <Pressable
                  key={book.id}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected
                  ]}
                  onPress={() => toggleSelect(book)}
                >
                  <Link href={{ pathname: "/bookInfo", params: { id: book.id } }}>
                    <Text style={globalStyles.subheading}>{book.title}</Text>
                  </Link>
                </Pressable>
              );
            })}
            </View>
        </ScrollView>

        <Pressable
            style={globalStyles.button}
            onPress={handleConfirmSelection}
        >
            <Text style={[globalStyles.buttonText]}> 
                Confirm Selection ({selectedBooks.length})
            </Text>

        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 180,
    margin: CARD_MARGIN/2,
    backgroundColor: colors.yellow,
    borderColor: colors.darkest,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  cardSelected: {
    width: 120,
    height: 180,
    margin: CARD_MARGIN/2,
    backgroundColor: colors.teal,
    borderColor: colors.darkest,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scrollContainer: {
    paddingVertical: CARD_MARGIN,
    paddingHorizontal: CARD_MARGIN/1.5,
  },
});

