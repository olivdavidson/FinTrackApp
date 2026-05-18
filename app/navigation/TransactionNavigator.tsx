import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AddTransactionScreen from "../screens/Transactions/AddTransactionScreen";
import TransactionsScreen from "../screens/Transactions/TransacionsScreen";
import { TransactionStackParamList } from "./types";

const Stack = createNativeStackNavigator<TransactionStackParamList>();

const TransactionNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TransactionsMain" component={TransactionsScreen} />
    <Stack.Screen
      name="AddTransaction"
      component={AddTransactionScreen}
      options={{ animation: "slide_from_bottom" }}
    />
  </Stack.Navigator>
);

export default TransactionNavigator;
