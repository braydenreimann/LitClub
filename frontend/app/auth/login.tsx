import { ChivoMono_500Medium } from '@expo-google-fonts/chivo-mono';
import { Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { NotoSansMono_400Regular } from '@expo-google-fonts/noto-sans-mono';
import { Link, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Formik } from 'formik';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';
import { useSession } from '@/auth/authContext';
import { globalStyles } from '../../styles/globalStyles';
import { colors, fonts } from '../../theme';

import type { LoginInput } from '@/api-mappers/auth/auth-mappers';

SplashScreen.preventAutoHideAsync();

const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginScreen() {
  const { signIn } = useSession();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    ChivoMono_500Medium,
    NotoSansMono_400Regular,
  });
  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const handleLogin = async (values: LoginInput) => {
    const success = await signIn(values);

    if (success) {
      router.push('/home');
    } else {
      Alert.alert('Login failed', 'Invalid email or password.');
    }
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      <Text style={globalStyles.heading}>Welcome Back</Text>

      <Formik
        validationSchema={loginValidationSchema}
        initialValues={{ email: '', password: '' }}
        onSubmit={handleLogin}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
        }) => (
          <>
            {/* Email */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.nextDarkest}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
            </View>
            {errors.email && touched.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            {/* Password */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.nextDarkest}
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
            </View>
            {errors.password && touched.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSubmit as any}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            {/* Signup link */}
            <Text style={styles.linkText}>
              Don’t have an account?{' '}
              <Link href="/auth/signup" style={styles.link}>
                Sign up
              </Link>
            </Text>
          </>
        )}
      </Formik>
    </View>
  );
}

// 🎨 Custom styles
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: 20,
  },
  inputContainer: {
    backgroundColor: colors.sage,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.darkest,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.midBlue,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.midBlue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: colors.teal,
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.subheading,
    color: colors.cream,
    fontSize: 18,
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: fonts.body,
    color: colors.darkest,
  },
  link: {
    fontFamily: fonts.subheading,
    color: colors.midBlue,
  },
});
