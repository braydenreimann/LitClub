import { StyleSheet, View, ScrollView, Text, Pressable, Alert, useColorScheme, Animated } from 'react-native';
import Header from '../../components/headerWithSearch';
import { globalStyles } from '@/styles/globalStyles';
import { Link, useFocusEffect } from 'expo-router';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useLitClubs } from '@/LitClubImport/LitClubContext';
import { colors } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/domain/models';
import { useRouter } from "expo-router";


export default function AllLitClubs() {
  // Example data
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });

  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); //create/join club
  const [user, setUser] = useState<User | null>(null)
  const { litClubs, loading, error, fetchLitClubs } = useLitClubs();
  const [archivedClubIds, setArchivedClubIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchLitClubs();
    }, [fetchLitClubs])
  )

  const toggleMenu = () => {
      setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const loadArchivedClubs = async () => {
      const saved = await AsyncStorage.getItem('archivedClubs');
      if (saved) {
        setArchivedClubIds(JSON.parse(saved));
      }
    };
    loadArchivedClubs();
  }, []);

  //save when changed
  useEffect(() => {
    AsyncStorage.setItem('archivedClubs', JSON.stringify(archivedClubIds));
  }, [archivedClubIds]);

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading clubs...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error loading clubs: {error}</Text>
      </View>
    );
  }

  if (!litClubs.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No Clubs Found.</Text>
      </View>
    );
  }
  
  const userId = user?.id ?? '';
  const userClubs = litClubs.filter(c => c.memberUserIds?.includes(userId) && !archivedClubIds.includes(c.id));
  const leaderClubs = litClubs.filter(c => c.ownerUserId === userId && !archivedClubIds.includes(c.id));
  const archivedClubs = litClubs.filter(c => archivedClubIds.includes(c.id)); // example filter

  
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* HEADER at the top */}
      <Header />

      {/* SCROLLABLE content */}
      <ScrollView contentContainerStyle={{ padding: 16}}>

        {/* New Club Button */}
        <Pressable
            onPress={toggleMenu}
            style={styles.toggle}>
              <EvilIcons name="plus" size={50} color={colors.midBlue} />
        </Pressable>

        {menuOpen && (
          <View style={[styles.dropdown]}>
              <Pressable
                style={styles.dropdownItem}
                onPress={() => router.push("/createLitClub")}
              >
                <Text style = {globalStyles.body}>Create New LitClub</Text>
              </Pressable>

              <Pressable
                style={styles.dropdownItem}
                onPress={() => router.push("/JoinLitClub")}
              >
                <Text style = {globalStyles.body}>Join New LitClub</Text>
              </Pressable>

            </View>
        )}
       

        {/* MAIN HEADING */}
        <Text style={globalStyles.heading}>My LitClubs</Text>

        <View style={globalStyles.cardGroup}> 
          {leaderClubs.length ? (
            leaderClubs.map((club) => (
                                    
            <Pressable
              key={club.id}
              style={globalStyles.litclubCard}            >
            <Link href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name },}} asChild > 
              <Text style={globalStyles.cardFont} adjustsFontSizeToFit={true} > {club.name} </Text>
            </Link>
            </Pressable>
                                   
          ))
          ) : ( <Text>No owned LitClubs yet.</Text> )
          }
          </View>

        <Text style={globalStyles.heading}>Active LitClubs</Text>
        
        <View style={globalStyles.cardGroup}> 
            {userClubs.length ? (
              userClubs.map((club) => (
              <Pressable
                key={club.id}
                style={globalStyles.litclubCard}
              >
                <Link href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name },}} asChild > 
                  <Text style={globalStyles.cardFont} adjustsFontSizeToFit={true} > {club.name} </Text>
                </Link>
              </Pressable>
                                   
            ))
        ) : ( <Text>No active LitClubs.</Text> )
        }
      </View>

        <Text style={globalStyles.heading}>Archived LitClubs</Text>

        <View style={globalStyles.cardGroup}> 
           {archivedClubs.length ? (
              archivedClubs.map((club) => (  
              <Pressable
                  key={club.id}
                  style={[globalStyles.litclubCard, { backgroundColor: colors.midBlue }]}>
                <Link href={{ pathname: '/myLitClub', params: { id: club.id, name: club.name },}} asChild> 
                  <Text style={globalStyles.cardFont} adjustsFontSizeToFit={true} >
                    {club.name}
                  </Text>
                </Link>
              </Pressable>
                                   
           ))
          ) : (
            <Text>No archived LitClubs.</Text>
          )                        
        }
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    dropdown: {
        position: "absolute",
        top: 60,
        right: 25,
        backgroundColor: colors.cream,
        borderRadius: 16,
        paddingVertical: 10,
        width: 200,
        borderWidth: 2,
        borderColor: colors.midBlue,
        elevation: 4,
    },
    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    toggle: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 100, 
      borderRadius: 30,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    }
});
