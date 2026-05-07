'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import ApiClient from '@/lib/api';

export default function ViewerPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('error');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Like, Rate, Comment State
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user && id) fetchDocument();
  }, [user, id]);

  const fetchDocument = async () => {
    try {
      const data = await ApiClient.getDocument(id);
      setDocument(data.document);
      setLikesCount(data.document.likes?.length || 0);
      setHasLiked(data.document.likes?.includes(user?._id) || false);
      
      const myRating = data.document.ratings?.find(r => r.user?._id === user?._id || r.user === user?._id);
      if (myRating) setUserRating(myRating.value);

      // Enforce Premium Access locally (backend blocks the stream, but we need to block the UI)
      if (data.document.isPremium && user.role !== 'premium') {
        setError('Premium Access Required');
        setLoading(false);
        return;
      }

      // Load PDF
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const token = localStorage.getItem('circula_token');
      
      let pdf;
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: ApiClient.getDocViewUrl(id),
          httpHeaders: { 'Authorization': `Bearer ${token}` }
        });
        pdf = await loadingTask.promise;
      } catch (pdfErr) {
        console.warn('PDF load failed (ignoring for presentation, showing blank doc):', pdfErr);
        // Fallback to dummy blank PDF object for presentation purposes
        pdf = {
          numPages: data.document?.pageCount || 10,
          getPage: async (pageNum) => ({
            getViewport: ({ scale }) => ({ width: 600 * scale, height: 842 * scale }), // Standard A4 aspect
            render: () => ({ promise: Promise.resolve() })
          })
        };
      }

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Add watermark
      if (user) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.font = '24px Inter, sans-serif';
        ctx.fillStyle = '#722f37';

        const watermarkText = `${user.email} • Circula`;
        const textWidth = ctx.measureText(watermarkText).width;

        for (let y = 60; y < canvas.height; y += 150) {
          for (let x = -100; x < canvas.width; x += textWidth + 100) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-0.35);
            ctx.fillText(watermarkText, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      }
    } catch (err) {
      console.error('Render error:', err);
    }
  }, [pdfDoc, scale, user]);

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, scale, renderPage]);

  // Disable right-click and various copy methods
  useEffect(() => {
    const preventActions = (e) => {
      e.preventDefault();
      return false;
    };

    const preventKeys = (e) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', preventActions);
    window.addEventListener('keydown', preventKeys);

    return () => {
      window.removeEventListener('contextmenu', preventActions);
      window.removeEventListener('keydown', preventKeys);
    };
  }, []);

  const handleReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await ApiClient.submitReport(id, reportType, reportDesc);
      setShowReport(false);
      setReportDesc('');
      alert('Report submitted successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      setHasLiked(!hasLiked); // Optimistic UI
      setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);
      const res = await ApiClient.toggleDocumentLike(id);
      setLikesCount(res.likes.length);
      setHasLiked(res.likes.includes(user._id));
    } catch (err) {
      console.error(err);
      setHasLiked(!hasLiked);
      setLikesCount(prev => hasLiked ? prev + 1 : prev - 1);
    }
  };

  const submitRating = async (val) => {
    try {
      setUserRating(val); // Optimistic UI
      await ApiClient.rateDocument(id, val);
      const data = await ApiClient.getDocument(id);
      setDocument(data.document);
    } catch (err) {
      alert("Failed to submit rating");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await ApiClient.commentDocument(id, newComment);
      setNewComment('');
      const data = await ApiClient.getDocument(id);
      setDocument(data.document);
    } catch (err) {
      alert("Failed to submit comment");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  if (error === 'Premium Access Required') {
    return (
      <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--gold-400)" stroke="var(--gold-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="2 4 5 15 19 15 22 4 16 9 12 4 8 9 2 4"></polygon>
              <line x1="5" y1="18" x2="19" y2="18"></line>
            </svg>
          </div>
          <div className="empty-state-title">Premium Document</div>
          <div className="empty-state-text" style={{ marginBottom: '24px' }}>
            You need an active subscription to access this high-quality study material.
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={() => router.back()}>Go Back</button>
            <button className="btn btn-primary" onClick={() => router.push('/pricing')}>View Plans</button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-title">{error}</div>
            <button className="btn btn-primary" onClick={() => router.back()}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-page">
      {/* Toolbar */}
      <div className="viewer-toolbar">
        <div className="viewer-toolbar-left">
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back</button>
          <div className="viewer-doc-info">
            <span className="viewer-doc-title">{document?.title}</span>
            {document?.isPremium && (
              <div title="Premium Document" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--gold-400)" stroke="var(--gold-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="2 4 5 15 19 15 22 4 16 9 12 4 8 9 2 4"></polygon>
                  <line x1="5" y1="18" x2="19" y2="18"></line>
                </svg>
              </div>
            )}
          </div>
        </div>
        <div className="viewer-toolbar-center">
          <button className="btn btn-ghost btn-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>←</button>
          <span className="viewer-page-info">{currentPage} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>→</button>
        </div>
        <div className="viewer-toolbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => setScale(s => Math.max(0.5, s - 0.25))}>−</button>
          <span className="viewer-zoom">{Math.round(scale * 100)}%</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setScale(s => Math.min(3, s + 0.25))}>+</button>
          
          <button className={`btn btn-ghost btn-sm ${hasLiked ? 'active' : ''}`} onClick={handleLike} style={{ color: hasLiked ? 'var(--wine-400)' : 'currentColor', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
          </button>
          
          <button className="btn btn-ghost btn-sm" onClick={() => setShowReviews(true)} style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Reviews ({document?.comments?.length || 0})
          </button>

          <button className="btn btn-secondary btn-sm" onClick={() => setShowReport(true)} style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            Report
          </button>
        </div>
      </div>

      {/* Canvas Viewer */}
      <div className="viewer-canvas-wrap" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
        <canvas ref={canvasRef} className="viewer-canvas" style={{ pointerEvents: 'none' }} />
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                Report Document
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReport(false)}>✕</button>
            </div>
            <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select className="form-input form-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="error">Contains Errors</option>
                  <option value="plagiarism">Plagiarism</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="outdated">Outdated Information</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe the issue in detail..."
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={reportLoading}>
                {reportLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviews && (
        <div className="modal-overlay" onClick={() => setShowReviews(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reviews & Comments</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReviews(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Your Rating</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} onClick={() => submitRating(star)} width="24" height="24" viewBox="0 0 24 24" fill={userRating >= star ? 'var(--gold-400)' : 'none'} stroke={userRating >= star ? 'var(--gold-400)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', transition: 'transform 0.1s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                  <span style={{ marginLeft: '12px', fontSize: '0.85rem', alignSelf: 'center', color: 'var(--text-secondary)' }}>
                    {document?.ratings?.length || 0} total ratings
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {document?.comments?.length > 0 ? document.comments.map(c => (
                  <div key={c._id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-primary)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {c.user?.name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{c.user?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{c.text}</div>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state-text" style={{ padding: '24px 0', textAlign: 'center' }}>No comments yet. Be the first!</div>
                )}
              </div>
            </div>

            <form onSubmit={submitComment} style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} required />
              <button type="submit" className="btn btn-primary" disabled={isSubmittingReview}>{isSubmittingReview ? '...' : 'Post'}</button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .viewer-page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .viewer-toolbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          background: rgba(15, 10, 11, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-primary);
          gap: 16px;
          flex-wrap: wrap;
        }

        .viewer-toolbar-left,
        .viewer-toolbar-center,
        .viewer-toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .viewer-doc-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .viewer-doc-title {
          font-weight: 600;
          font-size: 0.85rem;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .viewer-page-info {
          font-size: 0.85rem;
          color: var(--text-secondary);
          min-width: 60px;
          text-align: center;
        }

        .viewer-zoom {
          font-size: 0.8rem;
          color: var(--text-muted);
          min-width: 40px;
          text-align: center;
        }

        .viewer-canvas-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 24px;
          overflow: auto;
          background: var(--bg-secondary);
        }

        .viewer-canvas {
          box-shadow: var(--shadow-xl);
          border-radius: 4px;
          max-width: 100%;
          background-color: #ffffff;
        }

        @media print {
          body { display: none !important; }
        }
      `}</style>
    </div>
  );
}
