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
  scrollContainer: {
        overflowX: 'scroll',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        padding: 10,
    },
    scrollingWrapper: {
        flex: 1,
    },
    card: {
        width: 120,
        height: 180,
        marginRight: 10,
        borderRadius: 8,
        backgroundColor: colors.teal,
        borderColor: colors.darkest,
        fontFamily: fonts.subheading
    },
    cardGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10, // or margin/padding for spacing
      marginTop: 10,
    },
    litclubCard: {
      width: 120,
      height: 180,
      backgroundColor: colors.teal,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginBottom: 10,
      padding: 5,
    },
    cardFont: {
      color: colors.cream,
      textAlign: 'center',
      fontWeight: 'bold',
      flexWrap: 'wrap',
    }, 
    button: {
        marginTop: 20,
        backgroundColor: colors.sage,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.darkest,
        fontFamily: fonts.body,
        fontSize: 18,
    }, 
});