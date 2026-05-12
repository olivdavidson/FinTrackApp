import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { colors, spacing, radius, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';

WebBrowser.maybeCompleteAuthSession();

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // TODO: substituir pela sua lógica de autenticação real
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    navigation.navigate('Main');
  };

  const handleGoogleLogin = async () => {
    // Configurar com seu clientId do Google Cloud Console
    // const [request, response, promptAsync] = Google.useAuthRequest({ clientId: 'SEU_CLIENT_ID' });
    // await promptAsync();
    navigation.navigate('Main');
  };

  const handleFacebookLogin = async () => {
    // Configurar com seu App ID do Facebook Developers
    navigation.navigate('Main');
  };

  const handleXLogin = async () => {
    // Configurar OAuth 2.0 com Twitter/X
    navigation.navigate('Main');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero com LinearGradient do Expo */}
      <LinearGradient
        colors={['#0F1A30', '#0A1020', '#0A0F1E']}
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
        <Text style={styles.tagline}>Controle total do seu dinheiro</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Bem-vindo de volta</Text>
        <Text style={styles.subheading}>Entre na sua conta para continuar</Text>

        {/* Email */}
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color={colors.text3} style={styles.inputIcon} />
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

        {/* Senha */}
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.text3} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.text3}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.text3}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryLoading]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.bg} />
            : <Text style={styles.btnPrimaryText}>Entrar</Text>
          }
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleLogin} activeOpacity={0.8}>
            <View style={[styles.socialIcon, { backgroundColor: '#fff' }]}>
              <Text style={[styles.socialIconText, { color: '#333' }]}>G</Text>
            </View>
            <Text style={styles.socialBtnText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={handleFacebookLogin} activeOpacity={0.8}>
            <View style={[styles.socialIcon, { backgroundColor: '#1877F2' }]}>
              <Text style={[styles.socialIconText, { color: '#fff' }]}>f</Text>
            </View>
            <Text style={styles.socialBtnText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={handleXLogin} activeOpacity={0.8}>
            <View style={[styles.socialIcon, { backgroundColor: '#000', borderWidth: 1, borderColor: '#333' }]}>
              <Text style={[styles.socialIconText, { color: '#fff' }]}>X</Text>
            </View>
            <Text style={styles.socialBtnText}>X</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Não tem conta? </Text>
          <TouchableOpacity>
            <Text style={styles.signupLink}>Cadastre-se</Text>
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
    justifyContent: 'flex-end',
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(79,255,176,0.07)', top: -60, right: -40,
  },
  orb2: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(91,158,255,0.07)', bottom: -20, left: 20,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  appName: { fontSize: 34, fontWeight: '300', color: colors.text, letterSpacing: -1 },
  appNameAccent: { color: colors.accent, fontWeight: '700' },
  tagline: { fontSize: 13, color: colors.text2 },
  body: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  heading: { ...typography.h2, marginBottom: 4 },
  subheading: { ...typography.caption, marginBottom: spacing.xl },
  label: { fontSize: 12, color: colors.text2, fontWeight: '500', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, marginBottom: 14, paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, color: colors.text, fontSize: 14 },
  eyeIcon: { padding: 4 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: { fontSize: 12, color: colors.accent },
  btnPrimary: {
    backgroundColor: colors.accent, borderRadius: radius.lg,
    paddingVertical: 15, alignItems: 'center', marginBottom: spacing.lg,
  },
  btnPrimaryLoading: { opacity: 0.8 },
  btnPrimaryText: { color: colors.bg, fontSize: 15, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.text3 },
  socialRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.xl },
  socialBtn: {
    flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  socialIcon: {
    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  socialIconText: { fontSize: 11, fontWeight: '700' },
  socialBtnText: { fontSize: 12, color: colors.text2, fontWeight: '500' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 13, color: colors.text2 },
  signupLink: { fontSize: 13, color: colors.accent, fontWeight: '600' },
});

export default LoginScreen;
