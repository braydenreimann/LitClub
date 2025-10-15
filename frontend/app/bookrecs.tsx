import { Image } from 'expo-image';
import { Button, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import SearchBar from '@/components/SearchBar';
import ReadingList from '@/components/ReadingList';
import { Link, router } from 'expo-router';


export default function BooksPage() {
    return (
        
        <ScrollView style={{ flex: 1, backgroundColor: "#E4D7C8" }}>
            <View>  

                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title" style={{ fontFamily: 'System', fontSize: 25, paddingTop: 25, paddingHorizontal: 25}}>
                        Recommended Books
                    </ThemedText>
                </ThemedView>

                


            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#E4D7C8',
    justifyContent: 'flex-start',
  },
  headerImage: {
    width: 80,
    height: 180,
    resizeMode: 'contain',
  },
  header: {
    backgroundColor: '#94a694',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 70,
    paddingLeft: 20,
    height: 120,
  },
});

