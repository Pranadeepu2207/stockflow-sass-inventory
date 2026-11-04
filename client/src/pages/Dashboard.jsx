import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Package,
  Boxes,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

// dashboard overview showing summary cards and low stock alerts
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // fetch inventory counts and low stock items from the backend
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get('/dashboard');
      setMetrics(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* page header with manual refresh button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inventory levels and low-stock monitor
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:border-sunset-300 hover:text-sunset-600 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sunset-500' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* total unique products cataloged */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-md bg-sunset-50 border border-sunset-100 text-sunset-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {isLoading ? '...' : metrics?.totalProducts ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">SKUs cataloged</span>
          </div>
        </div>

        {/* sum of all units currently on hand */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Units
            </span>
            <div className="w-8 h-8 rounded-md bg-redviolet-50 border border-redviolet-100 text-redviolet-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {isLoading ? '...' : metrics?.totalQuantity ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">units on hand</span>
          </div>
        </div>

        {/* count of items at or below threshold */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center ${
                (metrics?.lowStockCount || 0) > 0
                  ? 'bg-sunset-50 text-sunset-600 border border-sunset-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                (metrics?.lowStockCount || 0) > 0 ? 'text-sunset-600' : 'text-slate-900'
              }`}
            >
              {isLoading ? '...' : metrics?.lowStockCount ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              at or below threshold
            </span>
          </div>
        </div>
      </div>

      {/* low stock items list */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Low Stock Items</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Items requiring replenishment based on product or organization threshold (default: {metrics?.defaultLowStockThreshold ?? 5})
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sunset-600 hover:text-sunset-700 self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading low stock data...</div>
        ) : metrics?.lowStockItems?.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-emerald-50 text-emerald-700 mb-2">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-800">No low stock items</div>
            <p className="text-xs text-slate-500 mt-1">
              All inventory levels are currently above their configured thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Quantity on Hand</th>
                  <th className="py-3 px-4 text-right">Low Stock Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {metrics?.lowStockItems?.map((item) => (
                  <tr key={item._id} className="hover:bg-sunset-50/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.sku}</td>
                    <td className="py-3 px-4 text-right font-semibold text-sunset-600">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {item.lowStockThreshold !== null
                        ? item.lowStockThreshold
                        : `${item.effectiveThreshold} (Org Default)`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
