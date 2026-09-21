import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building 
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    login, 
    register, 
    loginAsDemo, 
    error 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password, rememberMe });
      } else {
        await register({ name, email, password, organization });
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg), 0 0 30px rgba(16, 185, 129, 0.15)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.35rem' }}
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Lock size={22} color="#042F2E" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>
            {mode === 'login' ? 'Sign In to SEO Studio Pro' : 'Create SEO Studio Account'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Enterprise SEO auditing & intelligence workspace
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-canvas)',
          padding: '0.25rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setLocalError(null); }}
            className={`btn ${mode === 'login' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8125rem', padding: '0.45rem' }}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setLocalError(null); }}
            className={`btn ${mode === 'register' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8125rem', padding: '0.45rem' }}
          >
            <UserPlus size={14} />
            <span>Register</span>
          </button>
        </div>

        {/* Error notice */}
        {(localError || error) && (
          <div style={{
            background: 'var(--status-critical-bg)',
            border: '1px solid var(--status-critical)',
            color: 'var(--status-critical)',
            fontSize: '0.8rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            {localError || error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Full Name
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0 0.75rem' }}>
                  <User size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    required
                    className="input-text"
                    style={{ border: 'none', background: 'transparent', padding: '0.65rem 0' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Organization / Agency (Optional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0 0.75rem' }}>
                  <Building size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                  <input
                    type="text"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    placeholder="Timeliners Kolkata"
                    className="input-text"
                    style={{ border: 'none', background: 'transparent', padding: '0.65rem 0' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Email Address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0 0.75rem' }}>
              <Mail size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agency.com"
                required
                className="input-text"
                style={{ border: 'none', background: 'transparent', padding: '0.65rem 0' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0 0.75rem' }}>
              <Lock size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-text"
                style={{ border: 'none', background: 'transparent', padding: '0.65rem 0' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember this device</span>
              </label>
              <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }}>Forgot password?</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {submitting ? 'Processing...' : mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Demo Access
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => loginAsDemo('admin')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
            >
              <ShieldCheck size={14} color="var(--accent-primary)" />
              <span>Admin Director</span>
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo('member')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
            >
              <User size={14} color="var(--accent-cyan)" />
              <span>SEO Analyst</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
