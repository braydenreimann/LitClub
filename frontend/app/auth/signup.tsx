/* Code for login page altered from 
https://medium.com/@chaudharyalinawazz/building-a-login-screen-in-react-native-a-step-by-step-guide-f90b10aea4ec */
/* alterations assisted by ChatGPT */
import { Link, useRouter } from 'expo-router';
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
import { useSession } from '@/context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { colors, fonts } from '../../theme';

const signupValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, ({ min }) => `Password must be at least ${min} characters`)
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function SignUpScreen() {
  const { signIn } = useSession();
  const router = useRouter();

  const handleSignUp = async (values: { email: string; password: string; confirmPassword: string }) => {
    router.push({
      pathname: '/auth/create_account',
      params: { email: values.email, password: values.password },
    });
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      <Text style={[globalStyles.heading, styles.title]}>Create Account</Text>

      <Formik
        validationSchema={signupValidationSchema}
        initialValues={{ email: '', password: '', confirmPassword: '' }}
        onSubmit={handleSignUp}
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

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.nextDarkest}
                secureTextEntry
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
            </View>
            {errors.confirmPassword && touched.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSubmit as any}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Login link */}
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Link href="/auth/login" style={styles.link}>
                Log in
              </Link>
            </Text>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 18,
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
