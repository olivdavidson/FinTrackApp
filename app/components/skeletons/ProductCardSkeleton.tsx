// src/components/skeletons/ProductCardSkeleton.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { ShimmerBlock } from "./ShimmerBlock";

export function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Mock da Imagem (Quadrado) */}
      <ShimmerBlock width={100} height={100} borderRadius={8} />

      {/* Mock dos Textos */}
      <View style={styles.textContainer}>
        {/* Título (Linha mais larga e alta) */}
        <ShimmerBlock width="90%" height={20} borderRadius={4} />

        {/* Espaçamento */}
        <View style={styles.spacer} />

        {/* Preço (Linha mais curta) */}
        <ShimmerBlock width="50%" height={16} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
    // Sombras para parecer um card real
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  spacer: {
    height: 12, // Espaço entre as linhas de texto
  },
});
