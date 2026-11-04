import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import ProductFormModal from '../components/ProductFormModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  ArrowUpDown,
  AlertCircle,
  Package,
} from 'lucide-react';

// product catalog page with search, stock adjustments, and crud controls
const Products = () => {
  const [products, setProducts] = useState([]);
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // modal visibility controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // load product list and store default threshold in parallel
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [prodRes, settingsRes] = await Promise.all([
        api.get('/products'),
        api.get('/settings'),
      ]);
      setProducts(prodRes.data.products || []);
      if (settingsRes.data?.defaultLowStockThreshold !== undefined) {
        setDefaultThreshold(settingsRes.data.defaultLowStockThreshold);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // instant client-side filtering by name or SKU
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // show a quick banner notification for 4 seconds
  const triggerFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 4000);
  };

  // handle modal submission for both creating new and updating existing
  const handleFormSubmit = async (formData) => {
    if (selectedProductForEdit) {
      // update existing product
      const res = await api.put(`/products/${selectedProductForEdit._id}`, formData);
      setProducts((prev) =>
        prev.map((p) => (p._id === selectedProductForEdit._id ? res.data.product : p))
      );
      triggerFeedback('Product updated successfully.');
    } else {
      // create new product
      const res = await api.post('/products', formData);
      setProducts((prev) => [res.data.product, ...prev]);
      triggerFeedback('Product created successfully.');
    }
  };

  // apply quick stock increment or decrement
  const handleAdjustSubmit = async (productId, delta, note) => {
    const res = await api.post(`/products/${productId}/adjust-stock`, { delta, note });
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? res.data.product : p))
    );
    triggerFeedback(`Stock adjusted by ${delta > 0 ? '+' : ''}${delta} units.`);
  };

  // delete product after user confirms dialog
  const handleDeleteConfirm = async () => {
    if (!selectedProductForDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/products/${selectedProductForDelete._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== selectedProductForDelete._id));
      setIsDeleteOpen(false);
      setSelectedProductForDelete(null);
      triggerFeedback('Product deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* top bar with page title and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your organization inventory, stock levels, and pricing
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProductForEdit(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sunset-500 hover:bg-sunset-600 rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md transition-all">
          {feedbackMessage}
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* search input box */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by SKU or Name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* products table list */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-slate-100 text-slate-400 mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              {products.length === 0 ? 'No products in inventory' : 'No matching products found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {products.length === 0
                ? 'Get started by creating your first product with SKU and initial stock quantity.'
                : 'Try adjusting your search query to find the item you are looking for.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => {
                  setSelectedProductForEdit(null);
                  setIsFormOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sunset-500 hover:bg-sunset-600 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => {
                  // if product doesn't set a custom threshold, use the store default
                  const effectiveThresh =
                    product.lowStockThreshold !== null && product.lowStockThreshold !== undefined
                      ? product.lowStockThreshold
                      : defaultThreshold;
                  const isLow = product.quantity <= effectiveThresh;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        {product.description && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{product.sku}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {product.quantity}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sunset-50 text-sunset-700 border border-sunset-200"
                            title={`Stock ${product.quantity} <= Threshold ${effectiveThresh}`}
                          >
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {product.sellingPrice !== null && product.sellingPrice !== undefined
                          ? `$${Number(product.sellingPrice).toFixed(2)}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedProductForAdjust(product);
                              setIsAdjustOpen(true);
                            }}
                            title="Adjust Stock (+/-)"
                            className="p-1.5 text-slate-600 hover:text-sunset-600 hover:bg-sunset-50 rounded-md transition-colors"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProductForEdit(product);
                              setIsFormOpen(true);
                            }}
                            title="Edit Product"
                            className="p-1.5 text-slate-600 hover:text-redviolet-600 hover:bg-redviolet-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProductForDelete(product);
                              setIsDeleteOpen(true);
                            }}
                            title="Delete Product"
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* create and edit modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProductForEdit(null);
        }}
        initialData={selectedProductForEdit}
        onSubmit={handleFormSubmit}
      />

      {/* adjust inventory units modal */}
      <StockAdjustmentModal
        isOpen={isAdjustOpen}
        onClose={() => {
          setIsAdjustOpen(false);
          setSelectedProductForAdjust(null);
        }}
        product={selectedProductForAdjust}
        onSuccess={handleAdjustSubmit}
      />

      {/* delete confirmation modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProductForDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={
          selectedProductForDelete
            ? `Are you sure you want to permanently delete "${selectedProductForDelete.name}" (SKU: ${selectedProductForDelete.sku})? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Product"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Products;
