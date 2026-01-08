import React from 'react';
import { useAuth } from '../App';
import { ShoppingBag, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleCart?: () => void;
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleCart, cartCount = 0 }) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">Euge te amo</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {!user && (
                <Link to="/" className="border-orange-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Menu
                </Link>
              )}
              {user && (
                <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Panel de Control
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!user && toggleCart && (
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-400 hover:text-gray-500"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <span className="text-sm font-medium text-orange-600 hidden sm:block">
                Modo {user.role === 'admin' ? 'Administrador' : 'Empleado'}
              </span>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Acceso Personal
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};