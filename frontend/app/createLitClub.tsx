
import React, { useEffect, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation'; 
import { Platform, Pressable, TextInput} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/headerWithSearch';
import { colors, fonts } from '@/theme';
import ReadingList from '@/components/ReadingList'; 
import TopThreeBooks from '@/components/TopThreeBooks';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert,Dimensions } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Fonts } from '@/constants/theme';

import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
// Update the import path to the correct location of profileService
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '@/styles/globalStyles';
import { useLitClubs } from '@/LitClubImport/LitClubContext';
import Constants from 'expo-constants';
import { User } from '@/domain/models';
import { useSession } from '@/auth/authContext';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const LAN_IP = hostFromExpo ?? '10.0.0.252'
const API_BASE_URL = `http://${LAN_IP}:5112`
const apiUrl = `${API_BASE_URL}/litclubs`;


// Define user state
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
    const { fetchLitClubs } = useLitClubs();
    const [user, setUser] = useState<User | null>(null);

    // club form inputs
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [preferredGenres, setPreferredGenres] = useState('');
    const [privateClub, setPrivateClub] = useState(false);
    const [loading, setLoading] = useState(false);

    //load user session
    useEffect(() => { //from profile.tsx
        const loadSession = async () => {
            try {
                const sessionString = await AsyncStorage.getItem('session');
                if (!sessionString) return; // no session stored

                const session: User = JSON.parse(sessionString);
                setUser(session); // update state
            } catch (error) {
                console.error('Error loading session:', error);
            }
        };
        loadSession();
    }, []);


    const handleCreateClub = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Club name cannot be empty.');
            return;
        }
        if (!user?.id) {
            Alert.alert('Error', 'User not logged in.');
            return;
        }

        const payload = {
            name: name.trim(),
            ownerUserId: user.id,
            description: description.trim(),
            preferredGenres: preferredGenres ? preferredGenres.split(',').map(genre => genre.trim()) : [],
            isPrivate: privateClub,
            memberUserIds: [user.id],
            libraryId: '',
        };

        try {
            setLoading(true);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error('Failed to create club', { cause: errorData });
            }
            Alert.alert('Success', `${name} club created successfully!`);
            await fetchLitClubs(); // Refresh the list of clubs
            router.back(); // Navigate back to the previous screen
        } catch (error: any) {
            console.error('Error creating club:', error);
            Alert.alert('Error', `Failed to create club: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream, }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[globalStyles.heading, {paddingBottom: 50}]}>Create a New Lit Club</Text>

                <Text style={[globalStyles.subheading, { fontSize: 18, color: colors.darkest }]}>Enter the Name of Your LitClub</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Club Name"
                    placeholderTextColor={'grey'}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={[globalStyles.subheading, { paddingTop: 30, fontSize: 18, color: colors.darkest }]}>Tell Us About Your LitClub</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Club Description"
                    placeholderTextColor={'grey'}
                    multiline={true}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={[globalStyles.subheading, { paddingTop: 30, fontSize: 18, color: colors.darkest }]}>Preferred Genres (Comma Separated)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Fiction, Mystery, Sci-Fi"
                    placeholderTextColor={'grey'}
                    value={preferredGenres}
                    onChangeText={setPreferredGenres}
                />

                <Pressable
                    style={[styles.toggleButton, privateClub && styles.toggleButtonActive, { marginTop: 30 }]}
                    onPress={() => setPrivateClub(!privateClub)}
                >
                    <Text style={[styles.toggleButtonText, { color: colors.cream }]}>
                        {privateClub ? 'Private Club (Only Invited Members)' : 'Public Club (Anyone Can Join)'}
                    </Text>
                </Pressable>
                
                <Pressable
                    style={[styles.createButton, loading && { opacity: 0.6 }, { marginTop: 20 }]}
                    onPress={handleCreateClub}
                    disabled={loading}
                >
                    <Text style={styles.createButtonText}>
                        {loading ? 'Creating Club...' : 'Create Lit Club'}
                    </Text>
                </Pressable>
            
            </ScrollView>
        </View>
    )
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
});
    
