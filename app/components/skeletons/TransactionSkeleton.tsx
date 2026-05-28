import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme";
import { ShimmerBlock } from "./ShimmerBlock";

export function TransactionSkeleton() {
  return (
    <View style={styles.txCard}>
      {/* Ícone */}
      <ShimmerBlock width={48} height={48} borderRadius={12} />

      {/* Informações de Texto */}
      <View style={styles.txInfo}>
        {/* Nome da transação */}
        <ShimmerBlock width="70%" height={16} borderRadius={4} />

        {/* Espaço */}
        <View style={styles.spacer} />

        {/* Categoria */}
        <ShimmerBlock width="50%" height={14} borderRadius={4} />
      </View>

      {/* Valor */}
      <ShimmerBlock width={80} height={16} borderRadius={4} />

      {/* Botão delete */}
      <ShimmerBlock width={24} height={24} borderRadius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  txInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  spacer: {
    height: 8,
  },
});
