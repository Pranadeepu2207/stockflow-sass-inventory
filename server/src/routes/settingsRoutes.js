const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { findOrgById, updateOrgSettings } = require('../services/dataStore');

const router = express.Router();

// requires authentication
router.use(requireAuth);

// fetch organization settings (store default threshold)
router.get('/', async (req, res) => {
  try {
    const org = await findOrgById(req.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      organizationName: org.name,
      defaultLowStockThreshold:
        typeof org.defaultLowStockThreshold === 'number' ? org.defaultLowStockThreshold : 5,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to retrieve settings' });
  }
});

// update store default low stock threshold
router.put('/', async (req, res) => {
  try {
    const { defaultLowStockThreshold } = req.body;

    // ensure threshold is non-negative whole number
    const threshold = parseInt(defaultLowStockThreshold, 10);
    if (isNaN(threshold) || threshold < 0) {
      return res.status(400).json({
        message: 'Default low stock threshold must be a non-negative integer (e.g. 5).',
      });
    }

    const updatedOrg = await updateOrgSettings(req.organizationId, {
      defaultLowStockThreshold: threshold,
    });

    if (!updatedOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      message: 'Settings updated successfully',
      defaultLowStockThreshold: updatedOrg.defaultLowStockThreshold,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
