import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { fonts } from '@/theme';

export const createStackScreenOptions = (
  colorScheme: 'light' | 'dark',
): NativeStackNavigationOptions => {
  const palette = Colors[colorScheme];

  return {
    headerShown: true,
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerTintColor: palette.text,
    headerBackTitle: 'Back',
    headerBackTitleVisible: Platform.OS === 'ios',
    headerStyle: { backgroundColor: palette.background },
    headerTitleStyle: {
      fontFamily: fonts.heading,
      fontSize: 18,
      color: palette.text,
    },
  };
};
