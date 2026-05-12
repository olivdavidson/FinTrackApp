import { colors } from "../theme";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  colorBg: string;
  total: number;
  count: number;
  percentage: number;
  budget?: number;
}

export interface Account {
  id: string;
  name: string;
  bank: string;
  balance: number;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    name: "Salário",
    category: "Renda",
    amount: 4200,
    type: "income",
    date: "2025-05-06",
    icon: "bank",
    iconColor: colors.accent,
    iconBg: colors.accentBg,
  },
  {
    id: "2",
    name: "Mercado Extra",
    category: "Mercado",
    amount: -187.4,
    type: "expense",
    date: "2025-05-06",
    icon: "cart",
    iconColor: colors.red,
    iconBg: colors.redBg,
  },
  {
    id: "3",
    name: "Uber",
    category: "Transporte",
    amount: -34.9,
    type: "expense",
    date: "2025-05-05",
    icon: "car",
    iconColor: colors.blue,
    iconBg: colors.blueBg,
  },
  {
    id: "4",
    name: "Netflix",
    category: "Entretenimento",
    amount: -39.9,
    type: "expense",
    date: "2025-05-05",
    icon: "tv",
    iconColor: colors.amber,
    iconBg: colors.amberBg,
  },
  {
    id: "5",
    name: "Farmácia",
    category: "Saúde",
    amount: -52.0,
    type: "expense",
    date: "2025-05-05",
    icon: "pill",
    iconColor: colors.purple,
    iconBg: colors.purpleBg,
  },
  {
    id: "6",
    name: "iFood",
    category: "Alimentação",
    amount: -62.5,
    type: "expense",
    date: "2025-05-04",
    icon: "food",
    iconColor: colors.red,
    iconBg: colors.redBg,
  },
  {
    id: "7",
    name: "PIX recebido",
    category: "Transferência",
    amount: 150.0,
    type: "income",
    date: "2025-05-04",
    icon: "cash",
    iconColor: colors.accent,
    iconBg: colors.accentBg,
  },
  {
    id: "8",
    name: "Posto Shell",
    category: "Transporte",
    amount: -210.0,
    type: "expense",
    date: "2025-05-03",
    icon: "gas",
    iconColor: colors.blue,
    iconBg: colors.blueBg,
  },
  {
    id: "9",
    name: "Aniversário Maria",
    category: "Presentes",
    amount: -89.0,
    type: "expense",
    date: "2025-05-02",
    icon: "gift",
    iconColor: colors.pink,
    iconBg: "rgba(255,158,170,0.15)",
  },
  {
    id: "10",
    name: "Academia",
    category: "Saúde",
    amount: -68.0,
    type: "expense",
    date: "2025-05-01",
    icon: "heart",
    iconColor: colors.teal,
    iconBg: "rgba(93,202,165,0.15)",
  },
];

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Mercado",
    icon: "cart",
    color: colors.red,
    colorBg: colors.redBg,
    total: 680,
    count: 12,
    percentage: 37,
    budget: 800,
  },
  {
    id: "2",
    name: "Transporte",
    icon: "car",
    color: colors.blue,
    colorBg: colors.blueBg,
    total: 410,
    count: 8,
    percentage: 22,
    budget: 500,
  },
  {
    id: "3",
    name: "Alimentação",
    icon: "food",
    color: colors.amber,
    colorBg: colors.amberBg,
    total: 328,
    count: 15,
    percentage: 18,
    budget: 400,
  },
  {
    id: "4",
    name: "Entretenimento",
    icon: "tv",
    color: colors.purple,
    colorBg: colors.purpleBg,
    total: 205,
    count: 5,
    percentage: 11,
    budget: 300,
  },
  {
    id: "5",
    name: "Saúde",
    icon: "heart",
    color: colors.accent,
    colorBg: colors.accentBg,
    total: 120,
    count: 3,
    percentage: 7,
    budget: 200,
  },
  {
    id: "6",
    name: "Presentes",
    icon: "gift",
    color: colors.pink,
    colorBg: "rgba(255,158,170,0.15)",
    total: 89,
    count: 2,
    percentage: 5,
    budget: 150,
  },
];

export const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Nubank",
    bank: "Conta corrente",
    balance: 8240.0,
    icon: "bank",
    iconColor: colors.blue,
    iconBg: colors.blueBg,
  },
  {
    id: "2",
    name: "Itaú",
    bank: "Poupança",
    balance: 3607.5,
    icon: "piggy-bank",
    iconColor: colors.accent,
    iconBg: colors.accentBg,
  },
  {
    id: "3",
    name: "Dinheiro",
    bank: "Em espécie",
    balance: 1000.0,
    icon: "cash",
    iconColor: colors.amber,
    iconBg: colors.amberBg,
  },
];

export const mockChartData = {
  monthly: [
    { month: "Jan", income: 3800, expense: 2400 },
    { month: "Fev", income: 4100, expense: 2900 },
    { month: "Mar", income: 3900, expense: 3100 },
    { month: "Abr", income: 4500, expense: 2100 },
    { month: "Mai", income: 4200, expense: 1832 },
  ],
};

export const mockUser = {
  name: "Mariana Costa",
  email: "mariana.costa@gmail.com",
  initials: "MC",
  plan: "Premium",
  totalBalance: 12847.5,
  monthIncome: 4200,
  monthExpense: 1832,
  savingsGoal: 2000,
  currentSavings: 1360,
  spendingLimit: 4200,
};
