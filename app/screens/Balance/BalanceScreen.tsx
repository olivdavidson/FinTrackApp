import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "../../components/common/Card";
import SectionTitle from "../../components/common/SectionTitle";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, spacing, typography } from "../../theme";
import { getAccounts, getTransactions } from "../../utils/api";
import { Account, Transaction } from "../../utils/mockData";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
const accountIconMap: Record<string, IoniconName> = {
  bank: "business-outline",
  "piggy-bank": "wallet-outline",
  cash: "cash-outline",
};

interface ProgressCardProps {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: IoniconName;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  label,
  value,
  max,
  color,
  icon,
}) => {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <Card style={{ marginBottom: 12 }}>
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleRow}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={styles.progressTitle}>{label}</Text>
        </View>
        <Text style={[styles.progressPct, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%` as any, backgroundColor: color },
          ]}
        />
      </View>
      <View style={styles.progressValues}>
        <Text style={styles.progressVal}>R$0</Text>
        <Text style={styles.progressVal}>
          R${value.toLocaleString("pt-BR")} / R${max.toLocaleString("pt-BR")}
        </Text>
      </View>
    </Card>
  );
};

const BalanceScreen = () => {
  const insets = useSafeAreaInsets();
  const { accessToken, refreshToken, updateTokens, user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
      if (!accessToken || !refreshToken) return;
      setLoading(true);
      setError(null);

      try {
        const accountsData = await getAccounts(
          accessToken,
          refreshToken,
          updateTokens,
        );
        const transactionsData = await getTransactions(
          accessToken,
          refreshToken,
          updateTokens,
        );
        setAccounts(accountsData);
        setTransactions(transactionsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar dados financeiros.",
        );
      } finally {
        setLoading(false);
      }
  }, [accessToken, refreshToken, updateTokens]);

  useFocusEffect(
    useCallback(() => {
    loadData();
    }, [loadData]),
  );

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = Math.abs(
    transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0),
  );
  const userName = user?.name ?? "seu";

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={typography.h2}>Saldo</Text>
        <Text style={styles.subtitle}>Resumo financeiro de {userName}</Text>
      </View>

      {/* Big Balance Gradient Card */}
      <LinearGradient
        colors={["#1A2540", "#0F1A2E"]}
        style={styles.bigBalanceCard}
      >
        <Text style={styles.balanceLabel}>SALDO TOTAL</Text>
        <Text style={styles.balanceValue}>
          R$ {Math.floor(totalBalance).toLocaleString("pt-BR")}
          <Text style={styles.balanceCents}>
            ,{(totalBalance % 1).toFixed(2).slice(2)}
          </Text>
        </Text>
        <View style={styles.balanceTrend}>
          <Ionicons
            name="trending-up-outline"
            size={16}
            color={colors.accent}
          />
          <Text style={styles.balanceTrendText}>
            +R$1.360 economizados este mês
          </Text>
        </View>
      </LinearGradient>

      {/* Progress */}
      <View style={styles.section}>
        <ProgressCard
          label="Entradas este mês"
          value={totalIncome}
          max={Math.max(totalIncome, totalExpense, 1)}
          color={colors.accent}
          icon="arrow-up-circle-outline"
        />
        <ProgressCard
          label="Saídas este mês"
          value={totalExpense}
          max={Math.max(totalIncome, totalExpense, 1)}
          color={colors.red}
          icon="arrow-down-circle-outline"
        />
      </View>

      {/* Accounts */}
      <View style={styles.section}>
        <SectionTitle>Contas vinculadas</SectionTitle>
        {loading && <Text style={styles.subTitle}>Carregando contas...</Text>}
        {error && <Text style={styles.subTitle}>{error}</Text>}
        {!loading && !error && accounts.length === 0 && (
          <Text style={styles.subTitle}>Nenhuma conta encontrada</Text>
        )}
        {accounts.map((acc) => (
          <View key={acc.id} style={styles.accountItem}>
            <View style={[styles.accountIcon, { backgroundColor: acc.iconBg }]}>
              <Ionicons
                name={accountIconMap[acc.icon] ?? "card-outline"}
                size={22}
                color={acc.iconColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{acc.name}</Text>
              <Text style={styles.accountBank}>{acc.bank}</Text>
            </View>
            <Text style={[styles.accountAmount, { color: colors.accent }]}>
              R$
              {acc.balance.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
};

const mono = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  subtitle: { fontSize: 13, color: colors.text2, marginTop: 4 },
  bigBalanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.text3,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 44,
    fontWeight: "300",
    letterSpacing: -2,
    fontFamily: mono,
    color: colors.text,
  },
  balanceCents: { fontSize: 24, color: colors.text2 },
  balanceTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  balanceTrendText: { fontSize: 12, color: colors.accent },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  progressTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  progressPct: { fontSize: 13, fontWeight: "600" },
  progressBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  progressVal: { fontSize: 12, color: colors.text2, fontFamily: mono },
  subTitle: { fontSize: 13, color: colors.text3, marginBottom: spacing.sm },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: 10,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: { fontSize: 14, fontWeight: "500", color: colors.text },
  accountBank: { fontSize: 12, color: colors.text3, marginTop: 2 },
  accountAmount: { fontSize: 16, fontWeight: "600", fontFamily: mono },
});

export default BalanceScreen;
