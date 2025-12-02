import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../context/AuthContext';
import { globalStyles } from '../styles/globalStyles';
import { colors, fonts } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function index() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });
  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isLoading) {
      //if (session) {
      //router.replace('/home');
      //} else {
      router.replace('/auth/login'); //Not logged in - going to login
      //}
    }
  }, [isLoading, session]);

  if (isLoading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.midBlue} />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

  // Optional fallback while redirecting
  return (
    <View style={[globalStyles.container, styles.loadingContainer]}>
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    color: colors.darkest,
    fontSize: 18,
    marginTop: 12,
  },
});