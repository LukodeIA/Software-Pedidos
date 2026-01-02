import React, { useState } from 'react';
import { useAuth } from '../App';
import { OrderList } from '../components/OrderList';
import { ProductManager } from '../components/ProductManager';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  if (!user) return <div>Access Denied</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.role === 'admin' ? 'Admin' : 'Staff'}.</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Orders
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('products')}
                className={`${
                  activeTab === 'products'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                Products & Menu
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow min-h-[500px]">
          {activeTab === 'orders' ? (
            <OrderList />
          ) : (
             user.role === 'admin' ? <ProductManager /> : <div className="p-6">Unauthorized</div>
          )}
        </div>
      </div>
    </div>
  );
};