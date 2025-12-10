import React from 'react';
import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

interface SearchFieldProps extends TextInputProps {
    containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Reusable themed search input with left icon.
 * Keeps consistent styling between header search and bookrecs search.
 */
export default function SearchField({
    containerStyle,
    style,
    placeholder = 'Search',
    placeholderTextColor = 'rgba(228, 215, 200, 0.8)',
    ...textInputProps
}: SearchFieldProps) {
    return (
        <View style={[styles.inputRow, containerStyle]}>
            <Ionicons name="search" size={18} color={colors.cream} />
            <TextInput
                style={[styles.searchInput, style]}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                {...textInputProps}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.nextDarkest,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        borderWidth: 1.5,
        borderColor: colors.cream,
        shadowColor: colors.nextDarkest,
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        color: colors.cream,
        fontSize: 16,
        paddingVertical: 2,
    },
});
