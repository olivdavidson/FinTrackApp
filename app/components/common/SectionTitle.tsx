import React from "react";
import { StyleSheet, Text } from "react-native";
import { typography } from "../../theme";

const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Text style={styles.text}>{children.toUpperCase()}</Text>
);

const styles = StyleSheet.create({
  text: { ...typography.label, marginBottom: 12 },
});

export default SectionTitle;
