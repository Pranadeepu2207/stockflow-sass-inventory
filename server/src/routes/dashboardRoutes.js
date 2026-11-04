const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getDashboardMetrics } = require('../services/dataStore');

const router = express.Router();

// requires logged in user
router.use(requireAuth);

// returns high-level inventory totals and low stock list
router.get('/', async (req, res) => {
  try {
    const metrics = await getDashboardMetrics(req.organizationId);
    res.json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard metrics' });
  }
});

module.exports = router;
