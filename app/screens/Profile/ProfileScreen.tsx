import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SectionTitle from "../../components/common/SectionTitle";
import { useAuth } from "../../context/AuthContext";
import { ProfileStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";

type NavProp = NativeStackNavigationProp<ProfileStackParamList>;
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface MenuItemProps {
  icon: IoniconName;
  iconColor: string;
  iconBg: string;
  label: string;
  sub: string;
  onPress?: () => void;
  badge?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  iconColor,
  iconBg,
  label,
  sub,
  onPress,
  badge,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuSub}>{sub}</Text>
    </View>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={16} color={colors.text3} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { user, signOut } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (__DEV__) {
      Alert.alert("DEBUG", "Logout button pressed (dev)");
    }

    Alert.alert("Sair", "Deseja realmente encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await signOut();
          } catch (err) {
            console.warn("Erro ao sair:", err);
            Alert.alert(
              "Erro",
              "Não foi possível encerrar a sessão. Tente novamente.",
            );
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const userName = user?.name || "Usuário";
  const userEmail = user?.email || "email@exemplo.com";
  const initials = userName
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.header}>
        <Text style={typography.h2}>Perfil</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Ionicons name="create-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Avatar section */}
      <View style={styles.hero}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity style={styles.avatarEditBtn}>
            <Ionicons name="camera-outline" size={14} color={colors.bg} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
        <View style={styles.planBadge}>
          <Ionicons name="star" size={12} color={colors.accent} />
          <Text style={styles.planText}>Plano Básico</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.accent }]}>47</Text>
          <Text style={styles.statLabel}>Transações</Text>
        </View>
        <View style={[styles.statCard, styles.statCardMid]}>
          <Text style={[styles.statValue, { color: colors.blue }]}>6</Text>
          <Text style={styles.statLabel}>Categorias</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.amber }]}>3</Text>
          <Text style={styles.statLabel}>Contas</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.sections}>
        <SectionTitle>Conta</SectionTitle>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="person-outline"
            iconColor={colors.accent}
            iconBg={colors.accentBg}
            label="Editar perfil"
            sub="Nome, foto, e-mail"
            onPress={() => navigation.navigate("EditProfile")}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            iconColor={colors.blue}
            iconBg={colors.blueBg}
            label="Segurança"
            sub="Senha, biometria, 2FA"
            onPress={() => navigation.navigate("Security")}
          />
        </View>

        <SectionTitle>Preferências</SectionTitle>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="settings-outline"
            iconColor={colors.amber}
            iconBg={colors.amberBg}
            label="Configurações"
            sub="Notificações, tema, moeda"
            onPress={() => navigation.navigate("AppSettings")}
          />
          <MenuItem
            icon="notifications-outline"
            iconColor={colors.purple}
            iconBg={colors.purpleBg}
            label="Notificações"
            sub="Alertas e lembretes"
            badge="3"
            onPress={() => navigation.navigate("AppSettings")}
          />
        </View>

        <SectionTitle>Suporte</SectionTitle>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="help-circle-outline"
            iconColor={colors.accent}
            iconBg={colors.accentBg}
            label="Ajuda e suporte"
            sub="FAQ, chat, documentação"
            onPress={() => navigation.navigate("Help")}
          />
          <MenuItem
            icon="information-circle-outline"
            iconColor={colors.blue}
            iconBg={colors.blueBg}
            label="Sobre o app"
            sub="Versão 1.0.0"
          />
        </View>
      </View>

      {/* Logout */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutBtn,
          pressed && styles.logoutBtnPressed,
          loggingOut && styles.logoutBtnDisabled,
        ]}
        onPress={handleLogout}
        disabled={loggingOut}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        accessibilityRole="button"
        accessible
      >
        <Ionicons name="log-out-outline" size={20} color={colors.red} />
        <Text style={styles.logoutText}>
          {loggingOut ? "Saindo..." : "Sair da conta"}
        </Text>
      </Pressable>

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
  editBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { alignItems: "center", paddingBottom: spacing.lg },
  avatarWrapper: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentBg,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "600", color: colors.accent },
  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: { fontSize: 20, fontWeight: "600", color: colors.text },
  userEmail: { fontSize: 13, color: colors.text2, marginTop: 4 },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.accentBg,
    borderWidth: 1,
    borderColor: "rgba(79,255,176,0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 12,
  },
  planText: { fontSize: 12, color: colors.accent, fontWeight: "500" },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statCardMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, color: colors.text3, marginTop: 2 },
  sections: { paddingHorizontal: spacing.lg },
  menuGroup: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 14, fontWeight: "500", color: colors.text },
  menuSub: { fontSize: 12, color: colors.text3, marginTop: 2 },
  badge: {
    backgroundColor: colors.red,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 4,
  },
  badgeText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  logoutBtn: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.redBg,
    borderWidth: 1,
    borderColor: "rgba(255,92,122,0.3)",
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutBtnPressed: {
    opacity: 0.8,
  },
  logoutBtnDisabled: {
    opacity: 0.6,
  },
  logoutText: { fontSize: 15, fontWeight: "500", color: colors.red },
});

export default ProfileScreen;
