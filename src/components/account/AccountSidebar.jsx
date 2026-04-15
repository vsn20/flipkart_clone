'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <div style={{ width: 250, flexShrink: 0 }}>
      <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
        {/* Hello Header */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <img
              src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#878787' }}>Hello,</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#212121' }}>{user?.name || 'User'}</p>
          </div>
        </div>

        {/* MY ORDERS */}
        <Link href="/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', cursor: 'pointer', background: pathname.startsWith('/orders') ? '#f5faff' : 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#2874f0"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 14H6v-2h8v2zm4-4H6v-2h12v2zm0-4H6V6h12v2z"/></svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#212121' }}>MY ORDERS</span>
          </div>
          <svg width="16" height="16" fill="none" stroke="#878787" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        </Link>

        {/* ACCOUNT SETTINGS */}
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 4px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#2874f0"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#878787', letterSpacing: 0.3, textTransform: 'uppercase' }}>Account Settings</span>
          </div>
          {[
            { label: 'Profile Information', href: '/account' },
            { label: 'Manage Addresses', href: '/account/addresses' },
            { label: 'PAN Card Information', href: '/account/pan' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{
                display: 'block', padding: '10px 16px 10px 48px', fontSize: 13, textDecoration: 'none',
                color: isActive(item.href) ? '#2874f0' : '#212121',
                fontWeight: isActive(item.href) ? 600 : 400,
                background: isActive(item.href) ? '#f5faff' : 'transparent',
                borderLeft: isActive(item.href) ? '3px solid #2874f0' : '3px solid transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* PAYMENTS */}
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 4px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#2874f0"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#878787', letterSpacing: 0.3, textTransform: 'uppercase' }}>Payments</span>
          </div>
          {[
            { label: 'Gift Cards', href: '/account/gift-cards', badge: '₹0' },
            { label: 'Saved UPI', href: '/account/saved-upi' },
            { label: 'Saved Cards', href: '/account/saved-cards' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px 10px 48px', fontSize: 13, textDecoration: 'none',
                color: isActive(item.href) ? '#2874f0' : '#212121',
                fontWeight: isActive(item.href) ? 600 : 400,
                background: isActive(item.href) ? '#f5faff' : 'transparent',
                borderLeft: isActive(item.href) ? '3px solid #2874f0' : '3px solid transparent',
              }}
            >
              {item.label}
              {item.badge && <span style={{ fontSize: 12, color: '#2874f0', fontWeight: 600 }}>{item.badge}</span>}
            </Link>
          ))}
        </div>

        {/* MY STUFF */}
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 4px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#2874f0"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#878787', letterSpacing: 0.3, textTransform: 'uppercase' }}>My Stuff</span>
          </div>
          {[
            { label: 'My Coupons', href: '/account/coupons' },
            { label: 'My Reviews & Ratings', href: '/account/reviews' },
            { label: 'All Notifications', href: '/account/notifications' },
            { label: 'My Wishlist', href: '/wishlist' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{
                display: 'block', padding: '10px 16px 10px 48px', fontSize: 13, textDecoration: 'none',
                color: isActive(item.href) ? '#2874f0' : '#212121',
                fontWeight: isActive(item.href) ? 600 : 400,
                background: isActive(item.href) ? '#f5faff' : 'transparent',
                borderLeft: isActive(item.href) ? '3px solid #2874f0' : '3px solid transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* LOGOUT */}
        <div 
          onClick={() => {
            logout();
            router.push('/login');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', cursor: 'pointer' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#2874f0"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#878787', textTransform: 'uppercase' }}>Logout</span>
        </div>
      </div>
    </div>
  );
}
