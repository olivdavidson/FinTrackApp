import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
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
import { resendOtpCode, verifyOtpCode } from "../../utils/api";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyCode">;

const VerifyCodeScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { userId, identifier } = route.params;
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((value) => value - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (code.trim().length < 4) {
      Alert.alert("Erro", "Informe o código recebido por SMS.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await verifyOtpCode(userId, code.trim());
      navigation.navigate("ResetPassword", {
        userId,
        otpCode: code.trim(),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao validar código.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMessage(null);

    try {
      await resendOtpCode(userId);
      setTimer(60);
      Alert.alert("Código reenviado", "Confira o SMS enviado ao telefone.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao reenviar código.",
      );
    } finally {
      setResending(false);
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
          <Ionicons
            name="shield-checkmark-outline"
            size={30}
            color={colors.accent}
          />
        </View>

        <Text style={styles.heading}>Verificar código</Text>
        <Text style={styles.subheading}>
          Digite o código enviado para {identifier}.
        </Text>

        <Text style={styles.label}>Código SMS</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, ""))}
            placeholder="000000"
            placeholderTextColor={colors.text3}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryLoading]}
          onPress={handleVerify}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.btnPrimaryText}>Validar código</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={timer > 0 || resending}
        >
          <Text
            style={[
              styles.resendText,
              (timer > 0 || resending) && styles.resendTextDisabled,
            ]}
          >
            {timer > 0
              ? `Reenviar código em ${timer}s`
              : resending
                ? "Reenviando..."
                : "Reenviar código"}
          </Text>
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  codeInput: {
    paddingVertical: 16,
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 8,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: "center",
  },
  btnPrimaryLoading: { opacity: 0.8 },
  btnPrimaryText: { color: colors.bg, fontSize: 15, fontWeight: "700" },
  resendButton: { alignItems: "center", marginTop: spacing.lg },
  resendText: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  resendTextDisabled: { color: colors.text3 },
  errorText: {
    color: colors.red,
    textAlign: "center",
    marginBottom: spacing.md,
    fontSize: 13,
  },
});

export default VerifyCodeScreen;
