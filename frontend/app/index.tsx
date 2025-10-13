import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../auth/authContext';
import { globalStyles } from '../styles/globalStyles';
import { colors, fonts } from '../theme';

export default function index() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (session) {
        router.replace('/home');
      } else {
        router.replace('/auth/login'); //Not logged in - going to login
      }
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