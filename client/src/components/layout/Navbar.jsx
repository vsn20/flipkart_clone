'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { debounce } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const isCartPage = pathname === '/cart';
  const isCheckoutPage = pathname.startsWith('/checkout');
 const isProductPage = pathname.startsWith('/product/') || pathname.includes('/p/');
  const isWhiteNav = isCheckoutPage || isProductPage;
  const { user, isAuthenticated, logout } = useAuth();
  
 const navBg = isWhiteNav ? '#fff' : '#2874f0';
const logoTextColor = isWhiteNav ? '#2874f0' : '#fff';
const searchBg = isWhiteNav ? '#fff' : '#fff';
const textColor = isWhiteNav ? '#212121' : '#fff';
const hoverBg = isWhiteNav ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.13)';
const bottomBorder = isWhiteNav ? '1px solid #e0e0e0' : 'none';
const searchBorder = isWhiteNav ? '2px solid #2874f0' : 'none';
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = debounce(async (query) => {
    if (query.length < 2) { setSuggestions([]); return; }
    try {
      const res = await productsAPI.searchSuggestions(query);
      setSuggestions(res.data.suggestions || []);
    } catch { setSuggestions([]); }
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    router.push(`/product/${suggestion.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <>
      {/* ── Top Blue Bar ─────────────────────────────── */}
      <header style={{ background: navBg, position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 1px 6px rgba(0,0,0,.2)', borderBottom: bottomBorder }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: isMobile ? '8px 10px' : '10px 16px', display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>

          {/* Logo */}
                   <Link href="/" style={{ textDecoration: 'none', minWidth: isWhiteNav ? (isMobile ? 100 : 130) : (isMobile ? 60 : 90), marginRight: 4 }}>
            {isWhiteNav ? (
              <div style={{ background: '#ffe500', borderRadius: isWhiteNav ? 12 : 2, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, height: 38 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2874f0"><path d="M3 13h18v-2H3v2zm0 4h12v-2H3v2zm0-8v2h18V9H3z"/></svg>
                <span style={{ color: '#2a55e5', fontSize: 19, fontWeight: 700, fontStyle: 'italic', fontFamily: 'Arial' }}>Flipkart</span>
                <svg width="12" height="12" fill="none" stroke="#2a55e5" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="m6 9 6 6 6-6"/></svg>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="22" height="22" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="4" fill="#FFE500"/><path d="M10 14h26v5H10zM10 22h18v5H10zM10 30h22v5H10z" fill="#2874F0"/></svg>
                  <span style={{ color: logoTextColor, fontSize: 22, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.5px', fontFamily: 'sans-serif', lineHeight: 1 }}>Flipkart</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 26, marginTop: -2 }}>
                  <span style={{ color: 'rgba(255,255,0.85)', fontSize: 11, fontStyle: 'italic' }}>Explore</span>
                  <span style={{ color: '#ffe500', fontSize: 11, fontWeight: 600, fontStyle: 'italic' }}>Plus</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginLeft: 1 }}><polygon points="5,0 6.2,3.5 10,3.5 7.1,5.7 8.1,9 5,7 1.9,9 2.9,5.7 0,3.5 3.8,3.5" fill="#ffe500"/></svg>
                </div>
              </div>
            )}
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} style={{ flex: 1, maxWidth: isMobile ? '100%' : 590, position: 'relative', order: isMobile ? 3 : 0, width: isMobile ? '100%' : 'auto' }}>
           <form onSubmit={handleSearch} style={{ display: 'flex', background: searchBg, borderRadius: isWhiteNav ? 10 : 2, overflow: 'hidden', border: searchBorder, boxShadow: isWhiteNav ? 'none' : '0 1px 3px rgba(0,0,0,.1)', height: isWhiteNav ? 38 : 'auto' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                placeholder="Search for Products, Brands and More"
                style={{ flex: 1, border: 'none', outline: 'none', padding: isWhiteNav ? '0 16px' : '10px 16px', fontSize: 14, color: '#212121', background: 'transparent', minWidth: 0 }}
              />
              <button type="submit" style={{ background: 'transparent', border: 'none', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2874f0' }}>
                <svg width="20" height="20" fill="none" stroke="#2874f0" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>
                </svg>
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,.15)', zIndex: 200, borderTop: '1px solid #f0f0f0' }}>
                {suggestions.map((s) => (
                  <button key={s.id} onClick={() => handleSuggestionClick(s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f8f8f8' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <svg width="16" height="16" fill="none" stroke="#878787" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
                    <span style={{ fontSize: 14, color: '#212121' }}>{s.text}</span>
                    {s.brand && <span style={{ fontSize: 12, color: '#878787', marginLeft: 4 }}>in {s.brand}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 4, marginLeft: 'auto', marginRight: isCartPage ? (isMobile ? '0' : '72px') : '0' }}>

            {/* Login / My Account */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              {isAuthenticated ? (
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: textColor, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: 15, fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {isWhiteNav && (
                    <svg width="20" height="20" fill="none" stroke={textColor} strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 14-4 14 0"/></svg>
                  )}
                  {user?.name?.split(' ')[0] || 'Account'}
                  <svg width="14" height="14" fill="none" stroke={textColor} strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              ) : (
                <Link href="/login"
                  style={{ display: 'inline-block', background: isWhiteNav ? 'transparent' : '#fff', color: isWhiteNav ? textColor : '#2874f0', fontWeight: isWhiteNav ? 500 : 700, fontSize: 15, padding: isWhiteNav ? '6px 8px' : '6px 40px', borderRadius: 2, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: 0.2 }}
                >
                  Login
                </Link>
              )}

              {/* User Dropdown */}
              {showUserMenu && isAuthenticated && (
                <div style={{ 
                  position: isMobile ? 'fixed' : 'absolute', 
                  right: isMobile ? 0 : 0, 
                  left: isMobile ? 0 : 'auto',
                  top: isMobile ? 0 : '110%', 
                  bottom: isMobile ? 0 : 'auto',
                  background: isMobile ? 'rgba(0,0,0,.5)' : 'transparent',
                  zIndex: 9999,
                }}>
                  <div style={{
                    background: '#fff', 
                    boxShadow: '0 4px 20px rgba(0,0,0,.18)', 
                    minWidth: isMobile ? '100%' : 280, 
                    maxWidth: isMobile ? '100%' : 280,
                    borderRadius: isMobile ? 0 : 4,
                    maxHeight: isMobile ? '100vh' : 'auto',
                    overflowY: 'auto',
                  }}>
                    {/* Close button on mobile */}
                    {isMobile && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', background: '#2874f0' }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>My Account</span>
                        <button onClick={() => setShowUserMenu(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
                      </div>
                    )}
                    {/* User Info Header */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', background: 'linear-gradient(135deg, #2874f0 0%, #1a3a7d 100%)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#2874f0' }}>
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{user?.name}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', margin: '2px 0 0 0' }}>{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ paddingTop: 4 }}>
                      {[
                        { href: '/account', icon: '👤', label: 'My Profile' },
                        { href: '/account', icon: '🪙', label: 'SuperCoin Zone' },
                        { href: '/flipkart-plus', icon: '✨', label: 'Flipkart Plus Zone' },
                        { href: '/orders', icon: '📦', label: 'Orders' },
                        { href: '/wishlist', icon: '❤️', label: 'Wishlist' },
                        { href: '/account/saved-cards', icon: '💳', label: 'Saved Cards & Wallet' },
                        { href: '/account/addresses', icon: '📍', label: 'Saved Addresses' },
                        { href: '/', icon: '🏷️', label: 'Coupons' },
                        { href: '/', icon: '🎁', label: 'Gift Cards' },
                        { href: '/', icon: '🔔', label: 'Notifications' },
                      ].map((item, idx) => (
                        <Link key={item.label} href={item.href} onClick={() => setShowUserMenu(false)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 10, 
                            padding: isMobile ? '12px 16px' : '8px 16px', 
                            fontSize: isMobile ? 15 : 13, 
                            color: '#212121', 
                            textDecoration: 'none', 
                            borderBottom: idx < 9 ? '1px solid #f5f5f5' : 'none',
                            transition: 'all .2s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#f8f8f8';
                            e.currentTarget.style.borderLeft = '4px solid #2874f0';
                            e.currentTarget.style.paddingLeft = isMobile ? '16px' : '12px';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.borderLeft = 'none';
                            e.currentTarget.style.paddingLeft = isMobile ? '16px' : '16px';
                          }}
                        >
                          <span style={{ fontSize: isMobile ? 18 : 16, minWidth: isMobile ? 20 : 18, textAlign: 'center' }}>{item.icon}</span>
                          <span style={{ fontWeight: 500 }}>{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <button onClick={() => { logout(); setShowUserMenu(false); router.push('/'); }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        width: '100%', 
                        padding: isMobile ? '12px 16px' : '8px 16px', 
                        fontSize: isMobile ? 15 : 13, 
                        color: '#ff6161', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        textAlign: 'left',
                        borderTop: '1px solid #f5f5f5',
                        marginTop: 0,
                        transition: 'all .2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#fff5f5';
                        e.currentTarget.style.borderLeft = '4px solid #ff6161';
                        e.currentTarget.style.paddingLeft = isMobile ? '16px' : '12px';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.borderLeft = 'none';
                        e.currentTarget.style.paddingLeft = isMobile ? '16px' : '16px';
                      }}
                    >
                      <span style={{ fontSize: isMobile ? 18 : 16, minWidth: isMobile ? 20 : 18, textAlign: 'center' }}>🚪</span>
                      <span style={{ fontWeight: 500 }}>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Become a Seller */}
            {!isCartPage && !isWhiteNav && !isMobile && (
              <button style={{ color: textColor, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: 15, fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Become a Seller
              </button>
            )}

            {/* More */}
            {!isCartPage && !isMobile && (
              <div ref={moreMenuRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowMoreMenu(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 3, color: textColor, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: 15, fontWeight: 600, borderRadius: 2 }}
                  onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  More
                  <svg width="14" height="14" fill="none" stroke={textColor} strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform: showMoreMenu ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                {showMoreMenu && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,.18)', zIndex: 300, minWidth: 200, borderRadius: 2 }}>
                    {[
                      { icon: '🔔', label: 'Notification Preferences' },
                      { icon: '🎧', label: '24x7 Customer Care' },
                      { icon: '📢', label: 'Advertise' },
                      { icon: '📱', label: 'Download App' },
                    ].map(item => (
                      <button key={item.label}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', fontSize: 13, color: '#212121', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f9f9f9', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <span>{item.icon}</span>{item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {!isCartPage && (
              <Link href="/cart"
                style={{ display: 'flex', alignItems: 'center', gap: 5, color: textColor, textDecoration: 'none', padding: '6px 12px', fontSize: 15, fontWeight: 600, borderRadius: 2, position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ position: 'relative' }}>
                  <svg width="22" height="22" fill="none" stroke={textColor} strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: -8, right: -8, background: '#ff6161', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </span>
                Cart
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Sub Nav / Category Bar ────────────────────── */}
{!isCartPage && !isWhiteNav && !isMobile && <SubNav />}
    </>
  );
}

/* ────────────────────────────────────────────────────────
   SubNav – Dynamic Mega Menu from API
   ──────────────────────────────────────────────────────── */
function SubNav() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategoryTree(res.data.categories || []);
      } catch { /* silent */ }
    };
    fetchTree();
  }, []);

  // Static nav items that don't come from the DB
  const staticItems = [
    { name: 'Flights', slug: '', mega: null },
    { name: 'Offer Zone', slug: 'products', mega: null },
  ];

  // Build navItems from API category tree
  const navItems = categoryTree.map(cat => ({
    name: cat.name,
    slug: cat.slug,
    mega: cat.subcategories?.length > 0 ? cat.subcategories.map(sub => ({
      heading: sub.name,
      headingSlug: sub.slug,
      catSlug: cat.slug,
      links: (sub.subSubcategories || []).map(subsub => ({
        label: subsub.name,
        subSlug: sub.slug,
        subSubSlug: subsub.slug,
        catSlug: cat.slug,
      })),
    })) : null,
  }));

  const allItems = [...navItems, ...staticItems];
  const rightAlignedItems = ['Home & Furniture', 'Sports, Books & More', 'Grocery'];

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 1px 3px rgba(0,0,0,.08)', position: 'relative', zIndex: 100 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {allItems.map((item) => {
          const anchorRight = rightAlignedItems.includes(item.name);
          return (
            <div key={item.name} style={{ position: 'relative', flexShrink: 0 }}
              onMouseEnter={() => item.mega && setActiveMenu(item.name)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              {item.mega ? (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3, padding: '12px 18px', fontSize: 13.5,
                    fontWeight: 500, color: activeMenu === item.name ? '#2874f0' : '#212121',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    borderBottom: activeMenu === item.name ? '3px solid #2874f0' : '3px solid transparent',
                    transition: 'color .15s',
                  }}
                >
                  {item.name}
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              ) : (
                <Link
                  href={item.slug ? `/products?category=${item.slug}` : '/products'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3, padding: '12px 18px', fontSize: 13.5,
                    fontWeight: 500, color: '#212121', textDecoration: 'none', whiteSpace: 'nowrap',
                    borderBottom: '3px solid transparent',
                  }}
                >
                  {item.name}
                </Link>
              )}

              {item.mega && activeMenu === item.name && (
                <div
                  style={{
                    position: 'absolute',
                    ...(anchorRight ? { right: 0 } : { left: 0 }),
                    top: '100%',
                    background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,.15)', zIndex: 999,
                    display: 'flex', padding: 0, minWidth: 750,
                    border: '1px solid #e0e0e0', borderTop: '2px solid #2874f0',
                  }}
                  onMouseEnter={() => setActiveMenu(item.name)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  {item.mega.map((col, ci) => (
                    <div key={ci} style={{
                      minWidth: 115, padding: '14px 14px', flex: 1,
                      borderRight: ci < item.mega.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}>
                      <Link
                        href={`/products?category=${col.catSlug}&subcategory=${col.headingSlug}`}
                        onClick={() => setActiveMenu(null)}
                        style={{
                          display: 'block', fontSize: 12.5, fontWeight: 700, color: '#212121',
                          marginBottom: 8, paddingBottom: 5,
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer', textDecoration: 'none',
                        }}
                      >
                        {col.heading} <span style={{ float: 'right', fontSize: 11, color: '#2874f0' }}>›</span>
                      </Link>
                      {col.links.map((link) => (
                        <Link key={link.label} href={`/products?category=${link.catSlug}&subcategory=${link.subSlug}&sub_subcategory=${link.subSubSlug}`}
                          style={{
                            display: 'block', fontSize: 12, color: '#555', textDecoration: 'none',
                            padding: '2px 0', lineHeight: 1.6, transition: 'color .12s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#2874f0'}
                          onMouseLeave={e => e.currentTarget.style.color = '#555'}
                          onClick={() => setActiveMenu(null)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
