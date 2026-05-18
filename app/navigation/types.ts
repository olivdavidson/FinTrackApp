import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Main Tab
export type MainTabParamList = {
  Home: undefined;
  Balance: undefined;
  Analytics: undefined;
  Transactions: undefined;
  Profile: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeMain: undefined;
  Categories: undefined;
  TransactionDetail: { transactionId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Security: undefined;
  AppSettings: undefined;
  Help: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "Login"
>;
export type HomeScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "HomeMain"
>;
export type CategoriesScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "Categories"
>;
export type BalanceScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Balance"
>;
export type AnalyticsScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Analytics"
>;
export type TransactionsScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Transactions"
>;
export type ProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "ProfileMain"
>;
export type EditProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "EditProfile"
>;
export type SecurityScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "Security"
>;
export type AppSettingsScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "AppSettings"
>;
export type HelpScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "Help"
>;
