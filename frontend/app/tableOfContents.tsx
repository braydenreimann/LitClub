import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts } from "@/theme";
import { getBook } from "@/services/booksService";
import { globalStyles } from "@/styles/globalStyles";

export default function TableOfContents() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.yellow }}>
      <ScrollView >
        <Text style={[globalStyles.heading, { color: colors.midBlue, fontSize: 24, marginBottom: 16, marginTop: 16, marginLeft: 10}]}>
          {book?.title ?? "Untitled Book"}
        </Text>
        <View style={styles.divider}>

        </View>

        {totalChapters === 0 ? (
          <Text style={[globalStyles.body, { fontStyle: "italic", color: colors.nextDarkest }]}>
            No chapters available.
          </Text>
        ) : (
          Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapterNumber) => (
            <View key={chapterNumber}>
              <Pressable
                style={styles.chapterButton}
                onPress={() => router.push('/threads/thread-${chapterNumber}')}
              >
                <Text style={[globalStyles.subheading, { fontSize: 18, color: colors.darkest }]}>
                  Chapter {chapterNumber}
                </Text>
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
});
