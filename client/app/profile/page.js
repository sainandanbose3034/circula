'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CircuBitIcon from '@/components/CircuBitIcon';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user) setName(user.name);
  }, [user, authLoading]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('circula_token');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refreshUser();
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="container container-sm">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>

        <div className="page-header animate-fade-in-up">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card animate-fade-in-up stagger-1">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className={`badge ${user.role === 'premium' ? 'badge-gold' : 'badge-wine'}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {user.role === 'premium' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                    <polygon points="2 4 5 15 19 15 22 4 16 9 12 4 8 9 2 4"></polygon>
                    <line x1="5" y1="18" x2="19" y2="18"></line>
                  </svg>
                  Premium
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Free Plan
                </>
              )}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats animate-fade-in-up stagger-2">
          <div className="profile-stat-item">
            <span className="profile-stat-icon" style={{ color: 'var(--gold-400)' }}>₹</span>
            <span className="profile-stat-value">{user.fiatBalance?.toFixed(2) || '0.00'}</span>
            <span className="profile-stat-label">Earnings (₹)</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-icon"><CircuBitIcon size="24" style={{ color: 'var(--gold-400)' }} /></span>
            <span className="profile-stat-value">{user.circuBits || 0}</span>
            <span className="profile-stat-label">CircuBits</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--wine-400)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
            </span>
            <span className="profile-stat-value">{user.totalUploads || 0}</span>
            <span className="profile-stat-label">Uploads</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold-400)' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <span className="profile-stat-value">{user.reputation || 0}</span>
            <span className="profile-stat-label">Reputation</span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="profile-section animate-fade-in-up stagger-3">
          <h3 className="profile-section-title">Edit Profile</h3>
          {message && <div className="profile-message">{message}</div>}
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Email cannot be changed</small>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="profile-section animate-fade-in-up stagger-4">
          <h3 className="profile-section-title">Account Details</h3>
          <div className="profile-detail-grid">
            <div className="profile-detail">
              <span className="profile-detail-label">Account Type</span>
              <span className="profile-detail-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            <div className="profile-detail">
              <span className="profile-detail-label">Joined</span>
              <span className="profile-detail-value">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="profile-detail">
              <span className="profile-detail-label">Subscription</span>
              <span className="profile-detail-value">{user.subscription?.isActive ? 'Active' : 'None'}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="profile-section danger-zone animate-fade-in-up stagger-5">
          <h3 className="profile-section-title">Session</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Logging out will end your current session on this device.
          </p>
          <button className="btn btn-secondary" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <style jsx>{`
        .back-link {
          display: inline-block;
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--wine-400); }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          margin-bottom: 20px;
        }

        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: white;
          border: 3px solid var(--border-accent);
          flex-shrink: 0;
        }

        .profile-info h2 {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .profile-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .profile-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
        }

        .profile-stat-icon { font-size: 1.5rem; }

        .profile-stat-value {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .profile-stat-label {
          font-size: 0.7rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .profile-section {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 28px;
          margin-bottom: 20px;
        }

        .profile-section-title {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-secondary);
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .profile-message {
          padding: 10px 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: var(--radius-md);
          color: #60a5fa;
          font-size: 0.85rem;
          margin-bottom: 12px;
        }

        .profile-detail-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .profile-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-primary);
        }

        .profile-detail:last-child { border-bottom: none; }

        .profile-detail-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .profile-detail-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .danger-zone {
          border-color: rgba(239, 68, 68, 0.15);
        }
      `}</style>
    </div>
  );
}
