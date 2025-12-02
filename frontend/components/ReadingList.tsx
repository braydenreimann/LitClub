// /frontend/components/ReadingList.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';

import { colors } from '../theme';
import { globalStyles } from '../styles/globalStyles';

import { User, DisplayBook } from '../domain/models';
import { getUser } from '../services/usersService';
import { getBookshelfByStatus } from '../services/librariesService';
import { getUriRead } from '@/services/imagesService';

// Status from backend enum: 0 | 1 | 2 | 3
type ShelfStatus = 0 | 1 | 2 | 3;

interface ReadingListProps {
    status: ShelfStatus;
    books?: DisplayBook[];
    refreshKey?: number;
}

export default function ReadingList({ books, status, refreshKey }: ReadingListProps) {
    const [user, setUser] = useState<User | null>(null);
    const [shelf, setShelf] = useState<DisplayBook[]>(books ?? []);
    const [loading, setLoading] = useState(!books);
    const [coverUris, setCoverUris] = useState<{ [id: string]: string }>({});

    // Load user from session (via usersService)
    useEffect(() => {
        const loadUser = async () => {
            try {
                const sessionUser = await getUser();
                if (sessionUser) {
                    setUser(sessionUser);
                }
            } catch (error) {
                console.error('Error loading user from session:', error);
            }
        };

        loadUser();
    }, []);

    // Load bookshelf by status (from librariesService)
    useEffect(() => {
        if (books || !user) return;

        const loadBookshelf = async () => {
            setLoading(true);
            try {
                const fetched = await getBookshelfByStatus(user.id, status);
                setShelf(fetched ?? []);
            } catch (err) {
                console.error('Error loading bookshelf:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBookshelf();
    }, [books, user, status, refreshKey]);

    // Load cover images for the shelf
    useEffect(() => {
        let alive = true;

        (async () => {
            const newUris: { [id: string]: string } = {};
            await Promise.all(
                shelf.map(async (book) => {
                    const uri = await getUriRead(book.coverImageUrl);
                    newUris[book.id] = uri || '';
                })
            );
            if (alive) setCoverUris(newUris);
        })();

        return () => {
            alive = false;
        };
    }, [shelf]);

    return (
        <View style={styles.scrollingWrapper}>
            {loading ? (
                <Text style={globalStyles.body}>Loading your books...</Text>
            ) : shelf.length === 0 ? (
                <Text style={globalStyles.body}>No books found for this shelf.</Text>
            ) : (
                <ScrollView
                    style={styles.scrollContainer}
                    horizontal
                    showsHorizontalScrollIndicator
                >
                    {shelf.map((book) => (
                        <Pressable key={book.id} style={styles.card}>
                            <Link
                                href={{
                                    pathname: '/bookInfo',
                                    params: { id: book.id },
                                }}
                            >
                                <Image
                                    source={
                                        coverUris[book.id]
                                            ? { uri: coverUris[book.id] }
                                            : require('../assets/images/turkstra.jpg')
                                    }
                                    style={{
                                        width: 120,
                                        height: 180,
                                        borderRadius: 8,
                                        marginBottom: 6,
                                    }}
                                    resizeMode="cover"
                                />
                            </Link>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexWrap: 'wrap',
        padding: 10,
    },
    scrollingWrapper: {
        flex: 1,
    },
    card: {
        width: 120,
        height: 180,
        marginRight: 10,
        backgroundColor: colors.yellow,
        borderColor: colors.darkest,
        borderRadius: 12,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
});
