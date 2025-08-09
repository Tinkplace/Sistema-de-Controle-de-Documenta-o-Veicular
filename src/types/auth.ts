// ===================================================================
// TIPOS E INTERFACES PARA SISTEMA DE AUTENTICAÇÃO
// ===================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  securityQuestion: string;
  securityAnswerHash: string;
  isFirstLogin: boolean;
  isLocked: boolean;
  lockUntil?: number;
  failedAttempts: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginAttempt {
  id: string;
  username: string;
  ipAddress: string;
  success: boolean;
  timestamp: string;
  userAgent?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordRecoveryData {
  username?: string;
  email?: string;
  securityAnswer?: string;
  newPassword?: string;
  confirmPassword?: string;
  resetToken?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string; requiresPasswordChange?: boolean }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  changePassword: (data: PasswordChangeData) => Promise<{ success: boolean; message: string }>;
  recoverPassword: (data: PasswordRecoveryData) => Promise<{ success: boolean; message: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

// Configurações de segurança
export const SECURITY_CONFIG = {
  // Política de senhas
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: true,
  
  // Bloqueio de conta
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos em millisegundos
  
  // Tokens e sessões
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas
  RESET_TOKEN_DURATION: 60 * 60 * 1000, // 1 hora
  
  // Rounds do bcrypt
  BCRYPT_ROUNDS: 12,
  
  // JWT Secret (em produção deve vir de variável de ambiente)
  JWT_SECRET: 'bbm-smartdocs-jwt-secret-key-2025',
  
  // Credenciais padrão iniciais
  DEFAULT_ADMIN: {
    username: 'adm',
    password: 'adm2025'
  }
} as const;