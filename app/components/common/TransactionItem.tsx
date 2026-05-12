// src/components/common/TransactionItem.tsx
import { CATEGORIES, formatCurrency, Transaction } from "@/app/utils/mockData";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../../theme/index";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
  showCard?: boolean;
}

export default function TransactionItem({
  transaction,
  onPress,
  showCard = false,
}: TransactionItemProps) {
  const category =
    CATEGORIES.find((c) => c.id === transaction.category) || CATEGORIES[0];
  const isIncome = transaction.type === "income";

  const content = (
    <View style={[styles.row, showCard && styles.card]}>
      <View style={[styles.iconWrap, { backgroundColor: category.colorBg }]}>
        <Ionicons
          name={category.icon as any}
          size={20}
          color={category.color}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{transaction.name}</Text>
        <Text style={styles.category}>{category.name}</Text>
      </View>
      <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => onPress(transaction)}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  category: {
    fontSize: 12,
    color: colors.text3,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
  income: {
    color: colors.accent,
  },
  expense: {
    color: colors.red,
  },
});
