// ===================================================================
// CONTEXTO DE AUTENTICAÇÃO - PROVIDER REACT
// ===================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  AuthContextType, 
  LoginCredentials, 
  RegisterData, 
  PasswordChangeData, 
  PasswordRecoveryData 
} from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de autenticação
 * Gerencia estado global de autenticação da aplicação
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verifica autenticação ao carregar a aplicação
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Realiza login
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Realiza logout
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Registra novo usuário
   */
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      return await authService.register(data);
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Altera senha
   */
  const changePassword = async (data: PasswordChangeData) => {
    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    setIsLoading(true);
    try {
      const result = await authService.changePassword(user.id, data);
      
      // Se alteração foi bem-sucedida, atualiza usuário local
      if (result.success) {
        const updatedUser = authService.getCurrentUser();
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erro na alteração de senha:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Recupera senha usando pergunta de segurança
   */
  const recoverPassword = async (data: PasswordRecoveryData) => {
    setIsLoading(true);
    try {
      return await authService.recoverPasswordWithSecurityQuestion(data);
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envia email de recuperação
   */
  const sendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    try {
      return await authService.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Erro no envio de email:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Redefine senha com token
   */
  const resetPasswordWithToken = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      return await authService.resetPasswordWithToken(token, newPassword);
    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    changePassword,
    recoverPassword,
    sendPasswordResetEmail,
    resetPasswordWithToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};