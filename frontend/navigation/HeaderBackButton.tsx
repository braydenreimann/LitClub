import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fonts } from '@/theme';

export function HeaderBackButton() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const paletteKey = colorScheme === 'dark' ? 'dark' : 'light';
  const tint = Colors[paletteKey].text;

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    // Fallback in case the stack history is lost
    router.replace('/home');
  };

  return (
    <Pressable onPress={handlePress} hitSlop={12} style={{ paddingHorizontal: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="chevron-back" size={22} color={tint} />
        <Text
          style={{
            color: tint,
            fontFamily: fonts.subheading,
            fontSize: 16,
          }}
        >
          Back
        </Text>
      </View>
    </Pressable>
  );
}
