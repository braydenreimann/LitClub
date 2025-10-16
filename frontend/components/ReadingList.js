// Code modelled after Medium (Code Burst) Article by Colin Lord
// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6

// react tutorial on how to make shapes: 
// https://www.codedaily.io/tutorials/The-Shapes-of-React-Native

import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';

//eventually will fetch data from backend

export default function ReadingList() {

    const books = [
    { id: 1, title: 'Book 1' },
    { id: 2, title: 'Book 2' },
    { id: 3, title: 'john green' },
    { id: 4, title: 'Book 4' },
    { id: 5, title: 'Book 5' },
    { id: 6, title: 'Book 6' },
  ];

    return (

        <View style={styles.scrollingWrapper}>
            <ScrollView style={styles.scrollContainer} horizontal={true} showsHorizontalScrollIndicator={true}>
                {/* cards that scroll horizontally */}
                {books.map((book) => (
                    <Pressable key={book.id} style={styles.card}>
                        <Link href="..\bookInfo">
                        <Text>{book.title}</Text>
                        </Link>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
};




const styles = StyleSheet.create({
    scrollContainer: {
        overflowX: 'scroll',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        padding: 10,
    },
    scrollingWrapper: {
        flex: 1,
    },
    card: {
        width: 120,
        height: 180,
        marginRight: 10,
        backgroundColor: "teal",
        borderColor: "black",
    },
});
