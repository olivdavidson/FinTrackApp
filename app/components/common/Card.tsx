import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = spacing.lg,
}) => <View style={[styles.card, { padding }, style]}>{children}</View>;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
