const express = require("express");
const Account = require("../models/Account");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const DEFAULT_EXPENSE_CATEGORIES = [
  {
    name: "Mercado",
    type: "expense",
    icon: "cart",
    color: "#F87171",
    colorBg: "rgba(248,113,113,0.15)",
    budget: 800,
  },
  {
    name: "Transporte",
    type: "expense",
    icon: "car",
    color: "#60A5FA",
    colorBg: "rgba(96,165,250,0.15)",
    budget: 500,
  },
  {
    name: "Alimentação",
    type: "expense",
    icon: "food",
    color: "#F59E0B",
    colorBg: "rgba(245,158,11,0.15)",
    budget: 400,
  },
  {
    name: "Entretenimento",
    type: "expense",
    icon: "tv",
    color: "#A78BFA",
    colorBg: "rgba(167,139,250,0.15)",
    budget: 300,
  },
  {
    name: "Saúde",
    type: "expense",
    icon: "heart",
    color: "#4AE1C8",
    colorBg: "rgba(74,225,200,0.15)",
    budget: 200,
  },
  {
    name: "Presentes",
    type: "expense",
    icon: "gift",
    color: "#FB7185",
    colorBg: "rgba(251,113,133,0.15)",
    budget: 150,
  },
];

const DEFAULT_INCOME_CATEGORIES = [
  {
    name: "Transferência bancária",
    type: "income",
    icon: "bank",
    color: "#60A5FA",
    colorBg: "rgba(96,165,250,0.15)",
    budget: 0,
  },
  {
    name: "Pix",
    type: "income",
    icon: "cash",
    color: "#4AE1C8",
    colorBg: "rgba(74,225,200,0.15)",
    budget: 0,
  },
];

const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
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

const getAccountVisuals = (bank = "") => {
  const normalizedBank = bank.toLowerCase();

  if (normalizedBank.includes("nubank")) {
    return {
      icon: "bank",
      iconColor: "#A78BFA",
      iconBg: "rgba(167,139,250,0.15)",
    };
  }

  if (normalizedBank.includes("itaú") || normalizedBank.includes("itau")) {
    return {
      icon: "bank",
      iconColor: "#F59E0B",
      iconBg: "rgba(245,158,11,0.15)",
    };
  }

  if (normalizedBank.includes("dinheiro") || normalizedBank.includes("cash")) {
    return {
      icon: "cash",
      iconColor: "#4AE1C8",
      iconBg: "rgba(74,225,200,0.15)",
    };
  }

  return {
    icon: "bank",
    iconColor: "#60A5FA",
    iconBg: "rgba(96,165,250,0.15)",
  };
};

const ensureDefaultCategories = async (userId) => {
  await Category.updateMany(
    { user: userId, type: { $exists: false } },
    { $set: { type: "expense" } },
  );

  await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      Category.updateOne(
        { user: userId, type: category.type, name: category.name },
        { $setOnInsert: { ...category, user: userId } },
        { upsert: true },
      ),
    ),
  );

  return Category.find({ user: userId }).sort({ type: 1, name: 1 });
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

const resolveTransactionAccount = async (userId, payload) => {
  const { accountId, accountName, accountBank } = payload;

  if (accountId) {
    const account = await Account.findOne({ _id: accountId, user: userId });
    if (account) return account;
  }

  if (accountName?.trim()) {
    const name = accountName.trim();
    const bank = accountBank?.trim() || "Conta manual";
    const existing = await Account.findOne({ user: userId, name, bank });

    if (existing) return existing;

    return Account.create({
      user: userId,
      name,
      bank,
      balance: 0,
      ...getAccountVisuals(`${name} ${bank}`),
      isDefault: false,
    });
  }

  return ensureDefaultAccount(userId);
};

const buildCategoryStats = async (userId) => {
  const [categories, expenseTotals] = await Promise.all([
    ensureDefaultCategories(userId).then((items) =>
      items.filter((category) => category.type === "expense"),
    ),
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
      resolveTransactionAccount(req.user._id, req.body),
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

router.put("/transactions/:id", requireAuth, async (req, res) => {
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

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transação não encontrada." });
    }

    const [newAccount, categories] = await Promise.all([
      resolveTransactionAccount(req.user._id, req.body),
      ensureDefaultCategories(req.user._id),
    ]);
    const categoryInfo = categories.find((cat) => cat.name === category);
    const oldAccountId = transaction.account?.toString();
    const newAccountId = newAccount._id.toString();

    if (oldAccountId === newAccountId) {
      newAccount.balance = newAccount.balance - transaction.amount + normalizedAmount;
      await newAccount.save();
    } else {
      if (oldAccountId) {
        await Account.updateOne(
          { _id: oldAccountId, user: req.user._id },
          { $inc: { balance: -transaction.amount } },
        );
      }
      newAccount.balance += normalizedAmount;
      await newAccount.save();
    }

    transaction.account = newAccount._id;
    transaction.name = name.trim();
    transaction.category = category;
    transaction.amount = normalizedAmount;
    transaction.type = type;
    transaction.date = parseDate(date);
    transaction.icon = icon || categoryInfo?.icon || "cash";
    transaction.iconColor = categoryInfo?.color || "#4AE1C8";
    transaction.iconBg = categoryInfo?.colorBg || "rgba(74,225,200,0.15)";
    await transaction.save();

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error("[PUT /data/transactions/:id]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar transação." });
  }
});

router.delete("/transactions/:id", requireAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transação não encontrada." });
    }

    if (transaction.account) {
      await Account.updateOne(
        { _id: transaction.account, user: req.user._id },
        { $inc: { balance: -transaction.amount } },
      );
    }

    await transaction.deleteOne();
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    console.error("[DELETE /data/transactions/:id]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao remover transação." });
  }
});

router.get("/accounts", requireAuth, async (req, res) => {
  try {
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

router.put("/accounts/:id", requireAuth, async (req, res) => {
  try {
    const { name, bank } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Nome da conta é obrigatório." });
    }

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        name: name.trim(),
        bank: bank?.trim() || "Conta manual",
        ...getAccountVisuals(`${name} ${bank || ""}`),
      },
      { new: true },
    );

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Conta não encontrada." });
    }

    res.json({ success: true, data: account });
  } catch (error) {
    console.error("[PUT /data/accounts/:id]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar conta." });
  }
});

router.delete("/accounts/:id", requireAuth, async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Conta não encontrada." });
    }

    await Transaction.updateMany(
      { user: req.user._id, account: account._id },
      { $set: { account: null } },
    );

    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    console.error("[DELETE /data/accounts/:id]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao remover conta." });
  }
});

router.get("/categories", requireAuth, async (req, res) => {
  try {
    const { type } = req.query;
    const categories =
      type === "income" || type === "expense"
        ? await ensureDefaultCategories(req.user._id).then((items) =>
            items.filter((category) => category.type === type),
          )
        : await buildCategoryStats(req.user._id);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("[GET /data/categories]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao carregar categorias." });
  }
});

router.post("/categories", requireAuth, async (req, res) => {
  try {
    const { name, type, icon, color, colorBg, budget } = req.body;

    if (!name?.trim() || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Nome e tipo da categoria são obrigatórios.",
      });
    }

    await ensureDefaultCategories(req.user._id);
    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
      type,
      icon: icon || (type === "income" ? "cash" : "cart"),
      color: color || (type === "income" ? "#4AE1C8" : "#F87171"),
      colorBg:
        colorBg ||
        (type === "income"
          ? "rgba(74,225,200,0.15)"
          : "rgba(248,113,113,0.15)"),
      budget: Number(budget) || 0,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Categoria já cadastrada para este tipo.",
      });
    }
    console.error("[POST /data/categories]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao criar categoria." });
  }
});

router.put("/categories/:id", requireAuth, async (req, res) => {
  try {
    const { name, icon, color, colorBg, budget } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Nome da categoria é obrigatório." });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        name: name.trim(),
        ...(icon ? { icon } : {}),
        ...(color ? { color } : {}),
        ...(colorBg ? { colorBg } : {}),
        budget: Number(budget) || 0,
      },
      { new: true },
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Categoria não encontrada." });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Categoria já cadastrada para este tipo.",
      });
    }
    console.error("[PUT /data/categories/:id]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar categoria." });
  }
});

router.delete("/categories/:id", requireAuth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Categoria não encontrada." });
    }

    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    console.error("[DELETE /data/categories/:id]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao remover categoria." });
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
