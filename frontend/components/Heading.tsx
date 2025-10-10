import React from 'react';
import { Text, TextStyle } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

type HeadingProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export default function Heading({ children, style }: HeadingProps) {
  return <Text style={[globalStyles.heading, style]}>{children}</Text>;
}