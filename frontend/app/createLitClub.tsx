/* begin frontend/app/createLitClub.tsx */

import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';

import { colors, fonts } from '@/theme';
import { globalStyles } from '@/styles/globalStyles';
import { useLitClubs } from '@/context/LitClubsContext';
import { Book, User } from '@/domain/models';
import { useSession } from '@/context/AuthContext';
import { GenresSelector } from '@/components/genresSelector';

import { getUser } from '@/api/services/usersService';
import { createLitClub } from '@/api/services/litClubsService';
import type { AddLitClubInput } from '@/api/mappers/litclubs-mappers';

SplashScreen.preventAutoHideAsync();

function BackButton() {
    const router = useRouter();
    return (
        <Pressable>
            <Link href="/litClubs" onPress={() => router.back()}>
                <EvilIcons name="chevron-left" size={50} color="#193350" style={{ marginLeft: 0 }} />
            </Link>
        </Pressable>
    );
}

export default function CreateLitClub() {
    const [fontsLoaded] = useFonts({
        Fraunces_700Bold,
        ChivoMono_500Medium,
        NotoSansMono_400Regular,
    });

    React.useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    const router = useRouter();
    const params = useLocalSearchParams();
    const { addLitClub } = useLitClubs();
    useSession(); // keep authContext engaged

    const [user, setUser] = useState<User | null>(null);

    // ---- Form state ----

    const [name, setName] = useState<string>(() =>
        Array.isArray(params.name)
            ? params.name[0] ?? ''
            : (params.name as string | undefined) ?? ''
    );

    const [description, setDescription] = useState<string>(() =>
        Array.isArray(params.description)
            ? params.description[0] ?? ''
            : (params.description as string | undefined) ?? ''
    );

    // preferredGenres: always string[] on the frontend
    const [preferredGenres, setPreferredGenres] = useState<string[]>(() => {
        const raw = params.genres;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map((g) => String(g).trim()).filter(Boolean);
        return String(raw)
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean);
    });

    const [privateClub, setPrivateClub] = useState<boolean>(params.isPrivate === 'true');

    const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    // ---- Load current user from session (via usersService) ----
    useEffect(() => {
        const loadUser = async () => {
            try {
                const sessionUser = await getUser();
                if (sessionUser) {
                    setUser(sessionUser);
                }
            } catch (error) {
                console.error('Error loading user from session:', error);
            }
        };

        loadUser();
    }, []);

    // ---- Load selectedBooks from route params (if present) ----
    useEffect(() => {
        if (params.selectedBooks) {
            try {
                const books: Book[] = JSON.parse(params.selectedBooks as string);
                setSelectedBooks(books);
            } catch (err) {
                console.error('Error parsing selectedBooks:', err);
            }
        }
    }, [params.selectedBooks]);

    const handleFindBooks = () => {
        router.push({
            pathname: '/bookPicksForClub',
            params: { preselected: JSON.stringify(selectedBooks) },
        });
    };

    // ---- Create Lit Club (integration-strategy style) ----
    const handleCreateClub = async () => {
        // Basic validation
        const trimmedName = typeof name === 'string' ? name.trim() : String(name).trim();
        const trimmedDescription =
            typeof description === 'string' ? description.trim() : String(description).trim();

        if (!trimmedName) {
            Alert.alert('Validation Error', 'Club name cannot be empty.');
            return;
        }

        if (selectedBooks.length === 0) {
            Alert.alert('Error', 'Please select at least one book');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not logged in.');
            return;
        }

        // Build AddLitClubInput (frontend model for mapper)
        const input: AddLitClubInput = {
            name: trimmedName,
            ownerUserId: user.id,
            description: trimmedDescription,
            preferredGenres: preferredGenres.length ? preferredGenres : null,
            privateClub,
            memberUserIds: [user.id],
            // Note: libraryId is handled on the backend or via mapper; not part of the input type.
        };

        try {
            setLoading(true);

            // Call service (which uses OpenAPI client + mappers)
            const createdClub = await createLitClub(input);

            if (!createdClub) {
                throw new Error('Unable to create LitClub.');
            }

            // Update local context with newly created domain LitClub
            addLitClub(createdClub);

            // TODO: After this, you may want to:
            // - Create LibraryBooks for each selected book ID
            //   using a librariesService method.

            Alert.alert('Success', `${trimmedName} club created successfully!`);
            router.push('/litClubs');
        } catch (error: any) {
            console.error('Error creating club:', error);
            Alert.alert('Error', `Failed to create club: ${error.message ?? 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream }}>
            <View style={{ flexDirection: 'row', paddingTop: 90, margin: 10 }}>
                <BackButton />
                <Text style={[globalStyles.heading, { paddingTop: 0, paddingBottom: 10 }]}>
                    Create a New Lit Club
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Club Name */}
                <Text
                    style={[
                        globalStyles.subheading,
                        { fontSize: 18, color: colors.darkest },
                    ]}
                >
                    Enter the Name of Your LitClub
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Club Name"
                    placeholderTextColor={'grey'}
                    value={name}
                    onChangeText={setName}
                />

                {/* Description */}
                <Text
                    style={[
                        globalStyles.subheading,
                        { paddingTop: 30, fontSize: 18, color: colors.darkest },
                    ]}
                >
                    Tell Us About Your LitClub
                </Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Club Description"
                    placeholderTextColor={'grey'}
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                {/* Genres */}
                <Text
                    style={[
                        globalStyles.subheading,
                        {
                            paddingTop: 30,
                            fontSize: 18,
                            color: colors.darkest,
                            paddingBottom: 10,
                        },
                    ]}
                >
                    Preferred Genres
                </Text>
                <GenresSelector
                    selected={preferredGenres}
                    onChange={setPreferredGenres}
                />

                {/* Book Selection */}
                <Text
                    style={[
                        globalStyles.subheading,
                        {
                            paddingTop: 30,
                            fontSize: 18,
                            color: colors.darkest,
                            paddingBottom: 10,
                        },
                    ]}
                >
                    Book List
                </Text>
                <Pressable
                    style={[styles.booksButton, loading && { opacity: 0.6 }, { marginTop: 10 }]}
                    onPress={handleFindBooks}
                    disabled={loading}
                >
                    <Text style={styles.bookButtonText}>
                        {selectedBooks.length > 0
                            ? `Selected Books: ${selectedBooks.length}`
                            : 'Select Books for Your Club'}
                    </Text>
                </Pressable>

                <Text
                    style={[
                        globalStyles.subheading,
                        {
                            paddingTop: 30,
                            fontSize: 18,
                            color: colors.darkest,
                            paddingBottom: 10,
                        },
                    ]}
                >
                    _____________________________________
                </Text>

                {/* Privacy toggle */}
                <Pressable
                    style={[
                        styles.toggleButton,
                        privateClub && styles.toggleButtonActive,
                        { marginTop: 30 },
                    ]}
                    onPress={() => setPrivateClub(!privateClub)}
                >
                    <Text style={[styles.toggleButtonText, { color: colors.cream }]}>
                        {privateClub
                            ? 'Private Club (Only Invited Members)'
                            : 'Public Club (Anyone Can Join)'}
                    </Text>
                </Pressable>

                {/* Create Button */}
                <Pressable
                    style={[
                        styles.createButton,
                        loading && { opacity: 0.6 },
                        { marginTop: 20, marginBottom: 40 },
                    ]}
                    onPress={handleCreateClub}
                    disabled={loading}
                >
                    <Text style={styles.createButtonText}>
                        {loading ? 'Creating Club...' : 'Create Lit Club'}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: colors.midBlue,
    },
    input: {
        borderWidth: 2,
        borderColor: colors.midBlue,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        marginVertical: 8,
        fontFamily: fonts.body,
    },
    toggleButton: {
        padding: 12,
        backgroundColor: colors.midBlue,
        borderRadius: 10,
        marginTop: 12,
    },
    toggleButtonActive: {
        padding: 12,
        backgroundColor: colors.teal,
        borderRadius: 10,
        marginTop: 12,
    },
    toggleButtonText: {
        textAlign: 'center',
        color: colors.darkest,
        fontFamily: fonts.body,
        fontSize: 16,
    },
    createButton: {
        marginTop: 20,
        backgroundColor: colors.sage,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    createButtonText: {
        color: colors.darkest,
        fontFamily: fonts.body,
        fontSize: 18,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    booksButton: {
        marginTop: 20,
        backgroundColor: colors.yellow,
        padding: 15,
        width: '100%',
        borderRadius: 100,
        margin: 'auto',
        textAlign: 'center',
    },
    bookButtonText: {
        textAlign: 'center',
        color: colors.darkest,
        fontFamily: fonts.body,
        fontSize: 16,
    },
});

/* end frontend/app/createLitClub.tsx */