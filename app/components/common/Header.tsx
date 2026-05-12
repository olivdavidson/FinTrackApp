import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightComponent,
  leftComponent,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        { paddingTop: insets.top + spacing.sm },
      ]}
    >
      <View style={styles.row}>
        {leftComponent && <View style={styles.left}>{leftComponent}</View>}
        <View style={styles.center}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightComponent && <View style={styles.right}>{rightComponent}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  transparent: {
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { width: 44 },
  center: { flex: 1 },
  right: { width: 44, alignItems: "flex-end" },
  title: { ...typography.h2 },
  subtitle: { ...typography.caption, marginTop: 2 },
});

export default Header;
