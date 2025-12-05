import { View, ScrollView, Text, Pressable, ActivityIndicator, Dimensions, Image, TextInput } from 'react-native';
import { globalStyles } from '@/styles/globalStyles';
import { useRouter } from 'expo-router';
import { colors } from '../theme'
import { StyleSheet } from 'react-native';

import React, { useEffect, useState } from 'react';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { Book } from '@/domain/models';
import { getBooks } from '@/api/services/booksService';
import { getUriRead } from '@/api/services/imagesService';
import { pushBookDetail } from '@/navigation/routes';
import { searchBooks, searchUsers } from '@/services/searchservice';

Dimensions.get('window');
const CARD_MARGIN = 10;


export default function BookRecs() {
   const [searchInput, setSearchInput] = useState("");
   const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState("");
    const [bookResults, setBookResults] = useState<Book[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverUris, setCoverUris] = useState<string[]>([]);
  const router = useRouter();

    useEffect(() => {
        if (!query.trim()) {
            setBookResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const books = await searchBooks(query);
            setBookResults(books ?? []);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        const loadBooks = async () => {
            try {
            let all: Book[] = [];
            let token: string | null | undefined = undefined;

            while (true) {
                const { books, continuationToken } = await getBooks(token);
                all = [...all, ...books];

                if (!continuationToken) break; // Done
                token = continuationToken;
            }

            const sorted = all.sort((a, b) => a.title.localeCompare(b.title));
            setBooks(sorted);
            } catch (err) {
            console.error("Error loading books:", err);
            } finally {
            setLoading(false);
            }
        };

        loadBooks();
        }, []);

    const visible = query.trim() ? bookResults : books; 

    useEffect(() => {
        const loadCovers = async () => {
            if (!visible || visible.length === 0) {
                setCoverUris([]);
                return;
            }

            const uris = await Promise.all(
                visible.map(book => getUriRead(book.coverImageUrl))
            );

            setCoverUris(uris.map(uri => uri || ""));
        };

        loadCovers();
    }, [visible]);

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
    const handleBookPress = (bookId: string) => {
        setIsFocused(false);
        setSearchInput('');
        setQuery('');
        pushBookDetail(router, bookId);
    };

   // Either shows results of query, or shows default book list in the abscense of a query.

    return (
        <View style={globalStyles.container}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.darkest} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    
                    <Text style={[globalStyles.heading, { textAlign: 'center', marginBottom: 10 }]}>
                        Book Recommendations
                    </Text>

                    
                    <View style={styles.searchBarWrapper}>
                        <TextInput
                            style={styles.searchBar}
                            placeholder="Search"
                            placeholderTextColor={colors.midBlue}
                            value={searchInput}
                            onChangeText={(text) => {
                                setSearchInput(text);
                                setQuery(text);
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </View>

                    
                    {books.length === 0 ? (
                        <Text style={globalStyles.body}>
                            No book recommendations available at the moment.
                        </Text>
                    ) : (
                        <View style={styles.gridContainer}>
                            {visible.map((book, index) => (
                                <View key={book.id} style={styles.card}>
                                    <Pressable
                                        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}
                                        onPress={() => pushBookDetail(router, book.id)}
                                    >
                                        {coverUris[index] ? (
                                            <Image
                                                source={{ uri: coverUris[index] }}
                                                style={styles.bookImage}
                                            />
                                        ) : (
                                            <Text style={globalStyles.subheading}>{book.title}</Text>
                                        )}
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
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
    searchBarWrapper: {
        marginVertical: 10,
        alignItems: 'center',
    },
    container: {
        flex: 1,
        paddingLeft: 20,
        marginTop: 20,
    },
    searchBar: {
        borderRadius: 10,
        borderColor: '#212f3e',
        borderWidth: 3,
        paddingHorizontal: 10,
        height: 38,
        fontSize: 16,
        width: 180,
    },
    dropdownContainer: {
        marginTop: 4,
        width: 180,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        maxHeight: 150,
        marginBottom: 4,
        zIndex: 100,
    },
    header: {
        fontWeight: 'bold',
        padding: 6,
        fontSize: 14,
        backgroundColor: '#f0f0f0',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    list: {
        maxHeight: 120, // scrollable height
    },
    item: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 16,
        color: '#333',
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
