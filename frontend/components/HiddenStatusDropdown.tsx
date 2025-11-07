/* 
HOW TO USE:

1. Imports:

import BookStatusDropdown from "../components/HiddenStatusDropdown";

2. In the export default function BEFORE return() statement:
  const handlePrivacyChange = (newPrivacyStatus: string) => {
    console.log("Privacy status changed to:", newPrivacyStatus);
    // TODO: send newPrivacyStatus to Cosmos DB later
  };

3. IN return statement: Simply add:

    <View style={globalStyles.container}>
      <HiddenStatusDropdown onStatusChange={handlePrivacyChange} />
    </View>

*/
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

const STATUS_OPTIONS = ["Public", "Hidden"];

type HiddenStatusDropdownProps = {
  initialStatus?: string;
  onStatusChange?: (newStatus: string) => void;
};

export default function HiddenStatusDropdown({
  initialStatus = "Public",
  onStatusChange,
}: HiddenStatusDropdownProps) {
  const [status, setStatus] = useState(initialStatus);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSelect = (newStatus: string) => {
    setStatus(newStatus);
    setDropdownVisible(false);
    if (onStatusChange) onStatusChange(newStatus);
  };

  return (
    <View style={styles.container}>
      {/* Main Button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={styles.buttonText}>{status}</Text>
      </Pressable>

      {/* Dropdown List */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          {STATUS_OPTIONS.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [
                styles.dropdownItem,
                pressed && { backgroundColor: colors.sage },
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  item === status && { fontWeight: "bold", color: colors.midBlue },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",          // responsive width
    maxWidth: 300,          // optional max width
    alignItems: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: colors.teal,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.darkest,
  },
  buttonText: {
    fontFamily: fonts.subheading,
    color: colors.cream,
    fontSize: 16,
    textAlign: "center",
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: colors.cream,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkest,
    width: "100%",          // match parent width
    maxHeight: 220,
    overflow: "hidden",
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.darkest,
    textAlign: "center",
  },
});
