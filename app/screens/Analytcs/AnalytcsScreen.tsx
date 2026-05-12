import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "../../components/common/Card";
import { colors, radius, spacing, typography } from "../../theme";
import { mockCategories, mockChartData } from "../../utils/mockData";

type Period = "dia" | "semana" | "mes";
const FILTERS: { key: Period; label: string }[] = [
  { key: "dia", label: "Dia" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
];

const AnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("mes");

  const maxValue = Math.max(
    ...mockChartData.monthly.flatMap((d) => [d.income, d.expense]),
  );
  const CHART_H = 120;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={typography.h2}>Análises</Text>
      </View>

      {/* Period Filter */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              period === f.key && styles.filterTabActive,
            ]}
            onPress={() => setPeriod(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                period === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View
          style={[styles.summaryCard, { borderColor: `${colors.accent}33` }]}
        >
          <Ionicons name="arrow-up-outline" size={16} color={colors.accent} />
          <Text style={styles.summaryLabel}>Entradas</Text>
          <Text style={[styles.summaryValue, { color: colors.accent }]}>
            R$4.200
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: `${colors.red}33` }]}>
          <Ionicons name="arrow-down-outline" size={16} color={colors.red} />
          <Text style={styles.summaryLabel}>Saídas</Text>
          <Text style={[styles.summaryValue, { color: colors.red }]}>
            R$1.832
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: `${colors.blue}33` }]}>
          <Ionicons name="trending-up-outline" size={16} color={colors.blue} />
          <Text style={styles.summaryLabel}>Economia</Text>
          <Text style={[styles.summaryValue, { color: colors.blue }]}>
            R$2.368
          </Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={styles.section}>
        <Card>
          <Text style={styles.chartTitle}>Entradas vs. Saídas</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.accent }]}
              />
              <Text style={styles.legendText}>Entradas</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.red }]}
              />
              <Text style={styles.legendText}>Saídas</Text>
            </View>
          </View>
          <View style={[styles.barChart, { height: CHART_H + 24 }]}>
            {mockChartData.monthly.map((d, i) => {
              const isCurrent = i === mockChartData.monthly.length - 1;
              return (
                <View key={i} style={styles.barGroup}>
                  <View style={[styles.bars, { height: CHART_H }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (d.income / maxValue) * CHART_H,
                          backgroundColor: colors.accent,
                          opacity: isCurrent ? 1 : 0.45,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (d.expense / maxValue) * CHART_H,
                          backgroundColor: colors.red,
                          opacity: isCurrent ? 0.9 : 0.55,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      isCurrent && { color: colors.accent, fontWeight: "600" },
                    ]}
                  >
                    {d.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Top Expenses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maiores gastos</Text>
        <Card>
          {mockCategories.map((cat, i) => (
            <View
              key={cat.id}
              style={[
                styles.expRow,
                i < mockCategories.length - 1 && styles.expRowBorder,
              ]}
            >
              <Text style={styles.expRank}>{i + 1}</Text>
              <View style={[styles.expDot, { backgroundColor: cat.color }]} />
              <Text style={styles.expName}>{cat.name}</Text>
              <View style={styles.expBarBg}>
                <View
                  style={[
                    styles.expBarFill,
                    {
                      width: `${cat.percentage}%` as any,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.expAmount}>R${cat.total}</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
};

const mono = Platform.OS === "ios" ? "Courier New" : "monospace";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
  },
  filterText: { fontSize: 13, fontWeight: "500", color: colors.text2 },
  filterTextActive: { color: colors.accent },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: { fontSize: 10, color: colors.text3 },
  summaryValue: { fontSize: 13, fontWeight: "700", fontFamily: mono },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  legend: { flexDirection: "row", gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.text2 },
  barChart: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  barGroup: { flex: 1, alignItems: "center" },
  bars: { flexDirection: "row", gap: 3, alignItems: "flex-end", width: "100%" },
  bar: { flex: 1, borderRadius: 4 },
  barLabel: { fontSize: 10, color: colors.text3, marginTop: 6 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  expRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  expRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  expRank: { fontSize: 11, color: colors.text3, width: 16, fontFamily: mono },
  expDot: { width: 10, height: 10, borderRadius: 5 },
  expName: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.text },
  expBarBg: {
    width: 72,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
  },
  expBarFill: { height: "100%", borderRadius: 2 },
  expAmount: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: mono,
    color: colors.text,
    minWidth: 52,
    textAlign: "right",
  },
});

export default AnalyticsScreen;
