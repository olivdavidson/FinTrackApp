import React from "react";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigation";
import MainTabNavigator from "./MainTabNavigator";

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return user ? <MainTabNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
