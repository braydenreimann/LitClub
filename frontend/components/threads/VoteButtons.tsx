// components/threads/VoteButtons.tsx
import React, { useCallback } from "react";
import { View, Pressable, Text } from "react-native";
import { colors } from "@/theme";

type Props = {
    /** Current vote of the user on this item */
    currentVote: -1 | 0 | 1;
    /** Called with the NEXT vote after a tap (supports 1, 0, -1) */
    onChange: (next: -1 | 0 | 1) => Promise<void> | void;
    compact?: boolean;
    disabled?: boolean;
};

export default function VoteButtons({
    currentVote,
    onChange,
    compact,
    disabled,
}: Props) {
    const onPressUp = useCallback(() => {
        const next: -1 | 0 | 1 = currentVote === 1 ? 0 : 1; // tap up again => unvote
        onChange(next);
    }, [currentVote, onChange]);

    const onPressDown = useCallback(() => {
        const next: -1 | 0 | 1 = currentVote === -1 ? 0 : -1; // tap down again => unvote
        onChange(next);
    }, [currentVote, onChange]);

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: compact ? 8 : 12,
                opacity: disabled ? 0.6 : 1,
            }}
        >
            <Pressable onPress={onPressUp} disabled={disabled}>
                <Text
                    style={{
                        color: currentVote === 1 ? colors.midBlue : colors.midBlue,
                        fontWeight: currentVote === 1 ? "800" : "600",
                        textDecorationLine: currentVote === 1 ? "underline" : "none",
                    }}
                >
                    Upvote
                </Text>
            </Pressable>

            <Pressable onPress={onPressDown} disabled={disabled}>
                <Text
                    style={{
                        color: currentVote === -1 ? colors.midBlue : colors.midBlue,
                        fontWeight: currentVote === -1 ? "800" : "600",
                        textDecorationLine: currentVote === -1 ? "underline" : "none",
                    }}
                >
                    Downvote
                </Text>
            </Pressable>
        </View>
    );
}