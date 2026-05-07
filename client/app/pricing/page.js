'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';
import CircuBitIcon from '@/components/CircuBitIcon';

export default function PricingPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchActiveSub();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const data = await ApiClient.getPlans();
      setPlans(data.plans);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveSub = async () => {
    try {
      const data = await ApiClient.getActiveSubscription();
      setActiveSub(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscribe = async (planKey) => {
    setLoading(true);
    setMessage('');
    try {
      const data = await ApiClient.createSubscription(planKey);
      setMessage(data.message);
      await refreshUser();
      await fetchActiveSub();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (days) => {
    setLoading(true);
    setMessage('');
    try {
      const data = await ApiClient.extendSubscription(days);
      setMessage(data.message);
      await refreshUser();
      await fetchActiveSub();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  const planData = [
    { key: 'monthly', tenure: 30, amount: 299, label: 'Monthly', popular: true },
    { key: '15days', tenure: 15, amount: 229, label: '15 Days' },
    { key: '10days', tenure: 10, amount: 179, label: '10 Days' },
    { key: '5days', tenure: 5, amount: 99, label: '5 Days' },
    { key: '3days', tenure: 3, amount: 69, label: '3 Days' },
    { key: '1day', tenure: 1, amount: 29, label: '1 Day' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-fade-in-up" style={{ textAlign: 'center' }}>
          <h1 className="page-title">💎 Subscription Plans</h1>
          <p className="page-subtitle">Unlock premium study materials with flexible plans</p>
        </div>

        {/* Current Status */}
        {activeSub?.hasActive && (
          <div className="pricing-status animate-fade-in-up stagger-1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-green">
                  Active Plan: {activeSub.subscription.plan === 'monthly' ? 'Monthly' : `${activeSub.subscription.tenure} Days`}
                </span>
                <span className="badge badge-gold">Premium</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Expires: {new Date(activeSub.subscription.endDate).toLocaleDateString()}
                <span style={{ color: 'var(--wine-400)', marginLeft: '8px', fontWeight: 600 }}>
                  ({Math.max(0, Math.ceil((new Date(activeSub.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining)
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.8 }}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await ApiClient.debugRemoveSubscription();
                    await refreshUser();
                    await fetchActiveSub();
                    setMessage('Debug: Subscription successfully removed');
                  } catch (err) {
                    setMessage(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                [Debug] Remove Subscription
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="pricing-message animate-fade-in-up">{message}</div>
        )}

        {/* Pricing Cards */}
        <div className="pricing-grid animate-fade-in-up stagger-2">
          {planData.map((plan) => (
            <div key={plan.key} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="pricing-popular">Most Popular</div>}
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">{plan.label}</h3>
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-price">{plan.amount}</span>
                </div>
                <div className="pricing-tenure">{plan.tenure} day{plan.tenure > 1 ? 's' : ''} access</div>
              </div>
              <ul className="pricing-features">
                <li>✅ All premium documents</li>
                <li>✅ Watermarked viewing</li>
                <li>✅ Priority support</li>
                <li>✅ Earn more CircuBits</li>
                {plan.tenure >= 10 && <li>✅ Bounty priority access</li>}
                {plan.tenure >= 30 && <li>✅ Extended token rewards</li>}
              </ul>
              <button
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                style={{ width: '100%' }}
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading}
              >
                {loading ? '...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        {/* CircuBits Extension */}
        {activeSub?.hasActive && (
          <div className="extend-section animate-fade-in-up stagger-3">
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CircuBitIcon size="24" style={{ color: 'var(--gold-400)' }} /> Extend with CircuBits
            </h2>
            <p className="section-subtitle" style={{ marginBottom: '24px' }}>
              Use your earned CircuBits to extend your subscription
            </p>
            <div className="extend-options">
              <button className="extend-card" onClick={() => handleExtend(1)} disabled={loading}>
                <span className="extend-days">+1 Day</span>
                <span className="extend-cost">10 CircuBits</span>
              </button>
              <button className="extend-card" onClick={() => handleExtend(3)} disabled={loading}>
                <span className="extend-days">+3 Days</span>
                <span className="extend-cost">25 CircuBits</span>
              </button>
              <button className="extend-card" onClick={() => handleExtend(5)} disabled={loading}>
                <span className="extend-days">+5 Days</span>
                <span className="extend-cost">40 CircuBits</span>
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              Your balance: <CircuBitIcon size="14" style={{ color: 'var(--gold-400)' }} /> {user.circuBits} CircuBits
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .pricing-status {
          text-align: center;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 32px;
        }

        .pricing-message {
          text-align: center;
          padding: 12px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: var(--radius-md);
          color: #60a5fa;
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }

        .pricing-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }

        .pricing-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
        }

        .pricing-card.popular {
          border-color: var(--wine-600);
          background: linear-gradient(to bottom, rgba(114, 47, 55, 0.1), var(--bg-card));
          box-shadow: var(--shadow-glow);
        }

        .pricing-popular {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 16px;
          background: var(--accent-gradient);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .pricing-card-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .pricing-plan-name {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .pricing-amount {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 4px;
        }

        .pricing-currency {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .pricing-price {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
        }

        .pricing-tenure {
          font-size: 0.8rem;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .pricing-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
          flex: 1;
        }

        .pricing-features li {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .extend-section {
          text-align: center;
          padding: 48px 0;
          margin-bottom: 40px;
        }

        .extend-options {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .extend-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: var(--font-primary);
        }

        .extend-card:hover {
          border-color: var(--gold-500);
          transform: translateY(-3px);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
        }

        .extend-card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .extend-days {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .extend-cost {
          font-size: 0.8rem;
          color: var(--gold-400);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (max-width: 1024px) and (min-width: 769px) {
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
