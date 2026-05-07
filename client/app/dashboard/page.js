'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/documents');
  }, [router]);

  return (
    <div className="loading-page">
      <div className="spinner spinner-lg"></div>
    </div>
  );
}
