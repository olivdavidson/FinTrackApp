import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AuthNavigator from "./AuthNavigation";
import MainTabNavigator from "./MainTabNavigator";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
