
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

export default function editProfilePage () {
    const [fontsLoaded] = useFonts({
                Fraunces_700Bold,
                ChivoMono_500Medium,
                NotoSansMono_400Regular,
            });
            React.useEffect(() => {
                if (fontsLoaded) SplashScreen.hideAsync();
            }, [fontsLoaded]);
    
    const router = useRouter();
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
}