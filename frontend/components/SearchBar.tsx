// code borrowed from https://plainenglish.io/blog/how-to-implement-a-search-bar-in-react-js

import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableWithoutFeedback, Pressable } from 'react-native';
import { Link, router } from 'expo-router'
import { IconSymbol } from '@/components/ui/icon-symbol';
import { searchBooks } from '@/services/searchservice';
import { Book } from '@/domain/models';

const SearchBar = () => {
    const [searchInput, setSearchInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Book[]>([]);

    useEffect(() => {
        if (!query.trim()) { //empties results once user deletes their query
            setResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const books = await searchBooks(query);
            setResults(books ?? []);
        }, 300); //debounce to give space between query changes. searchBooks isn't called for every keystroke

        return () => clearTimeout(timeout);
    }, [query]);

    
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search"
                placeholderTextColor={"#224b6f"}
                value={searchInput}
                onChangeText={(text) => {
                    setSearchInput(text);
                    setQuery(text);
                }}
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
            />

            {isFocused && results.length > 0 && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={results}
                        keyboardShouldPersistTaps= "always"
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.item}
                                onPress={() => {
                                    setIsFocused(false);
                                    router.push({
                                        pathname: "/bookInfo",
                                        params: { id: item.id }
                                    });
                                }}
                            >
                                <Text style={styles.title}>{item.title}</Text>
                            </Pressable>
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
    zIndex: 100,
},
title: {
    fontSize: 16,
    color: '#333',
},
item: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: "100%",
},
});

export default SearchBar;