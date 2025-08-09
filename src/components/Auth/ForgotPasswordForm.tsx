// ===================================================================
// FORMULÁRIO DE RECUPERAÇÃO DE SENHA
// ===================================================================

import React, { useState } from 'react';
import { ArrowLeft, Mail, HelpCircle, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Common/Button';
import { validatePasswordStrength } from '../../utils/authHelpers';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, onSuccess }) => {
  const { recoverPassword, sendPasswordResetEmail, isLoading } = useAuth();
  const [step, setStep] = useState<'method' | 'security' | 'email'>('method');
  const [method, setMethod] = useState<'security' | 'email'>('security');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });

  const handleMethodSelect = (selectedMethod: 'security' | 'email') => {
    setMethod(selectedMethod);
    setStep(selectedMethod);
    setError('');
    setSuccess('');
  };

  const handleSecurityQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.securityAnswer || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Nova senha não atende aos critérios de segurança');
      return;
    }

    try {
      const result = await recoverPassword({
        username: formData.username,
        securityAnswer: formData.securityAnswer,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (result.success) {
        setSuccess('Senha recuperada com sucesso! Você pode fazer login com a nova senha.');
        setTimeout(() => onSuccess(), 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro interno do servidor');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email) {
      setError('Email é obrigatório');
      return;
    }

    try {
      const result = await sendPasswordResetEmail(formData.email);
      
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro interno do servidor');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');

    // Valida força da nova senha em tempo real
    if (field === 'newPassword') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Recuperar Senha</h2>
          <p className="mt-2 text-sm text-gray-600">
            Escolha como deseja recuperar sua senha
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">{success}</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Method Selection */}
          {step === 'method' && (
            <div className="space-y-4">
              <button
                onClick={() => handleMethodSelect('security')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center">
                  <HelpCircle className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Pergunta de Segurança</h3>
                    <p className="text-sm text-gray-500">Responda sua pergunta de segurança</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('email')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email de Recuperação</h3>
                    <p className="text-sm text-gray-500">Receba um link por email</p>
                  </div>
                </div>
              </button>

              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                icon={ArrowLeft}
                className="w-full py-3 text-base font-medium"
              >
                Voltar ao Login
              </Button>
            </div>
          )}

          {/* Security Question Form */}
          {step === 'security' && (
            <form className="space-y-6" onSubmit={handleSecurityQuestionSubmit}>
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de Usuário *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite seu nome de usuário"
                />
              </div>

              {/* Security Answer Field */}
              <div>
                <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                  Resposta de Segurança *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="securityAnswer"
                    name="securityAnswer"
                    type="text"
                    required
                    value={formData.securityAnswer}
                    onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite a resposta da sua pergunta de segurança"
                  />
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className={`text-xs ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.isValid ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Senha segura
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium mb-1">Requisitos da senha:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {passwordStrength.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full py-3 text-base font-medium"
              >
                Recuperar Senha
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep('method')}
                icon={ArrowLeft}
                className="w-full py-3 text-base font-medium"
              >
                Voltar
              </Button>
            </form>
          )}

          {/* Email Recovery Form */}
          {step === 'email' && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite seu email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full py-3 text-base font-medium"
              >
                Enviar Link de Recuperação
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep('method')}
                icon={ArrowLeft}
                className="w-full py-3 text-base font-medium"
              >
                Voltar
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;