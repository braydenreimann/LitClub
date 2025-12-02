import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Link } from 'expo-router';
import SearchBar from '@/components/temp/SearchBar';

export default function Header() {
  return (
    // Sample data to display in the FlatList - Sourced from GeeksforGeeks
    <View style={styles.header}>
      <Link href="/bookrecs">
        <Image
          source={require('@/assets/images/small logo.png')}
          style={styles.headerImage}
          contentFit="contain"
        />
      </Link>

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
    height: 150,
    flexDirection: 'row',
  },
  searchBar: {
    marginTop: 10,

  }
});