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
import { resetPassword } from "../../utils/api";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { userId, otpCode } = route.params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Erro", "Informe e confirme a nova senha.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("A senha e a confirmação não coincidem.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setErrorMessage(
        "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula e número.",
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await resetPassword(userId, password, otpCode);
      Alert.alert("Senha alterada", "Entre novamente com sua nova senha.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao redefinir senha.",
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
          <Ionicons name="key-outline" size={30} color={colors.accent} />
        </View>

        <Text style={styles.heading}>Nova senha</Text>
        <Text style={styles.subheading}>
          Defina uma senha forte para proteger sua conta.
        </Text>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.text3}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.text3}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.text3}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.text3}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repita a senha"
            placeholderTextColor={colors.text3}
            secureTextEntry={!showPassword}
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
            <Text style={styles.btnPrimaryText}>Salvar nova senha</Text>
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
    marginBottom: 14,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, color: colors.text, fontSize: 14 },
  eyeIcon: { padding: 4 },
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

export default ResetPasswordScreen;
