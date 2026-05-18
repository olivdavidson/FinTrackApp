import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, spacing, typography } from "../../theme";
import { getCategories } from "../../utils/api";
import { Category } from "../../utils/mockData";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
const catIconMap: Record<string, IoniconName> = {
  cart: "cart-outline",
  car: "car-outline",
  tv: "tv-outline",
  pill: "medkit-outline",
  food: "fast-food-outline",
  gift: "gift-outline",
  heart: "heart-outline",
};

const CategoriesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { accessToken, refreshToken, updateTokens } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      if (!accessToken || !refreshToken) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getCategories(
          accessToken,
          refreshToken,
          updateTokens,
        );
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar categorias.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [accessToken, refreshToken, updateTokens]);

  const totalExpense = categories.reduce((sum, c) => sum + c.total, 0);
  const maxTotal = categories.length > 0 ? categories[0].total : 1;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.accent} />
        </TouchableOpacity>
        <Text style={typography.h2}>Categorias</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>TOTAL GASTO EM MAI</Text>
        <Text style={styles.totalValue}>
          R${" "}
          {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Color Legend */}
      <View style={styles.legendRow}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
            <Text style={styles.legendName}>{cat.name}</Text>
            <Text style={styles.legendPct}>{cat.percentage}%</Text>
          </View>
        ))}
      </View>

      {/* Category Cards */}
      <View style={styles.list}>
        {categories.map((cat) => {
          const barWidth = (cat.total / maxTotal) * 100;
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              activeOpacity={0.7}
            >
              <View style={styles.catHeader}>
                <View
                  style={[styles.catIcon, { backgroundColor: cat.colorBg }]}
                >
                  <Ionicons
                    name={catIconMap[cat.icon] ?? "ellipse-outline"}
                    size={22}
                    color={cat.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catCount}>{cat.count} transações</Text>
                </View>
                <Text style={[styles.catAmount, { color: cat.color }]}>
                  R${cat.total.toLocaleString("pt-BR")}
                </Text>
              </View>
              <View style={styles.catProgressBg}>
                <View
                  style={[
                    styles.catProgressFill,
                    {
                      width: `${barWidth}%` as any,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
              {cat.budget && (
                <View style={styles.catBudgetRow}>
                  <Text style={styles.catBudget}>
                    Orçamento: R${cat.budget.toLocaleString("pt-BR")}
                  </Text>
                  <Text
                    style={[
                      styles.catBudget,
                      {
                        color:
                          cat.total > cat.budget ? colors.red : colors.accent,
                      },
                    ]}
                  >
                    {cat.total > cat.budget
                      ? "Acima do limite"
                      : "Dentro do limite"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && (
        <Text style={styles.loaderText}>Carregando categorias...</Text>
      )}
      {error && <Text style={styles.loaderText}>{error}</Text>}
      {!loading && !error && categories.length === 0 && (
        <Text style={styles.loaderText}>Nenhuma categoria encontrada</Text>
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
};

const mono = Platform.OS === "ios" ? "Courier New" : "monospace";

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
  totalSection: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  totalLabel: {
    fontSize: 11,
    color: colors.text3,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "300",
    fontFamily: mono,
    color: colors.text,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendName: { fontSize: 12, color: colors.text2 },
  legendPct: { fontSize: 11, color: colors.text3, fontFamily: mono },
  list: { paddingHorizontal: spacing.lg },
  catCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: 10,
  },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: { fontSize: 15, fontWeight: "600", color: colors.text },
  catCount: { fontSize: 12, color: colors.text3, marginTop: 2 },
  catAmount: { fontSize: 17, fontWeight: "600", fontFamily: mono },
  catProgressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  catProgressFill: { height: "100%", borderRadius: 3 },
  catBudgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  catBudget: { fontSize: 11, color: colors.text3 },
  loaderText: {
    fontSize: 13,
    color: colors.text3,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});

export default CategoriesScreen;
