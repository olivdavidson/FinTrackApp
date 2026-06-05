import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../../components/common/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography } from "../../theme";
import {
    updateProfile as updateProfileApi,
    uploadAvatar,
} from "../../utils/api";

const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, updateProfile, accessToken, refreshToken, updateTokens } =
    useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<string | undefined>(
    user?.avatar || undefined,
  );

  const pickImage = async () => {
    try {
      // validate fields locally
      const newErrors: typeof errors = {};
      if (!name || name.trim().length < 2)
        newErrors.name = "Nome deve ter ao menos 2 caracteres";
      if (!email || !/^\S+@\S+\.\S+$/.test(email))
        newErrors.email = "E-mail inválido";
      if (phone && phone.replace(/\D/g, "").length < 10)
        newErrors.phone = "Telefone inválido";
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        toast.showToast("Verifique os erros do formulário", "error");
        setIsSaving(false);
        return;
      }
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!res.granted) {
        Alert.alert(
          "Permissão necessária",
          "Permissão para acessar fotos é necessária.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.cancelled) {
        setAvatar(result.uri);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload avatar file if changed and is a local file
      if (
        avatar &&
        avatar.startsWith("file://") &&
        accessToken &&
        refreshToken
      ) {
        try {
          const up = await uploadAvatar(
            avatar,
            accessToken,
            refreshToken,
            async (a, r) => {
              await updateTokens(a, r);
            },
          );

          if (up && up.user) {
            await updateProfile({ avatar: up.user.avatar });
          }
        } catch (err) {
          console.warn("Avatar upload failed:", err);
          // continue to attempt other updates
        }
      }

      // Update basic profile fields
      if (accessToken && refreshToken) {
        try {
          const res = await updateProfileApi(
            { name, email, phone },
            accessToken,
            refreshToken,
            async (a, r) => {
              await updateTokens(a, r);
            },
          );

          if (res && res.user) {
            await updateProfile({
              name: res.user.name,
              email: res.user.email,
              phone: res.user.phone,
              avatar: res.user.avatar,
            });
            toast.showToast("Perfil atualizado.", "success");
            navigation.goBack();
            return;
          }
        } catch (err) {
          console.warn("Profile update failed:", err);
        }
      }

      // fallback local
      await updateProfile({ name, email, phone, avatar });
      toast.showToast("Perfil atualizado localmente.", "info");
      navigation.goBack();
    } catch (err) {
      console.warn(err);
      toast.showToast("Falha ao salvar perfil.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const config = {
    EditProfile: { title: "Editar Perfil", icon: "person-outline" as const },
    Security: { title: "Segurança", icon: "shield-checkmark-outline" as const },
    AppSettings: { title: "Configurações", icon: "settings-outline" as const },
    Help: { title: "Ajuda e Suporte", icon: "help-circle-outline" as const },
  }["EditProfile"];

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

      <View style={styles.form}>
        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={32} color={colors.text3} />
            </View>
          )}
          <Text style={styles.avatarHint}>Tocar para alterar foto</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nome"
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : null}

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        <Text style={styles.label}>Celular</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
        />
        {errors.phone ? (
          <Text style={styles.errorText}>{errors.phone}</Text>
        ) : null}

        <View style={{ marginTop: spacing.lg }}>
          {isSaving ? (
            <View style={{ alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : (
            <Button title="Salvar" onPress={handleSave} />
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
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  avatarPicker: { alignItems: "center", marginBottom: spacing.lg },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: { marginTop: 8, fontSize: 12, color: colors.text3 },
  label: { marginTop: spacing.sm, fontSize: 13, color: colors.text2 },
  input: {
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.bg,
  },
  errorText: { color: "#d9534f", marginTop: 6, fontSize: 12 },
});

export default EditProfileScreen;
