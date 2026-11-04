const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Product = require('../models/Product');

// in-memory fallback store used if mongodb atlas is temporarily unreachable (e.g. ip whitelist)
const localStore = {
  organizations: [
    {
      _id: '6aeab586983cb7527cbe8e3b',
      name: 'Acme Retail Store',
      defaultLowStockThreshold: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  users: [
    {
      _id: '6aeab586983cb7527cbe8e3c',
      email: 'demo@stockflow.local',
      // bcrypt hash for 'password123'
      passwordHash: '$2a$10$rDGZl7pb0hRDBt9JYn5.NeDy6XXQNPFXCotx6qStpwF0AuXbNKwFO',
      organizationId: '6aeab586983cb7527cbe8e3b',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  products: [
    {
      _id: '6aeab587983cb7527cbe8e3d',
      organizationId: '6aeab586983cb7527cbe8e3b',
      name: 'Mechanical Keyboard',
      sku: 'KB-001',
      description: 'Tactile brown switches, standard 87-key layout',
      quantity: 18,
      costPrice: 45.0,
      sellingPrice: 79.99,
      lowStockThreshold: 10,
      lastUpdatedBy: 'demo@stockflow.local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '6aeab587983cb7527cbe8e3e',
      organizationId: '6aeab586983cb7527cbe8e3b',
      name: 'Wireless Optical Mouse',
      sku: 'MS-002',
      description: '2.4GHz USB receiver with precision optical sensor',
      quantity: 3,
      costPrice: 12.5,
      sellingPrice: 24.99,
      lowStockThreshold: 5,
      lastUpdatedBy: 'demo@stockflow.local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '6aeab587983cb7527cbe8e44',
      organizationId: '6aeab586983cb7527cbe8e3b',
      name: 'USB-C Multiport Hub',
      sku: 'HUB-003',
      description: '7-in-1 aluminum adapter with HDMI and SD reader',
      quantity: 2,
      costPrice: 18.0,
      sellingPrice: 39.99,
      lowStockThreshold: null,
      lastUpdatedBy: 'demo@stockflow.local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '6aeab587983cb7527cbe8e45',
      organizationId: '6aeab586983cb7527cbe8e3b',
      name: 'Aluminum Monitor Stand',
      sku: 'STD-004',
      description: 'Ergonomic desk riser with cable management',
      quantity: 22,
      costPrice: 22.0,
      sellingPrice: 44.5,
      lowStockThreshold: 8,
      lastUpdatedBy: 'demo@stockflow.local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const makeId = () => new mongoose.Types.ObjectId().toString();

// find user by lowercase trimmed email
const findUserByEmail = async (email) => {
  const normalized = email.trim().toLowerCase();
  if (getIsConnected()) {
    return await User.findOne({ email: normalized });
  }
  return localStore.users.find((u) => u.email.toLowerCase() === normalized) || null;
};

// look up user by database id
const findUserById = async (id) => {
  const idStr = id.toString();
  if (getIsConnected()) {
    return await User.findById(idStr);
  }
  return localStore.users.find((u) => u._id.toString() === idStr) || null;
};

// save new registered user linked to an organization
const createUser = async ({ email, passwordHash, organizationId }) => {
  const normalized = email.trim().toLowerCase();
  if (getIsConnected()) {
    const user = new User({ email: normalized, passwordHash, organizationId });
    return await user.save();
  }
  const user = {
    _id: makeId(),
    email: normalized,
    passwordHash,
    organizationId: organizationId.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStore.users.push(user);
  return user;
};

// get organization record
const findOrgById = async (id) => {
  const idStr = id.toString();
  if (getIsConnected()) {
    return await Organization.findById(idStr);
  }
  return localStore.organizations.find((o) => o._id.toString() === idStr) || null;
};

// create store on initial signup with default threshold (5)
const createOrg = async ({ name, defaultLowStockThreshold = 5 }) => {
  const cleanName = name.trim();
  const threshold = Number(defaultLowStockThreshold) || 5;
  if (getIsConnected()) {
    const org = new Organization({ name: cleanName, defaultLowStockThreshold: threshold });
    return await org.save();
  }
  const org = {
    _id: makeId(),
    name: cleanName,
    defaultLowStockThreshold: threshold,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStore.organizations.push(org);
  return org;
};

// update organization settings (e.g. low stock threshold)
const updateOrgSettings = async (id, { defaultLowStockThreshold }) => {
  const idStr = id.toString();
  const threshold = Math.max(0, parseInt(defaultLowStockThreshold, 10) || 0);
  if (getIsConnected()) {
    return await Organization.findByIdAndUpdate(
      idStr,
      { defaultLowStockThreshold: threshold },
      { new: true }
    );
  }
  const org = localStore.organizations.find((o) => o._id.toString() === idStr);
  if (!org) return null;
  org.defaultLowStockThreshold = threshold;
  org.updatedAt = new Date().toISOString();
  return org;
};

// list products for a store, with optional search query on name or sku
const getProducts = async (organizationId, search = '') => {
  const orgIdStr = organizationId.toString();

  if (getIsConnected()) {
    const query = { organizationId: orgIdStr };
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { sku: regex }];
    }
    return await Product.find(query).sort({ createdAt: -1 });
  }

  let list = localStore.products.filter((p) => p.organizationId.toString() === orgIdStr);
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
};

// get a single product scoped to the caller's organization
const getProductById = async (organizationId, id) => {
  const orgIdStr = organizationId.toString();
  const prodIdStr = id.toString();
  if (getIsConnected()) {
    return await Product.findOne({ _id: prodIdStr, organizationId: orgIdStr });
  }
  return (
    localStore.products.find(
      (p) => p.organizationId.toString() === orgIdStr && p._id.toString() === prodIdStr
    ) || null
  );
};

// check if a SKU already exists in this store (excluding current product during edit)
const getProductBySku = async (organizationId, sku, excludeId = null) => {
  const orgIdStr = organizationId.toString();
  const normalizedSku = sku.trim().toLowerCase();

  if (getIsConnected()) {
    const query = {
      organizationId: orgIdStr,
      sku: { $regex: new RegExp(`^${sku.trim()}$`, 'i') },
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Product.findOne(query);
  }

  return (
    localStore.products.find((p) => {
      const matchOrg = p.organizationId.toString() === orgIdStr;
      const matchSku = p.sku.toLowerCase() === normalizedSku;
      const notExcluded = excludeId ? p._id.toString() !== excludeId.toString() : true;
      return matchOrg && matchSku && notExcluded;
    }) || null
  );
};

// create a new product in the store catalog
const createProduct = async (organizationId, productData, userEmail) => {
  const orgIdStr = organizationId.toString();
  const quantity = Math.round(Number(productData.quantity) || 0);
  const costPrice =
    productData.costPrice !== '' && productData.costPrice !== null && productData.costPrice !== undefined
      ? Number(productData.costPrice)
      : null;
  const sellingPrice =
    productData.sellingPrice !== '' && productData.sellingPrice !== null && productData.sellingPrice !== undefined
      ? Number(productData.sellingPrice)
      : null;
  const lowStockThreshold =
    productData.lowStockThreshold !== '' &&
    productData.lowStockThreshold !== null &&
    productData.lowStockThreshold !== undefined
      ? Math.round(Number(productData.lowStockThreshold))
      : null;

  if (getIsConnected()) {
    const product = new Product({
      organizationId: orgIdStr,
      name: productData.name.trim(),
      sku: productData.sku.trim(),
      description: (productData.description || '').trim(),
      quantity,
      costPrice,
      sellingPrice,
      lowStockThreshold,
      lastUpdatedBy: userEmail || '',
    });
    return await product.save();
  }

  const now = new Date().toISOString();
  const newProduct = {
    _id: makeId(),
    organizationId: orgIdStr,
    name: productData.name.trim(),
    sku: productData.sku.trim(),
    description: (productData.description || '').trim(),
    quantity,
    costPrice,
    sellingPrice,
    lowStockThreshold,
    lastUpdatedBy: userEmail || '',
    createdAt: now,
    updatedAt: now,
  };
  localStore.products.push(newProduct);
  return newProduct;
};

// update existing product fields
const updateProduct = async (organizationId, id, updateData, userEmail) => {
  const orgIdStr = organizationId.toString();
  const prodIdStr = id.toString();

  const updates = {};
  if (updateData.name !== undefined) updates.name = updateData.name.trim();
  if (updateData.sku !== undefined) updates.sku = updateData.sku.trim();
  if (updateData.description !== undefined) updates.description = updateData.description.trim();
  if (updateData.quantity !== undefined) updates.quantity = Math.round(Number(updateData.quantity) || 0);
  if (updateData.costPrice !== undefined) {
    updates.costPrice =
      updateData.costPrice === '' || updateData.costPrice === null ? null : Number(updateData.costPrice);
  }
  if (updateData.sellingPrice !== undefined) {
    updates.sellingPrice =
      updateData.sellingPrice === '' || updateData.sellingPrice === null ? null : Number(updateData.sellingPrice);
  }
  if (updateData.lowStockThreshold !== undefined) {
    updates.lowStockThreshold =
      updateData.lowStockThreshold === '' || updateData.lowStockThreshold === null
        ? null
        : Math.round(Number(updateData.lowStockThreshold));
  }
  updates.lastUpdatedBy = userEmail || '';

  if (getIsConnected()) {
    return await Product.findOneAndUpdate(
      { _id: prodIdStr, organizationId: orgIdStr },
      { $set: updates },
      { new: true }
    );
  }

  const idx = localStore.products.findIndex(
    (p) => p.organizationId.toString() === orgIdStr && p._id.toString() === prodIdStr
  );
  if (idx === -1) return null;

  localStore.products[idx] = {
    ...localStore.products[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return localStore.products[idx];
};

// apply relative stock adjustment (+/- delta units)
const adjustProductStock = async (organizationId, id, delta, note, userEmail) => {
  const orgIdStr = organizationId.toString();
  const prodIdStr = id.toString();
  const intDelta = parseInt(delta, 10);
  if (isNaN(intDelta)) {
    throw new Error('Adjustment unit must be a valid integer');
  }

  const product = await getProductById(orgIdStr, prodIdStr);
  if (!product) return null;

  const newQuantity = (product.quantity || 0) + intDelta;
  if (newQuantity < 0) {
    throw new Error('Adjustment would cause stock to drop below 0');
  }

  if (getIsConnected()) {
    return await Product.findOneAndUpdate(
      { _id: prodIdStr, organizationId: orgIdStr },
      {
        $set: {
          quantity: newQuantity,
          lastUpdatedBy: userEmail || '',
        },
      },
      { new: true }
    );
  }

  const idx = localStore.products.findIndex(
    (p) => p.organizationId.toString() === orgIdStr && p._id.toString() === prodIdStr
  );
  if (idx === -1) return null;

  localStore.products[idx].quantity = newQuantity;
  localStore.products[idx].lastUpdatedBy = userEmail || '';
  localStore.products[idx].updatedAt = new Date().toISOString();
  return localStore.products[idx];
};

// delete product from database
const deleteProduct = async (organizationId, id) => {
  const orgIdStr = organizationId.toString();
  const prodIdStr = id.toString();

  if (getIsConnected()) {
    const res = await Product.findOneAndDelete({ _id: prodIdStr, organizationId: orgIdStr });
    return !!res;
  }

  const initialLength = localStore.products.length;
  localStore.products = localStore.products.filter(
    (p) => !(p.organizationId.toString() === orgIdStr && p._id.toString() === prodIdStr)
  );
  return localStore.products.length < initialLength;
};

// calculate dashboard totals and collect low stock items
const getDashboardMetrics = async (organizationId) => {
  const orgIdStr = organizationId.toString();
  const org = await findOrgById(orgIdStr);
  const defaultThreshold = org && typeof org.defaultLowStockThreshold === 'number' ? org.defaultLowStockThreshold : 5;

  let products = [];
  if (getIsConnected()) {
    products = await Product.find({ organizationId: orgIdStr });
  } else {
    products = localStore.products.filter((p) => p.organizationId.toString() === orgIdStr);
  }

  const totalProducts = products.length;
  const totalQuantity = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);

  const lowStockItems = [];
  for (const p of products) {
    const threshold =
      p.lowStockThreshold !== null && p.lowStockThreshold !== undefined && p.lowStockThreshold !== ''
        ? Number(p.lowStockThreshold)
        : defaultThreshold;

    if (p.quantity <= threshold) {
      lowStockItems.push({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        lowStockThreshold: p.lowStockThreshold !== null && p.lowStockThreshold !== undefined ? p.lowStockThreshold : null,
        effectiveThreshold: threshold,
      });
    }
  }

  lowStockItems.sort((a, b) => a.quantity - b.quantity);

  return {
    totalProducts,
    totalQuantity,
    lowStockCount: lowStockItems.length,
    defaultLowStockThreshold: defaultThreshold,
    lowStockItems,
  };
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  findOrgById,
  createOrg,
  updateOrgSettings,
  getProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  adjustProductStock,
  deleteProduct,
  getDashboardMetrics,
};
