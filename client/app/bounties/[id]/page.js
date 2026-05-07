'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import ApiClient from '@/lib/api';

export default function BountyDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Upload form state
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDesc, setSubmitDesc] = useState('');
  const [submitSubject, setSubmitSubject] = useState('');
  const [submitFiles, setSubmitFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user && id) {
      fetchBounty();
    }
  }, [user, id]);

  const fetchBounty = async () => {
    try {
      const data = await ApiClient.getBounty(id);
      setBounty(data.bounty);
      // Pre-fill subject from bounty
      if (data.bounty?.subject) {
        setSubmitSubject(data.bounty.subject);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = (fileList) => {
    setSubmitFiles(Array.from(fileList));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitFiles.length === 0) {
      setError('Please select a file to upload');
      return;
    }
    if (!submitTitle || !submitSubject) {
      setError('Title and subject are required');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', submitTitle);
      formData.append('description', submitDesc);
      formData.append('subject', submitSubject);
      submitFiles.forEach(f => formData.append('files', f));

      const data = await ApiClient.submitToBounty(id, formData);
      setMessage(data.message || 'Submission successful!');
      setSubmitTitle('');
      setSubmitDesc('');
      setSubmitFiles([]);
      await fetchBounty();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  if (!bounty) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--wine-400)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div className="empty-state-title">Bounty not found</div>
            <button className="btn btn-primary" onClick={() => router.push('/bounties')}>Back to Bounties</button>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(bounty.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
  const hasAlreadySubmitted = bounty.submissions?.some(s => s.userId?._id === user?._id);

  return (
    <div className="page-wrapper">
      <div className="container container-md">
        <button className="btn btn-ghost btn-sm" onClick={() => router.push('/bounties')} style={{ marginBottom: '16px' }}>
          ← Back to Bounties
        </button>

        <div className="bounty-detail animate-fade-in-up">
          <div className="bounty-detail-header">
            <div>
              <span className={`badge ${bounty.status === 'open' ? 'badge-green' : 'badge-wine'}`}>
                {bounty.status.toUpperCase()}
              </span>
              <h1 className="bounty-detail-title">{bounty.title}</h1>
              <div className="bounty-detail-meta">
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
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                </span>
              </div>
            </div>
            <div className="bounty-detail-reward">
              <span className="reward-amount">₹{bounty.userReward}</span>
              <span className="reward-label">Your Reward</span>
            </div>
          </div>

          <div className="bounty-detail-body">
            <div className="bounty-section">
              <h3>Description</h3>
              <p>{bounty.description}</p>
            </div>

            {bounty.requirements && (
              <div className="bounty-section">
                <h3>Requirements</h3>
                <p>{bounty.requirements}</p>
              </div>
            )}

            <div className="bounty-section">
              <h3>Submissions ({bounty.submissions?.length || 0} / {bounty.maxSubmissions})</h3>
              {bounty.submissions && bounty.submissions.length > 0 ? (
                <div className="submission-list">
                  {bounty.submissions.map((sub, i) => (
                    <div key={i} className="submission-item">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {sub.userId?.name || 'User'}
                      </span>
                      <span className={`badge ${sub.status === 'accepted' ? 'badge-green' : sub.status === 'rejected' ? 'badge-red' : 'badge-wine'}`}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-submissions">No submissions yet. Be the first!</p>
              )}
            </div>
          </div>

          {/* Submit Section — Direct File Upload */}
          {bounty.status === 'open' && daysLeft > 0 && !hasAlreadySubmitted && (
            <div className="bounty-submit-section">
              <h3>📤 Upload Your Submission</h3>
              <p>Upload a document directly to the company. This file will <strong>not</strong> be added to the public Circula database. Only unique documents not already in the database are accepted.</p>

              <div className="bounty-reward-callout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                <span>If accepted, you'll earn <strong>₹{bounty.userReward}</strong></span>
              </div>

              {message && <div className="submit-success">{message}</div>}
              {error && <div className="submit-error">{error}</div>}

              <form onSubmit={handleSubmit} className="bounty-upload-form">
                {/* Drop Zone */}
                <div
                  className={`bounty-dropzone ${dragActive ? 'active' : ''} ${submitFiles.length > 0 ? 'has-files' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                  />
                  {submitFiles.length > 0 ? (
                    <div className="dropzone-files">
                      <span className="dropzone-file-icon">📎</span>
                      <div>
                        <strong>{submitFiles[0].name}</strong>
                        <br />
                        <small style={{ color: 'var(--text-dim)' }}>Click to change</small>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="dropzone-icon">📁</div>
                      <div><strong>Drop your document here</strong></div>
                      <div className="dropzone-hint">or click to browse · PDF, DOCX, images</div>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Document Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Machine Learning Notes Ch 5-8"
                    value={submitTitle}
                    onChange={(e) => setSubmitTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={submitSubject}
                    onChange={(e) => setSubmitSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Briefly describe the content..."
                    value={submitDesc}
                    onChange={(e) => setSubmitDesc(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={submitting || submitFiles.length === 0}
                >
                  {submitting ? (
                    <><span className="spinner"></span> Uploading & Submitting...</>
                  ) : (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Submit to Bounty</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Already submitted message */}
          {hasAlreadySubmitted && bounty.status === 'open' && (
            <div className="bounty-submit-section">
              <div className="submit-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div style={{ flex: 1 }}>You have already submitted to this bounty. The company will review your submission.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .bounty-detail {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .bounty-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 36px;
          border-bottom: 1px solid var(--border-primary);
          gap: 24px;
          flex-wrap: wrap;
        }

        .bounty-detail-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          margin: 12px 0;
        }

        .bounty-detail-meta {
          display: flex;
          gap: 20px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .bounty-detail-reward {
          text-align: center;
          padding: 20px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-lg);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .reward-amount {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--gold-400);
          display: block;
        }

        .reward-label {
          font-size: 0.75rem;
          color: var(--gold-500);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .reward-breakdown {
          font-size: 0.65rem;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .bounty-detail-body {
          padding: 36px;
        }

        .bounty-section {
          margin-bottom: 28px;
        }

        .bounty-section h3 {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }

        .bounty-section p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .submission-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .submission-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
        }

        .no-submissions {
          font-style: italic;
        }

        .bounty-submit-section {
          padding: 36px;
          border-top: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        .bounty-submit-section h3 {
          font-family: var(--font-display);
          font-weight: 700;
          margin-bottom: 4px;
        }

        .bounty-submit-section > p {
          font-size: 0.85rem;
          color: var(--text-dim);
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .bounty-reward-callout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          color: var(--gold-400);
          margin-bottom: 20px;
        }

        .bounty-upload-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bounty-dropzone {
          border: 2px dashed var(--border-secondary);
          border-radius: var(--radius-lg);
          padding: 36px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .bounty-dropzone:hover,
        .bounty-dropzone.active {
          border-color: var(--wine-500);
          background: rgba(114, 47, 55, 0.05);
        }

        .bounty-dropzone.has-files {
          border-style: solid;
          border-color: var(--wine-600);
          padding: 20px 24px;
        }

        .dropzone-icon {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }

        .dropzone-hint {
          font-size: 0.8rem;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .dropzone-files {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .dropzone-file-icon {
          font-size: 1.5rem;
        }

        .submit-success {
          padding: 14px 18px;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: var(--radius-md);
          color: #4ade80;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .submit-error {
          padding: 14px 18px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          color: #f87171;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .bounty-detail-header {
            padding: 24px;
          }

          .bounty-detail-body {
            padding: 24px;
          }

          .bounty-submit-section {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
