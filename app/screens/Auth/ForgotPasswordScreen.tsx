import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { AuthStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";
import { requestPasswordReset } from "../../utils/api";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      Alert.alert("Erro", "Informe seu e-mail ou telefone cadastrado.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await requestPasswordReset(identifier.trim());
      if (!response.userId) {
        throw new Error("Não foi possível iniciar a recuperação de senha.");
      }

      navigation.navigate("VerifyCode", {
        userId: response.userId,
        identifier: response.identifier || identifier.trim(),
        isEmail: response.isEmail,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao solicitar recuperação de senha.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="lock-open-outline" size={30} color={colors.accent} />
        </View>

        <Text style={styles.heading}>Recuperar senha</Text>
        <Text style={styles.subheading}>
          Informe seu e-mail ou telefone cadastrado para receber um código por
          SMS.
        </Text>

        <Text style={styles.label}>E-mail ou telefone</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-circle-outline"
            size={18}
            color={colors.text3}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="seu@email.com ou (92) 99999-9999"
            placeholderTextColor={colors.text3}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryLoading]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.btnPrimaryText}>Enviar código</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flexGrow: 1, paddingHorizontal: spacing.xxl },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,255,176,0.08)",
    marginBottom: spacing.xl,
  },
  heading: { ...typography.h2, marginBottom: 8 },
  subheading: {
    ...typography.caption,
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: 12,
    color: colors.text2,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, color: colors.text, fontSize: 14 },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: "center",
  },
  btnPrimaryLoading: { opacity: 0.8 },
  btnPrimaryText: { color: colors.bg, fontSize: 15, fontWeight: "700" },
  errorText: {
    color: colors.red,
    textAlign: "center",
    marginBottom: spacing.md,
    fontSize: 13,
  },
});

export default ForgotPasswordScreen;
