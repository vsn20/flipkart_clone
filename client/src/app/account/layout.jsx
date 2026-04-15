'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function AccountLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTop: '3px solid #2874f0', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div style={{ background: '#f1f3f6', minHeight: 'calc(100vh - 120px)', padding: '16px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 12px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 0 : 16, alignItems: 'flex-start' }}>
        <AccountSidebar />
        <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
