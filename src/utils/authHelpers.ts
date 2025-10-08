// ===================================================================
// UTILITÁRIOS DE AUTENTICAÇÃO E SEGURANÇA
// ===================================================================

import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { User, LoginAttempt, SECURITY_CONFIG } from '../types/auth';

/**
 * Gera um salt aleatório para hash de senha
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

/**
 * Cria hash seguro da senha usando bcrypt + salt personalizado
 */
export const hashPassword = async (password: string, salt?: string): Promise<{ hash: string; salt: string }> => {
  const passwordSalt = salt || generateSalt();
  
  // Combina a senha com o salt personalizado
  const saltedPassword = password + passwordSalt;
  
  // Aplica bcrypt com rounds configurados
  const hash = await bcrypt.hash(saltedPassword, SECURITY_CONFIG.BCRYPT_ROUNDS);
  
  return { hash, salt: passwordSalt };
};

/**
 * Verifica se a senha fornecida corresponde ao hash armazenado
 */
export const verifyPassword = async (password: string, hash: string, salt: string): Promise<boolean> => {
  try {
    const saltedPassword = password + salt;
    return await bcrypt.compare(saltedPassword, hash);
  } catch (error) {
    console.error('Erro na verificação de senha:', error);
    return false;
  }
};

/**
 * Valida se a senha atende aos critérios de segurança
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um símbolo especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gera token JWT para sessão (implementação compatível com navegador)
 */
export const generateJWT = (userId: string): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    timestamp: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  const signature = CryptoJS.HmacSHA256(
    `${encodedHeader}.${encodedPayload}`,
    SECURITY_CONFIG.JWT_SECRET
  ).toString();

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Verifica e decodifica token JWT (implementação compatível com navegador)
 */
export const verifyJWT = (token: string): { userId: string; timestamp: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verifica assinatura
    const expectedSignature = CryptoJS.HmacSHA256(
      `${encodedHeader}.${encodedPayload}`,
      SECURITY_CONFIG.JWT_SECRET
    ).toString();

    if (signature !== expectedSignature) {
      return null;
    }

    // Decodifica payload
    const payload = JSON.parse(atob(encodedPayload));

    // Verifica expiração
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return { userId: payload.userId, timestamp: payload.timestamp };
  } catch (error) {
    return null;
  }
};

/**
 * Gera token seguro para recuperação de senha
 */
export const generateResetToken = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

/**
 * Verifica se a conta está bloqueada
 */
export const isAccountLocked = (user: User): boolean => {
  if (!user.isLocked || !user.lockUntil) {
    return false;
  }
  
  // Se o tempo de bloqueio expirou, desbloqueia automaticamente
  if (Date.now() > user.lockUntil) {
    return false;
  }
  
  return true;
};

/**
 * Calcula tempo restante de bloqueio em minutos
 */
export const getLockTimeRemaining = (user: User): number => {
  if (!user.isLocked || !user.lockUntil) {
    return 0;
  }
  
  const remaining = user.lockUntil - Date.now();
  return Math.max(0, Math.ceil(remaining / (60 * 1000))); // Retorna em minutos
};

/**
 * Registra tentativa de login
 */
export const logLoginAttempt = (username: string, success: boolean, ipAddress: string = 'unknown'): LoginAttempt => {
  return {
    id: Date.now().toString(),
    username,
    success,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  };
};

/**
 * Sanitiza entrada do usuário para prevenir ataques
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Gera ID único para entidades
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Formata data para exibição
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

/**
 * Verifica se é o primeiro acesso com credenciais padrão
 */
export const isDefaultCredentials = (username: string, password: string): boolean => {
  return username === SECURITY_CONFIG.DEFAULT_ADMIN.username && 
         password === SECURITY_CONFIG.DEFAULT_ADMIN.password;
};

/**
 * Criptografa dados sensíveis para armazenamento local
 */
export const encryptData = (data: string, key: string = SECURITY_CONFIG.JWT_SECRET): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Descriptografa dados do armazenamento local
 */
export const decryptData = (encryptedData: string, key: string = SECURITY_CONFIG.JWT_SECRET): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return '';
  }
};