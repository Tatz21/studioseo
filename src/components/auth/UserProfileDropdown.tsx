import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  LogIn, 
  ChevronDown, 
  Building, 
  KeyRound,
  RefreshCw 
} from 'lucide-react';

export const UserProfileDropdown: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    openAuthModal, 
    loginAsDemo, 
    session 
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={openAuthModal}
        className="btn btn-primary"
        style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
      >
        <LogIn size={15} />
        <span>Sign In</span>
      </button>
    );
  }

  const roleColor = user.role === 'admin' ? 'var(--accent-primary)' : user.role === 'member' ? 'var(--accent-cyan)' : 'var(--status-warning)';

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Profile Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* User Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={14} color="var(--text-secondary)" />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.name}
          </span>
          <span style={{ fontSize: '0.65rem', color: roleColor, fontWeight: 700, textTransform: 'uppercase' }}>
            {user.role}
          </span>
        </div>

        <ChevronDown size={14} color="var(--text-secondary)" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '260px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: '0.85rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* User Details */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
              {user.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', wordBreak: 'break-all' }}>
              {user.email}
            </span>
            {user.organization && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Building size={12} />
                <span>{user.organization}</span>
              </div>
            )}
          </div>

          {/* Session Token Info */}
          <div style={{
            background: 'var(--bg-canvas)',
            padding: '0.5rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.7rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <KeyRound size={12} color="var(--accent-primary)" />
              <span>Active Session Token:</span>
            </div>
            <code className="font-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.65rem', wordBreak: 'break-all' }}>
              {session?.token.substring(0, 24)}...
            </code>
          </div>

          {/* Role Switcher */}
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
              Switch Demo Role:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => { loginAsDemo('admin'); setIsOpen(false); }}
                className={`btn ${user.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.7rem', padding: '0.3rem' }}
              >
                <ShieldCheck size={12} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => { loginAsDemo('member'); setIsOpen(false); }}
                className={`btn ${user.role === 'member' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.7rem', padding: '0.3rem' }}
              >
                <RefreshCw size={12} />
                <span>Analyst</span>
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => { logout(); setIsOpen(false); }}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--status-critical)', fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
