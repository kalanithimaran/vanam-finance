const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all crop plans
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.cropPlan.findMany({
      where: { household_id: req.householdId },
      include: { entries: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create crop plan
router.post('/', async (req, res) => {
  const { name, start_date } = req.body;
  try {
    const plan = await prisma.cropPlan.create({
      data: {
        household_id: req.householdId,
        name,
        start_date: start_date ? new Date(start_date) : undefined
      }
    });
    
    req.io.to(`household_${req.householdId}`).emit('cropplan:created', plan);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get crop plan timeline
router.get('/:id/timeline', async (req, res) => {
  const { id } = req.params;
  try {
    const plan = await prisma.cropPlan.findUnique({
      where: { id: parseInt(id), household_id: req.householdId },
      include: {
        entries: {
          orderBy: { entry_date: 'desc' },
          include: { source: true }
        }
      }
    });
    if (!plan) return res.status(404).json({ error: 'Not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
