'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ApiClient from '@/lib/api';
import CircuBitIcon from '@/components/CircuBitIcon';

export default function CircuBitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const data = await ApiClient.getTransactionHistory({ limit: 50 });
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="container container-md">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>

        <div className="page-header animate-fade-in-up">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CircuBitIcon size="32" style={{ color: 'var(--gold-400)' }} /> CircuBits</h1>
          <p className="page-subtitle">Your token balance, history, and ways to earn & spend</p>
        </div>

        {/* Balance Card */}
        <div className="cb-balance-card animate-fade-in-up stagger-1">
          <div className="cb-balance-main">
            <span className="cb-balance-label">Current Balance</span>
            <span className="cb-balance-amount">{user.circuBits || 0}</span>
            <span className="cb-balance-unit">CircuBits</span>
          </div>
          <div className="cb-balance-divider"></div>
          <div className="cb-balance-info">
            <p>CircuBits are earned by uploading quality documents and completing bounties. Use them to unlock premium content or extend your subscription.</p>
            <small>⚠️ CircuBits cannot be converted to real currency</small>
          </div>
        </div>

        {/* Earn & Spend */}
        <div className="cb-actions-grid animate-fade-in-up stagger-2">
          <div className="cb-action-section">
            <h3 className="cb-action-title earn" style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> 
              Ways to Earn
            </h3>
            <div className="cb-action-items">
              <div className="cb-action-item">
                <span className="cb-action-desc">Upload a document (score 85+)</span>
                <span className="cb-action-amount positive">+12</span>
              </div>
              <div className="cb-action-item">
                <span className="cb-action-desc">Upload a document (score 70-84)</span>
                <span className="cb-action-amount positive">+8</span>
              </div>
              <div className="cb-action-item">
                <span className="cb-action-desc">Upload a document (score 60-69)</span>
                <span className="cb-action-amount positive">+5</span>
              </div>
              <div className="cb-action-item">
                <span className="cb-action-desc">Complete a bounty</span>
                <span className="cb-action-amount positive">Varies</span>
              </div>
            </div>
            <Link href="/upload" className="btn btn-primary btn-sm" style={{ marginTop: '16px', width: '100%', textAlign: 'center' }}>
              Upload a Document →
            </Link>
          </div>

          <div className="cb-action-section">
            <h3 className="cb-action-title spend" style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> 
              Ways to Spend
            </h3>
            <div className="cb-action-items">
              <div className="cb-action-item">
                <span className="cb-action-desc">Unlock premium document</span>
                <span className="cb-action-amount negative">−3</span>
              </div>
              <div className="cb-action-item">
                <span className="cb-action-desc">Extend subscription +1 day</span>
                <span className="cb-action-amount negative">−10</span>
              </div>
              <div className="cb-action-item">
                <span className="cb-action-desc">Extend subscription +3 days</span>
                <span className="cb-action-amount negative">−25</span>
              </div>
              <div className="cb-action-item">
                <span className="cb-action-desc">Extend subscription +5 days</span>
                <span className="cb-action-amount negative">−40</span>
              </div>
            </div>
            <Link href="/pricing" className="btn btn-secondary btn-sm" style={{ marginTop: '16px', width: '100%', textAlign: 'center' }}>
              View Subscription Plans →
            </Link>
          </div>
        </div>

        {/* Transaction History */}
        <div className="cb-history animate-fade-in-up stagger-3">
          <h3 className="cb-history-title" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> 
            Transaction History
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></div>
          ) : transactions.length > 0 ? (
            <div className="cb-tx-list">
              {transactions.map(tx => (
                <div key={tx._id} className="cb-tx-row">
                  <div className="cb-tx-left">
                    <span className={`cb-tx-badge ${tx.amount > 0 ? 'credit' : 'debit'}`}>
                      {tx.amount > 0 ? 'CREDIT' : 'DEBIT'}
                    </span>
                    <div className="cb-tx-info">
                      <span className="cb-tx-desc">{tx.description || tx.type?.replace(/_/g, ' ')}</span>
                      <span className="cb-tx-date">{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`cb-tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '48px 20px' }}>
              <div className="empty-state-icon"><CircuBitIcon size="36" style={{ color: 'var(--gold-400)' }} /></div>
              <div className="empty-state-title">No transactions yet</div>
              <div className="empty-state-text">Upload your first document to start earning CircuBits</div>
            </div>
          )}
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

        .cb-balance-card {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 36px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.03));
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-xl);
          margin-bottom: 24px;
        }

        .cb-balance-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          min-width: 160px;
        }

        .cb-balance-label {
          font-size: 0.75rem;
          color: var(--gold-500);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .cb-balance-amount {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 900;
          color: var(--gold-400);
          line-height: 1.1;
        }

        .cb-balance-unit {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .cb-balance-divider {
          width: 1px;
          height: 80px;
          background: rgba(245, 158, 11, 0.2);
        }

        .cb-balance-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .cb-balance-info small {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .cb-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .cb-action-section {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .cb-action-title {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .cb-action-title.earn { color: #4ade80; }
        .cb-action-title.spend { color: var(--wine-400); }

        .cb-action-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cb-action-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }

        .cb-action-desc {
          color: var(--text-muted);
        }

        .cb-action-amount {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .cb-action-amount.positive { color: #4ade80; }
        .cb-action-amount.negative { color: #f87171; }

        .cb-history {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 28px;
          margin-bottom: 40px;
        }

        .cb-history-title {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .cb-tx-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cb-tx-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
        }

        .cb-tx-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cb-tx-badge {
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .cb-tx-badge.credit {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .cb-tx-badge.debit {
          background: rgba(248, 113, 113, 0.1);
          color: #f87171;
        }

        .cb-tx-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .cb-tx-date {
          font-size: 0.7rem;
          color: var(--text-dim);
          display: block;
          margin-top: 2px;
        }

        .cb-tx-amount {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1rem;
        }

        .cb-tx-amount.positive { color: #4ade80; }
        .cb-tx-amount.negative { color: #f87171; }

        @media (max-width: 768px) {
          .cb-balance-card {
            flex-direction: column;
            text-align: center;
          }
          .cb-balance-divider {
            width: 80%;
            height: 1px;
          }
          .cb-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
