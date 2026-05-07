'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import CircuBitIcon from './CircuBitIcon';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    {
      section: 'MAIN',
      items: [
        { href: '/documents', label: 'Browse', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
        { href: '/upload', label: 'Upload', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
        { href: '/bounties', label: 'Bounties', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
      ]
    },
    {
      section: 'ACCOUNT',
      items: [
        { href: '/circubits', label: 'CircuBits', icon: <CircuBitIcon size="20" /> },
        { href: '/pricing', label: 'Subscription', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
        { href: '/profile', label: 'Profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      ]
    },
    ...(user.role === 'admin' ? [{
      section: 'ADMIN',
      items: [
        { href: '/admin/revenue', label: 'Revenue', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg> },
      ]
    }] : [])
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sb-header">
        <Link href="/documents" className="sb-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#8b3a44" strokeWidth="2.2" />
            <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke="#8b3a44" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 20C12 17.7909 13.7909 16 16 16C18.2091 16 20 17.7909 20 20" stroke="#8b3a44" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="16" cy="22" r="1.5" fill="#8b3a44" />
          </svg>
          {!collapsed && <span className="sb-brand-text">Circula</span>}
        </Link>
        <button className="sb-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sb-nav">
        {navItems.map((group) => (
          <div key={group.section} className="sb-group">
            {!collapsed && <span className="sb-group-label">{group.section}</span>}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-link ${isActive(item.href) ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="sb-link-icon">{item.icon}</span>
                {!collapsed && <span className="sb-link-label">{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        {!collapsed && (
          <Link href="/circubits" className="sb-balance">
            <span className="sb-balance-val">{user.circuBits || 0}</span>
            <span className="sb-balance-lbl">CircuBits</span>
          </Link>
        )}
        <div className="sb-user">
          <div className="sb-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          {!collapsed && (
            <div className="sb-user-info">
              <span className="sb-user-name">{user.name}</span>
              <span className="sb-user-plan">
                {user.role}
                {user.role === 'premium' && user.subscription?.endDate && (() => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(user.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
                  return ` (${daysLeft}d left)`;
                })()}
              </span>
            </div>
          )}
          <button className="sb-logout" onClick={logout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>


    </aside>
  );
}
