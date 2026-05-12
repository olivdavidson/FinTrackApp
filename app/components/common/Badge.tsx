import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme";

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.accent,
  bg = colors.accentBg,
}) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.text, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontWeight: "600" },
});

export default Badge;
