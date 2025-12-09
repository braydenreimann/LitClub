// /frontend/components/ReadingList.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';

import { globalStyles } from '../styles/globalStyles';

import { User, DisplayBook } from '../domain/models';
import { getUser } from '@/api/services/usersService';
import { getBookshelfByStatus } from '../api/services/librariesService';
import { getUriRead } from '@/api/services/imagesService';
import { pushBookDetail } from '@/navigation/routes';
import { ShelfStatus } from '@/domain/shelfStatus';
import { subscribeToBookshelfUpdates } from '@/utils/bookshelfEvents';

interface ReadingListProps {
    status: ShelfStatus;
    books?: DisplayBook[];
    refreshKey?: number;
    ownerId?: string;
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

    const resolvedOwnerId = useMemo(
        () => ownerId ?? user?.id ?? null,
        [ownerId, user?.id]
    );

    // Load user from session (via usersService) if an explicit owner isn't provided
    useEffect(() => {
        if (ownerId) return;
        const loadUser = async () => {
            try {
                const sessionUser = await getUser();
                if (sessionUser) setUser(sessionUser);
            } catch (error) {
                console.error('Error loading user from session:', error);
            }
        };
        loadUser();
    }, [ownerId]);

    useEffect(() => {
        if (books) {
            setShelf(books);
            setLoading(false);
        }
    }, [books]);

    const loadBookshelf = useCallback(async () => {
        if (books) return;

        if (!resolvedOwnerId) {
            setShelf([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const fetched = await getBookshelfByStatus(resolvedOwnerId, status);
            setShelf(fetched ?? []);
        } catch (err) {
            console.error('Error loading bookshelf:', err);
            setShelf([]);
        } finally {
            setLoading(false);
        }
    }, [books, resolvedOwnerId, status]);

    // Load bookshelf by status (from librariesService)
    useEffect(() => {
        if (books) return;

        void loadBookshelf();
    }, [books, loadBookshelf, refreshKey]);

    useEffect(() => {
        if (books || !resolvedOwnerId) return;

        return subscribeToBookshelfUpdates(
            ({ ownerId: updatedOwnerId, previousStatus, nextStatus }) => {
                const affectsThisList =
                    updatedOwnerId === resolvedOwnerId &&
                    (previousStatus === status || nextStatus === status);

                if (affectsThisList) {
                    void loadBookshelf();
                }
            }
        );
    }, [books, resolvedOwnerId, status, loadBookshelf]);

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
                    horizontal
                    showsHorizontalScrollIndicator
                    contentContainerStyle={styles.scrollContent}
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
                                style={styles.coverImage}
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
    scrollContent: {
        flexDirection: 'row',
        paddingLeft: 0,
        paddingRight: 8,
    },
    scrollingWrapper: {
        flex: 1,
        marginTop: 6,
    },
    card: {
        width: 120,
        marginRight: 8,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    coverImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
    },
});
