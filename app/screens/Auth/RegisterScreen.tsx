import { Ionicons } from "@expo/vector-icons";
import {
    CompositeNavigationProp,
    useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
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
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList, RootStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";

WebBrowser.maybeCompleteAuthSession();

type NavProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const RegisterScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();

  const getPasswordStrength = (value: string) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthLabel =
    passwordStrength <= 2
      ? "Fraca"
      : passwordStrength === 3
        ? "Média"
        : "Forte";
  const passwordStrengthColor =
    passwordStrength <= 2
      ? "#F87171"
      : passwordStrength === 3
        ? "#FBBF24"
        : "#34D399";

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos para continuar.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("A senha e a confirmação não coincidem.");
      return;
    }

    if (passwordStrength < 3) {
      setErrorMessage(
        "Escolha uma senha mais forte: use letras maiúsculas, minúsculas, números e símbolos.",
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await register(name.trim(), email.trim(), password);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao cadastrar usuário.",
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
      <LinearGradient
        colors={["#0F1A30", "#0A1020", "#0A0F1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}
      >
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={styles.logoRow}>
          <Ionicons name="wallet" size={32} color={colors.accent} />
          <Text style={styles.appName}>
            Fin<Text style={styles.appNameAccent}>Track</Text>
          </Text>
        </View>
        <Text style={styles.tagline}>
          Cadastre-se e comece a controlar seu dinheiro
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Crie sua conta</Text>
        <Text style={styles.subheading}>
          Preencha os dados abaixo para continuar
        </Text>

        <Text style={styles.label}>Nome completo</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={18}
            color={colors.text3}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.text3}
            autoCapitalize="words"
          />
        </View>

        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={colors.text3}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={colors.text3}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

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

        <View style={styles.strengthRow}>
          <Text style={styles.strengthLabel}>Força da senha</Text>
          <Text
            style={[styles.strengthValue, { color: passwordStrengthColor }]}
          >
            {passwordStrengthLabel}
          </Text>
        </View>
        <View style={styles.strengthMeterBackground}>
          <View
            style={[
              styles.strengthMeterFill,
              {
                width: `${(passwordStrength / 5) * 100}%`,
                backgroundColor: passwordStrengthColor,
              },
            ]}
          />
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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryLoading]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.btnPrimaryText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signupLink}>Entrar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: {
    height: 270,
    paddingHorizontal: spacing.xxl,
    justifyContent: "flex-end",
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  orb1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(79,255,176,0.07)",
    top: -60,
    right: -40,
  },
  orb2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(91,158,255,0.07)",
    bottom: -20,
    left: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: "300",
    color: colors.text,
    letterSpacing: -1,
  },
  appNameAccent: { color: colors.accent, fontWeight: "700" },
  tagline: { fontSize: 13, color: colors.text2 },
  body: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  heading: { ...typography.h2, marginBottom: 4 },
  subheading: { ...typography.caption, marginBottom: spacing.xl },
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
    marginBottom: spacing.lg,
  },
  btnPrimaryLoading: { opacity: 0.8 },
  btnPrimaryText: { color: colors.bg, fontSize: 15, fontWeight: "700" },
  errorText: {
    color: colors.red,
    textAlign: "center",
    marginBottom: spacing.md,
    fontSize: 13,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: colors.text2,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  strengthMeterBackground: {
    width: "100%",
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  strengthMeterFill: {
    height: "100%",
    borderRadius: 999,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: { fontSize: 13, color: colors.text2 },
  signupLink: { fontSize: 13, color: colors.accent, fontWeight: "600" },
});

export default RegisterScreen;
