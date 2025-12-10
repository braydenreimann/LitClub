import {
    View,
    ScrollView,
    Text,
    Pressable,
    ActivityIndicator,
    Dimensions,
    Image,
} from 'react-native';
import { globalStyles } from '@/styles/globalStyles';
import { useRouter } from 'expo-router';
import { colors } from '../theme';
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
import { searchBooks } from '@/services/searchservice';
import SearchField from '@/components/SearchField';

Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = 140;
const CARD_HEIGHT = 210;

export default function BookRecs() {
    const [searchInput, setSearchInput] = useState('');
    const [query, setQuery] = useState('');
    const [bookResults, setBookResults] = useState<Book[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [coverUris, setCoverUris] = useState<string[]>([]);
    const router = useRouter();

    // Debounced search
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

    // Load all books
    useEffect(() => {
        const loadBooks = async () => {
            try {
                let all: Book[] = [];
                let token: string | null | undefined = undefined;

                while (true) {
                    const { books, continuationToken } = await getBooks(token);
                    all = [...all, ...books];
                    if (!continuationToken) break;
                    token = continuationToken;
                }

                const sorted = all.sort((a, b) => a.title.localeCompare(b.title));
                setBooks(sorted);
            } catch (err) {
                console.error('Error loading books:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBooks();
    }, []);

    const visible = query.trim() ? bookResults : books;

    // Load cover images
    useEffect(() => {
        const loadCovers = async () => {
            if (!visible || visible.length === 0) {
                setCoverUris([]);
                return;
            }

            const uris = await Promise.all(
                visible.map((book) => getUriRead(book.coverImageUrl))
            );

            setCoverUris(uris.map((uri) => uri || ''));
        };

        loadCovers();
    }, [visible]);

    // Fonts
    const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
    });
    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (loading) {
        return (
            <View
                style={[
                    globalStyles.container,
                    { justifyContent: 'center', alignItems: 'center' },
                ]}
            >
                <ActivityIndicator size="large" color={colors.darkest} />
            </View>
        );
    }

    const handleBookPress = (bookId: string) => {
        setSearchInput('');
        setQuery('');
        pushBookDetail(router, bookId); // ← consistent navigation
    };

    // -------------------------
    // UI (Header removed—handled by stack)
    // -------------------------
    return (
        <View style={globalStyles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Search Bar */}
                <View style={styles.searchBarWrapper}>
                    <SearchField
                        value={searchInput}
                        placeholder="Search books"
                        onChangeText={(text) => {
                            setSearchInput(text);
                            setQuery(text);
                        }}
                        returnKeyType="search"
                        containerStyle={{ width: '100%', maxWidth: 360 }}
                    />
                </View>

                {/* Book Grid */}
                {books.length === 0 ? (
                    <Text style={globalStyles.body}>
                        No book recommendations available at the moment.
                    </Text>
                ) : (
                    <View style={styles.gridContainer}>
                        {visible.map((book, index) => (
                            <View key={book.id} style={styles.card}>
                                <Pressable
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                                    onPress={() => handleBookPress(book.id)}
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
        </View>
    );
}

// -------------------------
// Styles
// -------------------------
const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        margin: CARD_MARGIN / 2,
        backgroundColor: '#ffffff',
        borderColor: '#e5dfd6',
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    searchBarWrapper: {
        marginTop: 10,
        marginBottom: 18,
        alignItems: 'center',
        width: '100%',
    },
    bookImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '100%',
        maxWidth: 360,
    },
    scrollContainer: {
        paddingVertical: CARD_MARGIN,
        paddingHorizontal: CARD_MARGIN / 1.5,
    },
});
