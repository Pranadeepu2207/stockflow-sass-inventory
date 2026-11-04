import React, { useState } from 'react';
import Modal from './Modal';
import { ArrowUpDown, AlertCircle } from 'lucide-react';

// modal for quick inventory adjustments like restocks or damaged write-offs
const StockAdjustmentModal = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  // calculate what the new quantity will be before the user hits save
  const currentQty = product.quantity ?? 0;
  const parsedDelta = parseInt(delta, 10);
  const isValidDelta = !isNaN(parsedDelta) && parsedDelta !== 0;
  const projectedQty = isValidDelta ? currentQty + parsedDelta : currentQty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidDelta) {
      setError('Please enter a non-zero adjustment value (e.g. +10 or -5).');
      return;
    }

    // prevent inventory from going negative
    if (projectedQty < 0) {
      setError(`Adjustment would cause stock to drop below 0 (current: ${currentQty}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSuccess(product._id, parsedDelta, note);
      setDelta('');
      setNote('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${product.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* preview current vs projected units */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-slate-500 font-medium">Current Stock</div>
            <div className="text-xl font-semibold text-slate-800">{currentQty}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Projected Stock</div>
            <div
              className={`text-xl font-semibold ${
                isValidDelta && projectedQty < 0
                  ? 'text-red-600'
                  : 'text-sunset-600'
              }`}
            >
              {projectedQty}
            </div>
          </div>
        </div>

        {/* delta input field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Adjustment Units (+/- N) *
          </label>
          <div className="relative">
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. 10 to add, -5 to reduce"
              step="1"
              required
              className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Enter a positive number to increase inventory, or a negative number to reduce.
          </p>
        </div>

        {/* optional adjustment note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Restock shipment, Damaged item return"
            maxLength={100}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
          />
        </div>

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
            disabled={isSubmitting || !isValidDelta || projectedQty < 0}
            className="px-4 py-2 text-sm font-semibold text-white bg-sunset-500 hover:bg-sunset-600 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Apply Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockAdjustmentModal;
