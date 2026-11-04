import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Sliders, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

// organization settings page to manage default inventory thresholds
const Settings = () => {
  const [threshold, setThreshold] = useState('5');
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // fetch current store threshold setting
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get('/settings');
      setThreshold(String(res.data.defaultLowStockThreshold ?? 5));
      setOrganizationName(res.data.organizationName || '');
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError('Failed to load organization settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // save updated default threshold
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const parsed = parseInt(threshold, 10);
    if (isNaN(parsed) || parsed < 0) {
      setError('Default low stock threshold must be a non-negative integer (e.g. 5).');
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.put('/settings', {
        defaultLowStockThreshold: parsed,
      });
      setThreshold(String(res.data.defaultLowStockThreshold));
      setSuccessMessage('Organization settings updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* page header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure default thresholds and parameters for {organizationName || 'your organization'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* settings form container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Default Low Stock Threshold
              </label>
              <div className="max-w-xs">
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sunset-500 focus:border-sunset-500"
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                When a product does not specify its own custom low-stock threshold, this default
                value is used across your organization to trigger dashboard alerts and low-stock
                indicators.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-start">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sunset-500 hover:bg-sunset-600 rounded-md transition-colors disabled:opacity-50 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
