// ===================================================================
// FORMULÁRIO DE LOGIN
// ===================================================================

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Common/Button';

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
  onPasswordChangeRequired: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onForgotPassword, 
  onRegister, 
  onPasswordChangeRequired 
}) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      const result = await login(formData);
      
      if (!result.success) {
        setError(result.message);
      } else if (result.requiresPasswordChange) {
        // Redireciona para alteração de senha obrigatória
        onPasswordChangeRequired(result);
      }
    } catch (error) {
      setError('Erro interno do servidor');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Limpa erro ao digitar
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            <span className="text-blue-700 font-black tracking-tight">BBM</span>
            <span className="text-gray-800 font-semibold ml-1">SmartDocs</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Controle de Documentação Veicular
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full py-3 text-base font-medium"
            >
              Entrar
            </Button>

            {/* Links */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Esqueci minha senha
              </button>
              <button
                type="button"
                onClick={onRegister}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Criar conta
              </button>
            </div>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <Shield className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Primeiro acesso:</p>
                  <p>Usuário: <code className="bg-blue-100 px-1 rounded">adm</code></p>
                  <p>Senha: <code className="bg-blue-100 px-1 rounded">adm2025</code></p>
                  <p className="text-xs mt-2 text-blue-600">
                    Será solicitada a criação de nova senha no primeiro login.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;