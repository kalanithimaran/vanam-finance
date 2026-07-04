const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const plans = await prisma.investmentPlan.findMany({
      where: { household_id: req.householdId }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', async (req, res) => {
  const plans = req.body; // Array of { id, percentage }
  try {
    for (const plan of plans) {
      if (plan.id) {
        await prisma.investmentPlan.update({
          where: { id: parseInt(plan.id), household_id: req.householdId },
          data: { percentage: parseFloat(plan.percentage) }
        });
      }
    }
    const updatedPlans = await prisma.investmentPlan.findMany({
      where: { household_id: req.householdId }
    });
    res.json(updatedPlans);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
