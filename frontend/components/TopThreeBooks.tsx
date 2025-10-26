// Code modelled after Medium (Code Burst) Article by Colin Lord
// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6

// react tutorial on how to make shapes: 
// https://www.codedaily.io/tutorials/The-Shapes-of-React-Native

// modifying ReadingList.js to create TopThreeBooks.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { globalStyles } from '@/styles/globalStyles';
import { fonts, colors } from '@/theme';
import { User, DisplayBook } from '../interfaces/interfaces';
import { getTopThree } from '../services/profileService';
import AsyncStorage from '@react-native-async-storage/async-storage';

//eventually will fetch data from backend

export default function ReadingList() {
    const [user, setUser] = useState<User | null>(null);
    const [topBooks, setTopBooks] = useState<DisplayBook[] | null>(null);

    useEffect(() => {
        const loadSession = async () => {
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

    useEffect(() => {
        if (!user) { return; }
        const fetchBooks = async () => {
            const books = await getTopThree(user.id);
            setTopBooks(books);
        };

        fetchBooks();
    }, [user]);

    const books = [
        { id: 1, title: 'Book 1' },
        { id: 2, title: 'Book 2' },
        { id: 3, title: 'Book 3' },
    ];

    return (
        <View>
            <Text style={[globalStyles.heading, { marginLeft: 10, marginBottom: 10 }]}>
                Top Three Books
            </Text>

            <View style={{ flexDirection: 'row', padding: 10 }}>
                {topBooks?.map((book) => (
                    <View
                        key={book.id}
                        style={[styles.card, { justifyContent: 'center', alignItems: 'center' }]}
                    >
                        <Text style={styles.cardText}>
                            {book.title}
                        </Text>
                    </View>
                ))}
            </View>

            {!topBooks && <Text>Loading top books...</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        aspectRatio: 0.65,
        width: "30%",
        marginRight: 5,
        marginLeft: 5,
        justifyContent: "center",
        backgroundColor: "#E4D7C8",
        borderColor: "#629FAE",
        borderWidth: 5,
        borderRadius: 12,
    },
    cardText: {
        fontSize: 18,
        textAlign: "center",
    },
});
