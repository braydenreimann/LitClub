import Constants from 'expo-constants';

export const env = {
    HOST_FROM_EXPO: Constants.expoConfig?.hostUri?.split(':')[0] as string
}