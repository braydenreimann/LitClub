import { StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: 16,
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
    marginBottom: 6,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.darkest,
    lineHeight: 22,
  },
});