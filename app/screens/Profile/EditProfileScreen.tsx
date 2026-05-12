import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme";

const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
      <View style={styles.placeholder}>
        <Ionicons name={config.icon} size={48} color={colors.text3} />
        <Text style={styles.placeholderText}>{config.title}</Text>
        <Text style={styles.placeholderSub}>
          Implemente o conteúdo desta tela aqui
        </Text>
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
});

export default EditProfileScreen;
