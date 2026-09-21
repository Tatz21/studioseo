import { AuthSession, User } from './types';

const SESSION_STORAGE_KEY = 'seo_studio_auth_session';

export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'usr_adm_001',
    name: 'Alex Rivera',
    email: 'alex.director@seostudiopro.com',
    role: 'admin',
    organization: 'Apex SEO Growth Inc.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  analyst: {
    id: 'usr_ana_002',
    name: 'Sarah Chen',
    email: 'sarah.chen@seostudiopro.com',
    role: 'member',
    organization: 'Digital Scale Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T09:30:00.000Z'
  },
  viewer: {
    id: 'usr_viw_003',
    name: 'David Miller',
    email: 'david.client@timelinerskolkata.com',
    role: 'viewer',
    organization: 'The Timeliners Studio',
    createdAt: '2026-03-01T11:00:00.000Z'
  }
};

/**
 * Creates a valid auth session with a mock cryptographic bearer token.
 */
export function createSession(user: User, durationHours: number = 24): AuthSession {
  const token = `seo_tok_${user.role}_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;
  return {
    token,
    user,
    expiresAt
  };
}

/**
 * Persists session to browser storage.
 */
export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Unable to persist session to localStorage', e);
  }
}

/**
 * Retrieves and validates the current session from storage.
 */
export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Check expiration
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Clears session from storage on logout.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Unable to clear session from storage', e);
  }
}
