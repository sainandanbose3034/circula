'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';

export default function CompanyPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState('login'); // login, register, dashboard
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Dashboard State
  const [dashTab, setDashTab] = useState('my_bounties'); // my_bounties, create
  const [myBounties, setMyBounties] = useState([]);
  const [reviewingBounty, setReviewingBounty] = useState(null);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDesc, setRegDesc] = useState('');
  const [regWebsite, setRegWebsite] = useState('');
  const [regIndustry, setRegIndustry] = useState('');

  // Bounty creation
  const [bountyTitle, setBountyTitle] = useState('');
  const [bountyDesc, setBountyDesc] = useState('');
  const [bountyReq, setBountyReq] = useState('');
  const [bountySubject, setBountySubject] = useState('');
  const [bountyReward, setBountyReward] = useState(50);
  const [bountyDeadline, setBountyDeadline] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('circula_company_token');
    const saved = localStorage.getItem('circula_company');
    if (token && saved) {
      setCompany(JSON.parse(saved));
      setActiveView('dashboard');
    }
  }, []);

  useEffect(() => {
    let interval;
    if (activeView === 'dashboard') {
      fetchMyBounties();
      interval = setInterval(fetchMyBounties, 10000); // Poll every 10s for real-time feel
    }
    return () => clearInterval(interval);
  }, [activeView]);

  const fetchMyBounties = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getCompanyBounties();
      setMyBounties(data.bounties);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await ApiClient.companyLogin(loginEmail, loginPassword);
      localStorage.setItem('circula_company_token', data.token);
      localStorage.setItem('circula_company', JSON.stringify(data.company));
      setCompany(data.company);
      setActiveView('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ApiClient.companyRegister({
        name: regName,
        email: regEmail,
        password: regPassword,
        description: regDesc,
        website: regWebsite,
        industry: regIndustry,
      });
      setMessage('Registration submitted! Your account is pending admin approval.');
      setActiveView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBounty = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ApiClient.createBounty({
        title: bountyTitle,
        description: bountyDesc,
        requirements: bountyReq,
        subject: bountySubject,
        reward: parseInt(bountyReward),
        deadline: bountyDeadline,
      });
      setMessage('Bounty created successfully!');
      setBountyTitle('');
      setBountyDesc('');
      setBountyReq('');
      setBountySubject('');
      setBountyReward(50);
      setBountyDeadline('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (bountyId, submissionIndex, status) => {
    try {
      await ApiClient.reviewBountySubmission(bountyId, submissionIndex, status, '');
      await fetchMyBounties(); // Await the refresh
      // Update local viewing state
      if (reviewingBounty && reviewingBounty._id === bountyId) {
        const updated = { ...reviewingBounty };
        updated.submissions[submissionIndex].status = status;
        if (status === 'accepted') updated.status = 'fulfilled';
        setReviewingBounty(updated);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBounty = async (bountyId) => {
    if (!confirm('Are you sure you want to delete this bounty?')) return;
    try {
      await ApiClient.deleteBounty(bountyId);
      await fetchMyBounties();
      setMessage('Bounty deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('circula_company_token');
    localStorage.removeItem('circula_company');
    setCompany(null);
    setActiveView('login');
  };

  return (
    <div className="page-wrapper">
      <div className="container container-md">
        {activeView === 'login' && (
          <div className="company-auth animate-fade-in-up">
            <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="badge badge-gold" style={{ marginBottom: '12px' }}>B2B PORTAL</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Company Login</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Access your bounty management dashboard</p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="pricing-message">{message}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Company Email</label>
                <input type="email" className="form-input" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-premium btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? '...' : 'Sign In →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              New company?{' '}
              <button className="btn btn-ghost" onClick={() => { setActiveView('register'); setError(''); }}>Register</button>
            </p>
          </div>
        )}

        {activeView === 'register' && (
          <div className="company-auth animate-fade-in-up">
            <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="badge badge-gold" style={{ marginBottom: '12px' }}>B2B PORTAL</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Register Company</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Requires admin approval</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input type="text" className="form-input" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input type="text" className="form-input" placeholder="e.g., Education, Tech" value={regIndustry} onChange={e => setRegIndustry(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input type="url" className="form-input" placeholder="https://..." value={regWebsite} onChange={e => setRegWebsite(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Company Description</label>
                <textarea className="form-input form-textarea" value={regDesc} onChange={e => setRegDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-premium btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? '...' : 'Submit for Approval'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button className="btn btn-ghost" onClick={() => { setActiveView('login'); setError(''); }}>Login</button>
            </p>
          </div>
        )}

        {activeView === 'dashboard' && company && (
          <div className="animate-fade-in-up">
            <div className="dash-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                  {company.name}
                </h1>
                <p className="page-subtitle">Company Dashboard — B2B Bounty Management</p>
              </div>
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-primary)', marginBottom: '32px' }}>
              <button className={`tab-btn ${dashTab === 'my_bounties' ? 'active' : ''}`} onClick={() => { setDashTab('my_bounties'); setReviewingBounty(null); }}>Active Bounties</button>
              <button className={`tab-btn ${dashTab === 'create' ? 'active' : ''}`} onClick={() => { setDashTab('create'); setReviewingBounty(null); }}>Create Bounty</button>
            </div>

            {message && <div className="pricing-message" style={{ marginBottom: '24px' }}>{message}</div>}
            {error && <div className="auth-error" style={{ marginBottom: '24px' }}>{error}</div>}

            {dashTab === 'my_bounties' && (
              <div>
                {!reviewingBounty ? (
                  myBounties.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {myBounties.map(b => (
                        <div key={b._id} className="card-flat" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ marginBottom: '8px' }}>
                              <span className={`badge ${b.status === 'open' ? 'badge-green' : 'badge-wine'}`}>{b.status.toUpperCase()}</span>
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '4px' }}>{b.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.submissions.length} / {b.maxSubmissions} Submissions</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" onClick={() => setReviewingBounty(b)}>View Submissions</button>
                            <button className="btn btn-secondary" onClick={() => handleDeleteBounty(b._id)} style={{ padding: '8px', borderColor: 'var(--wine-600)', color: 'var(--wine-400)' }} title="Delete Bounty"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--wine-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
                      <div className="empty-state-title">No bounties posted</div>
                      <div className="empty-state-text">Create your first bounty to start sourcing documents</div>
                    </div>
                  )
                ) : (
                  <div className="card-flat" style={{ padding: '32px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setReviewingBounty(null)} style={{ marginBottom: '24px' }}>← Back to Bounties</button>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '8px' }}>{reviewingBounty.title}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>{reviewingBounty.description}</p>
                    
                    <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px', marginBottom: '20px' }}>Submissions</h3>
                    {reviewingBounty.submissions.length > 0 ? (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {reviewingBounty.submissions.map((sub, idx) => (
                          <div key={idx} className="card-flat" style={{ padding: '20px', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{sub.userId?.name || 'User'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{sub.documentId?.title} (Score: {sub.documentId?.confidenceScore})</div>
                              <span className={`badge ${sub.status === 'accepted' ? 'badge-green' : sub.status === 'rejected' ? 'badge-red' : 'badge-wine'}`}>{sub.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <a href={ApiClient.getCompanyDocumentViewUrl(sub.documentId?._id)} target="_blank" className="btn btn-secondary btn-sm" rel="noreferrer">Preview PDF</a>
                              {sub.status === 'pending' && reviewingBounty.status !== 'fulfilled' && (
                                <>
                                  <button className="btn btn-primary btn-sm" onClick={() => handleReview(reviewingBounty._id, idx, 'accepted')}>Accept</button>
                                  <button className="btn btn-ghost btn-sm" style={{ color: '#f87171' }} onClick={() => handleReview(reviewingBounty._id, idx, 'rejected')}>Reject</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No submissions yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {dashTab === 'create' && (
              <div className="card-flat" style={{ padding: '36px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  Create New Bounty
                </h2>
                <form onSubmit={handleCreateBounty} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Bounty Title *</label>
                    <input type="text" className="form-input" placeholder="e.g., Machine Learning Notes - Chapter 5-8" value={bountyTitle} onChange={e => setBountyTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea className="form-input form-textarea" placeholder="Describe what you need in detail..." value={bountyDesc} onChange={e => setBountyDesc(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Requirements</label>
                    <textarea className="form-input form-textarea" placeholder="Specific requirements, format, etc." value={bountyReq} onChange={e => setBountyReq(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                      <label className="form-label">Subject *</label>
                      <input type="text" className="form-input" value={bountySubject} onChange={e => setBountySubject(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                      <label className="form-label">Reward (₹) *</label>
                      <input type="number" className="form-input" min="1" value={bountyReward} onChange={e => setBountyReward(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                      <label className="form-label">Deadline *</label>
                      <input type="date" className="form-input" value={bountyDeadline} onChange={e => setBountyDeadline(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-premium btn-lg" disabled={loading}>
                    {loading ? '...' : 'Post Bounty'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .company-auth {
          max-width: 480px;
          margin: 0 auto;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-2xl);
          padding: 48px 40px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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

        .pricing-message {
          padding: 12px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: var(--radius-md);
          color: #60a5fa;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 12px 16px;
          color: var(--text-dim);
          font-weight: 600;
          font-family: var(--font-display);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: var(--text-secondary);
        }

        .tab-btn.active {
          color: var(--wine-400);
          border-bottom-color: var(--wine-400);
        }
      `}</style>
    </div>
  );
}
