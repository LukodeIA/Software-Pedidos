import React, { useState } from 'react';
import { useAuth } from '../App';
import { OrderList } from '../components/OrderList';
import { ProductManager } from '../components/ProductManager';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Access Denied</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-orange-600" />
                Euge te amo
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {user.role === 'admin' ? 'Administrador' : 'Staff Member'}
              </span>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">
                {user.email[0].toUpperCase()}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-8 -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`${activeTab === 'orders'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <ShoppingBag className="w-4 h-4" />
              Pedidos Activos
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('products')}
                className={`${activeTab === 'products'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                Gestión de Productos
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] overflow-hidden">
          {activeTab === 'orders' ? (
            <OrderList />
          ) : (
            user.role === 'admin' ? <ProductManager /> : <div className="p-12 text-center text-gray-500">No tienes permisos para ver esta sección.</div>
          )}
        </div>
      </div>
    </div>
  );
};