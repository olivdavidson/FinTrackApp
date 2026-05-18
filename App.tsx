import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./app/context/AuthContext";
import RootNavigator from "./app/navigation/RootNavigator";
import { colors } from "./app/theme";

// Mantém a splash screen visível enquanto carregamos recursos
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Carregue fontes customizadas aqui se necessário
        // await Font.loadAsync({ 'DMSans': require('./assets/fonts/DMSans-Regular.ttf') });
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simula carregamento
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) await SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View
          style={{ flex: 1, backgroundColor: colors.bg }}
          onLayout={onLayoutRootView}
        >
          <NavigationContainer>
            <AuthProvider>
              <StatusBar style="light" backgroundColor={colors.bg} />
              <RootNavigator />
            </AuthProvider>
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
