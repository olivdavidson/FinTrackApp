import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryDetailScreenProps } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const catIconMap: Record<string, IoniconName> = {
  cart: "cart-outline",
  car: "car-outline",
  tv: "tv-outline",
  pill: "medkit-outline",
  food: "fast-food-outline",
  gift: "gift-outline",
  heart: "heart-outline",
  cash: "cash-outline",
  gas: "flame-outline",
};

const CategoryDetailScreen = ({
  navigation,
  route,
}: CategoryDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const { category } = route.params;
  const budgetStatus =
    category.budget && category.total > category.budget
      ? "Acima do limite"
      : "Dentro do limite";

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.accent} />
        </TouchableOpacity>
        <Text style={typography.h2}>{category.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.detailCard}>
        <View style={[styles.iconBox, { backgroundColor: category.colorBg }]}>
          <Ionicons
            name={catIconMap[category.icon] ?? "pricetag-outline"}
            size={24}
            color={category.color}
          />
        </View>
        <Text style={styles.detailLabel}>Total gasto</Text>
        <Text style={[styles.detailValue, { color: category.color }]}>
          R$
          {category.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailItemLabel}>Transações</Text>
            <Text style={styles.detailItemValue}>{category.count}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailItemLabel}>Percentual</Text>
            <Text style={styles.detailItemValue}>{category.percentage}%</Text>
          </View>
        </View>
        {category.budget ? (
          <View style={styles.budgetSection}>
            <Text style={styles.detailItemLabel}>Orçamento</Text>
            <Text
              style={[
                styles.detailItemValue,
                {
                  color:
                    category.total > category.budget
                      ? colors.red
                      : colors.accent,
                },
              ]}
            >
              R$
              {category.budget.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text
              style={[
                styles.budgetStatus,
                {
                  color:
                    category.total > category.budget
                      ? colors.red
                      : colors.accent,
                },
              ]}
            >
              {budgetStatus}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCard: {
    margin: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  detailValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailItem: {
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 12,
    color: colors.text3,
    marginBottom: spacing.sm,
  },
  detailItemValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "700",
  },
  budgetSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  budgetStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default CategoryDetailScreen;
