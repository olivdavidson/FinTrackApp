import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../../components/common/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography } from "../../theme";
import {
    changePassword as changePasswordApi,
    disable2fa,
    send2faCode,
    verify2fa,
} from "../../utils/api";

const SecurityScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const config = {
    EditProfile: { title: "Editar Perfil", icon: "person-outline" as const },
    Security: { title: "Segurança", icon: "shield-checkmark-outline" as const },
    AppSettings: { title: "Configurações", icon: "settings-outline" as const },
    Help: { title: "Ajuda e Suporte", icon: "help-circle-outline" as const },
  }["Security"];

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    disablePassword?: string;
  }>({});
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [waitingCode, setWaitingCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const b = await AsyncStorage.getItem("@fintrack:biometrics");
        const t = await AsyncStorage.getItem("@fintrack:2fa");
        setBiometricsEnabled(b === "1");
        setTwoFaEnabled(t === "1");
      } catch (err) {
        console.warn(err);
      }
    })();
  }, []);

  const {
    user,
    accessToken,
    refreshToken,
    signOut,
    updateTokens,
    updateProfile,
  } = useAuth();

  const toast = useToast();

  useEffect(() => {
    setTwoFaEnabled(Boolean(user?.twoFaEnabled));
  }, [user]);

  const toggleBiometrics = async (val: boolean) => {
    setBiometricsEnabled(val);
    try {
      await AsyncStorage.setItem("@fintrack:biometrics", val ? "1" : "0");
    } catch (err) {
      console.warn(err);
    }
  };

  const toggle2fa = async (val: boolean) => {
    // legacy/local toggle kept for quick demo; prefer server flow
    setTwoFaEnabled(val);
    try {
      await AsyncStorage.setItem("@fintrack:2fa", val ? "1" : "0");
    } catch (err) {
      console.warn(err);
    }
  };

  const handleChangePassword = async () => {
    const newErrors: typeof errors = {};
    if (!currentPassword) newErrors.currentPassword = "Informe a senha atual";
    if (!newPassword) newErrors.newPassword = "Informe a nova senha";
    if (newPassword && newPassword.length < 8)
      newErrors.newPassword = "A nova senha deve ter ao menos 8 caracteres";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.showToast("Verifique os campos", "error");
      return;
    }
    setIsChangingPw(true);
    try {
      if (accessToken && refreshToken) {
        const res = await changePasswordApi(
          currentPassword,
          newPassword,
          accessToken,
          refreshToken,
          async (a, r) => {
            await updateTokens(a, r);
          },
        );

        if (res && res.success) {
          toast.showToast("Senha alterada. Você será deslogado.", "success");
          await signOut();
          return;
        }
      }

      // Fallback local (não recomendado)
      setCurrentPassword("");
      setNewPassword("");
      toast.showToast("Senha alterada (simulada).", "info");
    } catch (err) {
      console.warn(err);
      toast.showToast("Falha ao alterar senha.", "error");
    } finally {
      setIsChangingPw(false);
    }
  };

  const toast = useToast();
  const handleSend2fa = async () => {
    if (!accessToken)
      return toast.showToast("Usuário não autenticado.", "error");
    setIsSending(true);
    try {
      const res = await send2faCode(accessToken);
      if (res && res.success) {
        setWaitingCode(true);
        toast.showToast("Código enviado. Verifique seu SMS.", "info");
      }
    } catch (err) {
      console.warn(err);
      toast.showToast("Não foi possível enviar o código.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify2fa = async () => {
    if (!accessToken || !refreshToken)
      return toast.showToast("Usuário não autenticado.", "error");
    if (!codeInput) return toast.showToast("Insira o código enviado.", "error");
    setIsVerifying(true);
    try {
      const res = await verify2fa(
        codeInput,
        accessToken,
        refreshToken,
        async (a, r) => {
          await updateTokens(a, r);
        },
      );

      if (res && res.user) {
        await updateProfile({ twoFaEnabled: true });
        setWaitingCode(false);
        setCodeInput("");
        toast.showToast("2FA ativado com sucesso.", "success");
        return;
      }
    } catch (err) {
      console.warn(err);
      toast.showToast("Código inválido ou falha ao verificar.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2fa = async () => {
    const newErrors: typeof errors = {};
    if (!disablePassword)
      newErrors.disablePassword = "Informe sua senha atual.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0)
      return toast.showToast("Informe a senha para desativar.", "error");
    if (!accessToken || !refreshToken)
      return toast.showToast("Usuário não autenticado.", "error");
    setIsDisabling(true);
    try {
      const res = await disable2fa(
        disablePassword,
        accessToken,
        refreshToken,
        async (a, r) => {
          await updateTokens(a, r);
        },
      );

      if (res && res.user) {
        await updateProfile({ twoFaEnabled: false });
        setDisablePassword("");
        toast.showToast("2FA desativado.", "success");
        return;
      }
    } catch (err) {
      console.warn(err);
      toast.showToast("Falha ao desativar 2FA.", "error");
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.accent} />
        </TouchableOpacity>
        <Text style={typography.h2}>{config.title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Autenticação</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Biometria</Text>
          <Switch value={biometricsEnabled} onValueChange={toggleBiometrics} />
        </View>
        <View style={{ marginTop: spacing.md }}>
          <Text style={[styles.rowLabel, { marginBottom: 8 }]}>
            2FA (Verificação em duas etapas)
          </Text>
          {twoFaEnabled ? (
            <View>
              <Text style={{ color: colors.text2, marginBottom: 8 }}>
                2FA ativado
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Senha atual para desativar"
                secureTextEntry
                value={disablePassword}
                onChangeText={setDisablePassword}
              />
              {errors.disablePassword ? (
                <Text style={styles.errorText}>{errors.disablePassword}</Text>
              ) : null}
              <View style={{ marginTop: spacing.sm }}>
                {isDisabling ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Button
                    title="Desativar 2FA"
                    color="#d9534f"
                    onPress={handleDisable2fa}
                  />
                )}
              </View>
            </View>
          ) : (
            <View>
              {waitingCode ? (
                <View>
                  <Text style={{ color: colors.text2, marginBottom: 8 }}>
                    Insira o código recebido por SMS
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={codeInput}
                    onChangeText={setCodeInput}
                    placeholder="Código"
                  />
                  <View style={{ marginTop: spacing.sm }}>
                    {isVerifying ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Button
                        title="Verificar código"
                        onPress={handleVerify2fa}
                      />
                    )}
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={{ color: colors.text2, marginBottom: 8 }}>
                    2FA não está ativado
                  </Text>
                  {isSending ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Button title="Ativar 2FA" onPress={handleSend2fa} />
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha atual"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        {errors.currentPassword ? (
          <Text style={styles.errorText}>{errors.currentPassword}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Nova senha"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        {errors.newPassword ? (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        ) : null}
        <View style={{ marginTop: spacing.md }}>
          {isChangingPw ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Button title="Alterar senha" onPress={handleChangePassword} />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  placeholderText: { fontSize: 18, fontWeight: "600", color: colors.text2 },
  placeholderSub: { fontSize: 13, color: colors.text3 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  rowLabel: { fontSize: 13, color: colors.text2 },
  input: {
    marginTop: spacing.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.bg,
  },
  errorText: { color: "#d9534f", marginTop: 6, fontSize: 12 },
});

export default SecurityScreen;
