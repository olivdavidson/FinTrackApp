import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import VerifyCodeScreen from "../screens/Auth/VerifyCodeScreen";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ title: "Esqueci minha senha" }}
    />
    <Stack.Screen
      name="VerifyCode"
      component={VerifyCodeScreen}
      options={{ title: "Verificar código" }}
    />
    <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={{ title: "Redefinir senha" }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
