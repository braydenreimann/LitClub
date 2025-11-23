/* begin VoteButtons.tsx */

import React, { useCallback, useEffect, useRef } from "react";
import { View, Pressable, Text, StyleSheet, Animated } from "react-native";
import { colors } from "@/theme";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import { formatScore } from "@/utils/formatScore";

type Props = {
    currentVote: -1 | 0 | 1;
    score: number;
    onChange: (nextVote: -1 | 0 | 1) => void | Promise<void>;
    compact?: boolean;
    disabled?: boolean;
    activeColor?: string;
};

/**
 * Zero layout-shift + bounce:
 * - Fixed wrapper width (regular/compact)
 * - Fixed icon boxes (24x24)
 * - Fixed score box width so digit changes don't reflow
 * - Bold via strokeWidth when active
 * - "Bounce" spring animation on the arrow when it becomes active
 */
export default function VoteButtons({
    currentVote,
    score,
    onChange,
    compact,
    disabled,
    activeColor = colors.midBlue,
}: Props) {
    const size = compact ? 16 : 20;

    const upActive = currentVote === 1;
    const downActive = currentVote === -1;

    const upColor = upActive ? activeColor : colors.nextDarkest;
    const downColor = downActive ? activeColor : colors.nextDarkest;

    // Animated scales for bounce (kept inside fixed-size boxes → no layout shift)
    const upScale = useRef(new Animated.Value(1)).current;
    const downScale = useRef(new Animated.Value(1)).current;

    const bounce = useCallback((anim: Animated.Value) => {
        // Quick pop to 1.12 then spring back to 1.0
        Animated.sequence([
            Animated.spring(anim, {
                toValue: 1.12,
                useNativeDriver: true,
                speed: 20,     // snappy
                bounciness: 8, // a bit playful
            }),
            Animated.spring(anim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 16,
                bounciness: 6,
            }),
        ]).start();
    }, []);

    // When an arrow becomes active, bounce it
    const prevVoteRef = useRef(currentVote);
    useEffect(() => {
        if (prevVoteRef.current !== currentVote) {
            if (currentVote === 1) bounce(upScale);
            else if (currentVote === -1) bounce(downScale);
            prevVoteRef.current = currentVote;
        }
    }, [currentVote, bounce, upScale, downScale]);

    const tapUp = useCallback(() => {
        if (disabled) return;
        onChange(upActive ? 0 : 1);
    }, [disabled, onChange, upActive]);

    const tapDown = useCallback(() => {
        if (disabled) return;
        onChange(downActive ? 0 : -1);
    }, [disabled, onChange, downActive]);

    return (
        <View style={[styles.row, compact ? styles.rowCompact : styles.rowRegular]}>
            <Pressable onPress={tapUp} hitSlop={8} style={styles.iconBox}>
                <Animated.View style={{ transform: [{ scale: upScale }] }}>
                    <ChevronUp
                        size={size}
                        color={upColor}
                        strokeWidth={upActive ? 3 : 1.75} // bold on select
                    />
                </Animated.View>
            </Pressable>

            {/* Score box grows to fit content, keeps spacing via padding */}
            <View style={styles.scoreBox}>
                <Text
                    style={[styles.scoreText, compact && { fontSize: 12 }]}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                >
                    {formatScore(score)}
                </Text>
            </View>

            <Pressable onPress={tapDown} hitSlop={8} style={styles.iconBox}>
                <Animated.View style={{ transform: [{ scale: downScale }] }}>
                    <ChevronDown
                        size={size}
                        color={downColor}
                        strokeWidth={downActive ? 3 : 1.75} // bold on select
                    />
                </Animated.View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    // Even spacing between icons and score
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rowRegular: {
        columnGap: 4,
    },
    rowCompact: {
        columnGap: 4,
    },

    // Fixed icon boxes; animation happens inside via transforms
    iconBox: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },

    // Fixed-width score box centered
    scoreBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
        minWidth: 24,
        flexShrink: 0,
    },
    scoreText: {
        color: colors.nextDarkest,
        fontWeight: "600",
    }
});

/* end VoteButtons.tsx */
