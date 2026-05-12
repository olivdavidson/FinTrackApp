import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Avatar, AmountText } from "@/app/components";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "@/app/theme";
import { mockUser, mockTransactions } from "@/app/mockData";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

// Workaround para importar Platform nos styles
import { Platform } from 'react-native';

type NavProp = NativeStackNavigationProp<HomeStackParamList>;
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const txIconMapping: Record<string, IoniconName> = {
  bank: "business-outline",
  cart: "cart-outline",
  car: "car-outline",
  tv: "tv-outline",
  pill: "medkit-outline",
  food: "fast-food-outline",
  gift: "gift-outline",
  travel: "airplane-outline",
  cash: "cash-outline",
  heart: "heart-outline",
  gas: "gas-outline",
};

interface QuickAction {
  label: string;
  icon: IoniconName;
  onPress: () => void;
  color: string;
  route?: keyof HomeStackParamList;
}

const quickActions: QuickAction[] = [
  {
    label: "Transações",
    icon: "swap-horizontal-outline",
    onPress: () => {},
    color: "#007AFF",
  },
  {
    label: "Análises",
    icon: "pie-chart-outline",
    onPress: () => {},
    color: "#007AFF",
  },
  {
    label: "Categorias",
    icon: "grid-outline",
    onPress: () => {},
    color: "#007AFF",
    route: "Categories",
  },
  {
    label: "Saldo",
    icon: "wallet-outline",
    onPress: () => {},
    color: "#007AFF",
  },
];

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const recentTxs = mockTransactions.slice(0, 4);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bom dia, 👋</Text>
          <Text style={styles.name}>{mockUser.name}</Text>
        </View>
        <Avatar initials={mockUser.initials} size={40} />
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={["#1E2A3A", "#162030"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.balanceOrb} />
        <Text style={styles.balanceLabel}>Saldo disponível</Text>
        <Text style={styles.balanceAmount}>
          <Text style={{ color: colors.accent }}>R$</Text>{" "}
          {Math.floor(mockUser.totalBalance).toLocaleString("pt-BR")}
          <Text style={styles.balanceCents}>
            ,{(mockUser.totalBalance % 1).toFixed(2).slice(2)}
          </Text>
        </Text>
        <View style={styles.balanceChange}>
          <Ionicons
            name="trending-up-outline"
            size={14}
            color={colors.accent}
          />
          <Text style={styles.balanceChangeText}>+3,2% este mês</Text>
        </View>
        <View style={styles.miniStats}>
          <View style={styles.miniStat}>
            <View style={styles.miniLabelRow}>
              <Ionicons
                name="arrow-up-outline"
                size={12}
                color={colors.accent}
              />
              <Text style={styles.miniLabel}>Entradas</Text>
            </View>
            <Text style={[styles.miniValue, { color: colors.accent }]}>
              R${mockUser.monthIncome.toLocaleString("pt-BR")}
            </Text>
          </View>
          <View style={styles.miniStat}>
            <View style={styles.miniLabelRow}>
              <Ionicons
                name="arrow-down-outline"
                size={12}
                color={colors.red}
              />
              <Text style={styles.miniLabel}>Saídas</Text>
            </View>
            <Text style={[styles.miniValue, { color: colors.red }]}>
              R${mockUser.monthExpense.toLocaleString("pt-BR")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.qaItem}
              onPress={() => item.route && navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.qaIcon, { borderColor: colors.border }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.qaLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recentes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {recentTxs.map((tx) => (
          <View key={tx.id} style={styles.txItem}>
            <View style={[styles.txIcon, { backgroundColor: tx.iconBg }]}>
              <Ionicons
                name={txIconMap[tx.icon] ?? "card-outline"}
                size={20}
                color={tx.iconColor}
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txName}>{tx.name}</Text>
              <Text style={styles.txDate}>{tx.category}</Text>
            </View>
            <AmountText value={tx.amount} size={15} />
          </View>
        ))}
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
  greeting: { fontSize: 13, color: colors.text2 },
  name: { fontSize: 18, fontWeight: "600", color: colors.text, marginTop: 2 },
  balanceCard: {
    margin: spacing.lg,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  balanceOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(79,255,176,0.06)",
    top: -60,
    right: -40,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.text2,
    fontWeight: "500",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "300",
    color: colors.text,
    letterSpacing: -1,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  balanceCents: { fontSize: 20, color: colors.text2 },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  balanceChangeText: { fontSize: 13, color: colors.accent },
  miniStats: { flexDirection: "row", gap: 12, marginTop: 20 },
  miniStat: {
    flex: 1,
  
  miniLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  miniLabel: { fontSize: 11, color: colors.text3 },
  miniValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  quickGrid: { flexDirection: "row", justifyContent: "space-between" },
  qaItem: { alignItems: "center", gap: 8, width: 72 },
  qaIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qaLabel: { fontSize: 11, color: colors.text2, textAlign: "center" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: spacing.lg,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  seeAll: { fontSize: 12, color: colors.accent },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 14, fontWeight: "500", color: colors.text },
  txDate: { fontSize: 12, color: colors.text3, marginTop: 2 },
});

// Workaround para importar Platform nos styles
import { Platform } from "react-native";

export default HomeScreen;
