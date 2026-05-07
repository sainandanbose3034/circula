'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import ApiClient from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'company'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // User form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Company form
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/documents');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await ApiClient.companyLogin(companyEmail, companyPassword);
      localStorage.setItem('circula_company_token', data.token);
      localStorage.setItem('circula_company', JSON.stringify(data.company));
      router.push('/company');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <Link href="/" className="auth-logo">
            <span className="auth-logo-text">Circula</span>
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your journey</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => { setActiveTab('user'); setError(''); }}
          >
            Student / User
          </button>
          <button
            className={`auth-tab ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => { setActiveTab('company'); setError(''); }}
          >
            Company (B2B)
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {activeTab === 'user' ? (
          <form onSubmit={handleUserLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Sign In →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompanyLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">Company Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="contact@company.com"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={companyPassword}
                onChange={(e) => setCompanyPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-premium btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Company Sign In →'}
            </button>
            <p className="auth-note">
              Don&apos;t have a company account?{' '}
              <Link href="/company" className="text-link">Register your company</Link>
              <br />
              <small style={{ color: 'var(--text-dim)' }}>Company accounts require admin approval</small>
            </p>
          </form>
        )}

        {activeTab === 'user' && (
          <div className="auth-footer">
            <p>Don&apos;t have an account? <Link href="/register" className="text-link">Create Account</Link></p>
          </div>
        )}
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 40px 20px;
        }

        .auth-bg {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
        }

        .auth-orb-1 {
          width: 500px;
          height: 500px;
          background: rgba(114, 47, 55, 0.25);
          top: -150px;
          right: -100px;
          animation: float 10s ease-in-out infinite;
        }

        .auth-orb-2 {
          width: 350px;
          height: 350px;
          background: rgba(171, 30, 72, 0.15);
          bottom: -100px;
          left: -50px;
          animation: float 12s ease-in-out infinite reverse;
        }

        .auth-container {
          width: 100%;
          max-width: 440px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-2xl);
          padding: 48px 40px;
          position: relative;
          z-index: 1;
          box-shadow: var(--shadow-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo-text {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 900;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 16px;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 6px;
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 4px;
          margin-bottom: 24px;
        }

        .auth-tab {
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          font-family: var(--font-primary);
        }

        .auth-tab.active {
          background: var(--bg-elevated);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-submit {
          width: 100%;
          margin-top: 8px;
        }

        .auth-error {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          color: #f87171;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .auth-note {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .auth-note a {
          color: var(--wine-400);
          font-weight: 500;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-primary);
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .auth-footer a {
          color: var(--wine-400);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
