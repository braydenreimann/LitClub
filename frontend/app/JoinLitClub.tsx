
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
import { joinLitClub } from '@/api/services/litClubsService';
import { getUser } from '@/api/services/usersService';


const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const LAN_IP = hostFromExpo ?? '10.0.0.252'
const API_BASE_URL = `http://${LAN_IP}:5112`
const apiUrl = `${API_BASE_URL}/litclubs`;

SplashScreen.preventAutoHideAsync();

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
export default function JoinLitClub() {
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
    const [ inviteCode, setInviteCode ] = useState('')
    const [loading, setLoading] = useState(false);
    const [ user, setUser ] = useState<User | null>(null);

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

    const handleJoinLitClub = async () => {
        if (!inviteCode.trim()) {
            Alert.alert('Error', 'Please enter a valid invite code.');
            return;
        }

        if (!user?.id) {
                    Alert.alert('Error', 'User not logged in.');
                    return;
                }

        try {
            setLoading(true);
            const joinedClub = await joinLitClub({
                litClubId: inviteCode.trim(),
                userId: user?.id,
            });

            if (!joinedClub) {
                Alert.alert('Error', 'Failed to join LitClub. Please check the invite code and try again.');
                return;
            }

            addLitClub(joinedClub);
            Alert.alert('Success', `You have joined the LitClub: ${joinedClub.name}`);
            router.replace('/litClubs');
        }
        catch (error) {
            console.error('Error joining LitClub:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
        }
        finally {
            setLoading(false);
        }

    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.cream, }}>
            <View style={{flexDirection:'row', paddingTop: 30, margin: 10} } >
                <BackButton /> 
                <Text style={[globalStyles.heading, {paddingTop: 7, paddingBottom: 10, fontSize: 20}]}>Join a LitClub</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                
                {/* Club Invite Code */}
                <Text style={[globalStyles.subheading, { fontSize: 18, color: colors.darkest }]}>Enter the Invite Code to Join a LitClub</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Invite Code"
                    placeholderTextColor={'grey'}
                    value={inviteCode}
                    onChangeText={setInviteCode}
                />
                
                {/* Join Button */}
                <Pressable
                    style={[styles.joinButton, loading && { opacity: 0.6 }, { marginTop: 20, marginBottom: 40 }]}
                    onPress={handleJoinLitClub}
                    disabled={loading}

                >
                    <Text style={styles.joinButtonText}>
                        {loading ? "Joining..." : "Join LitClub"}
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
    joinButton: {
        marginTop: 20,
        backgroundColor: colors.sage,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    joinButtonText: {
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

