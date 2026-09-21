import React from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from './types';
import { Lock, ShieldAlert, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { isAuthenticated, user, openAuthModal } = useAuth();

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="glass-panel" style={{
        maxWidth: '480px',
        margin: '3rem auto',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--status-critical)'
        }}>
          <Lock size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem' }}>Authentication Required</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          You must be signed in to access this workspace and perform SEO audits.
        </p>
        <button
          onClick={openAuthModal}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          <LogIn size={16} />
          <span>Sign In to Continue</span>
        </button>
      </div>
    );
  }

  // Check role authorization if specified
  if (requiredRole && user) {
    const roleHierarchy: Record<UserRole, number> = {
      admin: 3,
      member: 2,
      viewer: 1
    };

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return (
        <div className="glass-panel" style={{
          maxWidth: '520px',
          margin: '3rem auto',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--status-warning)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Insufficient Permissions</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            This feature requires the <strong style={{ color: 'var(--text-primary)' }}>{requiredRole.toUpperCase()}</strong> role. Your current role is <strong style={{ color: 'var(--accent-primary)' }}>{user.role.toUpperCase()}</strong>.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};
