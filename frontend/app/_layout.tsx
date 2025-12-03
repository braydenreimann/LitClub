import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SessionProvider } from '../context/AuthContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LitClubProvider } from '@/context/litClubsContext';
import React, { useMemo } from 'react';
import { createStackScreenOptions } from '@/navigation/stackOptions';
import { HeaderBackButton } from '@/navigation/HeaderBackButton';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paletteKey = colorScheme === 'dark' ? 'dark' : 'light';
  const stackScreenOptions = useMemo(
    () => createStackScreenOptions(paletteKey),
    [paletteKey],
  );

  return (
    <SessionProvider>
      <LitClubProvider>
        <ThemeProvider value={paletteKey === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName="(tabs)" screenOptions={stackScreenOptions}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="createLitClub" options={{ title: 'Create Club', headerShown: false }} />
            <Stack.Screen
              name="books/[bookId]"
              options={{
                title: 'Book Info',
                headerLeft: () => <HeaderBackButton />,
              }}
            />
          </Stack>
        </ThemeProvider>
      </LitClubProvider>
    </SessionProvider>
  );
}
