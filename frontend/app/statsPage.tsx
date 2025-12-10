import React from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { Pressable, View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';

import Header from '../components/headerWithSearch';
import { colors, fonts } from '../theme';
import ReadingList from '../components/ReadingList';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Fonts } from '../constants/theme';
import { ShelfStatus } from '@/domain/shelfStatus';

function Jump2discButton() {
    return (
        <Pressable
            style={globalStyles.discButton}
            onPress={() => {
                Alert.alert('jumping to discussion...'); /* TODO make the buttons go to their clubs */
            }}
        >
            <Text>Jump To Discussion</Text>
        </Pressable>
    );
}

function BackButton() {
    return (
        <Pressable>
            <Link href="/profile">
                <EvilIcons
                    name="chevron-left"
                    size={50}
                    color="#193350"
                    marginLeft="20"
                    marginBottom="10"
                />
            </Link>
        </Pressable>
    );
}

export default function StatsScreen() {
    // PRE_INTEGRATION: This will be a template page for all book clubs to go to
    return (
        <View style={{ flex: 1, backgroundColor: '#E4D7C8' }}>
            <Header />
            <ScrollView>
                <View style={{ flexDirection: 'row' }}>
                    <BackButton />
                    <Text style={globalStyles.heading}> Reading Statistics </Text>
                </View>

                <Text style={globalStyles.body}> this is the bio for my LitClub! </Text>

                <View style={globalStyles.leaderBanner}>
                    <Foundation name="crown" size={30} color="#193350" margin="5" marginTop="0" />
                    <Text style={globalStyles.subheading}> CLUB LEADER: </Text>
                    <Text style={globalStyles.subheading}>@username</Text>
                    <Foundation name="crown" size={30} color="#193350" margin="5" marginTop="0" />
                </View>

                {/* currently reading section */}
                <View style={globalStyles.currentRead}>
                    <View style={globalStyles.sideRead}>
                        <View style={globalStyles.card} />
                        <Text>Book Title</Text>
                    </View>
                    <View style={globalStyles.sideRead}>
                        <View style={globalStyles.discBox}>
                            <Text>This is our most recent discussion!</Text>
                        </View>
                        <Jump2discButton />
                    </View>
                </View>

                {/* shelves */}
                <View>
                    <Text style={globalStyles.subheading}>Upcoming Reads</Text>
                    <ReadingList status={ShelfStatus.FutureReads} />

                    <Text style={globalStyles.subheading}>Past Reads</Text>
                    <ReadingList status={ShelfStatus.PastReads} />
                    
                </View>
            </ScrollView>
        </View>
    );
}

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.cream,
        padding: 16,
    },
    leaderBanner: {
        flexDirection: 'row',
        width: '100%',
        height: 40,
        backgroundColor: '#F7C76C',
        fontFamily: 'serif',
        fontSize: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    currentRead: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 15,
    },
    sideRead: {
        flexDirection: 'column',
        width: 120,
        marginHorizontal: 20,
    },
    discBox: {
        backgroundColor: '#E4D7C8',
        borderColor: '#193350',
        borderWidth: 4,
        borderRadius: 12,
        margin: 5,
        marginTop: 20,
        height: 120,
        width: '120%',
    },
    discButton: {
        backgroundColor: '#629FAE',
        borderColor: 'black',
        borderWidth: 4,
        borderRadius: 12,
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: 5,
        height: 45,
        width: '120%',
    },
    heading: {
        fontFamily: fonts.heading,
        fontSize: 32,
        color: colors.midBlue,
        marginBottom: 8,
    },
    subheading: {
        fontFamily: fonts.subheading,
        fontSize: 22,
        color: colors.midBlue,
        alignContent: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    body: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.darkest,
        lineHeight: 22,
    },
    scrollContainer: {
        overflowX: 'scroll' as any, // RN web only; ignore on native
        overflowY: 'hidden' as any,
        padding: 10,
    },
    scrollingWrapper: {
        flex: 1,
    },
    cardGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 5,
        margin: 5,
    },
    card: {
        width: 120,
        height: 180,
        backgroundColor: 'teal',
        borderColor: 'black',
        margin: 15,
    },
    cardFont: {
        fontFamily: Fonts.sans,
        color: colors.darkest,
        lineHeight: 22,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
});
