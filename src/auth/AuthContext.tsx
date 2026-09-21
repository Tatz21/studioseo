import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AuthState, 
  User, 
  AuthSession, 
  LoginCredentials, 
  RegisterCredentials, 
  UserRole 
} from './types';
import { 
  createSession, 
  saveSession, 
  getStoredSession, 
  clearSession, 
  DEMO_USERS 
} from './sessionManager';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setAuthState({
        user: session.user,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } else {
      // Default to lead SEO analyst demo session so user is not blocked initially
      const defaultSession = createSession(DEMO_USERS.admin);
      saveSession(defaultSession);
      setAuthState({
        user: defaultSession.user,
        session: defaultSession,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Simulate network request
      await new Promise(res => setTimeout(res, 400));

      if (!credentials.email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }

      // Check if matches known demo or create dynamic user
      const existingKey = Object.keys(DEMO_USERS).find(k => DEMO_USERS[k].email.toLowerCase() === credentials.email.toLowerCase());
      const user: User = existingKey ? DEMO_USERS[existingKey] : {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: credentials.email,
        name: credentials.email.split('@')[0].replace('.', ' '),
        role: 'member',
        createdAt: new Date().toISOString()
      };

      const session = createSession(user, credentials.rememberMe ? 168 : 24);
      saveSession(session);

      setAuthState({
        user,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: err.message || 'Login failed.' }));
      throw err;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await new Promise(res => setTimeout(res, 500));

      if (!credentials.email.includes('@') || !credentials.name.trim()) {
        throw new Error('Please provide a valid name and email address.');
      }

      const newUser: User = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        name: credentials.name.trim(),
        email: credentials.email.trim(),
        organization: credentials.organization?.trim() || 'Personal Project',
        role: 'admin', // First user in new org gets admin
        createdAt: new Date().toISOString()
      };

      const session = createSession(newUser, 48);
      saveSession(session);

      setAuthState({
        user: newUser,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: err.message || 'Registration failed.' }));
      throw err;
    }
  };

  const loginAsDemo = (role: UserRole) => {
    const targetUser = DEMO_USERS[role === 'admin' ? 'admin' : role === 'member' ? 'analyst' : 'viewer'] || DEMO_USERS.admin;
    const session = createSession(targetUser);
    saveSession(session);
    setAuthState({
      user: targetUser,
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    clearSession();
    setAuthState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const updateUser = (updated: Partial<User>) => {
    if (authState.user && authState.session) {
      const updatedUser: User = { ...authState.user, ...updated };
      const updatedSession: AuthSession = { ...authState.session, user: updatedUser };
      saveSession(updatedSession);
      setAuthState(prev => ({ ...prev, user: updatedUser, session: updatedSession }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        loginAsDemo,
        logout,
        updateUser,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
