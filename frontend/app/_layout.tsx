//initial set up code borrowed from expo router template
// https://docs.expo.dev/tutorial/create-your-first-app/

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SessionProvider } from '../auth/authContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LitClubProvider } from '@/LitClubImport/LitClubContext';
import { InteractionManager } from 'react-native';
import { ChivoMono_500Medium, useFonts } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import React from 'react';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <LitClubProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="createLitClub" options={{ title: 'Create Club', headerShown: false }} />
          </Stack>
          {/*<StatusBar style="auto" />*/}
        </ThemeProvider>
      </LitClubProvider>
    </SessionProvider>
  );
}
