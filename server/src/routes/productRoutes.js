const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  adjustProductStock,
  deleteProduct,
} = require('../services/dataStore');

const router = express.Router();

// all product operations require a valid logged-in user
router.use(requireAuth);

// get all products for the current user's organization (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const products = await getProducts(req.organizationId, search);
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
});

// get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.organizationId, req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to retrieve product' });
  }
});

// add a new product to inventory
router.post('/', async (req, res) => {
  try {
    const { name, sku, description, quantity, costPrice, sellingPrice, lowStockThreshold } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required.' });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({ message: 'Product SKU is required.' });
    }

    // make sure SKU is not already in use in this store
    const existing = await getProductBySku(req.organizationId, sku);
    if (existing) {
      return res.status(400).json({
        message: `A product with SKU "${sku.trim()}" already exists in your organization.`,
      });
    }

    // quantity must be an integer >= 0
    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({ message: 'Quantity on hand must be a non-negative integer.' });
    }

    // validate optional numeric fields
    if (costPrice !== undefined && costPrice !== null && costPrice !== '') {
      if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
        return res.status(400).json({ message: 'Cost price must be a valid positive number.' });
      }
    }

    if (sellingPrice !== undefined && sellingPrice !== null && sellingPrice !== '') {
      if (isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
        return res.status(400).json({ message: 'Selling price must be a valid positive number.' });
      }
    }

    if (lowStockThreshold !== undefined && lowStockThreshold !== null && lowStockThreshold !== '') {
      const parsedThresh = parseInt(lowStockThreshold, 10);
      if (isNaN(parsedThresh) || parsedThresh < 0) {
        return res.status(400).json({ message: 'Low stock threshold must be a non-negative integer.' });
      }
    }

    const product = await createProduct(
      req.organizationId,
      {
        name,
        sku,
        description,
        quantity: parsedQty,
        costPrice,
        sellingPrice,
        lowStockThreshold,
      },
      req.user.email
    );

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// update an existing product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, quantity, costPrice, sellingPrice, lowStockThreshold } = req.body;

    // ensure product exists and belongs to this store
    const existingProduct = await getProductById(req.organizationId, id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'Product name cannot be empty.' });
    }

    // if user changed the SKU, check if new SKU is already taken by another product
    if (sku !== undefined) {
      if (!sku.trim()) {
        return res.status(400).json({ message: 'Product SKU cannot be empty.' });
      }
      const duplicate = await getProductBySku(req.organizationId, sku, id);
      if (duplicate) {
        return res.status(400).json({
          message: `A product with SKU "${sku.trim()}" already exists in your organization.`,
        });
      }
    }

    if (quantity !== undefined) {
      const parsedQty = parseInt(quantity, 10);
      if (isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({ message: 'Quantity on hand must be a non-negative integer.' });
      }
    }

    if (costPrice !== undefined && costPrice !== null && costPrice !== '') {
      if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
        return res.status(400).json({ message: 'Cost price must be a valid positive number.' });
      }
    }

    if (sellingPrice !== undefined && sellingPrice !== null && sellingPrice !== '') {
      if (isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
        return res.status(400).json({ message: 'Selling price must be a valid positive number.' });
      }
    }

    if (lowStockThreshold !== undefined && lowStockThreshold !== null && lowStockThreshold !== '') {
      const parsedThresh = parseInt(lowStockThreshold, 10);
      if (isNaN(parsedThresh) || parsedThresh < 0) {
        return res.status(400).json({ message: 'Low stock threshold must be a non-negative integer.' });
      }
    }

    const updated = await updateProduct(
      req.organizationId,
      id,
      {
        name,
        sku,
        description,
        quantity,
        costPrice,
        sellingPrice,
        lowStockThreshold,
      },
      req.user.email
    );

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// quick stock adjustment (+/- units) with optional note
router.post('/:id/adjust-stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { delta, note } = req.body;

    const intDelta = parseInt(delta, 10);
    if (isNaN(intDelta) || intDelta === 0) {
      return res.status(400).json({
        message: 'Please provide a non-zero integer adjustment value (e.g. +5 or -3).',
      });
    }

    try {
      const updated = await adjustProductStock(
        req.organizationId,
        id,
        intDelta,
        note,
        req.user.email
      );

      if (!updated) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        message: `Stock updated by ${intDelta > 0 ? '+' : ''}${intDelta} units.`,
        product: updated,
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ message: 'Failed to adjust stock' });
  }
});

// delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProduct(req.organizationId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found or already deleted' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
