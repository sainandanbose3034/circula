'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';

export default function UploadPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList);
    setFiles(arr);
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
    setError('');
    setResult(null);

    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    if (!title || !subject) {
      setError('Title and subject are required');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', subject);
      formData.append('tags', tags);
      formData.append('isPremium', isPremium);
      files.forEach(f => formData.append('files', f));

      const data = await ApiClient.uploadDocument(formData);
      setResult(data);
      await refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="container container-md">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">📤 Upload Document</h1>
          <p className="page-subtitle">Share your study materials and earn CircuBits</p>
        </div>

        {/* CircuBits Earning Banner */}
        <div className="circubits-banner animate-fade-in-up">
          <div className="circubits-banner-header">
            <span className="circubits-banner-icon">⚡</span>
            <div>
              <strong>Earn CircuBits with Every Upload!</strong>
              <p>Upload quality documents and get rewarded instantly based on your confidence score</p>
            </div>
          </div>
          <div className="circubits-tiers">
            <div className="circubits-tier">
              <span className="tier-score">85+</span>
              <span className="tier-reward">+12 ⚡</span>
            </div>
            <div className="circubits-tier">
              <span className="tier-score">70-84</span>
              <span className="tier-reward">+8 ⚡</span>
            </div>
            <div className="circubits-tier">
              <span className="tier-score">60-69</span>
              <span className="tier-reward">+5 ⚡</span>
            </div>
            <div className="circubits-tier">
              <span className="tier-score">40-59</span>
              <span className="tier-reward">+2 ⚡</span>
            </div>
          </div>
        </div>

        {result ? (
          <div className="upload-result animate-fade-in-up">
            <div className="upload-success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4ade80' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>Upload Successful!</h2>
            <div className="upload-result-stats">
              <div className="upload-result-stat">
                <span className="upload-result-label">Confidence Score</span>
                <span className="upload-result-value">{result.scoring?.totalScore || 0}/100</span>
              </div>
              <div className="upload-result-stat">
                <span className="upload-result-label">CircuBits Earned</span>
                <span className="upload-result-value circubits">⚡ {result.circuBitsEarned || 0}</span>
              </div>
              <div className="upload-result-stat">
                <span className="upload-result-label">New Balance</span>
                <span className="upload-result-value">{result.newBalance} CircuBits</span>
              </div>
            </div>

            {result.scoring?.breakdown && (
              <div className="upload-breakdown">
                <h3>Score Breakdown</h3>
                {Object.entries(result.scoring.breakdown).map(([key, value]) => (
                  <div key={key} className="breakdown-row">
                    <span className="breakdown-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-bar-fill" style={{ width: `${(value / 25) * 100}%` }}></div>
                    </div>
                    <span className="breakdown-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="upload-result-actions">
              <button className="btn btn-primary" onClick={() => { setResult(null); setFiles([]); setTitle(''); setDescription(''); }}>
                Upload Another
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/documents')}>
                Browse Documents
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="upload-form animate-fade-in-up stagger-1">
            {error && <div className="auth-error">{error}</div>}

            {/* Drop Zone */}
            <div
              className={`upload-dropzone ${dragActive ? 'active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif"
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
              />
              {files.length > 0 ? (
                <div className="upload-files-list">
                  <div className="upload-files-icon">📎</div>
                  <div className="upload-files-info">
                    <strong>{files.length} file(s) selected</strong>
                    <div className="upload-files-names">
                      {files.map((f, i) => (
                        <span key={i} className="upload-file-name">{f.name}</span>
                      ))}
                    </div>
                  </div>
                  <span className="upload-files-change">Click to change</span>
                </div>
              ) : (
                <>
                  <div className="upload-dropzone-icon">📁</div>
                  <div className="upload-dropzone-text">
                    <strong>Drag & drop files here</strong>
                    <span>or click to browse</span>
                  </div>
                  <div className="upload-dropzone-hint">
                    PDF, DOCX, PPTX, or images (JPG, PNG, WebP) • Max 50MB
                    <br />
                    <small>Multiple images will be combined into a single PDF</small>
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Document Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Advanced Data Structures Notes - Semester 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe the content, topics covered, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="upload-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Computer Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., algorithms, trees, graphs"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="upload-premium-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                />
                <span className="toggle-switch"></span>
                <span>Mark as Premium Content 💎</span>
              </label>
              <small>Premium content is only accessible to paid users or via CircuBits</small>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={uploading}>
              {uploading ? (
                <><span className="spinner"></span> Uploading & Analyzing...</>
              ) : (
                '⬆️ Upload Document'
              )}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .upload-form {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .upload-dropzone {
          border: 2px dashed var(--border-secondary);
          border-radius: var(--radius-lg);
          padding: 48px 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-dropzone:hover,
        .upload-dropzone.active {
          border-color: var(--wine-500);
          background: rgba(114, 47, 55, 0.05);
        }

        .upload-dropzone.has-files {
          border-style: solid;
          border-color: var(--wine-600);
          padding: 24px;
        }

        .upload-dropzone-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .upload-dropzone-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .upload-dropzone-hint {
          font-size: 0.8rem;
          color: var(--text-dim);
        }

        .upload-files-list {
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
        }

        .upload-files-icon {
          font-size: 2rem;
        }

        .upload-files-info {
          flex: 1;
        }

        .upload-files-names {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }

        .upload-file-name {
          font-size: 0.75rem;
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
        }

        .upload-files-change {
          font-size: 0.8rem;
          color: var(--wine-400);
        }

        .upload-row {
          display: flex;
          gap: 16px;
        }

        .upload-premium-toggle {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .upload-premium-toggle small {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-left: 52px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .toggle-label input {
          display: none;
        }

        .toggle-switch {
          width: 40px;
          height: 22px;
          background: var(--bg-secondary);
          border-radius: 11px;
          position: relative;
          transition: background 0.3s ease;
          border: 1px solid var(--border-primary);
        }

        .toggle-switch::after {
          content: '';
          width: 16px;
          height: 16px;
          background: var(--text-muted);
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s ease;
        }

        .toggle-label input:checked + .toggle-switch {
          background: var(--wine-700);
          border-color: var(--wine-600);
        }

        .toggle-label input:checked + .toggle-switch::after {
          left: 20px;
          background: var(--gold-400);
        }

        .auth-error {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          color: #f87171;
          font-size: 0.85rem;
        }

        /* Upload Result */
        .upload-result {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: 48px;
          text-align: center;
        }

        .upload-success-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .upload-result h2 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 32px;
        }

        .upload-result-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .upload-result-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .upload-result-label {
          font-size: 0.8rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .upload-result-value {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
        }

        .upload-result-value.circubits {
          color: var(--gold-400);
        }

        .upload-breakdown {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 32px;
          text-align: left;
        }

        .upload-breakdown h3 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-secondary);
        }

        .breakdown-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .breakdown-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          min-width: 140px;
          text-transform: capitalize;
        }

        .breakdown-value {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          min-width: 24px;
          text-align: right;
        }

        .upload-result-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        /* CircuBits Earning Banner */
        .circubits-banner {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.04));
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-xl);
          padding: 24px 28px;
          margin-bottom: 24px;
        }

        .circubits-banner-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 16px;
        }

        .circubits-banner-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .circubits-banner-header strong {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: var(--gold-400);
        }

        .circubits-banner-header p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .circubits-tiers {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .circubits-tier {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: var(--radius-md);
        }

        .tier-score {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .tier-reward {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 900;
          color: var(--gold-400);
        }

        @media (max-width: 640px) {
          .upload-form {
            padding: 24px;
          }

          .upload-row {
            flex-direction: column;
          }

          .circubits-tiers {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
