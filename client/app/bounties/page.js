'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';
import CircuBitIcon from '@/components/CircuBitIcon';

export default function BountiesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchBounties();
  }, [user]);

  const fetchBounties = async () => {
    try {
      const data = await ApiClient.getBounties();
      setBounties(data.bounties);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const daysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  if (authLoading || !user) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              Bounty Board
            </h1>
            <p className="page-subtitle">Companies are looking for specific documents — fulfill bounties and earn rewards</p>
          </div>
        </div>

        <div className="bounty-info animate-fade-in-up stagger-1">
          <div className="bounty-info-card">
            <span className="bounty-info-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            </span>
            <div>
              <strong>Earn Cash Rewards</strong>
              <p>Complete bounties posted by companies and get rewarded in real ₹</p>
            </div>
          </div>
          <div className="bounty-info-card">
            <span className="bounty-info-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--wine-400)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </span>
            <div>
              <strong>Upload & Submit</strong>
              <p>Create a document matching the requirements, then submit it</p>
            </div>
          </div>
          <div className="bounty-info-card">
            <span className="bounty-info-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4ade80' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </span>
            <div>
              <strong>Get Accepted</strong>
              <p>Once the company accepts your submission, you receive the reward</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner spinner-lg"></div></div>
        ) : bounties.length > 0 ? (
          <div className="bounties-list animate-fade-in-up stagger-2">
            {bounties.map(bounty => (
              <Link key={bounty._id} href={`/bounties/${bounty._id}`} className="bounty-card">
                <div className="bounty-card-left">
                  <div className="bounty-card-status">
                    <span className={`badge ${bounty.status === 'open' ? 'badge-green' : 'badge-wine'}`}>
                      {bounty.status}
                    </span>
                  </div>
                  <h3 className="bounty-card-title">{bounty.title}</h3>
                  <p className="bounty-card-desc">{bounty.description.substring(0, 150)}...</p>
                  <div className="bounty-card-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                      {bounty.companyId?.name || 'Company'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      {bounty.subject}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {daysLeft(bounty.deadline)}
                    </span>
                  </div>
                </div>
                <div className="bounty-card-right">
                  <div className="bounty-reward">
                    <span className="bounty-reward-amount">₹{bounty.userReward}</span>
                    <span className="bounty-reward-label">Your Reward</span>
                  </div>
                  <div className="bounty-submissions">
                    {bounty.submissions?.length || 0} / {bounty.maxSubmissions} submissions
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state animate-fade-in-up stagger-2">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--wine-400)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div className="empty-state-title">No bounties available</div>
            <div className="empty-state-text">Check back later for new bounties from companies</div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bounty-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .bounty-info-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
        }

        .bounty-info-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .bounty-info-card strong {
          font-size: 0.9rem;
        }

        .bounty-info-card p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .bounties-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }

        .bounty-card {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 28px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .bounty-card:hover {
          border-color: var(--border-accent);
          transform: translateX(4px);
          box-shadow: var(--shadow-glow);
        }

        .bounty-card-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0; /* allows text truncation */
        }

        .bounty-card-status {
          margin-bottom: 8px;
        }

        .bounty-card-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .bounty-card-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          width: 100%;
        }

        .bounty-card-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-dim);
          flex-wrap: wrap;
        }

        .bounty-card-right {
          display: flex;
          flex-direction: column;
          align-items: center; /* keep reward text centered within its own column */
          justify-content: center;
          min-width: 120px;
        }

        .bounty-reward {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 8px;
        }

        .bounty-reward-amount {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 900;
          color: var(--gold-400);
        }

        .bounty-reward-label {
          font-size: 0.7rem;
          color: var(--gold-500);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bounty-submissions {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .bounty-info {
            grid-template-columns: 1fr;
          }

          .bounty-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .bounty-card-right {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 16px;
            border-top: 1px solid var(--border-primary);
          }

          .bounty-reward {
            flex-direction: row;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
