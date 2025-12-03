
import React, { useEffect, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation'; 
import { InteractionManager, Platform, Pressable, TextInput} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
//import SearchBar from '@/components/SearchBar';
import Header from '@/components/headerWithSearch';
import { colors, fonts } from '@/theme';
import ReadingList from '@/components/ReadingList'; 
//import TopThreeBooks from '@/components/TopThreeBooks';
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
import { useLitClubs } from '@/context/litClubsContext';
import Constants from 'expo-constants';
import { Book, User } from '@/domain/models';
import { useSession } from '@/context/AuthContext';
import { GenresSelector } from '@/components/genresSelector';
import { isPromise } from 'formik';
import { useFocusEffect } from '@react-navigation/native';


const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const LAN_IP = hostFromExpo ?? '10.0.0.252'
const API_BASE_URL = `http://${LAN_IP}:5112`
const apiUrl = `${API_BASE_URL}/litclubs`;

function BackButton() {
    const router = useRouter();
    return (
        <Pressable>
            <Link href="/litClubs" onPress={() => router.back()}>
                <EvilIcons name="chevron-left" size={50} color="#193350" style={{marginLeft: 0}}/>
            </Link>
        </Pressable>
    );
}

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
    const params = useLocalSearchParams();
    //const preselectedBooks = params?.selectedBooks ? JSON.parse(params.selectedBooks as string) : [];
    const { addLitClub } = useLitClubs();
    const { session } = useSession();
    const [user, setUser] = useState<User | null>(null);

    // club form inputs
    const [name, setName] = useState<string>(
        Array.isArray(params.name) 
        ? params.name[0] ?? '' 
        : params.name ?? ''
    );
    const [description, setDescription] = useState<string>(
        Array.isArray(params.description)
            ? params.description[0] ?? ''
            : params.description ?? ''
    );
    //const [name, setName] = useState(params.name ?? '');
    //const [description, setDescription] = useState(params.description ?? '');
    const [preferredGenres, setPreferredGenres] = useState(params.genres ?? '');
    const [privateClub, setPrivateClub] = useState(params.isPrivate === 'true');
    const [selectedBooks, setSelectedBooks ] = useState<Book[]>([]);
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

    const handleFindBooks = async () => {
        router.push({
            pathname: '/bookPicksForClub',
            params: {preselected: JSON.stringify(selectedBooks) }
        })
    };

    //handle create club
    const handleCreateClub = async () => {
        if (!(typeof name === 'string' ? name.trim() : String(name).trim())) {
            Alert.alert('Validation Error', 'Club name cannot be empty.');
            return;
        }
        if (selectedBooks.length === 0 ) {
            Alert.alert('Error', 'Please select at least one book');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not logged in.');
            return;
        }

        //const isPrivate = String(privateClub) === 'true';

        const payload = {
                name: name.trim(),
                ownerUserId: user.id,
                description: description.trim(),
                preferredGenres,
                privateClub,
                memberUserIds: [user.id],
                libraryId: '',
                selectedBooks: selectedBooks.map((b) => b.id),
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

            //here you want to create library books with those book IDs you collected 

            const createdClub = await response.json();

            //get the ID of the created club
            //with each selected book, the first book should be the 'up next'
            //create library books with the 
            //

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error (${response.status}): ${errorText}`);
            }

            addLitClub(createdClub);
            //await fetchLitClubs(); //refresh list
            await AsyncStorage.removeItem('createLitClubForm');

            Alert.alert('Success', `${name} club created successfully!`);
            router.push('/litClubs');
            //setTimeout(() => router.push('/bookclubs'), 300);
        } catch (error: any) {
            console.error('Error creating club:', error);
            Alert.alert('Error', `Failed to create club: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream, }}>
            <View style={{flexDirection:'row', paddingTop: 30, margin: 10} } >
                <BackButton /> 
                <Text style={[globalStyles.heading, {paddingTop: 0, paddingBottom: 10}]}>Join a LitClub</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                
                {/* Club Invite Code */}
                <Text style={[globalStyles.subheading, { fontSize: 18, color: colors.darkest }]}>Enter the Invite Code to Join a LitClub</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Invite Code"
                    placeholderTextColor={'grey'}
                    value={Array.isArray(name) ? name.join(', ') : name}
                    onChangeText={setName}
                />
                
                {/* Join Button */}
                <Pressable
                    style={[styles.createButton, loading && { opacity: 0.6 }, { marginTop: 20, marginBottom: 40 }]}
                    disabled={loading}
                >
                    <Text style={styles.createButtonText}>
                        Join LitClub
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

