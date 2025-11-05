// components/AddCommentBar.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    View,
    TextInput,
    Pressable,
    Text,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme";
import type { Author, CommentResponse } from "@/domain/models/thread-types";
import { addTopLevelComment } from "@/services/commentsService";

type AddCommentBarProps = {
    threadId: string;
    author: Author;
    onOptimisticCreate: (temp: CommentResponse) => void;
    onServerConfirm?: (tempId: string, saved: CommentResponse) => void;
    onServerError?: (tempId: string, err: unknown) => void;
};

export default function AddCommentBar({
    threadId,
    author,
    onOptimisticCreate,
    onServerConfirm,
    onServerError,
}: AddCommentBarProps) {
    const insets = useSafeAreaInsets();
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const canPost = text.trim().length > 0 && !submitting;

    const createTemp = useCallback(
        (body: string): CommentResponse => ({
            id: `temp-${Date.now()}`,
            threadId,
            author,
            body,
            parentCommentId: "",
            created: new Date().toISOString(),
            updated: null,
            score: 0,
            isDeleted: false,
            replyCount: 0,
        }),
        [author, threadId]
    );

    const onSubmit = useCallback(async () => {
        const body = text.trim();
        if (!body || submitting) return;

        setSubmitting(true);
        const temp = createTemp(body);
        onOptimisticCreate(temp);
        setText("");

        try {
            const saved = await addTopLevelComment(
                threadId,
                {
                    authorId: author.authorId,
                    username: author.username,
                    profilePhotoUrl: author.profilePhotoUrl ?? undefined,
                },
                body
            );
            onServerConfirm?.(temp.id, saved);
        } catch (err) {
            onServerError?.(temp.id, err);
        } finally {
            setSubmitting(false);
            // keep focus for fast comment streams
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [text, submitting, createTemp, onOptimisticCreate, onServerConfirm, onServerError, threadId, author]);

    const bottomPad = useMemo(() => Math.max(insets.bottom, 8), [insets.bottom]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 }) ?? 0}
        >
            <View style={[styles.bar, { paddingBottom: bottomPad }]}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Write a comment…"
                    placeholderTextColor={colors.nextDarkest}
                    multiline
                    value={text}
                    onChangeText={setText}
                    editable={!submitting}
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                />
                <Pressable
                    style={({ pressed }) => [styles.postBtn, (pressed || submitting || !canPost) && styles.postBtnDisabled]}
                    onPress={onSubmit}
                    disabled={!canPost}
                >
                    {submitting ? <ActivityIndicator /> : <Text style={styles.postText}>Post</Text>}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    bar: {
        borderTopWidth: 1,
        borderTopColor: "#e6e2da",
        backgroundColor: colors.cream,
        paddingTop: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        gap: 8,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: colors.midBlue,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: colors.darkest,
    },
    postBtn: {
        alignSelf: "flex-end",
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: colors.midBlue,
    },
    postBtnDisabled: {
        opacity: 0.6,
    },
    postText: {
        color: "#fff",
        fontWeight: "700",
    },
});