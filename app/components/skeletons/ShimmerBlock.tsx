// src/components/skeletons/ShimmerBlock.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
    Dimensions,
    DimensionValue,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

// Precisamos do LinearGradient para o efeito de brilho
// npx expo install expo-linear-gradient

interface ShimmerBlockProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Normaliza valores de dimensão para o tipo correto do React Native
 */
const normalizeDimension = (value: DimensionValue): DimensionValue => {
  return value;
};

export function ShimmerBlock({
  width,
  height,
  borderRadius = 4,
}: ShimmerBlockProps) {
  // 1. Variável compartilhada para controlar o progresso da animação (0 a 1)
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    // 2. Inicia a animação infinita (-1 = loop infinito, true = vai e volta)
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1500 }), // Tempo de uma "passada" de luz
      -1,
      false, // Reinicia do início em vez de voltar
    );
  }, [shimmerProgress]);

  // 3. Estilo animado que move o gradiente de brilho
  const animatedStyle = useAnimatedStyle(() => {
    // Move o gradiente da esquerda para a direita baseado na largura da tela
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH],
    );

    return {
      transform: [{ translateX }],
    };
  });

  // Estilo do container normalizado com tipos corretos
  const containerStyle: ViewStyle[] = [
    styles.shimmerContainer,
    {
      width: normalizeDimension(width),
      height: normalizeDimension(height),
      borderRadius,
    },
  ];

  return (
    // Bloco cinza de fundo
    <View style={containerStyle}>
      {/* Camada do Gradiente Animado */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerContainer: {
    backgroundColor: "#E0E0E0", // Cor cinza claro base do skeleton
    overflow: "hidden", // Importante para o gradiente não vazar
    position: "relative",
  },
});
