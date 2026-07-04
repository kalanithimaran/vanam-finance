const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get active target
router.get('/', async (req, res) => {
  try {
    const target = await prisma.financialGoal.findFirst({
      where: { household_id: req.householdId, status: 'active' },
      orderBy: { created_at: 'desc' }
    });
    res.json(target);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Set new target
router.post('/', async (req, res) => {
  const { name, amount, target_date } = req.body;
  try {
    // Optionally mark previous targets as achieved or closed
    await prisma.financialGoal.updateMany({
      where: { household_id: req.householdId, status: 'active' },
      data: { status: 'archived' }
    });

    const target = await prisma.financialGoal.create({
      data: {
        household_id: req.householdId,
        name: name || 'சேமிப்பு இலக்கு',
        amount: parseFloat(amount),
        target_date: new Date(target_date)
      }
    });
    
    res.json(target);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
