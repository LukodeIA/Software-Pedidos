import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { supabase } from '../services/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Coffee, Lock, UserCog, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido</h2>
          <p className="mt-2 text-sm text-gray-500">Inicia sesión para gestionar los pedidos</p>
        </div>

        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ea580c',
                    brandAccent: '#c2410c',
                    inputBorder: '#e5e7eb',
                    inputLabelText: '#374151'
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    inputBorderRadius: '0.5rem'
                  }
                }
              },
              className: {
                button: 'w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200',
                input: 'appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-shadow duration-200',
                label: 'block text-sm font-medium text-gray-700 mb-1'
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu correo electrónico',
                  password_input_placeholder: 'Tu contraseña',
                  button_label: 'Iniciar sesión',
                  loading_button_label: 'Iniciando sesión...',
                  social_provider_text: 'Entrar con {{provider}}',
                  link_text: '¿Ya tienes una cuenta? Inicia sesión',
                },
                forgotten_password: {
                  link_text: '¿Olvidaste tu contraseña?',
                  button_label: 'Enviar instrucciones',
                  loading_button_label: 'Enviando instrucciones...',
                  confirmation_text: 'Revisa tu correo para el enlace de recuperación',
                },
              },
            }}
            providers={[]}
            showLinks={false}
            theme="default"
          />

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Acceso seguro solo para personal autorizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};