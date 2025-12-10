// components/SearchBar.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { searchBooks, searchUsers } from '@/services/searchservice';
import { Book, User } from '@/domain/models';
import { pushBookDetail, pushUserDetail } from '@/navigation/routes';
import { colors } from '@/theme';
import SearchField from './SearchField';

interface SearchBarProps {
    onBookPress?: (id: string) => void;
    onUserPress?: (id: string) => void;
    maxWidth?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onBookPress, onUserPress, maxWidth }) => {
    const [searchInput, setSearchInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');
    const [bookResults, setBookResults] = useState<Book[]>([]);
    const [userResults, setUserResults] = useState<User[]>([]);
    const router = useRouter();
    const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    useEffect(() => {
        return () => {
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
        };
    }, []);

    const hasResults = bookResults.length > 0 || userResults.length > 0;
    const showDropdown = isFocused && hasResults;

    const resolvedMaxWidth = maxWidth ?? 320;
    const containerSizing = maxWidth
        ? { width: resolvedMaxWidth, maxWidth: resolvedMaxWidth }
        : { width: '100%', maxWidth: resolvedMaxWidth };

    return (
        <View style={[styles.container, containerSizing]}>
            <SearchField
                placeholder="Search books or users"
                value={searchInput}
                onChangeText={(text) => {
                    setSearchInput(text);
                    setQuery(text);
                    setIsFocused(true);
                }}
                onFocus={() => {
                    if (blurTimeout.current) clearTimeout(blurTimeout.current);
                    setIsFocused(true);
                }}
                onBlur={() => {
                    blurTimeout.current = setTimeout(() => setIsFocused(false), 120);
                }}
                returnKeyType="search"
                containerStyle={styles.inputRow}
            />

            {showDropdown && (
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
                                        style={({ pressed }) => [
                                            styles.item,
                                            pressed && styles.itemPressed,
                                        ]}
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
                                        style={({ pressed }) => [
                                            styles.item,
                                            pressed && styles.itemPressed,
                                        ]}
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
        position: 'relative',
    },
    inputRow: {
        width: '100%',
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderColor: '#d9d4cc',
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: colors.nextDarkest,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        zIndex: 50,
        overflow: 'hidden',
    },
    dropdown: {
        maxHeight: 160,
        paddingBottom: 8,
        zIndex: 100,
    },
    header: {
        fontWeight: '700',
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 6,
        fontSize: 14,
        color: colors.nextDarkest,
        backgroundColor: colors.cream,
    },
    list: {
        maxHeight: 124,
    },
    item: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    title: {
        fontSize: 16,
        color: colors.nextDarkest,
    },
    itemPressed: {
        backgroundColor: '#f4efe8',
    },
});

export default SearchBar;
