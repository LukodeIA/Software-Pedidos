import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Product, Order, OrderStatus } from '../types';
import { MOCK_PRODUCTS, MOCK_ORDERS } from './mockData';

// Simple in-memory store for the session (Mock Mode fallback)
let mockOrdersStore = [...MOCK_ORDERS];
let mockProductsStore = [...MOCK_PRODUCTS];

// Helper to log errors safely without crashing or printing [object Object]
const logError = (context: string, error: any) => {
  const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  
  // Suppress common "table missing" error (42P01) or specific schema cache messages
  // This happens when Supabase is connected but tables haven't been created yet.
  if (
    error?.code === '42P01' || 
    (typeof msg === 'string' && msg.includes('Could not find the table'))
  ) {
    console.warn(`${context}: Table not found in Supabase. Using local mock data instead.`);
  } else {
    console.error(`${context}:`, msg);
  }
};

// --- Products ---

export const fetchProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('active', true);
      if (error) throw error;
      return (data || []) as Product[];
    } catch (err) {
      logError('Supabase fetchProducts', err);
      return mockProductsStore;
    }
  }
  return new Promise((resolve) => setTimeout(() => resolve(mockProductsStore), 500));
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  const createMock = () => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    mockProductsStore.push(newProduct);
    return newProduct;
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('products').insert([product]).select().single();
      if (error) throw error;
      return data as Product;
    } catch (err) {
      logError('Supabase createProduct', err);
      return createMock();
    }
  }
  return createMock();
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  const updateMock = () => {
    const index = mockProductsStore.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProductsStore[index] = { ...mockProductsStore[index], ...updates };
      return mockProductsStore[index];
    }
    return null;
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Product;
    } catch (err) {
      logError('Supabase updateProduct', err);
      return updateMock();
    }
  }
  return updateMock();
};

export const deleteProduct = async (id: string): Promise<void> => {
  const deleteMock = () => {
    mockProductsStore = mockProductsStore.filter(p => p.id !== id);
  };

  if(isSupabaseConfigured()){
     try {
       const { error } = await supabase.from('products').delete().eq('id', id);
       if (error) throw error;
       return;
     } catch (err) {
       logError('Supabase deleteProduct', err);
       deleteMock();
       return;
     }
  }
  deleteMock();
};

// --- Orders ---

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at'>): Promise<Order | null> => {
  const newOrderData = {
    ...orderData,
    status: 'pending' as OrderStatus,
    created_at: new Date().toISOString(),
    total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  const createMock = () => {
    const newOrder = { ...newOrderData, id: Math.random().toString(36).substr(2, 9) } as Order;
    mockOrdersStore = [newOrder, ...mockOrdersStore];
    return newOrder;
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('orders').insert([newOrderData]).select().single();
      if (error) throw error;
      return data as Order;
    } catch (err) {
      logError('Supabase createOrder', err);
      return createMock();
    }
  }
  
  return createMock();
};

export const fetchOrders = async (): Promise<Order[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Order[];
    } catch (err) {
      logError('Supabase fetchOrders', err);
      return mockOrdersStore;
    }
  }
  return new Promise((resolve) => setTimeout(() => resolve(mockOrdersStore), 500));
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
  const updateMock = () => {
     mockOrdersStore = mockOrdersStore.map(o => o.id === id ? { ...o, status } : o);
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      logError('Supabase updateOrderStatus', err);
      updateMock();
      return;
    }
  }
  updateMock();
};