import React from 'react';
import { Text, TextStyle } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

type BodyTextProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export default function BodyText({ children, style }: BodyTextProps) {
  return <Text style={[globalStyles.body, style]}>{children}</Text>;
}