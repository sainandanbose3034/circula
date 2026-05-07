'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const publicPaths = ['/', '/login', '/register'];

export default function AppShell({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isPublic = publicPaths.includes(pathname);

  if (!user || isPublic) {
    // Public layout — top navbar, full width
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '80px' }}>{children}</main>
      </>
    );
  }

  // Authenticated layout — sidebar + shifted content
  return (
    <>
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main className={`app-main ${sidebarCollapsed ? 'collapsed' : ''}`}>{children}</main>
      <style jsx>{`
        .app-main {
          margin-left: 240px;
          min-height: 100vh;
          transition: margin-left 0.2s ease;
        }

        .app-main.collapsed {
          margin-left: 64px;
        }

        @media (max-width: 768px) {
          .app-main {
            margin-left: 64px;
          }
        }
      `}</style>
    </>
  );
}
