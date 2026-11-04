import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Sliders,
  LogOut,
  Building2,
  Menu,
  X,
} from 'lucide-react';

// main dashboard layout shell with responsive sidebar navigation
const Layout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Products', to: '/products', icon: Package },
    { name: 'Settings', to: '/settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* mobile top header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-sunset-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            SF
          </div>
          <span className="font-semibold text-slate-900 text-base">StockFlow</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* desktop sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-white border-r border-slate-200 md:min-h-screen shrink-0`}
      >
        {/* logo and brand */}
        <div className="p-5 border-b border-slate-200 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-sunset-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              SF
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-base leading-tight">StockFlow</div>
              <div className="text-xs text-slate-500 font-medium">Inventory System</div>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-redviolet-50 text-redviolet-700 px-2 py-0.5 rounded border border-redviolet-200">
            MVP
          </span>
        </div>

        {/* currently active organization */}
        <div className="p-4 mx-3 my-3 bg-redviolet-50/40 border border-redviolet-100 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-redviolet-700 mb-1">
            <Building2 className="w-3.5 h-3.5 text-redviolet-500" />
            <span>Organization</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 truncate" title={user?.organizationName}>
            {user?.organizationName || 'Current Organization'}
          </div>
        </div>

        {/* navigation items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-sunset-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* user card & sign out button */}
        <div className="p-3 border-t border-slate-200 mt-auto">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-slate-500 font-medium">Signed in as</div>
            <div className="text-sm font-medium text-slate-900 truncate" title={user?.email}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-redviolet-600 hover:bg-redviolet-50 hover:text-redviolet-700 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* main view content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
