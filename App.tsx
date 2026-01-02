import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { AuthState, UserProfile, Product, CartItem } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

// --- Auth Context ---
interface AuthContextType extends AuthState {
  signIn: (role: 'admin' | 'employee') => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check Supabase session
    if (isSupabaseConfigured()) {
       supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
           try {
             // Fetch profile to get role
             const { data, error } = await supabase
               .from('profiles')
               .select('role')
               .eq('id', session.user.id)
               .maybeSingle(); // Use maybeSingle to avoid error if row doesn't exist

             setState({
                user: { 
                  id: session.user.id, 
                  email: session.user.email!, 
                  role: data?.role || 'employee' // Default to employee if no profile found
                },
                isAuthenticated: true,
                loading: false
             });
           } catch (err) {
             console.error("Profile fetch error:", err);
             // Fallback to allow login even if profile fetch fails
             setState({
                user: { id: session.user.id, email: session.user.email!, role: 'employee' },
                isAuthenticated: true,
                loading: false
             });
           }
        } else {
            setState({ user: null, isAuthenticated: false, loading: false });
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
           const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
           setState({
              user: { id: session.user.id, email: session.user.email!, role: data?.role || 'employee' },
              isAuthenticated: true,
              loading: false
           });
        } else {
           setState({ user: null, isAuthenticated: false, loading: false });
        }
      });

      return () => subscription.unsubscribe();

    } else {
        // Stop loading if in Mock mode
        setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Mock Login Function for Demo purposes if no Supabase
  const signIn = async (role: 'admin' | 'employee') => {
    if (isSupabaseConfigured()) {
        // This would be triggered by the Auth UI, not directly here usually
        return; 
    }
    // Mock Logic
    setState({
      user: { id: 'mock-id', email: `${role}@example.com`, role },
      isAuthenticated: true,
      loading: false
    });
  };

  const signOut = async () => {
    if(isSupabaseConfigured()) await supabase.auth.signOut();
    setState({ user: null, isAuthenticated: false, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {!state.loading && children}
    </AuthContext.Provider>
  );
};

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// --- Main App Logic ---
const MainLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const location = useLocation();

  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar 
        toggleCart={() => setIsCartOpen(true)} 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
      />
      
      <main>
        <Routes>
          <Route path="/" element={<Menu addToCart={addToCart} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Cart Modal is global but only relevant for public users usually, though accessible */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        updateQuantity={updateQuantity}
        clearCart={() => setCartItems([])}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </AuthProvider>
  );
}