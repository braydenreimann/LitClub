// components/SearchBar.tsx

import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { searchBooks, searchUsers } from '@/services/searchservice';
import { Book, User } from '@/domain/models';
import { pushBookDetail, pushUserDetail } from '@/navigation/routes';

interface SearchBarProps {
    onBookPress?: (id: string) => void;
    onUserPress?: (id: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onBookPress, onUserPress }) => {
    const [searchInput, setSearchInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');
    const [bookResults, setBookResults] = useState<Book[]>([]);
    const [userResults, setUserResults] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!query.trim()) {
            setBookResults([]);
            setUserResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const [books, users] = await Promise.all([
                searchBooks(query),
                searchUsers(query),
            ]);
            setBookResults(books ?? []);
            setUserResults(users ?? []);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    const handleBookPress = (bookId: string) => {
        setIsFocused(false);
        setSearchInput('');
        setQuery('');
        if (onBookPress) {
            onBookPress(bookId);
        } else {
            pushBookDetail(router, bookId);
        }
    };

    const handleUserPress = (userId: string) => {
        setIsFocused(false);
        setSearchInput('');
        setQuery('');
        if (onUserPress) {
            onUserPress(userId);
        } else {
            pushUserDetail(router, userId);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search"
                placeholderTextColor="#224B6F"
                value={searchInput}
                onChangeText={(text) => {
                    setSearchInput(text);
                    setQuery(text);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {isFocused && (
                <View style={styles.dropdownContainer}>
                    {bookResults.length > 0 && (
                        <View style={styles.dropdown}>
                            <Text style={styles.header}>Books</Text>
                            <FlatList
                                data={bookResults}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="always"
                                style={styles.list}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.item}
                                        onPress={() => handleBookPress(item.id)}
                                    >
                                        <Text style={styles.title} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        </View>
                    )}

                    {userResults.length > 0 && (
                        <View style={styles.dropdown}>
                            <Text style={styles.header}>Users</Text>
                            <FlatList
                                data={userResults}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="always"
                                style={styles.list}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.item}
                                        onPress={() => handleUserPress(item.id)}
                                    >
                                        <Text style={styles.title} numberOfLines={1}>
                                            {item.firstName} {item.lastName}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
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
    dropdownContainer: {
        marginTop: 4,
        width: 180,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        maxHeight: 150,
        marginBottom: 4,
        zIndex: 100,
    },
    header: {
        fontWeight: 'bold',
        padding: 6,
        fontSize: 14,
        backgroundColor: '#f0f0f0',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    list: {
        maxHeight: 120,
    },
    item: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 16,
        color: '#333',
    },
});

export default SearchBar;