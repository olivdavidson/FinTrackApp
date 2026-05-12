import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme";

interface AvatarProps {
  initials: string;
  size?: number;
  onPress?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ initials, size = 44, onPress }) => {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component
      onPress={onPress}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.3 }]}>{initials}</Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accentBg,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: colors.accent, fontWeight: "600" },
});

export default Avatar;
