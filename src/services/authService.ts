// ===================================================================
// SERVIÇO DE AUTENTICAÇÃO - LÓGICA DE NEGÓCIO
// ===================================================================

import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  PasswordChangeData, 
  PasswordRecoveryData,
  LoginAttempt,
  PasswordResetToken,
  SECURITY_CONFIG 
} from '../types/auth';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  validateEmail,
  generateJWT,
  verifyJWT,
  generateResetToken,
  isAccountLocked,
  getLockTimeRemaining,
  logLoginAttempt,
  sanitizeInput,
  generateId,
  isDefaultCredentials,
  encryptData,
  decryptData
} from '../utils/authHelpers';

/**
 * Classe principal do serviço de autenticação
 * Gerencia todas as operações relacionadas à autenticação e segurança
 */
class AuthService {
  private users: User[] = [];
  private loginAttempts: LoginAttempt[] = [];
  private resetTokens: PasswordResetToken[] = [];
  private currentSession: string | null = null;

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultAdmin();
  }

  /**
   * Carrega dados do localStorage (simulando banco de dados)
   */
  private loadFromStorage(): void {
    try {
      const encryptedUsers = localStorage.getItem('bbm_users');
      const encryptedAttempts = localStorage.getItem('bbm_login_attempts');
      const encryptedTokens = localStorage.getItem('bbm_reset_tokens');
      const session = localStorage.getItem('bbm_session');

      if (encryptedUsers) {
        const decryptedUsers = decryptData(encryptedUsers);
        this.users = JSON.parse(decryptedUsers);
      }

      if (encryptedAttempts) {
        const decryptedAttempts = decryptData(encryptedAttempts);
        this.loginAttempts = JSON.parse(decryptedAttempts);
      }

      if (encryptedTokens) {
        const decryptedTokens = decryptData(encryptedTokens);
        this.resetTokens = JSON.parse(decryptedTokens);
      }

      this.currentSession = session;
    } catch (error) {
      console.error('Erro ao carregar dados do storage:', error);
    }
  }

  /**
   * Salva dados no localStorage de forma criptografada
   */
  private saveToStorage(): void {
    try {
      const encryptedUsers = encryptData(JSON.stringify(this.users));
      const encryptedAttempts = encryptData(JSON.stringify(this.loginAttempts));
      const encryptedTokens = encryptData(JSON.stringify(this.resetTokens));

      localStorage.setItem('bbm_users', encryptedUsers);
      localStorage.setItem('bbm_login_attempts', encryptedAttempts);
      localStorage.setItem('bbm_reset_tokens', encryptedTokens);
    } catch (error) {
      console.error('Erro ao salvar dados no storage:', error);
    }
  }

  /**
   * Inicializa usuário administrador padrão se não existir
   */
  private async initializeDefaultAdmin(): Promise<void> {
    const adminExists = this.users.some(user => user.username === SECURITY_CONFIG.DEFAULT_ADMIN.username);
    
    if (!adminExists) {
      const { hash, salt } = await hashPassword(SECURITY_CONFIG.DEFAULT_ADMIN.password);
      
      const defaultAdmin: User = {
        id: generateId(),
        username: SECURITY_CONFIG.DEFAULT_ADMIN.username,
        email: 'admin@bbmsmartdocs.com',
        passwordHash: hash,
        salt,
        securityQuestion: 'Qual é o nome do sistema?',
        securityAnswerHash: (await hashPassword('BBM SmartDocs', salt)).hash,
        isFirstLogin: true,
        isLocked: false,
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.users.push(defaultAdmin);
      this.saveToStorage();
    }
  }

  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User; requiresPasswordChange?: boolean }> {
    const { username, password } = credentials;
    const sanitizedUsername = sanitizeInput(username);
    
    // Registra tentativa de login
    const attempt = logLoginAttempt(sanitizedUsername, false);
    
    try {
      // Busca usuário
      const user = this.users.find(u => u.username === sanitizedUsername);
      
      if (!user) {
        this.loginAttempts.push(attempt);
        this.saveToStorage();
        return { success: false, message: 'Login ou senha inválidos' };
      }

      // Verifica se a conta está bloqueada
      if (isAccountLocked(user)) {
        const timeRemaining = getLockTimeRemaining(user);
        this.loginAttempts.push(attempt);
        this.saveToStorage();
        return { 
          success: false, 
          message: `Conta bloqueada. Tente novamente em ${timeRemaining} minutos.` 
        };
      }

      // Verifica credenciais padrão para primeiro login
      const isDefaultLogin = isDefaultCredentials(sanitizedUsername, password);
      
      // Verifica senha
      const isValidPassword = isDefaultLogin || await verifyPassword(password, user.passwordHash, user.salt);
      
      if (!isValidPassword) {
        // Incrementa tentativas falhadas
        user.failedAttempts += 1;
        
        // Bloqueia conta se exceder limite
        if (user.failedAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
          user.isLocked = true;
          user.lockUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
        }
        
        user.updatedAt = new Date().toISOString();
        this.loginAttempts.push(attempt);
        this.saveToStorage();
        
        return { success: false, message: 'Login ou senha inválidos' };
      }

      // Login bem-sucedido - reset tentativas falhadas
      user.failedAttempts = 0;
      user.isLocked = false;
      user.lockUntil = undefined;
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();

      // Gera token de sessão
      const token = generateJWT(user.id);
      this.currentSession = token;
      localStorage.setItem('bbm_session', token);

      // Registra tentativa bem-sucedida
      attempt.success = true;
      this.loginAttempts.push(attempt);
      this.saveToStorage();

      // Verifica se precisa trocar senha (primeiro login com credenciais padrão)
      const requiresPasswordChange = isDefaultLogin || user.isFirstLogin;

      return { 
        success: true, 
        message: 'Login realizado com sucesso', 
        user,
        requiresPasswordChange 
      };

    } catch (error) {
      console.error('Erro no login:', error);
      this.loginAttempts.push(attempt);
      this.saveToStorage();
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<{ success: boolean; message: string }> {
    try {
      const { username, email, password, confirmPassword, securityQuestion, securityAnswer } = data;
      
      // Sanitiza entradas
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedEmail = sanitizeInput(email);
      
      // Validações
      if (!sanitizedUsername || !sanitizedEmail || !password || !securityQuestion || !securityAnswer) {
        return { success: false, message: 'Todos os campos são obrigatórios' };
      }

      if (password !== confirmPassword) {
        return { success: false, message: 'Senhas não coincidem' };
      }

      // Valida força da senha
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.errors.join('. ') };
      }

      // Valida email
      if (!validateEmail(sanitizedEmail)) {
        return { success: false, message: 'Email inválido' };
      }

      // Verifica se usuário já existe
      if (this.users.some(u => u.username === sanitizedUsername)) {
        return { success: false, message: 'Nome de usuário já existe' };
      }

      if (this.users.some(u => u.email === sanitizedEmail)) {
        return { success: false, message: 'Email já cadastrado' };
      }

      // Cria hash da senha e resposta de segurança
      const { hash: passwordHash, salt } = await hashPassword(password);
      const { hash: securityAnswerHash } = await hashPassword(securityAnswer.toLowerCase(), salt);

      // Cria novo usuário
      const newUser: User = {
        id: generateId(),
        username: sanitizedUsername,
        email: sanitizedEmail,
        passwordHash,
        salt,
        securityQuestion,
        securityAnswerHash,
        isFirstLogin: false,
        isLocked: false,
        failedAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.users.push(newUser);
      this.saveToStorage();

      return { success: true, message: 'Usuário cadastrado com sucesso' };

    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(userId: string, data: PasswordChangeData): Promise<{ success: boolean; message: string }> {
    try {
      const { currentPassword, newPassword, confirmPassword } = data;
      
      const user = this.users.find(u => u.id === userId);
      if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Para primeiro login com credenciais padrão, pula verificação da senha atual
      const isFirstTimeChange = user.isFirstLogin && isDefaultCredentials(user.username, currentPassword);
      
      if (!isFirstTimeChange) {
        // Verifica senha atual
        const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash, user.salt);
        if (!isCurrentPasswordValid) {
          return { success: false, message: 'Senha atual incorreta' };
        }
      }

      if (newPassword !== confirmPassword) {
        return { success: false, message: 'Novas senhas não coincidem' };
      }

      // Valida força da nova senha
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.errors.join('. ') };
      }

      // Gera novo hash
      const { hash: newPasswordHash, salt: newSalt } = await hashPassword(newPassword);
      
      // Atualiza usuário
      user.passwordHash = newPasswordHash;
      user.salt = newSalt;
      user.isFirstLogin = false;
      user.updatedAt = new Date().toISOString();

      this.saveToStorage();

      return { success: true, message: 'Senha alterada com sucesso' };

    } catch (error) {
      console.error('Erro na alteração de senha:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  /**
   * Recupera senha usando pergunta de segurança
   */
  async recoverPasswordWithSecurityQuestion(data: PasswordRecoveryData): Promise<{ success: boolean; message: string }> {
    try {
      const { username, securityAnswer, newPassword, confirmPassword } = data;
      
      if (!username || !securityAnswer || !newPassword || !confirmPassword) {
        return { success: false, message: 'Todos os campos são obrigatórios' };
      }

      const sanitizedUsername = sanitizeInput(username);
      const user = this.users.find(u => u.username === sanitizedUsername);
      
      if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Verifica resposta de segurança
      const isSecurityAnswerValid = await verifyPassword(
        securityAnswer.toLowerCase(), 
        user.securityAnswerHash, 
        user.salt
      );
      
      if (!isSecurityAnswerValid) {
        return { success: false, message: 'Resposta de segurança incorreta' };
      }

      if (newPassword !== confirmPassword) {
        return { success: false, message: 'Senhas não coincidem' };
      }

      // Valida nova senha
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.errors.join('. ') };
      }

      // Atualiza senha
      const { hash: newPasswordHash, salt: newSalt } = await hashPassword(newPassword);
      user.passwordHash = newPasswordHash;
      user.salt = newSalt;
      user.updatedAt = new Date().toISOString();

      this.saveToStorage();

      return { success: true, message: 'Senha recuperada com sucesso' };

    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  /**
   * Envia email de recuperação de senha (simulado)
   */
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const sanitizedEmail = sanitizeInput(email);
      const user = this.users.find(u => u.email === sanitizedEmail);
      
      if (!user) {
        // Por segurança, sempre retorna sucesso mesmo se email não existir
        return { success: true, message: 'Se o email existir, um link de recuperação foi enviado' };
      }

      // Gera token de recuperação
      const resetToken: PasswordResetToken = {
        id: generateId(),
        userId: user.id,
        token: generateResetToken(),
        expiresAt: new Date(Date.now() + SECURITY_CONFIG.RESET_TOKEN_DURATION).toISOString(),
        used: false,
        createdAt: new Date().toISOString()
      };

      this.resetTokens.push(resetToken);
      this.saveToStorage();

      // Em produção, aqui seria enviado o email real
      console.log(`Link de recuperação (SIMULADO): /reset-password?token=${resetToken.token}`);

      return { success: true, message: 'Se o email existir, um link de recuperação foi enviado' };

    } catch (error) {
      console.error('Erro no envio de email:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  /**
   * Redefine senha usando token de recuperação
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const resetToken = this.resetTokens.find(t => t.token === token && !t.used);
      
      if (!resetToken) {
        return { success: false, message: 'Token inválido ou expirado' };
      }

      // Verifica se token expirou
      if (new Date() > new Date(resetToken.expiresAt)) {
        return { success: false, message: 'Token expirado' };
      }

      const user = this.users.find(u => u.id === resetToken.userId);
      if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Valida nova senha
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.errors.join('. ') };
      }

      // Atualiza senha
      const { hash: newPasswordHash, salt: newSalt } = await hashPassword(newPassword);
      user.passwordHash = newPasswordHash;
      user.salt = newSalt;
      user.updatedAt = new Date().toISOString();

      // Marca token como usado
      resetToken.used = true;

      this.saveToStorage();

      return { success: true, message: 'Senha redefinida com sucesso' };

    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  getCurrentUser(): User | null {
    if (!this.currentSession) {
      return null;
    }

    const decoded = verifyJWT(this.currentSession);
    if (!decoded) {
      this.logout();
      return null;
    }

    const user = this.users.find(u => u.id === decoded.userId);
    return user || null;
  }

  /**
   * Realiza logout
   */
  logout(): void {
    this.currentSession = null;
    localStorage.removeItem('bbm_session');
  }

  /**
   * Obtém histórico de tentativas de login
   */
  getLoginAttempts(limit: number = 50): LoginAttempt[] {
    return this.loginAttempts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Obtém lista de usuários (apenas para admin)
   */
  getUsers(): Omit<User, 'passwordHash' | 'salt' | 'securityAnswerHash'>[] {
    return this.users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      securityQuestion: user.securityQuestion,
      isFirstLogin: user.isFirstLogin,
      isLocked: user.isLocked,
      lockUntil: user.lockUntil,
      failedAttempts: user.failedAttempts,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }
}

// Instância singleton do serviço
export const authService = new AuthService();