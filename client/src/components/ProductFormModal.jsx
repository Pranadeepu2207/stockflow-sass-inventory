import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

// form modal used for both creating a new product and editing an existing one
const ProductFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: '0',
    costPrice: '',
    sellingPrice: '',
    lowStockThreshold: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  // populate form with product details if editing, or clear if adding fresh
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        quantity: initialData.quantity !== undefined ? String(initialData.quantity) : '0',
        costPrice: initialData.costPrice !== null && initialData.costPrice !== undefined ? String(initialData.costPrice) : '',
        sellingPrice: initialData.sellingPrice !== null && initialData.sellingPrice !== undefined ? String(initialData.sellingPrice) : '',
        lowStockThreshold:
          initialData.lowStockThreshold !== null && initialData.lowStockThreshold !== undefined
            ? String(initialData.lowStockThreshold)
            : '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        quantity: '0',
        costPrice: '',
        sellingPrice: '',
        lowStockThreshold: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // client-side validation
    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!formData.sku.trim()) {
      setError('SKU is required.');
      return;
    }

    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError('Quantity on hand must be a non-negative integer.');
      return;
    }

    if (formData.costPrice !== '') {
      const cost = Number(formData.costPrice);
      if (isNaN(cost) || cost < 0) {
        setError('Cost price must be a valid positive number.');
        return;
      }
    }

    if (formData.sellingPrice !== '') {
      const price = Number(formData.sellingPrice);
      if (isNaN(price) || price < 0) {
        setError('Selling price must be a valid positive number.');
        return;
      }
    }

    if (formData.lowStockThreshold !== '') {
      const threshold = parseInt(formData.lowStockThreshold, 10);
      if (isNaN(threshold) || threshold < 0) {
        setError('Low stock threshold must be a non-negative integer.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        quantity: qty,
        costPrice: formData.costPrice !== '' ? Number(formData.costPrice) : null,
        sellingPrice: formData.sellingPrice !== '' ? Number(formData.sellingPrice) : null,
        lowStockThreshold: formData.lowStockThreshold !== '' ? parseInt(formData.lowStockThreshold, 10) : null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* name and sku */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Mouse"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SKU (Stock Keeping Unit) *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. WM-100-BLK"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
            />
          </div>
        </div>

        {/* optional description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief product notes or details"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500 resize-none"
          />
        </div>

        {/* stock quantity and pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity on Hand *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cost Price ($)
            </label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Price ($)
            </label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
            />
          </div>
        </div>

        {/* low stock alert trigger for this specific item */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Low Stock Threshold (Optional)
          </label>
          <input
            type="number"
            name="lowStockThreshold"
            value={formData.lowStockThreshold}
            onChange={handleChange}
            min="0"
            step="1"
            placeholder="Default: Organization setting"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Leave blank to use the organization default low-stock threshold.
          </p>
        </div>

        {/* action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-sunset-500 hover:bg-sunset-600 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
