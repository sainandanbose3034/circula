'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CircuBitIcon from '@/components/CircuBitIcon';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user]);

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text-column">
            <div className="hero-badge animate-fade-in">
              <span className="circubits-icon"><CircuBitIcon size="16" style={{ color: 'var(--gold-400)', verticalAlign: 'text-bottom' }} /></span> Powered by CircuBits
            </div>

            <h1 className="hero-title animate-fade-in-up">
              Decentralized<br />
              <span className="hero-title-accent">Study Materials</span><br />
              Circulation
            </h1>
            <p className="hero-subtitle animate-fade-in-up stagger-2">
              Upload notes, earn CircuBits, access premium content. The world&apos;s first 
              quality-verified study resource platform with built-in anti-piracy protection.
            </p>
            <div className="hero-cta animate-fade-in-up stagger-3">
              <Link href="/register" className="btn btn-primary btn-lg">
                Start Learning Free →
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
            <div className="hero-stats animate-fade-in-up stagger-4">
              <div className="hero-stat">
                <span className="hero-stat-number">10K+</span>
                <span className="hero-stat-label">Documents</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">5K+</span>
                <span className="hero-stat-label">Students</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">50+</span>
                <span className="hero-stat-label">Companies</span>
              </div>
            </div>
          </div>

          <div className="hero-logo-column">
            <div className="hero-logo animate-fade-in-up stagger-1">
              <svg width="340" height="340" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-logo-svg">
                <circle cx="16" cy="16" r="14" stroke="#8b3a44" strokeWidth="2.2" />
                <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke="#8b3a44" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 20C12 17.7909 13.7909 16 16 16C18.2091 16 20 17.7909 20 20" stroke="#8b3a44" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="16" cy="22" r="1.5" fill="#8b3a44" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container">
        <div className="section-header animate-fade-in-up">
          <h2 className="section-title">Why Circula?</h2>
          <p className="section-subtitle">A complete ecosystem for knowledge sharing and discovery</p>
        </div>

        <div className="features-grid">
          <div className="feature-card animate-fade-in-up stagger-1">
            <div className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
            <h3 className="feature-title">Upload & Earn</h3>
            <p className="feature-desc">Share your notes and study materials. Get verified and earn CircuBits based on your document&apos;s quality score.</p>
          </div>
          <div className="feature-card animate-fade-in-up stagger-2">
            <div className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <h3 className="feature-title">Anti-Piracy Protection</h3>
            <p className="feature-desc">Every document is watermarked and non-downloadable. Your content stays protected with traceable viewing.</p>
          </div>
          <div className="feature-card animate-fade-in-up stagger-3">
            <div className="feature-icon"><CircuBitIcon size="40" style={{ color: 'var(--gold-400)' }} /></div>
            <h3 className="feature-title">CircuBits Economy</h3>
            <p className="feature-desc">Earn tokens for quality uploads. Spend them to access premium content or extend your subscription.</p>
          </div>
          <div className="feature-card animate-fade-in-up stagger-4">
            <div className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
            <h3 className="feature-title">B2B Bounty Board</h3>
            <p className="feature-desc">Companies post bounties for specific documents. Fulfill them and get rewarded — like freelancing for knowledge.</p>
          </div>
          <div className="feature-card animate-fade-in-up stagger-5">
            <div className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
            <h3 className="feature-title">Quality Verified</h3>
            <p className="feature-desc">Every document goes through our confidence scoring system. Only quality content makes it to the platform.</p>
          </div>
          <div className="feature-card animate-fade-in-up stagger-6">
            <div className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg></div>
            <h3 className="feature-title">Report & Moderate</h3>
            <p className="feature-desc">Found an error or plagiarism? Report it instantly. Community-driven quality assurance keeps content reliable.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works container">
        <div className="section-header animate-fade-in-up">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to start sharing and earning</p>
        </div>

        <div className="steps">
          <div className="step animate-fade-in-up stagger-1">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Create Your Account</h3>
              <p>Sign up for free. Start browsing public documents and upload your own materials immediately.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step animate-fade-in-up stagger-2">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Upload & Get Scored</h3>
              <p>Upload PDFs, documents, or images. Our AI-powered system scores your content and awards CircuBits.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step animate-fade-in-up stagger-3">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Earn & Access</h3>
              <p>Use your CircuBits to unlock premium content, extend subscriptions, or complete corporate bounties for more rewards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Section */}
      <section className="b2b-section container">
        <div className="b2b-card animate-fade-in-up">
          <div className="b2b-content">
            <div className="badge badge-gold" style={{ marginBottom: '16px' }}>FOR BUSINESSES</div>
            <h2 className="b2b-title">Need Specific Documents?</h2>
            <p className="b2b-desc">
              Post bounties for the exact study materials your organization needs. 
              Our community of verified creators will produce high-quality content tailored to your requirements.
            </p>
            <Link href="/login" className="btn btn-premium btn-lg" style={{ marginTop: '24px' }}>
              Company Portal →
            </Link>
          </div>
          <div className="b2b-visual">
            <div className="b2b-bounty-preview">
              <div className="preview-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                Active Bounty
              </div>
              <div className="preview-title">Advanced Data Structures Notes</div>
              <div className="preview-meta">
                <span style={{ display: 'flex', alignItems: 'center' }}><CircuBitIcon size="14" style={{ color: 'var(--gold-400)', marginRight: '4px' }} /> 50 CircuBits</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  5 days left
                </span>
              </div>
              <div className="preview-submissions">3 submissions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="section bg-secondary" style={{ padding: '80px 0', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header center animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">Transparent Pricing</h2>
            <p className="section-subtitle">Earn your way through uploads, or upgrade for unlimited premium access.</p>
          </div>
          
          <div className="pricing-preview grid-2 animate-fade-in-up stagger-1" style={{ maxWidth: '800px', margin: '0 auto', gap: '24px' }}>
            <div className="pricing-card free" style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column' }}>
              <h3 className="pricing-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>Free & Earn Mode</h3>
              <div className="pricing-cost" style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '24px' }}>$0<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>/mo</span></div>
              <ul className="pricing-features" style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg> Browse free & public study resources</li>
                <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg> Upload documents to earn CircuBits</li>
                <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg> Unlock Premium items via CircuBits</li>
              </ul>
              <Link href="/register" className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto', textAlign: 'center' }}>Get Started</Link>
            </div>
            
            <div className="pricing-card premium" style={{ background: 'linear-gradient(to bottom right, rgba(139, 58, 68, 0.1), transparent)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--wine-400)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--wine-400)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>Most Popular</div>
              <h3 className="pricing-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--gold-400)' }}>1-Month Premium</h3>
              <div className="pricing-cost" style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>₹299<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>/30 days</span></div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '24px' }}>Flexible plans available starting at just ₹29 for 1 day!</p>
              <ul className="pricing-features" style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg> Unlimited access to all Premium documents</li>
                <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg> Zero CircuBits spent on document views</li>
                <li style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg> Access exclusive high-tier B2B bounties</li>
              </ul>
              <Link href="/pricing" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', textAlign: 'center' }}>View Full Plan</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-content animate-fade-in-up">
          <h2 className="cta-title">Ready to Start?</h2>
          <p className="cta-subtitle">Join thousands of students and creators on the platform</p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="navbar-brand-text" style={{ fontSize: '1.2rem' }}>Circula</span>
            <p className="footer-desc">Decentralized study material circulation platform.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link href="/documents">Browse</Link>
              <Link href="/upload">Upload</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="/bounties">Bounty Board</Link>
              <Link href="/login">Company Login</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Circula. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing {
          position: relative;
          z-index: 1;
        }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding: 120px 0 80px;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .hero-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(114, 47, 55, 0.5), transparent);
          top: -200px;
          right: -100px;
          animation: float 8s ease-in-out infinite;
        }

        .hero-orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(171, 30, 72, 0.3), transparent);
          bottom: -100px;
          left: -50px;
          animation: float 10s ease-in-out infinite reverse;
        }

        .hero-orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent);
          top: 40%;
          left: 50%;
          animation: float 12s ease-in-out infinite;
        }

        .hero-content {
          text-align: left;
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 60px;
        }

        .hero-text-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-logo-column {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gold-400);
          margin-bottom: 32px;
        }

        .hero-logo {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-logo-svg {
          position: relative;
          z-index: 1;
          animation: logoFloat 6s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .hero-title-accent {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 1.5vw, 1.2rem);
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 0 40px 0;
          line-height: 1.7;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          justify-content: flex-start;
          flex-wrap: wrap;
          margin-bottom: 60px;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 40px;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-stat-number {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--wine-300);
        }

        .hero-stat-label {
          font-size: 0.8rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .hero-stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border-primary);
        }

        /* Features */
        .features {
          padding: 100px 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary), var(--wine-300));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: 36px 28px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 20px;
        }

        .feature-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .feature-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* How It Works */
        .how-it-works {
          padding: 80px 0;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 700px;
          margin: 0 auto;
        }

        .step {
          display: flex;
          gap: 24px;
          padding: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          transition: all 0.3s ease;
        }

        .step:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-glow);
        }

        .step-number {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 900;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          min-width: 60px;
        }

        .step-content h3 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .step-content p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .step-connector {
          width: 2px;
          height: 32px;
          background: var(--border-accent);
          margin-left: 60px;
          opacity: 0.4;
        }

        /* B2B Section */
        .b2b-section {
          padding: 80px 0;
        }

        .b2b-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-2xl);
          padding: 56px;
          overflow: hidden;
          position: relative;
        }

        .b2b-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.06), transparent);
          border-radius: 50%;
        }

        .b2b-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .b2b-desc {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .b2b-visual {
          display: flex;
          justify-content: center;
        }

        .b2b-bounty-preview {
          background: var(--bg-elevated);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-lg);
          padding: 24px;
          width: 300px;
          box-shadow: var(--shadow-glow);
        }

        .preview-header {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--gold-400);
          margin-bottom: 12px;
        }

        .preview-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 16px;
        }

        .preview-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .preview-submissions {
          font-size: 0.75rem;
          color: var(--wine-400);
          font-weight: 500;
        }

        /* CTA */
        .cta-section {
          padding: 100px 0;
          text-align: center;
        }

        .cta-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .cta-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          margin-bottom: 32px;
        }

        /* Footer */
        .footer {
          border-top: 1px solid var(--border-primary);
          padding: 60px 0 32px;
        }

        .footer-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 48px;
        }

        .footer-desc {
          color: var(--text-dim);
          font-size: 0.85rem;
          margin-top: 8px;
        }

        .footer-links {
          display: flex;
          gap: 64px;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .footer-col h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .footer-col a {
          font-size: 0.85rem;
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-col a:hover {
          color: var(--wine-300);
        }

        .footer-bottom {
          grid-column: 1 / -1;
          padding-top: 24px;
          border-top: 1px solid var(--border-primary);
          font-size: 0.8rem;
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          
          .hero-text-column {
            align-items: center;
          }

          .hero-stats {
            justify-content: center;
            flex-direction: column;
            gap: 24px;
          }

          .hero-cta {
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .b2b-card {
            grid-template-columns: 1fr;
            padding: 32px;
          }

          .hero-stat-divider {
            display: none;
          }

          .footer-inner {
            grid-template-columns: 1fr;
          }

          .step {
            flex-direction: column;
            gap: 12px;
          }

          .step-connector {
            margin-left: 32px;
          }
        }
      `}</style>
    </div>
  );
}
