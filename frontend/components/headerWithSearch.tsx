import { Image } from 'expo-image';
import { StyleSheet, View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import SearchBar from '@/components/SearchBar';

export default function Header() {
  return (
    <View style={styles.header}>
      <Link href="/bookrecs" asChild>
        <Pressable>
          <Image
            source={require('@/assets/images/small logo.png')}
            style={styles.headerImage}
            contentFit="contain"
          />
        </Pressable>
      </Link>

      <View style={styles.searchWrapper}>
        <SearchBar maxWidth={220} />
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
    zIndex: 10,
    elevation: 6,
    position: 'relative',
  },
  searchWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
});
