import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AppSettingsScreen from "../screens/Profile/AppSettingScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import HelpScreen from "../screens/Profile/HelpScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import SecurityScreen from "../screens/Profile/SecurityScreen";
import { ProfileStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="Security"
      component={SecurityScreen}
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="AppSettings"
      component={AppSettingsScreen}
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="Help"
      component={HelpScreen}
      options={{ animation: "slide_from_right" }}
    />
  </Stack.Navigator>
);

export default ProfileNavigator;
