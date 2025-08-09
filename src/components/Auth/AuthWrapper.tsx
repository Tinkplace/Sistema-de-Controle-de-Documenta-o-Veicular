// ===================================================================
// WRAPPER DE AUTENTICAÇÃO - GERENCIADOR DE TELAS
// ===================================================================

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import PasswordChangeForm from './PasswordChangeForm';
import AuthGuard from './AuthGuard';

interface AuthWrapperProps {
  children: React.ReactNode;
}

type AuthScreen = 'login' | 'register' | 'forgot-password' | 'change-password' | 'success';

/**
 * Wrapper principal que gerencia todas as telas de autenticação
 */
const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [pendingPasswordChange, setPendingPasswordChange] = useState<any>(null);

  // Se está autenticado, renderiza o conteúdo protegido
  if (isAuthenticated) {
    return (
      <AuthGuard>
        {children}
      </AuthGuard>
    );
  }

  // Handlers para navegação entre telas
  const handleForgotPassword = () => setCurrentScreen('forgot-password');
  const handleRegister = () => setCurrentScreen('register');
  const handleBackToLogin = () => setCurrentScreen('login');
  
  const handlePasswordChangeRequired = (loginResult: any) => {
    setPendingPasswordChange(loginResult);
    setCurrentScreen('change-password');
  };

  const handlePasswordChangeSuccess = () => {
    setPendingPasswordChange(null);
    setCurrentScreen('login');
    // Força reload da página para aplicar nova autenticação
    window.location.reload();
  };

  const handleSuccess = () => {
    setCurrentScreen('login');
  };

  // Renderiza a tela apropriada baseada no estado atual
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginForm
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
            onPasswordChangeRequired={handlePasswordChangeRequired}
          />
        );

      case 'register':
        return (
          <RegisterForm
            onBack={handleBackToLogin}
            onSuccess={handleSuccess}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBack={handleBackToLogin}
            onSuccess={handleSuccess}
          />
        );

      case 'change-password':
        return (
          <PasswordChangeForm
            isFirstLogin={true}
            onSuccess={handlePasswordChangeSuccess}
          />
        );

      default:
        return (
          <LoginForm
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
            onPasswordChangeRequired={handlePasswordChangeRequired}
          />
        );
    }
  };

  return renderCurrentScreen();
};

export default AuthWrapper;