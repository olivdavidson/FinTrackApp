import React from "react";
import { Text, TextStyle } from "react-native";
import { colors } from "../../theme";

interface AmountTextProps {
  value: number;
  style?: TextStyle;
  showSign?: boolean;
  size?: number;
}

const AmountText: React.FC<AmountTextProps> = ({
  value,
  style,
  showSign = true,
  size = 16,
}) => {
  const isPositive = value >= 0;
  const color = isPositive ? colors.accent : colors.red;
  const sign = showSign ? (isPositive ? "+" : "") : "";
  const formatted = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  return (
    <Text
      style={[
        { fontSize: size, fontWeight: "600", fontFamily: "Courier New", color },
        style,
      ]}
    >
      {sign}R${formatted}
    </Text>
  );
};

export default AmountText;
