import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Category } from "../utils/mockData";
import { Transaction } from "../utils/mockData";

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
  CategoryDetail: { category: Category };
  TransactionDetail: { transactionId: string };
};

// Transaction Stack
export type TransactionStackParamList = {
  TransactionsMain: undefined;
  AddTransaction: { transaction?: Transaction } | undefined;
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
export type CategoryDetailScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "CategoryDetail"
>;
export type BalanceScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Balance"
>;
export type AnalyticsScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Analytics"
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
export type TransactionsScreenProps = NativeStackScreenProps<
  TransactionStackParamList,
  "TransactionsMain"
>;
export type AddTransactionScreenProps = NativeStackScreenProps<
  TransactionStackParamList,
  "AddTransaction"
>;
