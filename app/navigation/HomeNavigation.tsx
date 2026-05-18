import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import CategoriesScreen from "../screens/Categories/CategoriesScreen";
import CategoryDetailScreen from "../screens/Categories/CategoryDetailScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import { HomeStackParamList } from "./types";

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="CategoryDetail"
      component={CategoryDetailScreen}
      options={{ animation: "slide_from_right" }}
    />
  </Stack.Navigator>
);

export default HomeNavigator;
