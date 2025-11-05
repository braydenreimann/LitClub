import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { globalStyles } from '../styles/globalStyles';
import { colors, fonts } from '../theme';
import { User } from '../domain/models';

const pronounOptions = [
  'he', 'him', 'his',
  'she', 'her', 'hers',
  'they', 'them', 'theirs',
  'it', 'its',
  'xe', 'xem', 'xyr',
];

export default function EditProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [biography, setBiography] = useState('');
  const [privateAccount, setPrivateAccount] = useState(false);
  const [selectedPronouns, setSelectedPronouns] = useState<string[]>([]);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const sessionString = await AsyncStorage.getItem('session');
        if (!sessionString) return;

        const userData: User = JSON.parse(sessionString);
        setUser(userData);
        setFirstName(userData.firstName || '');
        setLastName(userData.lastName || '');
        setUsername(userData.userName || '');
        setEmail(userData.email || '');
        setBiography(userData.bio || '');
        setPrivateAccount(userData.privateAccount || false);
        {/*setSelectedPronouns(userData.pronouns || []);*/}
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUser();
  }, []);

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
    if (!firstName || !email) {
      Alert.alert('Missing information', 'Please make sure you have a first name and an email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!user) return;

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      bio: biography,
      privateAccount,
      pronouns: selectedPronouns,
    };

    try {
      // TODO: Replace this with an actual API call to update your backend database
      // e.g., await updateUserProfile(updatedUser);

      await AsyncStorage.setItem('session', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Your changes have been saved.');
      router.push('/profile'); // go back to profile page
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'Failed to save your changes.');
    }
  };

  const handleDiscard = () => {
    Alert.alert('Discard Changes?', 'Are you sure you want to discard your edits?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={[globalStyles.container, styles.container]}>
      <Text style={globalStyles.heading}>Edit Your Profile</Text>

      {/* Email (readonly) */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Username (readonly) */}
      <Text style={styles.label}>Username (cannot be changed)</Text>
      <TextInput
        style={[styles.input, styles.readonly]}
        value={username}
        editable={false}
      />

      {/* First Name */}
      <Text style={styles.label}>First Name *</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      {/* Last Name */}
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
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
      <TouchableOpacity
        style={[styles.button, styles.passwordButton]}
          onPress={() => router.push('/changePassword')}
        >
          <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.discardButton]} onPress={handleDiscard}>
          <Text style={styles.buttonText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.midBlue,
  },
  discardButton: {
    backgroundColor: colors.teal,
  },
    passwordButton: {
    backgroundColor: colors.nextDarkest,
    marginTop: 16,
  },
  buttonText: {
    fontFamily: fonts.subheading,
    color: colors.cream,
    fontSize: 18,
  },
});