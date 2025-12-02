// hooks/useKeyboardHeight.ts
import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";

export function useKeyboardHeight() {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardShown, setKeyboardShown] = useState(false);

    useEffect(() => {
        const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const onShow = (e: KeyboardEvent) => {
            setKeyboardShown(true);
            setKeyboardHeight(e.endCoordinates?.height ?? 0);
        };
        const onHide = () => {
            setKeyboardShown(false);
            setKeyboardHeight(0);
        };

        const subShow = Keyboard.addListener(showEvt, onShow);
        const subHide = Keyboard.addListener(hideEvt, onHide);
        return () => {
            subShow.remove();
            subHide.remove();
        };
    }, []);

    return { keyboardHeight, keyboardShown };
}