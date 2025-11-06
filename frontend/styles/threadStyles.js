// styles/threadStyles.ts
import { StyleSheet } from "react-native";

// Pick your background. Use pure white or a soft gray.
// const THREAD_BG = "#FFFFFF";
const THREAD_BG = "#F5F5F7";

export const threadStyles = StyleSheet.create({
    // This only needs to include properties you want to override.
    container: {
        backgroundColor: THREAD_BG,
    },
});