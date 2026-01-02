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

const CACHE_KEY = 'products_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchProducts = async (): Promise<Product[]> => {
  // Check Cache
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log('Serving products from cache');
      return data;
    }
  }

  if (isSupabaseConfigured()) {
    try {
      // 5s Timeout race
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 5000));
      const dataPromise = supabase.from('products').select('*').eq('active', true);

      const result = await Promise.race([dataPromise, timeoutPromise]) as any;
      const { data, error } = result;

      if (error) throw error;

      // Update Cache
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: data || [],
        timestamp: Date.now()
      }));

      return (data || []) as Product[];
    } catch (err) {
      logError('Supabase fetchProducts', err);
      // Fallback to cache if available even if expired, but NEVER to mock if Supabase is active
      if (cached) return JSON.parse(cached).data;
      return [];
    }
  }
  return mockProductsStore;
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  sessionStorage.removeItem(CACHE_KEY); // Invalidate cache
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
      throw err; // Stop creating mock products if Supabase fails
    }
  }
  return createMock();
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  sessionStorage.removeItem(CACHE_KEY); // Invalidate cache
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
      throw err;
    }
  }
  return updateMock();
};

export const deleteProduct = async (id: string): Promise<void> => {
  sessionStorage.removeItem(CACHE_KEY); // Invalidate cache
  const deleteMock = () => {
    mockProductsStore = mockProductsStore.filter(p => p.id !== id);
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      logError('Supabase deleteProduct', err);
      throw err;
    }
  }
  deleteMock();
};

export const uploadProductImage = async (file: File): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('Productos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Supabase Storage Error Details:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('Productos').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    logError('Supabase uploadImage', error);
    console.error('Full upload error context:', error);
    return null;
  }
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
      throw err;
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
      return []; // Return empty instead of mocks to avoid confusion
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