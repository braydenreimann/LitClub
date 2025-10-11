import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { SearchBar } from 'react-native-screens';
import { useState } from 'react';

export default function HomeScreen() {

  // Sample data to display in the FlatList - Sourced from GeeksforGeeks
    const DATA = [
    { id: "1", title: "Data Structures" },
    { id: "2", title: "STL" },
    { id: "3", title: "C++" },
    { id: "4", title: "Java" },
    { id: "5", title: "Python" },
    { id: "6", title: "CP" },
    { id: "7", title: "ReactJs" },
    { id: "8", title: "NodeJs" },
    { id: "9", title: "MongoDb" },
    { id: "10", title: "ExpressJs" },
    { id: "11", title: "PHP" },
    { id: "12", title: "MySql" },
    ];

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/small logo.png')}
          style={styles.headerImage}
          contentFit="contain"
        />
        
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor="#555"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

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
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 70,
    paddingLeft: 20,
    height: 120,
  },
  searchBar: {
    marginTop: 10,
    
  }
});

