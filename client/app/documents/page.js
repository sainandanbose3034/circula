'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/api';

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user, page, sort, filter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (filter === 'premium') params.premium = 'true';
      if (filter === 'free') params.premium = 'false';

      const data = await ApiClient.getDocuments(params);
      setDocuments(data.documents);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  if (authLoading || !user) {
    return <div className="loading-page"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">Browse Documents</h1>
          <p className="page-subtitle">Discover quality-verified study materials</p>
        </div>

        {/* Search & Filters */}
        <div className="docs-toolbar animate-fade-in-up stagger-1">
          <form className="docs-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-input docs-search-input"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="docs-filters">
            <select className="form-input form-select docs-select" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
              <option value="all">All Documents</option>
              <option value="free">Free Only</option>
              <option value="premium">Premium Only</option>
            </select>
            <select className="form-input form-select docs-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="loading-page"><div className="spinner spinner-lg"></div></div>
        ) : documents.length > 0 ? (
          <>
            <div className="docs-grid animate-fade-in-up stagger-2">
              {documents.map(doc => (
                <Link key={doc._id} href={`/viewer/${doc._id}`} className="doc-card">
                  <div className="doc-card-top">
                    <div className="doc-card-type" style={{ color: 'var(--text-dim)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    {doc.isPremium && (
                      <div title="Premium Document" style={{ display: 'flex', alignItems: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--gold-400)" stroke="var(--gold-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="2 4 5 15 19 15 22 4 16 9 12 4 8 9 2 4"></polygon>
                          <line x1="5" y1="18" x2="19" y2="18"></line>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="doc-card-title">{doc.title}</h3>
                  <p className="doc-card-desc">{doc.description || 'No description'}</p>
                  <div className="doc-card-meta">
                    <span className="doc-card-subject">{doc.subject}</span>
                    <span className="doc-card-pages">{doc.pageCount} pages</span>
                  </div>

                  <div className="doc-card-footer">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="doc-card-author">By {doc.uploadedBy?.name || 'Unknown'}</span>
                      <span className="doc-card-date" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(doc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="doc-card-views" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {doc.totalViews}
                      </span>
                      <span className="doc-card-likes" style={{ display: 'flex', alignItems: 'center', color: 'var(--wine-400)', opacity: doc.likes?.length ? 1 : 0.5 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {doc.likes?.length || 0}
                      </span>
                      {doc.ratings?.length > 0 && (
                        <span className="doc-card-rating" style={{ display: 'flex', alignItems: 'center', color: 'var(--gold-400)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '2px'}}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          {(doc.ratings.reduce((a, b) => a + b.value, 0) / doc.ratings.length).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="docs-pagination">
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ← Previous
                </button>
                <span className="docs-page-info">Page {page} of {totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
            </div>
            <div className="empty-state-title">No documents found</div>
            <div className="empty-state-text">Try adjusting your search or filters</div>
          </div>
        )}
      </div>

      <style jsx>{`
        .docs-toolbar {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .docs-search {
          display: flex;
          gap: 8px;
          flex: 1;
          min-width: 280px;
        }

        .docs-search-input {
          flex: 1;
        }

        .docs-filters {
          display: flex;
          gap: 8px;
        }

        .docs-select {
          min-width: 140px;
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .doc-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-decoration: none;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .doc-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-3px);
          box-shadow: var(--shadow-glow);
        }

        .doc-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .doc-card-type {
          font-size: 2rem;
        }

        .doc-card-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .doc-card-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .doc-card-meta {
          display: flex;
          gap: 12px;
          font-size: 0.75rem;
        }

        .doc-card-subject {
          color: var(--wine-400);
          font-weight: 600;
        }

        .doc-card-pages {
          color: var(--text-dim);
        }


        .doc-card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-dim);
          padding-top: 8px;
          border-top: 1px solid var(--border-primary);
        }

        .docs-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .docs-page-info {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .docs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
