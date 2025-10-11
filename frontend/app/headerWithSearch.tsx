import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';

export default function Header() {
  return (
  // Sample data to display in the FlatList - Sourced from GeeksforGeeks
    <View style={styles.header}>
       <Image
          source={require('@/assets/images/small logo.png')}
          style={styles.headerImage}
          contentFit="contain"
        />

        <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 20 }}>
          <SearchBar />
        </View>  
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: 80,
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  header: {
    backgroundColor: '#94a694',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 70,
    paddingLeft: 20,
    height: 120,
    flexDirection: 'row',
  },
  searchBar: {
    marginTop: 10,
    
  }
});

