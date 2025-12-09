// /frontend/components/BookShelf.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import ReadingList from './ReadingList';
import { globalStyles } from '@/styles/globalStyles';
import { colors } from '@/theme';
import { ShelfStatus } from '@/domain/shelfStatus';

interface BookShelfProps {
    ownerId?: string;
    refreshKey?: number;
    onBookPress?: (bookId: string) => void;
}

/**
 * Reusable bookshelf section that renders:
 * - Currently Reading
 * - Future Reads
 * - Past Reads
 *
 * Uses the domain ShelfStatus enum.
 */
export default function BookShelf({
    ownerId,
    refreshKey,
    onBookPress,
}: BookShelfProps) {
    const sections = [
        {
            title: 'Currently Reading',
            status: ShelfStatus.CurrentlyReading,
        },
        {
            title: 'Past Reads',
            status: ShelfStatus.PastReads,
        },
        {
            title: 'Future Reads',
            status: ShelfStatus.FutureReads,
        },
    ];

    return (
        <View style={styles.container}>
            {sections.map((section) => (
                <View key={section.status} style={styles.section}>
                    <Text style={[globalStyles.subheading, styles.sectionTitle]}>
                        {section.title}
                    </Text>
                    <ReadingList
                        status={section.status}
                        ownerId={ownerId}
                        refreshKey={refreshKey}
                        onBookPress={onBookPress}
                    />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 20,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        marginLeft: 0,
        marginTop: 10,
        color: colors.midBlue,
    },
});
