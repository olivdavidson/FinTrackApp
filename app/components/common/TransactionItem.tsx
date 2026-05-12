// src/components/common/TransactionItem.tsx
import { Colors, Radius, Spacing, Typography } from "@theme/index";
import { CATEGORIES, formatCurrency } from "@utils/mockData";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Transaction } from "../../types";

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
  const category = CATEGORIES[transaction.category];
  const isIncome = transaction.type === "income";

  const content = (
    <View style={[styles.row, showCard && styles.card]}>
      <View style={[styles.iconWrap, { backgroundColor: category.bgColor }]}>
        <Icon name={category.icon} size={20} color={category.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.category}>{category.label}</Text>
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
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  category: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  amount: {
    fontSize: Typography.md,
    fontWeight: "600",
  },
  income: {
    color: Colors.accent,
  },
  expense: {
    color: Colors.red,
  },
});
