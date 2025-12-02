import { View, ScrollView, Text, Pressable, Alert, ActivityIndicator, Dimensions, Image } from 'react-native';
import Header from '../components/headerWithSearch';
import { globalStyles } from '@/styles/globalStyles';
import { Link } from 'expo-router';
import { colors } from '../theme'
import { StyleSheet } from 'react-native';

import React, { use, useEffect, useState } from 'react';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { Book } from '@/domain/models';
import { getBooks } from '@/api/services/booksService';
import { getUriRead } from '@/api/services/imagesService';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const NUM_COLUMNS = 3;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS; // 3 cards per row with margins

export default function BookRecs() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverUris, setCoverUris] = useState<string[]>([]);

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

  useEffect(() => {
    let alive = true;

    const loadBooksWithCovers = async () => {
      try {
        const { books: fetchedBooks } = await getBooks();

        // Fetch all cover URIs
        const uris = await Promise.all(
          fetchedBooks.map(book => getUriRead(book.coverImageUrl))
        );

        if (alive) {
          setBooks(fetchedBooks);
          setCoverUris(uris.map(uri => uri || "")); // store in array
        }
      } catch (err) {
        console.error("Error loading books:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadBooksWithCovers();

    return () => { alive = false; };
  }, []);

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
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.darkest} />
      </View>
    );
  }
  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.heading, { alignContent: 'center', justifyContent: 'center' }]}>Book Recommendations</Text>
      {books.length === 0 ? (
        <Text style={globalStyles.body}>No book recommendations available at the moment.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.gridContainer}>
            {books.map((book, index) => (
              <Pressable key={book.id} style={styles.card}>
                <Link href={{ pathname: "/bookInfo", params: { id: book.id } }}>
                  {coverUris[index] ? (
                    <Image
                      source={{ uri: coverUris[index] }}
                      style={styles.bookImage}
                    />
                  ) : (
                    <Text style={globalStyles.subheading}>{book.title}</Text>
                  )}
                </Link>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 180,
    margin: CARD_MARGIN / 2,
    backgroundColor: colors.yellow,
    borderColor: colors.darkest,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  bookImage: {
    width: 120,
    height: 160,
    backgroundColor: colors.teal,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scrollContainer: {
    paddingVertical: CARD_MARGIN,
    paddingHorizontal: CARD_MARGIN / 1.5,
  },
});

