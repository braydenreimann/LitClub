import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/theme";

type HiddenToggleProps = {
    count: number;
    shown: boolean;
    onToggle: () => void;
    kind: "comments" | "replies";
};

export default function HiddenToggle({ count, shown, onToggle, kind }: HiddenToggleProps) {
    if (count <= 0) return null;
    return (
        <Pressable onPress={onToggle} style={styles.wrap}>
            <Text style={styles.text}>
                {shown ? `Hide hidden ${kind}` : `View hidden ${kind} (${count})…`}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrap: { alignSelf: "flex-start", marginTop: 8 },
    text: { color: colors.nextDarkest, fontStyle: "italic" },
});
