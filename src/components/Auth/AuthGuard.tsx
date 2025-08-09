// ===================================================================
// GUARD DE AUTENTICAÇÃO - PROTEÇÃO DE ROTAS
// ===================================================================

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas autenticadas
 * Exibe loading enquanto verifica autenticação
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Exibe loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            <span className="text-blue-700 font-black tracking-tight">BBM</span>
            <span className="text-gray-800 font-semibold ml-1">SmartDocs</span>
          </h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, o AuthWrapper irá mostrar as telas de login
  if (!isAuthenticated) {
    return null;
  }

  // Se está autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default AuthGuard;