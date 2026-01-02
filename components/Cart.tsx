import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Minus, Plus, Loader2 } from 'lucide-react';
import { createOrder } from '../services/dataService';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, updateQuantity, clearCart }) => {
  const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrder({
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        address: customerInfo.address,
        items,
        total
      });
      setStep('success');
      clearCart();
    } catch (err) {
      alert("Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              
              {/* Header */}
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {step === 'cart' ? 'Shopping Cart' : step === 'details' ? 'Checkout Details' : 'Order Confirmed'}
                  </h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button onClick={onClose} className="bg-white rounded-md text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-8">
                  {step === 'success' ? (
                    <div className="text-center py-10">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Order Placed!</h3>
                      <p className="mt-2 text-sm text-gray-500">Thank you for your order. We'll start preparing it right away.</p>
                      <button 
                        onClick={() => { setStep('cart'); onClose(); }}
                        className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                      >
                        Back to Menu
                      </button>
                    </div>
                  ) : step === 'cart' ? (
                    items.length === 0 ? (
                      <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
                    ) : (
                      <div className="flow-root">
                        <ul className="-my-6 divide-y divide-gray-200">
                          {items.map((item) => (
                            <li key={item.id} className="py-6 flex">
                              <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-center object-cover" />
                              </div>
                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.name}</h3>
                                    <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                </div>
                                <div className="flex-1 flex items-end justify-between text-sm">
                                  <div className="flex items-center border border-gray-300 rounded-md">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100"><Minus className="w-4 h-4"/></button>
                                    <span className="px-2">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100"><Plus className="w-4 h-4"/></button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ) : (
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input required type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-orange-500 focus:border-orange-500" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input required type="tel" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-orange-500 focus:border-orange-500" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                        <textarea rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-orange-500 focus:border-orange-500" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Footer */}
              {step !== 'success' && items.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                  <div className="mt-6">
                    {step === 'cart' ? (
                      <button
                        onClick={() => setStep('details')}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700"
                      >
                        Checkout
                      </button>
                    ) : (
                      <button
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                         {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Confirm Order
                      </button>
                    )}
                  </div>
                  {step === 'details' && (
                     <div className="mt-2 text-center">
                        <button onClick={() => setStep('cart')} className="text-sm text-orange-600 hover:text-orange-500">Back to Cart</button>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};