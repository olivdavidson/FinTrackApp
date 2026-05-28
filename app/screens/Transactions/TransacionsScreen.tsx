import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AmountText from "../../components/common/AmountText";
import { TransactionSkeleton } from "../../components/skeletons/TransactionSkeleton";
import { useAuth } from "../../context/AuthContext";
import { TransactionsScreenProps } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";
import { deleteTransaction, getTransactions } from "../../utils/api";
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

const TransactionsScreen = ({ navigation }: TransactionsScreenProps) => {
  const insets = useSafeAreaInsets();
  const { accessToken, refreshToken, updateTokens } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("Todas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
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
  }, [accessToken, refreshToken, updateTokens]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const handleDeleteTransaction = useCallback(
    (transaction: Transaction) => {
      Alert.alert(
        "Remover transação",
        `Deseja remover \"${transaction.name}\"? O saldo da conta vinculada será recalculado.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Remover",
            style: "destructive",
            onPress: async () => {
              if (!accessToken || !refreshToken) return;

              try {
                await deleteTransaction(
                  transaction.id,
                  accessToken,
                  refreshToken,
                  updateTokens,
                );
                await loadTransactions();
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Erro ao remover transação.",
                );
              }
            },
          },
        ],
      );
    },
    [accessToken, refreshToken, updateTokens, loadTransactions],
  );

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
  }, [activeFilter, search, transactions]);

  const groups = groupByDate(filtered);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={typography.h2}>Transações</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddTransaction")}
        >
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
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <TransactionSkeleton />}
          scrollEnabled={false}
          style={styles.txList}
        />
      ) : (
        <View style={styles.txList}>
          {Object.entries(groups).map(([date, txs]) => (
            <View key={date}>
              <Text style={styles.groupDate}>{formatDate(date)}</Text>
              {txs.map((tx) => (
                <TouchableOpacity
                  key={tx.id}
                  style={styles.txCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("AddTransaction", { transaction: tx })
                  }
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
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteTransaction(tx)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.red}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          {error && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          )}
          {!error && filtered.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.text3} />
              <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            </View>
          )}
        </View>
      )}

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
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { paddingVertical: 48, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, color: colors.text3 },
});

export default TransactionsScreen;
