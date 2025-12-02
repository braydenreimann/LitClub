// code borrowed from https://plainenglish.io/blog/how-to-implement-a-search-bar-in-react-js

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableWithoutFeedback } from 'react-native';

const SearchBar = () => {
    const [searchInput, setSearchInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const DATA = [
        { id: "1", title: "Data Structures" },
        { id: "2", title: "STL" },
        { id: "3", title: "C++" },
        { id: "4", title: "Java" },
        { id: "5", title: "Python" },
        { id: "6", title: "CP" },
        { id: "7", title: "ReactJs" },
        { id: "8", title: "NodeJs" },
        { id: "9", title: "MongoDb" },
        { id: "10", title: "ExpressJs" },
        { id: "11", title: "PHP" },
        { id: "12", title: "MySql" },
    ];

    const filteredData = DATA.filter((item) =>
        item.title.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search"
                placeholderTextColor={"#224b6f"}
                value={searchInput}
                onChangeText={setSearchInput}
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
            />

            {isFocused && filteredData.length > 0 && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableWithoutFeedback onPress={() => {
                                setSearchInput(item.title);
                                setIsFocused(false);
                            }}
                            >
                                <View style={styles.item}>
                                    <Text style={styles.title}>{item.title}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
        alignContent: 'center',
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
    dropdown: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        width: 180,
        maxHeight: 150,
        zIndex: 10,
    },
    title: {
        fontSize: 16,
        color: '#333',
    },
    item: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
});

export default SearchBar;