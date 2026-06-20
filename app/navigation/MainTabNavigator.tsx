import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";
import { MainTabParamList } from "./types";

import AnalyticsScreen from "../screens/Analytcs/AnalytcsScreen";
import BalanceScreen from "../screens/Balance/BalanceScreen";
import HomeNavigator from "./HomeNavigation";
import ProfileNavigator from "./ProfileNavigator";
import TransactionNavigator from "./TransactionNavigator";

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

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: insets.bottom ? insets.bottom + 12 : 16,
          marginHorizontal: 12,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name as keyof MainTabParamList];
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, isFocused && styles.tabItemActive]}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.iconWrapper,
                isFocused && styles.iconWrapperActive,
              ]}
            >
              <Ionicons
                name={isFocused ? config.iconActive : config.icon}
                size={22}
                color={isFocused ? colors.bg : colors.text3}
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarShowLabel: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeNavigator} />
    <Tab.Screen name="Balance" component={BalanceScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Transactions" component={TransactionNavigator} />
    <Tab.Screen name="Profile" component={ProfileNavigator} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg,
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 2,
  },
  tabItemActive: {
    backgroundColor: "rgba(79,255,176,0.1)",
    borderRadius: 20,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 18,
  },
  iconWrapperActive: {
    backgroundColor: colors.accent,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    color: colors.text3,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.accent,
  },
});

export default MainTabNavigator;
