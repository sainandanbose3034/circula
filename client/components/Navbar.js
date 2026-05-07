'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only show on public pages when user is NOT logged in
  if (user) return null;

  const publicPages = ['/', '/login', '/register'];
  if (!publicPages.includes(pathname)) return null;

  return (
    <>
      <nav className={`topnav ${scrolled ? 'topnav-scrolled' : ''}`}>
        <div className="topnav-inner container">
          <Link href="/" className="topnav-brand">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#8b3a44" strokeWidth="2.2" />
              <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke="#8b3a44" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 20C12 17.7909 13.7909 16 16 16C18.2091 16 20 17.7909 20 20" stroke="#8b3a44" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="16" cy="22" r="1.5" fill="#8b3a44" />
            </svg>
            <span className="topnav-brand-text">Circula</span>
          </Link>

          <div className="topnav-actions">
            <Link href="/login" className="btn btn-ghost">Sign In</Link>
            <Link href="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .topnav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 16px 0;
          transition: all 0.3s ease;
        }

        .topnav-scrolled {
          background: rgba(12, 11, 13, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-primary);
          padding: 10px 0;
        }

        .topnav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .topnav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .topnav-brand-text {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .topnav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </>
  );
}
