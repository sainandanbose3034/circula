'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.push('/documents');
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start sharing and earning CircuBits today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
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
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Create Account →'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link href="/login" className="text-link">Sign In</Link></p>
        </div>
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
          left: -100px;
          animation: float 10s ease-in-out infinite;
        }

        .auth-orb-2 {
          width: 350px;
          height: 350px;
          background: rgba(171, 30, 72, 0.15);
          bottom: -100px;
          right: -50px;
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
