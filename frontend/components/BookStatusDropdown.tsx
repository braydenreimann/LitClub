/* 
HOW TO USE:

1. Imports:

import BookStatusDropdown from "../components/BookStatusDropdown";

2. In the export default function BEFORE return() statement:
  const handleStatusChange = (newStatus: string) => {
    console.log("Book status changed to:", newStatus);
    // TODO: send newStatus to Cosmos DB later
  };

3. IN return statement: Simply add:

    <View style={globalStyles.container}>
      <BookStatusDropdown onStatusChange={handleStatusChange} />
    </View>

*/
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

const STATUS_OPTIONS = [
  "Not in Your Library",
  "Currently Reading",
  "Future Reads",
  "Past Reads",
];

type ShelfStatus = 0 | 1 | 3 ;

type BookStatusDropdownProps = {
  status: string;
  onStatusChange?: (newStatus: string) => void;
};

export default function BookStatusDropdown({
  //initialStatus = "Not in Your Library",
  status,
  onStatusChange,
}: BookStatusDropdownProps) {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (status != selectedStatus) {
      setSelectedStatus(status);
    }
  }, [status]);

  const handleSelect = (newStatus: string) => {
    setSelectedStatus(newStatus);
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
        <Text style={styles.buttonText}>{selectedStatus}</Text>
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
                  item === selectedStatus && { fontWeight: "bold", color: colors.midBlue },
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
    width: "100%",        // makes the dropdown responsive
    maxWidth: 300,        // optional: limit max width
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
    width: "100%",        // match parent width
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
