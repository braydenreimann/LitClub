// Code modelled after Medium (Code Burst) Article by Colin Lord
// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6

// react tutorial on how to make shapes: 
// https://www.codedaily.io/tutorials/The-Shapes-of-React-Native

import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';

//eventually will fetch data from backend

export default function ReadingList() {
    return (
        <View style={styles.scrollingWrapper}>
            <ScrollView style={styles.scrollContainer} horizontal={true} showsHorizontalScrollIndicator={true}>
                {/* cards that scroll horizontally */}
                <View style={styles.card}>
                    <Text>Book 1</Text>
                </View>
                <View style={styles.card}>
                    <Text>Book 2</Text>
                </View>
                <View style={styles.card}>
                    <Text>Book 3</Text>
                </View>
                <View style={styles.card}>
                    <Text>Book 4</Text>
                </View>
                <View style={styles.card}>
                    <Text>Book 5</Text>
                </View>
                <View style={styles.card}>
                    <Text>Book 6</Text>
                </View>
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
