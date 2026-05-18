import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AmountText from "../../components/common/AmountText";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, spacing, typography } from "../../theme";
import { getTransactions } from "../../utils/api";
import { Transaction } from "../../utils/mockData";

type Filter = "Todas" | "Entradas" | "Saídas" | "Mercado" | "Transporte";
const FILTERS: Filter[] = [
  "Todas",
  "Entradas",
  "Saídas",
  "Mercado",
  "Transporte",
];

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
const txIconMap: Record<string, IoniconName> = {
  bank: "business-outline",
  cart: "cart-outline",
  car: "car-outline",
  tv: "tv-outline",
  pill: "medkit-outline",
  food: "fast-food-outline",
  cash: "cash-outline",
  gas: "flame-outline",
  gift: "gift-outline",
  heart: "heart-outline",
};

const groupByDate = (txs: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  return groups;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
};

const TransactionsScreen = () => {
  const insets = useSafeAreaInsets();
  const { accessToken, refreshToken, updateTokens } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("Todas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      if (!accessToken || !refreshToken) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getTransactions(
          accessToken,
          refreshToken,
          updateTokens,
        );
        setTransactions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar transações.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [accessToken, refreshToken, updateTokens]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = tx.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        activeFilter === "Todas"
          ? true
          : activeFilter === "Entradas"
            ? tx.type === "income"
            : activeFilter === "Saídas"
              ? tx.type === "expense"
              : tx.category === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [activeFilter, search]);

  const groups = groupByDate(filtered);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={typography.h2}>Transações</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={22} color={colors.bg} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.text3} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar transação..."
          placeholderTextColor={colors.text3}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.text3} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === f && styles.chipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions grouped by date */}
      <View style={styles.txList}>
        {Object.entries(groups).map(([date, txs]) => (
          <View key={date}>
            <Text style={styles.groupDate}>{formatDate(date)}</Text>
            {txs.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                style={styles.txCard}
                activeOpacity={0.7}
              >
                <View style={[styles.txIcon, { backgroundColor: tx.iconBg }]}>
                  <Ionicons
                    name={txIconMap[tx.icon] ?? "card-outline"}
                    size={20}
                    color={tx.iconColor}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{tx.name}</Text>
                  <Text style={styles.txCategory}>{tx.category}</Text>
                </View>
                <AmountText value={tx.amount} size={15} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        {loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Carregando transações...</Text>
          </View>
        )}
        {!loading && error && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        )}
        {!loading && !error && filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.text3} />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          </View>
        )}
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accentBg, borderColor: colors.accent },
  chipText: { fontSize: 12, fontWeight: "500", color: colors.text2 },
  chipTextActive: { color: colors.accent },
  txList: { paddingHorizontal: spacing.lg },
  groupDate: {
    fontSize: 11,
    color: colors.text3,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingTop: 14,
    paddingBottom: 8,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 8,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 14, fontWeight: "500", color: colors.text },
  txCategory: { fontSize: 10, color: colors.text3, marginTop: 2 },
  empty: { paddingVertical: 48, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, color: colors.text3 },
});

export default TransactionsScreen;
