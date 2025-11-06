// Code modelled after Medium (Code Burst) Article by Colin Lord
// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6

// react tutorial on how to make shapes: 
// https://www.codedaily.io/tutorials/The-Shapes-of-React-Native

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors, fonts } from '../theme';
import { globalStyles } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, DisplayBook } from '../domain/models';
import { getUser, getBookshelfByStatus } from '../services/usersService';
import { getBookCoverUri } from '@/services/imagesService';

//eventually will fetch data from backend
interface ReadingListProps {
    status: number;
}
export default function ReadingList({ status }: ReadingListProps) { //AI assist with the loading functionality
    const [user, setUser] = useState<User | null>(null);
    const [shelf, setShelf] = useState<DisplayBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [coverUris, setCoverUris] = useState<{ [id: string]: string }>({}); // For Loading cover images

    useEffect(() => {
        const loadSession = async () => { //Load user id from session.
            try {
                const sessionString = await AsyncStorage.getItem('session');
                if (!sessionString) return;
                const session: User = JSON.parse(sessionString);
                setUser(session);
            } catch (error) {
                console.error('Error loading session:', error);
            }
        };
        loadSession();
    }, []);

    useEffect(() => { //load bookshelf by status
        if (!user) return;

        const loadBookshelf = async () => {
            setLoading(true);
            try {
                const books = await getBookshelfByStatus(user.id, status);
                setShelf(books ?? []);
            } catch (err) {
                console.error('Error loading bookshelf:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBookshelf();
    }, [user, status]);

    useEffect(() => { //Load all images for shelf here
        let alive = true; //prevent memory leaks. 

        (async () => {
            const newUris: { [id: string]: string } = {}; //explicit typing needed
            await Promise.all( //ensure resolution of all cover images
                shelf.map(async (book) => {
                    const uri = await getBookCoverUri(book.coverImageUrl);
                    newUris[book.id] = uri || "";
                })
            );
            if (alive) setCoverUris(newUris); //Cancel when component unmounted
        })();

        return () => { alive = false; };
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
                            <Link href={{
                                pathname: "/bookInfo",
                                params: { id: book.id }
                            }}
                            >
                                <Image //<Text style={globalStyles.subheading}>{book.title}</Text> was originally here if reversion necessary
                                    source={
                                        coverUris[book.id]
                                            ? { uri: coverUris[book.id] }
                                            : require("../assets/images/turkstra.jpg") // fallback image
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
        flexWrap: "wrap",
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
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        textAlign: "center",
        textAlignVertical: "center",
    },
});
