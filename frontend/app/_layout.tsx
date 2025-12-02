import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SessionProvider } from '../context/AuthContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LitClubProvider } from '@/context/LitClubsContext';
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
        </ThemeProvider>
      </LitClubProvider>
    </SessionProvider>
  );
}
