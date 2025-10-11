import React from 'react';
import { Text, TextStyle } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

type SubheadingProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export default function Subheading({ children, style }: SubheadingProps) {
  return <Text style={[globalStyles.subheading, style]}>{children}</Text>;
}