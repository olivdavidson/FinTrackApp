const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const transactions = [
  {
    id: "1",
    name: "Salário",
    category: "Renda",
    amount: 4200,
    type: "income",
    date: "2025-05-06",
    icon: "bank",
    iconColor: "#4AE1C8",
    iconBg: "rgba(74,225,200,0.15)",
  },
  {
    id: "2",
    name: "Mercado Extra",
    category: "Mercado",
    amount: -187.4,
    type: "expense",
    date: "2025-05-06",
    icon: "cart",
    iconColor: "#F87171",
    iconBg: "rgba(248,113,113,0.15)",
  },
  {
    id: "3",
    name: "Uber",
    category: "Transporte",
    amount: -34.9,
    type: "expense",
    date: "2025-05-05",
    icon: "car",
    iconColor: "#60A5FA",
    iconBg: "rgba(96,165,250,0.15)",
  },
  {
    id: "4",
    name: "Netflix",
    category: "Entretenimento",
    amount: -39.9,
    type: "expense",
    date: "2025-05-05",
    icon: "tv",
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.15)",
  },
  {
    id: "5",
    name: "Farmácia",
    category: "Saúde",
    amount: -52.0,
    type: "expense",
    date: "2025-05-05",
    icon: "pill",
    iconColor: "#A78BFA",
    iconBg: "rgba(167,139,250,0.15)",
  },
  {
    id: "6",
    name: "iFood",
    category: "Alimentação",
    amount: -62.5,
    type: "expense",
    date: "2025-05-04",
    icon: "food",
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.15)",
  },
  {
    id: "7",
    name: "PIX recebido",
    category: "Transferência",
    amount: 150.0,
    type: "income",
    date: "2025-05-04",
    icon: "cash",
    iconColor: "#4AE1C8",
    iconBg: "rgba(74,225,200,0.15)",
  },
  {
    id: "8",
    name: "Posto Shell",
    category: "Transporte",
    amount: -210.0,
    type: "expense",
    date: "2025-05-03",
    icon: "gas",
    iconColor: "#60A5FA",
    iconBg: "rgba(96,165,250,0.15)",
  },
  {
    id: "9",
    name: "Aniversário Maria",
    category: "Presentes",
    amount: -89.0,
    type: "expense",
    date: "2025-05-02",
    icon: "gift",
    iconColor: "#FB7185",
    iconBg: "rgba(251,113,133,0.15)",
  },
  {
    id: "10",
    name: "Academia",
    category: "Saúde",
    amount: -68.0,
    type: "expense",
    date: "2025-05-01",
    icon: "heart",
    iconColor: "#14B8A6",
    iconBg: "rgba(20,184,166,0.15)",
  },
];

const accounts = [
  {
    id: "1",
    name: "Nubank",
    bank: "Conta corrente",
    balance: 8240.0,
    icon: "bank",
    iconColor: "#60A5FA",
    iconBg: "rgba(96,165,250,0.15)",
  },
  {
    id: "2",
    name: "Itaú",
    bank: "Poupança",
    balance: 3607.5,
    icon: "piggy-bank",
    iconColor: "#4AE1C8",
    iconBg: "rgba(74,225,200,0.15)",
  },
  {
    id: "3",
    name: "Dinheiro",
    bank: "Em espécie",
    balance: 1000.0,
    icon: "cash",
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.15)",
  },
];

const categories = [
  {
    id: "1",
    name: "Mercado",
    icon: "cart",
    color: "#F87171",
    colorBg: "rgba(248,113,113,0.15)",
    total: 680,
    count: 12,
    percentage: 37,
    budget: 800,
  },
  {
    id: "2",
    name: "Transporte",
    icon: "car",
    color: "#60A5FA",
    colorBg: "rgba(96,165,250,0.15)",
    total: 410,
    count: 8,
    percentage: 22,
    budget: 500,
  },
  {
    id: "3",
    name: "Alimentação",
    icon: "food",
    color: "#F59E0B",
    colorBg: "rgba(245,158,11,0.15)",
    total: 328,
    count: 15,
    percentage: 18,
    budget: 400,
  },
  {
    id: "4",
    name: "Entretenimento",
    icon: "tv",
    color: "#A78BFA",
    colorBg: "rgba(167,139,250,0.15)",
    total: 205,
    count: 5,
    percentage: 11,
    budget: 300,
  },
  {
    id: "5",
    name: "Saúde",
    icon: "heart",
    color: "#4AE1C8",
    colorBg: "rgba(74,225,200,0.15)",
    total: 120,
    count: 3,
    percentage: 7,
    budget: 200,
  },
  {
    id: "6",
    name: "Presentes",
    icon: "gift",
    color: "#FB7185",
    colorBg: "rgba(251,113,133,0.15)",
    total: 89,
    count: 2,
    percentage: 5,
    budget: 150,
  },
];

router.get("/transactions", requireAuth, (req, res) => {
  res.json({ success: true, data: transactions });
});

router.post("/transactions", requireAuth, (req, res) => {
  const { name, amount, type, category, icon } = req.body;

  if (!name || amount == null || !type || !category) {
    return res.status(400).json({
      success: false,
      message: "Nome, valor, tipo e categoria são obrigatórios.",
    });
  }

  const categoryInfo = categories.find((cat) => cat.name === category);
  const newTransaction = {
    id: `${Date.now()}`,
    name,
    category,
    amount: Number(amount),
    type,
    date: new Date().toISOString().slice(0, 10),
    icon: icon || categoryInfo?.icon || "cash",
    iconColor: categoryInfo?.color || "#4AE1C8",
    iconBg: categoryInfo?.colorBg || "rgba(74,225,200,0.15)",
  };

  transactions.unshift(newTransaction);

  res.json({ success: true, data: newTransaction });
});

router.get("/accounts", requireAuth, (req, res) => {
  res.json({ success: true, data: accounts });
});

router.get("/categories", requireAuth, (req, res) => {
  res.json({ success: true, data: categories });
});

router.get("/summary", requireAuth, (req, res) => {
  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenditure = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const balance = income - expenditure;

  res.json({
    success: true,
    data: {
      income,
      expenditure,
      balance,
      transactionsCount: transactions.length,
      accountsCount: accounts.length,
      categoriesCount: categories.length,
    },
  });
});

module.exports = router;
