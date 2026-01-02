import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { supabase } from '../services/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Coffee, Lock, UserCog, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [showSupabaseUI, setShowSupabaseUI] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Staff Login</h2>
          <p className="mt-2 text-sm text-gray-600">Access the order management system</p>
        </div>

        {showSupabaseUI ? (
          /* Real Supabase Auth UI */
          <div className="mt-8">
            <Auth 
              supabaseClient={supabase} 
              appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#ea580c', brandAccent: '#c2410c' } } } }} 
              providers={[]}
              showLinks={false}
            />
            <p className="mt-4 text-xs text-center text-gray-400">
               Note: Users must have a profile entry in 'profiles' table with role 'admin' or 'employee' to access features.
            </p>
          </div>
        ) : (
          /* Mock / Demo Auth */
          <div className="mt-8 space-y-4">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Demo Mode Active</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Supabase keys are not configured. Click below to simulate login.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => signIn('employee')}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <User className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              Login as Employee (View Orders)
            </button>

            <button
              onClick={() => signIn('admin')}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserCog className="h-5 w-5 text-gray-500 group-hover:text-gray-400" />
              </span>
              Login as Admin (Full Access)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};