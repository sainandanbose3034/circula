'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';

export default function AdminRevenuePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/documents');
      } else {
        fetchStats();
      }
    }
  }, [user, authLoading]);

  const fetchStats = async () => {
    try {
      const data = await ApiClient.getAdminRevenueStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  if (!stats) return null;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            Revenue Tracker
          </h1>
          <p className="page-subtitle">Platform-wide financial performance and earnings distribution</p>
        </div>

        <div className="revenue-grid animate-fade-in-up stagger-1">
          <div className="revenue-card highlight">
            <span className="revenue-label">Total Platform Revenue</span>
            <span className="revenue-value">₹{stats.summary.totalRevenue.toFixed(2)}</span>
            <span className="revenue-trend">All-time earnings</span>
          </div>
          <div className="revenue-card">
            <span className="revenue-label">Bounty Commissions</span>
            <span className="revenue-value">₹{stats.summary.bountyCommissions.toFixed(2)}</span>
            <span className="revenue-trend">35% Service Fee</span>
          </div>
          <div className="revenue-card">
            <span className="revenue-label">Subscriptions</span>
            <span className="revenue-value">₹{stats.summary.subscriptionRevenue.toFixed(2)}</span>
            <span className="revenue-trend">Direct User Payments</span>
          </div>
        </div>

        <div className="stats-row animate-fade-in-up stagger-2">
          <div className="stat-box">
            <span className="stat-num">{stats.summary.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{stats.summary.premiumUsers}</span>
            <span className="stat-label">Premium Members</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{stats.summary.fulfilledBounties} / {stats.summary.totalBounties}</span>
            <span className="stat-label">Bounties Fulfilled</span>
          </div>
        </div>

        <div className="transactions-section animate-fade-in-up stagger-3">
          <h2 className="section-title">Recent Transactions</h2>
          <div className="card-flat" style={{ overflowX: 'auto' }}>
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${tx.type === 'bounty_commission' ? 'badge-wine' : 'badge-green'}`}>
                          {tx.type === 'bounty_commission' ? 'Bounty Platform Fee' : 'Service Subscription'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{tx.amount.toFixed(2)}</td>
                      <td>{tx.sourceModel}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .revenue-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .revenue-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: 28px;
          display: flex;
          flex-direction: column;
        }

        .revenue-card.highlight {
          border-color: var(--gold-400);
          background: linear-gradient(145deg, var(--bg-card) 0%, rgba(201, 148, 88, 0.05) 100%);
        }

        .revenue-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .revenue-value {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .revenue-card.highlight .revenue-value {
          color: var(--gold-400);
        }

        .revenue-trend {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }

        .stat-box {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 20px;
          text-align: center;
        }

        .stat-num {
          display: block;
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .revenue-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        .revenue-table th {
          text-align: left;
          padding: 16px;
          font-size: 0.8rem;
          color: var(--text-dim);
          border-bottom: 1px solid var(--border-primary);
          background: rgba(0,0,0,0.05);
        }

        .revenue-table td {
          padding: 16px;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--border-primary);
        }

        @media (max-width: 1024px) {
          .revenue-grid, .stats-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
