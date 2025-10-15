// Code modelled after Medium (Code Burst) Article by Colin Lord
// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6

// react tutorial on how to make shapes: 
// https://www.codedaily.io/tutorials/The-Shapes-of-React-Native

// modifying ReadingList.js to create TopThreeBooks.js

import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';

//eventually will fetch data from backend

export default function ReadingList() {

    const books = [
        { id: 1, title: 'Book 1' },
        { id: 2, title: 'Book 2' },
        { id: 3, title: 'Book 3' },
    ];

    return (
        <View>
            <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
                    Top 3 Books
                </Text>
            </View>

            <View style={{ flexDirection: 'row', padding: 10 }}>
                {/* cards that scroll horizontally */}
                {books.map((book) => (
                    <View key={book.id} style={styles.card}>
                        <Text>{book.title}</Text>
                    </View>
                ))}
            </View>
        </View>

    )
};

const styles = StyleSheet.create({
    card: {
        width: 120,
        height: 180,
        marginRight: 5,
        marginLeft: 5,
        justifyContent: "center"
        backgroundColor: "teal",
        borderColor: "black",
    },
});
