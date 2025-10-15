import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors, fonts } from '../../theme';

const pronounOptions = [
  'he', 'him', 'his',
  'she', 'her', 'hers',
  'they', 'them', 'theirs',
  'it', 'its',
  'xe', 'xem', 'xyr',
];

export default function CreateAccountScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [biography, setBiography] = useState('');
  const [privateAccount, setPrivateAccount] = useState(false);
  const [selectedPronouns, setSelectedPronouns] = useState<string[]>([]);

  const togglePronoun = (p: string) => {
    setSelectedPronouns((prev) => {
      if (prev.includes(p)) {
        return prev.filter((x) => x !== p);
      } else if (prev.length < 4) {
        return [...prev, p];
      } else {
        Alert.alert('Limit reached', 'You can select up to 4 pronouns.');
        return prev;
      }
    });
  };

  const handleSave = async () => {
    if (!username || !firstName) {
      Alert.alert('Missing information', 'Please enter at least a username and first name.');
      return;
    }

    const userData = {
      firstName,
      lastName,
      username,
      email: email || '',
      biography,
      pronouns: selectedPronouns,
      private: privateAccount,
      genrePreference: null, // Placeholder for future use
    };

    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      console.log('Saved user profile:', userData);
      router.push('/home');
    } catch (error) {
      console.error('Failed to save user data:', error);
      Alert.alert('Error', 'Failed to save your information.');
    }
  };

  return (
    <ScrollView style={[globalStyles.container, styles.container]}>
      <Text style={globalStyles.heading}>Complete Your Profile</Text>

      {/* Email (readonly) */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, styles.readonly]}
        value={email || ''}
        editable={false}
      />

      {/* Username */}
      <Text style={styles.label}>Username *</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Choose a username"
        placeholderTextColor={colors.nextDarkest}
      />

      {/* First name */}
      <Text style={styles.label}>First Name *</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter your first name"
        placeholderTextColor={colors.nextDarkest}
      />

      {/* Last name */}
      <Text style={styles.label}>Last Name (optional)</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter your last name"
        placeholderTextColor={colors.nextDarkest}
      />

      {/* Pronouns */}
      <Text style={styles.label}>Pronouns (select up to 4)</Text>
      <View style={styles.pronounContainer}>
        {pronounOptions.map((p) => {
          const selected = selectedPronouns.includes(p);
          return (
            <TouchableOpacity
              key={p}
              onPress={() => togglePronoun(p)}
              style={[styles.pronounButton, selected && styles.pronounSelected]}
            >
              <Text style={[styles.pronounText, selected && styles.pronounTextSelected]}>
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bio */}
      <Text style={styles.label}>Short Bio (optional, up to 500 characters)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={biography}
        onChangeText={(text) => {
          if (text.length <= 500) setBiography(text);
        }}
        multiline
        placeholder="Tell us a little about yourself..."
        placeholderTextColor={colors.nextDarkest}
      />
      <Text style={styles.charCount}>{biography.length}/500</Text>

      {/* Private Account */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Private Account</Text>
        <Switch
          value={privateAccount}
          onValueChange={setPrivateAccount}
          trackColor={{ false: colors.teal, true: colors.midBlue }}
          thumbColor={colors.cream}
        />
      </View>

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save and Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  label: {
    fontFamily: fonts.subheading,
    fontSize: 16,
    color: colors.darkest,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.sage,
    borderRadius: 8,
    padding: 10,
    fontFamily: fonts.body,
    color: colors.darkest,
  },
  readonly: {
    opacity: 0.6,
  },
  pronounContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pronounButton: {
    backgroundColor: colors.sage,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  pronounSelected: {
    backgroundColor: colors.midBlue,
  },
  pronounText: {
    color: colors.darkest,
    fontFamily: fonts.body,
  },
  pronounTextSelected: {
    color: colors.cream,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.nextDarkest,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: colors.midBlue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontFamily: fonts.subheading,
    color: colors.cream,
    fontSize: 18,
  },
});
