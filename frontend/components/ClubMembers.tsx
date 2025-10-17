import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors, fonts } from '../theme';

export default function ClubMembers() {
  // Mock user data (replace later with backend fetch)
  const members = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
  }));

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {members.map((member) => (
          <View key={member.id} style={styles.memberContainer}>
            <View style={styles.profileCircle}>
              {/* Placeholder for profile picture */}
              {/* Later, replace with: 
                  <Image source={{ uri: member.profilePicUrl }} style={styles.profileImage} /> 
              */}
            </View>
            <Text style={styles.username}>{member.username}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
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
    borderColor: colors.teal,
  },
  username: {
    fontFamily: fonts.body,
    color: colors.darkest,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
