const express = require("express");
const Account = require("../models/Account");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const DEFAULT_CATEGORIES = [
  {
    name: "Mercado",
    icon: "cart",
    color: "#F87171",
    colorBg: "rgba(248,113,113,0.15)",
    budget: 800,
  },
  {
    name: "Transporte",
    icon: "car",
    color: "#60A5FA",
    colorBg: "rgba(96,165,250,0.15)",
    budget: 500,
  },
  {
    name: "Alimentação",
    icon: "food",
    color: "#F59E0B",
    colorBg: "rgba(245,158,11,0.15)",
    budget: 400,
  },
  {
    name: "Entretenimento",
    icon: "tv",
    color: "#A78BFA",
    colorBg: "rgba(167,139,250,0.15)",
    budget: 300,
  },
  {
    name: "Saúde",
    icon: "heart",
    color: "#4AE1C8",
    colorBg: "rgba(74,225,200,0.15)",
    budget: 200,
  },
  {
    name: "Presentes",
    icon: "gift",
    color: "#FB7185",
    colorBg: "rgba(251,113,133,0.15)",
    budget: 150,
  },
];

const parseDate = (date) => {
  if (date) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return new Date().toISOString().slice(0, 10);
};

const normalizeAmount = (amount, type) => {
  const numericAmount = Math.abs(Number(amount));

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  return type === "expense" ? -numericAmount : numericAmount;
};

const ensureDefaultCategories = async (userId) => {
  const existingCount = await Category.countDocuments({ user: userId });

  if (existingCount === 0) {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((category) => ({ ...category, user: userId })),
      { ordered: false },
    );
  }

  return Category.find({ user: userId }).sort({ name: 1 });
};

const ensureDefaultAccount = async (userId) => {
  let account = await Account.findOne({ user: userId, isDefault: true });

  if (!account) {
    account = await Account.create({
      user: userId,
      name: "Carteira principal",
      bank: "Saldo geral",
      balance: 0,
      icon: "cash",
      iconColor: "#4AE1C8",
      iconBg: "rgba(74,225,200,0.15)",
      isDefault: true,
    });
  }

  return account;
};

const buildCategoryStats = async (userId) => {
  const [categories, expenseTotals] = await Promise.all([
    ensureDefaultCategories(userId),
    Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: { $abs: "$amount" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalsByCategory = expenseTotals.reduce((acc, item) => {
    acc[item._id] = { total: item.total, count: item.count };
    return acc;
  }, {});
  const totalExpenses = expenseTotals.reduce((sum, item) => sum + item.total, 0);

  return categories.map((category) => {
    const plainCategory = category.toJSON();
    const stats = totalsByCategory[plainCategory.name] ?? {
      total: 0,
      count: 0,
    };

    return {
      ...plainCategory,
      total: stats.total,
      count: stats.count,
      percentage:
        totalExpenses > 0 ? Math.round((stats.total / totalExpenses) * 100) : 0,
    };
  });
};

router.get("/transactions", requireAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("[GET /data/transactions]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao carregar transações." });
  }
});

router.post("/transactions", requireAuth, async (req, res) => {
  try {
    const { name, amount, type, category, icon, date } = req.body;

    if (!name || amount == null || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "Nome, valor, tipo e categoria são obrigatórios.",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de transação inválido.",
      });
    }

    const normalizedAmount = normalizeAmount(amount, type);
    if (normalizedAmount === null) {
      return res.status(400).json({
        success: false,
        message: "Valor da transação inválido.",
      });
    }

    const [account, categories] = await Promise.all([
      ensureDefaultAccount(req.user._id),
      ensureDefaultCategories(req.user._id),
    ]);
    const categoryInfo = categories.find((cat) => cat.name === category);

    const newTransaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      name: name.trim(),
      category,
      amount: normalizedAmount,
      type,
      date: parseDate(date),
      icon: icon || categoryInfo?.icon || "cash",
      iconColor: categoryInfo?.color || "#4AE1C8",
      iconBg: categoryInfo?.colorBg || "rgba(74,225,200,0.15)",
    });

    account.balance += normalizedAmount;
    await account.save();

    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    console.error("[POST /data/transactions]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao salvar transação." });
  }
});

router.get("/accounts", requireAuth, async (req, res) => {
  try {
    await ensureDefaultAccount(req.user._id);
    const accounts = await Account.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: 1,
    });

    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error("[GET /data/accounts]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao carregar contas." });
  }
});

router.get("/categories", requireAuth, async (req, res) => {
  try {
    const categories = await buildCategoryStats(req.user._id);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("[GET /data/categories]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao carregar categorias." });
  }
});

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const [transactions, accounts, categoriesCount] = await Promise.all([
      Transaction.find({ user: req.user._id }),
      Account.find({ user: req.user._id }),
      Category.countDocuments({ user: req.user._id }),
    ]);

    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenditure = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const balance = accounts.reduce((sum, account) => sum + account.balance, 0);

    res.json({
      success: true,
      data: {
        income,
        expenditure,
        balance,
        transactionsCount: transactions.length,
        accountsCount: accounts.length,
        categoriesCount,
      },
    });
  } catch (error) {
    console.error("[GET /data/summary]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao carregar resumo." });
  }
});

module.exports = router;
