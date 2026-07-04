const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all entries with optional filters
router.get('/', async (req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      where: { household_id: req.householdId },
      include: { source: true },
      orderBy: { entry_date: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create entry
router.post('/', async (req, res) => {
  const { source_id, type, amount, entry_date, note, crop_plan_id } = req.body;
  try {
    const entry = await prisma.entry.create({
      data: {
        household_id: req.householdId,
        source_id: parseInt(source_id),
        type,
        amount: parseFloat(amount),
        entry_date: new Date(entry_date),
        note,
        crop_plan_id: crop_plan_id ? parseInt(crop_plan_id) : null
      },
      include: { source: true }
    });
    
    // Emit socket event
    req.io.to(`household_${req.householdId}`).emit('entry:created', entry);
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update entry
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { source_id, type, amount, entry_date, note, crop_plan_id } = req.body;
  try {
    const entry = await prisma.entry.update({
      where: { id: parseInt(id), household_id: req.householdId },
      data: {
        source_id: parseInt(source_id),
        type,
        amount: parseFloat(amount),
        entry_date: new Date(entry_date),
        note,
        crop_plan_id: crop_plan_id ? parseInt(crop_plan_id) : null
      },
      include: { source: true }
    });
    
    req.io.to(`household_${req.householdId}`).emit('entry:updated', entry);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.entry.delete({
      where: { id: parseInt(id), household_id: req.householdId }
    });
    
    req.io.to(`household_${req.householdId}`).emit('entry:deleted', { id: parseInt(id) });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Summary
router.get('/summary', async (req, res) => {
  const { month } = req.query; // YYYY-MM
  try {
    let startDate, endDate;
    if (month) {
      startDate = new Date(`${month}-01`);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    }
    
    const whereClause = { household_id: req.householdId };
    if (month) {
      whereClause.entry_date = { gte: startDate, lt: endDate };
    }

    const entries = await prisma.entry.findMany({ where: whereClause });
    let income = 0;
    let expense = 0;
    
    entries.forEach(e => {
      const amt = parseFloat(e.amount);
      if (e.type === 'income') income += amt;
      else expense += amt;
    });

    res.json({ income, expense, net: income - expense });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Breakdown
router.get('/breakdown', async (req, res) => {
  const { month } = req.query;
  try {
    let startDate, endDate;
    if (month) {
      startDate = new Date(`${month}-01`);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    }
    
    const whereClause = { household_id: req.householdId };
    if (month) {
      whereClause.entry_date = { gte: startDate, lt: endDate };
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      include: { source: true }
    });

    const breakdown = {};
    entries.forEach(e => {
      if (e.type === 'income') {
        if (!breakdown[e.source.display_name_ta]) {
          breakdown[e.source.display_name_ta] = { amount: 0, color: e.source.color };
        }
        breakdown[e.source.display_name_ta].amount += parseFloat(e.amount);
      }
    });

    res.json(Object.keys(breakdown).map(name => ({
      name,
      value: breakdown[name].amount,
      color: breakdown[name].color
    })));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Trend
router.get('/trend', async (req, res) => {
  const { months = 6 } = req.query;
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const entries = await prisma.entry.findMany({
      where: {
        household_id: req.householdId,
        entry_date: { gte: startDate }
      }
    });

    const trendMap = {};
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendMap[key] = { month: key, income: 0, expense: 0 };
    }

    entries.forEach(e => {
      const d = e.entry_date;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (trendMap[key]) {
        if (e.type === 'income') trendMap[key].income += parseFloat(e.amount);
        else trendMap[key].expense += parseFloat(e.amount);
      }
    });

    res.json(Object.values(trendMap));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get sources
router.get('/sources', async (req, res) => {
  try {
    const sources = await prisma.incomeSource.findMany({
      where: { household_id: req.householdId }
    });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create source
router.post('/sources', async (req, res) => {
  try {
    const { display_name_ta, key, color, icon } = req.body;
    const source = await prisma.incomeSource.create({
      data: {
        household_id: req.householdId,
        display_name_ta,
        key: key || `custom_${Date.now()}`,
        color: color || '#94a3b8',
        icon: icon || 'circle'
      }
    });
    // Emit socket event for real-time update
    req.io.to(`household_${req.householdId}`).emit('source:created', source);
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Custom Monitors (Home Expense, Planting Monitor)
router.get('/custom-monitors', async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    let startDate, endDate;
    if (month) {
      startDate = new Date(`${month}-01`);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // 1. Home Expense (current month)
    const homeExpenseEntries = await prisma.entry.aggregate({
      _sum: { amount: true },
      where: {
        household_id: req.householdId,
        source: { key: 'household_expense' },
        type: 'expense',
        entry_date: { gte: startDate, lt: endDate }
      }
    });
    const homeExpenseThisMonth = homeExpenseEntries._sum.amount || 0;

    // 2. Planting Monitor (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const plantingEntries = await prisma.entry.findMany({
      where: {
        household_id: req.householdId,
        source: { key: 'crop' },
        entry_date: { gte: sixMonthsAgo }
      }
    });

    let plantingIncome = 0;
    let plantingExpense = 0;
    plantingEntries.forEach(e => {
      const amt = parseFloat(e.amount);
      if (e.type === 'income') plantingIncome += amt;
      else plantingExpense += amt;
    });

    res.json({
      homeExpenseThisMonth,
      plantingMonitor: {
        income: plantingIncome,
        expense: plantingExpense,
        net: plantingIncome - plantingExpense
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
