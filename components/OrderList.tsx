import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { fetchOrders, updateOrderStatus } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { Clock, CheckCircle, Truck, Package, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../services/formatters';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // --- SUPABASE REALTIME ---
    // Listen for changes in the 'orders' table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Realtime change received!', payload);

          if (payload.eventType === 'INSERT') {
            // New order! Add to top of list
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);

            // Play notification sound (optional/browser-safe)
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(e => console.warn("Audio autoplay blocked by browser:", e));
            } catch (err) {
              console.error("Audio error:", err);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update existing order status in state
            const updatedOrder = payload.new as Order;
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted order
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    // Note: No need for optimistic update here because Realtime will sync back the DB change!
    // But we'll keep it for snappy UI.
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    await updateOrderStatus(id, newStatus);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && orders.length === 0) return <div className="p-8 text-center text-gray-500">Cargando pedidos...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Pedidos Entrantes</h2>
        <button onClick={loadOrders} className="p-2 text-gray-400 hover:text-gray-600">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? <p className="text-gray-500">No hay pedidos activos.</p> : orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">#{order.id.slice(0, 8)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)} uppercase`}>
                    {order.status === 'pending' ? 'PENDIENTE' :
                      order.status === 'preparing' ? 'PREPARANDO' :
                        order.status === 'ready' ? 'LISTO' : 'ENTREGADO'}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="mt-1 text-sm text-gray-900 font-medium">{order.customer_name} ({order.customer_phone})</div>
                {order.address && <div className="text-sm text-gray-500">{order.address}</div>}
              </div>

              <div className="flex items-center gap-2">
                {order.status === 'pending' && (
                  <button onClick={() => handleStatusChange(order.id, 'preparing')} className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
                    <Package className="w-3 h-3 mr-1" /> Empezar Prep
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => handleStatusChange(order.id, 'ready')} className="flex items-center px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700">
                    <CheckCircle className="w-3 h-3 mr-1" /> Marcar Listo
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => handleStatusChange(order.id, 'delivered')} className="flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700">
                    <Truck className="w-3 h-3 mr-1" /> Entregado
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <ul className="text-sm text-gray-600 space-y-1">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right font-bold text-gray-900">Total: {formatCurrency(order.total)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};