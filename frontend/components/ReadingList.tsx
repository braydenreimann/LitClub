// /frontend/components/ReadingList.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '../theme';
import { globalStyles } from '../styles/globalStyles';

import { User, DisplayBook } from '../domain/models';
import { getUser } from '@/api/services/usersService';
import { getBookshelfByStatus } from '../api/services/librariesService';
import { getUriRead } from '@/api/services/imagesService';
import { pushBookDetail } from '@/navigation/routes';

// Status from backend enum: 0 | 1 | 2 | 3
type ShelfStatus = 0 | 1 | 2 | 3 | 4;

interface ReadingListProps {
    status: ShelfStatus;
    books?: DisplayBook[];
    refreshKey?: number;
    ownerId?: string; // optional owner for shelves; defaults to current user
    onBookPress?: (bookId: string) => void;
}

export default function ReadingList({
    books,
    status,
    refreshKey,
    ownerId,
    onBookPress,
}: ReadingListProps) {
    const [user, setUser] = useState<User | null>(null);
    const [shelf, setShelf] = useState<DisplayBook[]>(books ?? []);
    const [loading, setLoading] = useState(!books);
    const [coverUris, setCoverUris] = useState<{ [id: string]: string }>({});
    const router = useRouter();

    // Load user from session (via usersService) if an explicit owner isn't provided
    useEffect(() => {
        if (ownerId) return;
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
    }, [ownerId]);

    // Load bookshelf by status (from librariesService)
    useEffect(() => {
        if (books) return;

        const resolvedOwnerId = ownerId ?? user?.id;
        if (!resolvedOwnerId) return;

        const loadBookshelf = async () => {
            setLoading(true);
            try {
                const fetched = await getBookshelfByStatus(resolvedOwnerId, status);
                setShelf(fetched ?? []);
            } catch (err) {
                console.error('Error loading bookshelf:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBookshelf();
    }, [books, user?.id, ownerId, status, refreshKey]);

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
                        <Pressable
                            key={book.id}
                            style={styles.card}
                            onPress={() =>
                                onBookPress
                                    ? onBookPress(book.id)
                                    : pushBookDetail(router, book.id)
                            }
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
