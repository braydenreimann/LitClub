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
    title?: string;
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
    title = 'My Bookshelf',
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
            <Text style={[globalStyles.heading, styles.title]} numberOfLines={2}>
                {title}
            </Text>
            {sections.map((section) => (
                <View key={section.status} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={[globalStyles.subheading, styles.sectionTitle]}>
                            {section.title}
                        </Text>
                    </View>
                    <View style={styles.sectionCard}>
                        <ReadingList
                            status={section.status}
                            ownerId={ownerId}
                            refreshKey={refreshKey}
                            onBookPress={onBookPress}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 32,
        marginBottom: 12,
        color: colors.midBlue,
    },
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    sectionAccent: {
        width: 6,
        height: 22,
        borderRadius: 3,
        backgroundColor: colors.midBlue,
        marginRight: 8,
        flexShrink: 0,
    },
    sectionTitle: {
        marginLeft: 0,
        marginTop: 2,
        color: colors.midBlue,
        flexShrink: 1,
        flex: 1,
        minWidth: 0,
        flexWrap: 'wrap',
    },
    sectionCard: {
        backgroundColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
});
