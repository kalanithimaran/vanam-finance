const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all loans
router.get('/', async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { household_id: req.householdId },
      include: { repayments: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create loan
router.post('/', async (req, res) => {
  const { type, person_name, amount, interest_rate, start_date } = req.body;
  try {
    const loan = await prisma.loan.create({
      data: {
        household_id: req.householdId,
        type,
        person_name,
        amount: parseFloat(amount),
        interest_rate: interest_rate ? parseFloat(interest_rate) : null,
        start_date: new Date(start_date)
      },
      include: { repayments: true }
    });
    
    req.io.to(`household_${req.householdId}`).emit('loan:created', loan);
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete loan
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.loan.delete({
      where: { id: parseInt(id), household_id: req.householdId }
    });
    
    req.io.to(`household_${req.householdId}`).emit('loan:deleted', { id: parseInt(id) });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add repayment
router.post('/:id/repayment', async (req, res) => {
  const { id } = req.params;
  const { amount, date, note } = req.body;
  try {
    // verify loan belongs to household
    const loan = await prisma.loan.findUnique({
      where: { id: parseInt(id), household_id: req.householdId }
    });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const repayment = await prisma.loanRepayment.create({
      data: {
        loan_id: parseInt(id),
        amount: parseFloat(amount),
        date: new Date(date),
        note
      }
    });

    req.io.to(`household_${req.householdId}`).emit('loan:repayment_added', { loan_id: parseInt(id), repayment });
    res.json(repayment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Close loan
router.put('/:id/close', async (req, res) => {
  const { id } = req.params;
  try {
    const loan = await prisma.loan.update({
      where: { id: parseInt(id), household_id: req.householdId },
      data: { status: 'closed' },
      include: { repayments: true }
    });
    
    req.io.to(`household_${req.householdId}`).emit('loan:updated', loan);
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
