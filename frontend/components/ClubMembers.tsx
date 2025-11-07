import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation';
import Constants from 'expo-constants';
import { colors, fonts } from '@/theme';
import { User } from '@/domain/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { featureFlags } from 'react-native-screens';

type ClubMembersProps = {
  memberUserIds: string[];
  ownerUserId: string;
};

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;

export default function ClubMembers({ memberUserIds, ownerUserId }: ClubMembersProps) {
  // Mock user data (replace later with backend fetch)
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberUserIds || memberUserIds.length === 0) {
      setLoading(false);
      return;
    }

    async function loadMembers() {
      try {
        const fetchedMembers: User[] = await Promise.all(
          memberUserIds.map(async (id) => {
            try {
              const res = await fetch(`${API_BASE_URL}/users/${id}`);
              if (!res.ok) {
                throw new Error('Failed to fetch users');
              }
              return await res.json();
            } catch (err) {
              console.warn(`Failed to fetch user ${id}:`, err);
              return null;
            }
          })
        );
        setMembers(fetchedMembers.filter((m): m is User => m !== null));
      } catch (err) {
        console.error('Error loading club members:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [memberUserIds]);



  if (loading) {
      return <ActivityIndicator style={{ marginVertical: 20 }} />;
  }

  if (members.length === 0) {
      return <Text style={styles.noMembers}>No members yet.</Text>;
  }

  return (
    <ScrollView horizontal contentContainerStyle={[styles.scrollContainer]}>
        {members.map((member) => {
          const displayName = member.userName || member.username || member.name || (member as any).displayName || 'Unknown';
          return (
          <View key={member.id} style={styles.memberContainer}>
            <View style={
              member.id === ownerUserId
                ? styles.ownerProfileCircle
                : styles.profileCircle
            }>
            </View>
            <Text style={styles.username}>@{displayName}</Text>
          </View>
          );
    })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  memberContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40, // makes it a circle
    backgroundColor: colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.midBlue,
  },
  ownerProfileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40, // makes it a circle
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.midBlue,
  },
  username: {
    fontFamily: fonts.body,
    color: colors.darkest,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  noMembers: {
        fontFamily: fonts.body,
        fontSize: 16,
        color: colors.midBlue,
        marginVertical: 10,
    },
    
});