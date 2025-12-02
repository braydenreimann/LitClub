/* begin tableOfContents.tsx */

import React, { useEffect, useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../theme';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '@/styles/globalStyles';

import { getBook } from '../services/booksService';
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';


const CustomCheckbox = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <Pressable onPress={onChange} style={{ padding: 4 }}>
    <Ionicons
      name={value ? "checkbox" : "square-outline"}
      size={24}
      color={value ? colors.midBlue : colors.darkest}
    />
  </Pressable>
);

function BackButton() {
  const router = useRouter(); // Initialize the router hook

  const handlePress = () => {
    router.back(); // Call the back function
  };

  return (
    <Pressable onPress={handlePress}>
      <EvilIcons
        name="chevron-left"
        size={50}
        color="#193350"
        style={{ marginLeft: 20, marginBottom: 10, marginTop: 15 }} // Use style object for multiple styles
      />
    </Pressable>
  );
}

export default function TableOfContents() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedChapters, setCheckedChapters] = useState<{ [key: number]: boolean }>({});


  useEffect(() => {
    let mounted = true;
    const fetchBook = async () => {
      try {
        if (!bookId) throw new Error("No bookId provided.");
        const data = await getBook(bookId);
        if (!mounted) return;
        setBook(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBook();
    return () => { mounted = false; };
  }, [bookId]);

  //persistence with checkboxes -used AI to help
  useEffect(() => {
    const loadChecked = async () => {
      try {
        const saved = await AsyncStorage.getItem(`book-${bookId}-checkedChapters`);
        if (saved) setCheckedChapters(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load checked chapters", e);
      }
    };
    loadChecked();
  }, [bookId]);

  // Save state whenever it changes -used AI to helpo
  useEffect(() => {
    const saveChecked = async () => {
      try {
        await AsyncStorage.setItem(
          `book-${bookId}-checkedChapters`,
          JSON.stringify(checkedChapters)
        );
      } catch (e) {
        console.warn("Failed to save checked chapters", e);
      }
    };
    saveChecked();
  }, [checkedChapters, bookId]);

  if (loading) return (
    <View style={[globalStyles.container, styles.center]}>
      <ActivityIndicator size="large" color={colors.midBlue} />
    </View>
  );

  if (error) return (
    <View style={[globalStyles.container, styles.center]}>
      <Text style={{ color: colors.darkest }}>{error}</Text>
    </View>
  );

  const totalChapters = book?.totalChapters ?? 0;

  const checkboxes = (chapterNumber: number) => {
    setCheckedChapters(prev => {
      const newChecked: { [key: number]: boolean } = { ...prev };
      const currentlyChecked = !!prev[chapterNumber];

      if (currentlyChecked) {
        // Unchecking: uncheck this chapter and all after it
        for (let i = chapterNumber; i <= totalChapters; i++) {
          newChecked[i] = false;
        }
      } else {
        // Checking: check this chapter and all previous
        for (let i = 1; i <= chapterNumber; i++) {
          newChecked[i] = true;
        }
      }

      return newChecked;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.yellow }}>
      <ScrollView>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 16 }}>
          <BackButton />
          <Text style={[globalStyles.heading, { color: colors.midBlue, fontSize: 24, marginBottom: 16, marginTop: 16, marginLeft: 10 }]}>
            {book?.title ?? "Untitled Book"}
          </Text>
        </View>

        <View style={styles.divider} />

        {totalChapters === 0 ? (
          <Text style={[globalStyles.body, { fontStyle: "italic", color: colors.nextDarkest }]}>
            No chapters available.
          </Text>
        ) : (
          Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapterNumber) => (
            <View key={chapterNumber}>
              <Pressable
                style={styles.chapterButton}
                onPress={() => {
                  router.push(`/threads/thread-${chapterNumber}`)
                }}
              >
                <Text style={[globalStyles.subheading, { fontSize: 18, color: colors.darkest }]}>
                  Chapter {chapterNumber}
                </Text>
                <CustomCheckbox
                  value={checkedChapters[chapterNumber] || false}
                  onChange={() => checkboxes(chapterNumber)}
                />
              </Pressable>
              {chapterNumber < totalChapters && <View style={styles.divider} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  chapterButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.teal,
    //marginVertical: 4,
  },
  divider: {
    height: 3,
    backgroundColor: colors.darkest,
    //marginVertical: 4,
  },
  forumBox: {
    backgroundColor: colors.sage,
    borderWidth: 4,
    borderRightWidth: 20,
    borderColor: colors.darkest,
    borderRadius: 12,
    padding: 12,
    textAlign: "center",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  checkbox: {
    marginLeft: 8,
  },
});

/* end tableOfContents.tsx */
