import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "../../components/common/Card";
import { useAuth } from "../../context/AuthContext";
import { AddTransactionScreenProps } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";
import { createTransaction, getAccounts, getCategories } from "../../utils/api";
import type { Account, Category } from "../../utils/mockData";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TransactionFormData {
  name: string;
  amount: string;
  type: "income" | "expense";
  categoryId: string;
  accountId: string;
  accountName: string;
  accountBank: string;
  date: string;
}

const TRANSACTION_TYPES = [
  { id: "income", label: "Entrada", icon: "arrow-down-outline" as IoniconName },
  { id: "expense", label: "Saída", icon: "arrow-up-outline" as IoniconName },
];

const categoryIconMap: Record<string, IoniconName> = {
  cart: "cart-outline",
  car: "car-outline",
  food: "fast-food-outline",
  tv: "tv-outline",
  pill: "medkit-outline",
  cash: "cash-outline",
  gas: "flame-outline",
  heart: "heart-outline",
  gift: "gift-outline",
  barbell: "barbell-outline",
};

const AddTransactionScreen = ({ navigation }: AddTransactionScreenProps) => {
  const insets = useSafeAreaInsets();
  const { accessToken, refreshToken, updateTokens } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<TransactionFormData>({
    name: "",
    amount: "",
    type: "expense",
    categoryId: "",
    accountId: "",
    accountName: "",
    accountBank: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      if (!accessToken || !refreshToken) return;

      setLoadingCategories(true);
      setSubmitError(null);

      try {
        const data = await getCategories(
          accessToken,
          refreshToken,
          updateTokens,
          formData.type,
        );
        setCategories(data);
        setFormData((current) => ({
          ...current,
          categoryId: data.some((category) => category.id === current.categoryId)
            ? current.categoryId
            : data[0]?.id || "",
        }));
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Erro ao carregar categorias.",
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [accessToken, refreshToken, updateTokens, formData.type]);

  useEffect(() => {
    async function loadAccounts() {
      if (!accessToken || !refreshToken) return;

      setLoadingAccounts(true);
      setSubmitError(null);

      try {
        const data = await getAccounts(accessToken, refreshToken, updateTokens);
        setAccounts(data);
        setFormData((current) => ({
          ...current,
          accountId: current.accountId || data[0]?.id || "new",
        }));
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Erro ao carregar contas.",
        );
      } finally {
        setLoadingAccounts(false);
      }
    }

    loadAccounts();
  }, [accessToken, refreshToken, updateTokens]);

  const selectedCategory = categories.find(
    (c) => c.id === formData.categoryId,
  );
  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId);
  const isNewAccount = formData.accountId === "new";

  const isValidDate = (value: string) => {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsedDate = new Date(value + "T00:00:00");
    return !Number.isNaN(parsedDate.getTime());
  };

  const formatDateDisplay = (value: string) => {
    if (!isValidDate(value)) return value;
    return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const handleAddTransaction = async () => {
    // Validação
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Digite o nome da transação";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Digite o valor";
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = "Valor inválido";
    }

    if (!formData.categoryId) {
      newErrors.category = "Selecione uma categoria";
    }

    if (!formData.accountId) {
      newErrors.account = "Selecione uma conta";
    }

    if (isNewAccount && !formData.accountName.trim()) {
      newErrors.accountName = "Digite o nome da conta";
    }

    if (!formData.date.trim() || !isValidDate(formData.date.trim())) {
      newErrors.date = "Digite uma data válida (YYYY-MM-DD)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!accessToken || !refreshToken) {
      setSubmitError("Não foi possível autenticar. Faça login novamente.");
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      await createTransaction(
        {
          name: formData.name.trim(),
          amount: Number(formData.amount.replace(",", ".")),
          type: formData.type,
          category: selectedCategory?.name ?? "",
          icon: selectedCategory?.icon ?? "cash",
          date: formData.date.trim(),
          accountId: isNewAccount ? undefined : formData.accountId,
          accountName: isNewAccount ? formData.accountName.trim() : undefined,
          accountBank: isNewAccount
            ? formData.accountBank.trim() || "Conta manual"
            : undefined,
        },
        accessToken,
        refreshToken,
        updateTokens,
      );

      navigation.goBack();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro ao salvar a transação.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={typography.h2}>Nova Transação</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Nome da Transação */}
          <View style={styles.section}>
            <Text style={styles.label}>Nome da Transação</Text>
            <View
              style={[styles.inputContainer, errors.name && styles.inputError]}
            >
              <TextInput
                style={styles.input}
                placeholder="Ex: Compra no Mercado"
                placeholderTextColor={colors.text3}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Tipo de Transação */}
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de Transação</Text>
            <View style={styles.typeContainer}>
              {TRANSACTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    formData.type === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      type: type.id as "income" | "expense",
                      categoryId: "",
                    })
                  }
                >
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={formData.type === type.id ? colors.bg : colors.text2}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type.id && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Valor */}
          <View style={styles.section}>
            <Text style={styles.label}>Valor</Text>
            <View
              style={[
                styles.inputContainer,
                errors.amount && styles.inputError,
              ]}
            >
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0,00"
                placeholderTextColor={colors.text3}
                keyboardType="decimal-pad"
                value={formData.amount}
                onChangeText={(text) => {
                  setFormData({ ...formData, amount: text });
                  if (errors.amount) setErrors({ ...errors, amount: "" });
                }}
              />
            </View>
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}
          </View>

          {/* Data */}
          <View style={styles.section}>
            <Text style={styles.label}>Data</Text>
            <View
              style={[styles.inputContainer, errors.date && styles.inputError]}
            >
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text3}
                keyboardType="numbers-and-punctuation"
                value={formData.date}
                onChangeText={(text) => {
                  setFormData({ ...formData, date: text });
                  if (errors.date) setErrors({ ...errors, date: "" });
                }}
              />
            </View>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Conta */}
          <View style={styles.section}>
            <Text style={styles.label}>Conta vinculada</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountsContainer}
            >
              {loadingAccounts && (
                <Text style={styles.categoryLoading}>Carregando...</Text>
              )}
              {!loadingAccounts &&
                accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountButton,
                      formData.accountId === account.id &&
                        styles.accountButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, accountId: account.id })
                    }
                  >
                    <Text
                      style={[
                        styles.accountButtonName,
                        formData.accountId === account.id &&
                          styles.accountButtonNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {account.name}
                    </Text>
                    <Text style={styles.accountButtonBalance}>
                      R${" "}
                      {account.balance.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </TouchableOpacity>
                ))}
              {!loadingAccounts && (
                <TouchableOpacity
                  style={[
                    styles.accountButton,
                    isNewAccount && styles.accountButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, accountId: "new" })}
                >
                  <Text
                    style={[
                      styles.accountButtonName,
                      isNewAccount && styles.accountButtonNameActive,
                    ]}
                  >
                    Nova conta
                  </Text>
                  <Text style={styles.accountButtonBalance}>manual</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            {errors.account && (
              <Text style={styles.errorText}>{errors.account}</Text>
            )}
            {isNewAccount && (
              <View style={styles.newAccountFields}>
                <View
                  style={[
                    styles.inputContainer,
                    errors.accountName && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Nubank"
                    placeholderTextColor={colors.text3}
                    value={formData.accountName}
                    onChangeText={(text) => {
                      setFormData({ ...formData, accountName: text });
                      if (errors.accountName) {
                        setErrors({ ...errors, accountName: "" });
                      }
                    }}
                  />
                </View>
                {errors.accountName && (
                  <Text style={styles.errorText}>{errors.accountName}</Text>
                )}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Tipo ou banco: conta corrente, poupança..."
                    placeholderTextColor={colors.text3}
                    value={formData.accountBank}
                    onChangeText={(text) =>
                      setFormData({ ...formData, accountBank: text })
                    }
                  />
                </View>
              </View>
            )}
          </View>

          {/* Categoria */}
          <View style={styles.section}>
            <Text style={styles.label}>Categoria</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {loadingCategories && (
                <Text style={styles.categoryLoading}>Carregando...</Text>
              )}
              {!loadingCategories && categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    formData.categoryId === category.id &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, categoryId: category.id })
                  }
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      formData.categoryId === category.id
                        ? { backgroundColor: colors.accent }
                        : { backgroundColor: category.colorBg },
                    ]}
                  >
                    <Ionicons
                      name={
                        categoryIconMap[category.icon] || "pricetag-outline"
                      }
                      size={20}
                      color={
                        formData.categoryId === category.id
                          ? colors.bg
                          : category.color
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      formData.categoryId === category.id &&
                        styles.categoryNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </View>

          {/* Resumo */}
          {formData.name && formData.amount && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transação:</Text>
                <Text style={styles.summaryValue}>{formData.name}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Data:</Text>
                <Text style={styles.summaryValue}>
                  {formatDateDisplay(formData.date)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Categoria:</Text>
                <Text style={styles.summaryValue}>
                  {selectedCategory?.name}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tipo:</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        formData.type === "income" ? colors.accent : colors.red,
                    },
                  ]}
                >
                  {formData.type === "income" ? "Entrada" : "Saída"}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Conta:</Text>
                <Text style={styles.summaryValue}>
                  {isNewAccount
                    ? formData.accountName || "Nova conta"
                    : selectedAccount?.name}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.amountLabel]}>
                  Valor:
                </Text>
                <Text
                  style={[
                    styles.amountValue,
                    {
                      color:
                        formData.type === "income" ? colors.accent : colors.red,
                    },
                  ]}
                >
                  {formData.type === "income" ? "+" : "-"} R${" "}
                  {parseFloat(formData.amount).toFixed(2)}
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Buttons */}
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleAddTransaction}
            disabled={saving}
          >
            <Ionicons name="add" size={20} color={colors.bg} />
            <Text style={styles.submitButtonText}>
              {saving ? "Salvando..." : "Adicionar"}
            </Text>
          </TouchableOpacity>
        </View>
        {submitError ? (
          <Text style={styles.errorText}>{submitError}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputError: {
    borderColor: colors.red,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    padding: 0,
  },
  amountInput: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    padding: 0,
  },
  currencyPrefix: {
    color: colors.text2,
    fontSize: 14,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  typeContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  typeButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  typeButtonText: {
    color: colors.text2,
    fontSize: 14,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: colors.bg,
  },
  categoriesContainer: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  accountsContainer: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  accountButton: {
    minWidth: 132,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  accountButtonActive: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
  },
  accountButtonName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  accountButtonNameActive: {
    color: colors.accent,
  },
  accountButtonBalance: {
    color: colors.text3,
    fontSize: 12,
  },
  newAccountFields: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  categoryButton: {
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonActive: {
    borderColor: colors.accent,
  },
  categoryName: {
    color: colors.text2,
    fontSize: 12,
    fontWeight: "500",
    maxWidth: 60,
    textAlign: "center",
  },
  categoryNameActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  categoryLoading: {
    color: colors.text3,
    fontSize: 12,
    paddingVertical: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.card2,
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    color: colors.text2,
    fontSize: 13,
    fontWeight: "500",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  amountLabel: {
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AddTransactionScreen;
