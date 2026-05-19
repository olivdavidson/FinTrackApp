const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Start with no transactions so new users see zero balance and add their own entries
const transactions = [];

// No example accounts — start with an empty accounts list so new users
// see zero balance and must add their own accounts/transactions.
const accounts = [];

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
  const { name, amount, type, category, icon, date } = req.body;

  if (!name || amount == null || !type || !category) {
    return res.status(400).json({
      success: false,
      message: "Nome, valor, tipo e categoria são obrigatórios.",
    });
  }

  const categoryInfo = categories.find((cat) => cat.name === category);
  const transactionDate = (() => {
    if (date) {
      const parsed = new Date(date);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    }
    return new Date().toISOString().slice(0, 10);
  })();

  const newTransaction = {
    id: `${Date.now()}`,
    name,
    category,
    amount: Number(amount),
    type,
    date: transactionDate,
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
