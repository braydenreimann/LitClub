// components/threads/ReplyComposer.tsx
import React, { useCallback, useRef, useState } from "react";
import { View, TextInput, Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "@/theme";

type Props = {
    placeholder?: string;
    onSubmit: (text: string) => Promise<void> | void;
    onSubmitted?: () => void;
    refocusAfterSubmit?: boolean;
    onFocus?: () => void; // ⬅️ NEW
};

export default function ReplyComposer({
    placeholder = "Write a reply…",
    onSubmit,
    onSubmitted,
    refocusAfterSubmit = true,
    onFocus,
}: Props) {
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const ref = useRef<TextInput>(null);
    const canPost = text.trim().length > 0 && !busy;

    const submit = useCallback(async () => {
        const body = text.trim();
        if (!body || busy) return;
        setBusy(true);
        try {
            await onSubmit(body);
            setText("");
            onSubmitted?.();
            if (refocusAfterSubmit) {
                requestAnimationFrame(() => ref.current?.focus());
            }
        } finally {
            setBusy(false);
        }
    }, [text, busy, onSubmit, onSubmitted, refocusAfterSubmit]);

    return (
        <View style={styles.wrap}>
            <TextInput
                ref={ref}
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                placeholderTextColor={colors.nextDarkest}
                editable={!busy}
                multiline
                returnKeyType="send"
                onSubmitEditing={submit}
                onFocus={onFocus}             // ⬅️ NEW
            />
            <Pressable onPress={submit} disabled={!canPost} style={[styles.btn, !canPost && { opacity: 0.6 }]}>
                {busy ? <ActivityIndicator /> : <Text style={styles.btnText}>Reply</Text>}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginTop: 8, paddingLeft: 12, gap: 6 },
    input: {
        borderWidth: 1, borderColor: colors.midBlue, backgroundColor: "#fff",
        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, minHeight: 36, color: colors.darkest,
    },
    btn: { alignSelf: "flex-start", backgroundColor: colors.midBlue, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    btnText: { color: "#fff", fontWeight: "700" },
});