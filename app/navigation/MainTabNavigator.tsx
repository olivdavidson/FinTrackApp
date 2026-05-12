import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { MainTabParamList } from "./types";

import AnalyticsScreen from "../screens/Analytcs/AnalytcsScreen";
import BalanceScreen from "../screens/Balance/BalanceScreen";
import TransactionsScreen from "../screens/Transactions/TransacionsScreen";
import HomeNavigator from "./HomeNavigation";
import ProfileNavigator from "./ProfileNavigator";

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: Record<
  keyof MainTabParamList,
  { label: string; icon: IoniconName; iconActive: IoniconName }
> = {
  Home: { label: "Início", icon: "home-outline", iconActive: "home" },
  Balance: { label: "Saldo", icon: "wallet-outline", iconActive: "wallet" },
  Analytics: {
    label: "Análises",
    icon: "pie-chart-outline",
    iconActive: "pie-chart",
  },
  Transactions: {
    label: "Transações",
    icon: "swap-horizontal-outline",
    iconActive: "swap-horizontal",
  },
  Profile: { label: "Perfil", icon: "person-outline", iconActive: "person" },
};

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const config = TAB_CONFIG[route.name as keyof MainTabParamList];
      return {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, size }) => (
          <View style={styles.tabItem}>
            {focused && <View style={styles.tabDot} />}
            <Ionicons
              name={focused ? config.iconActive : config.icon}
              size={22}
              color={focused ? colors.accent : colors.text3}
            />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {config.label}
            </Text>
          </View>
        ),
      };
    }}
  >
    <Tab.Screen name="Home" component={HomeNavigator} />
    <Tab.Screen name="Balance" component={BalanceScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Transactions" component={TransactionsScreen} />
    <Tab.Screen name="Profile" component={ProfileNavigator} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(10,15,30,0.97)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === "ios" ? 84 : 68,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 52,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    position: "absolute",
    top: -10,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.text3,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: colors.accent,
  },
});

export default MainTabNavigator;
