'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsAPI, categoriesAPI, addressAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

/* ──────────────── HOMEPAGE CATEGORY TABS ──────────────── */
const HOMEPAGE_TABS = [
  { key: 'for-you', label: 'For You', icon: '🏠' },
  { key: 'fashion', label: 'Fashion', icon: '👗' },
  { key: 'mobiles', label: 'Mobiles', icon: '📱' },
  { key: 'beauty', label: 'Beauty', icon: '💄' },
  { key: 'electronics', label: 'Electronics', icon: '💻' },
  { key: 'home', label: 'Home', icon: '🏡' },
  { key: 'appliances', label: 'Appliances', icon: '🔌' },
  { key: 'toys', label: 'Toys, ba...', icon: '🧸' },
  { key: 'sports', label: 'Sports &...', icon: '⚽' },
  { key: 'books', label: 'Books & ...', icon: '📚' },
  { key: 'furniture', label: 'Furniture', icon: '🪑' },
  { key: 'grocery', label: 'Grocery', icon: '🛒' },
];

const TAB_TO_CATEGORY = {
  'for-you': '',
  'fashion': 'men',
  'mobiles': 'electronics',
  'beauty': 'women',
  'electronics': 'electronics',
  'home': 'home-furniture',
  'appliances': 'tvs-appliances',
  'toys': 'baby-kids',
  'sports': 'sports-books-more',
  'books': 'sports-books-more',
  'furniture': 'home-furniture',
  'grocery': 'grocery',
};

// Map tabs to subcategory slugs for more precise filtering
const TAB_TO_SUBCATEGORY = {
  'mobiles': 'mobiles',
  'beauty': 'beauty-personal-care',
  'furniture': 'furniture',
};

// Subcategory labels per tab for the horizontal chips
const TAB_SUBCATEGORIES = {
  'fashion': ['T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Watches', 'Wallets', 'Sunglasses', 'Jackets'],
  'mobiles': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'OPPO', 'Vivo', 'Nothing'],
  'beauty': ['Skincare', 'Makeup', 'Perfumes', 'Haircare', 'Bath & Body', 'Grooming', 'Deodorants', 'Lipstick'],
  'electronics': ['Laptops', 'Tablets', 'Cameras', 'Audio', 'Headphones', 'Smart Wearables', 'Speakers', 'Gaming'],
  'home': ['Furniture', 'Decor', 'Bedding', 'Kitchen & Dining', 'Lamps', 'Curtains', 'Cookware', 'Storage'],
  'appliances': ['Televisions', 'Washing Machine', 'Air Conditioners', 'Refrigerators', 'Microwaves', 'Air Fryers', 'Mixer Grinders', 'Chimneys'],
  'toys': ['Building Sets', 'Action Figures', 'Board Games', 'Dolls', 'Baby Care', 'Kids Clothing', 'Diapers', 'Strollers'],
  'sports': ['Cricket', 'Football', 'Badminton', 'Tennis', 'Fitness', 'Running Shoes', 'Gym Equipment', 'Yoga'],
  'books': ['Fiction', 'Self-Help', 'Academic', 'Comics', 'Biographies', 'Children Books', 'Novels', 'Business'],
  'furniture': ['Sofas', 'Beds', 'Wardrobes', 'Study Tables', 'Shoe Racks', 'Dining Tables', 'Bookshelves', 'TV Units'],
  'grocery': ['Staples', 'Snacks', 'Beverages', 'Dairy', 'Oils & Ghee', 'Tea & Coffee', 'Chocolates', 'Biscuits'],
};

const BANNERS = [
  {
    panels: [
      { bg: 'linear-gradient(135deg,#1a237e,#283593)', title: 'WATCHES', subtitle: 'for him', extra: 'UNDER ₹249', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80' },
      { bg: 'linear-gradient(135deg,#fff9c4,#fff176)', title: 'Cricket season is on!', subtitle: 'Up to 80% Off', extra: 'DSC, SG, Jaspo & more...', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=80', dark: true },
      { bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', title: 'vivo T5 Pro 5G', subtitle: 'Launch 15th Apr', extra: 'Slimmest 9020 mAh', img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&q=80', dark: true },
    ]
  },
  {
    panels: [
      { bg: 'linear-gradient(135deg,#e65100,#bf360c)', title: 'Fashion Fiesta', subtitle: 'Min 50% Off', extra: 'Top Brands', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' },
      { bg: 'linear-gradient(135deg,#2e7d32,#1b5e20)', title: 'Home & Kitchen', subtitle: 'From ₹199', extra: 'Furniture & Decor', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
      { bg: 'linear-gradient(135deg,#6a1b9a,#4a148c)', title: 'Beauty Bonanza', subtitle: 'Premium Products', extra: 'Best Prices', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80' },
    ]
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState('for-you');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [allAddresses, setAllAddresses] = useState([]);
  const accountRef = useRef(null);
  const moreRef = useRef(null);
  const scrolledRef = useRef(false);

  // Flatten all panels from all banners for continuous scrolling
  const allPanels = BANNERS.flatMap(b => b.panels);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Reset banner index when switching between mobile and desktop
  useEffect(() => {
    setBannerIdx(0);
  }, [isMobile]);

  // Track scroll with hysteresis to prevent flickering
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (!scrolledRef.current && y > 140) {
        scrolledRef.current = true;
        setScrolled(true);
      } else if (scrolledRef.current && y < 40) {
        scrolledRef.current = false;
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch categories once
  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  // Fetch user addresses
  useEffect(() => {
    if (isAuthenticated) {
      addressAPI.getAll().then(r => {
        const addrs = r.data.addresses || [];
        setAllAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) setUserAddress(def);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Fetch products when activeTab changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const catSlug = TAB_TO_CATEGORY[activeTab];
        const subSlug = TAB_TO_SUBCATEGORY[activeTab];
        const params = { limit: 20 };
        if (subSlug) {
          params.subcategory = subSlug;
        } else if (catSlug) {
          params.category = catSlug;
        }
        const res = await productsAPI.getAll(params);
        setProducts(res.data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  // Banner auto-rotate
  useEffect(() => {
    const slidesCount = isMobile ? allPanels.length : 2;
    const t = setInterval(() => setBannerIdx(p => (p + 1) % slidesCount), 5000);
    return () => clearInterval(t);
  }, [isMobile, allPanels.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccountMenu(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  // Get subcategories for the selected tab
  const getTabSubcategories = () => {
    return TAB_SUBCATEGORIES[activeTab] || [];
  };
  
  // Get visible panels based on device type and current slide
  const getVisiblePanels = () => {
    if (isMobile) {
      // Mobile: show 1 card at a time
      return [allPanels[bannerIdx]];
    } else {
      // Desktop: show 3 cards at a time, bannerIdx is 0 or 1 (for 2 groups)
      const startIdx = bannerIdx * 3;
      return allPanels.slice(startIdx, startIdx + 3);
    }
  };

  const visiblePanels = getVisiblePanels();
  const maxSlides = isMobile ? allPanels.length : 2;

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh' }}>
      {/* ═══════════════════ STICKY HEADER ═══════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 900,
        background: '#fff', boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,.1)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid #e0e0e0',
      }}>
        {/* ── Top Bar (hidden when scrolled) ── */}
        {!scrolled && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Logo + Travel + Grocery */}
            <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
              <Link href="/" style={{
                background: '#ffe500', padding: '8px 20px', borderRadius: 10,
                fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                color: '#212121',
              }}>
                <span style={{ background: '#2874f0', color: '#fff', width: 22, height: 22, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, fontStyle: 'italic' }}>f</span>
                <span style={{ color: '#212121', fontWeight: 700, letterSpacing: -0.3 }}>Flipkart</span>
              </Link>
              {!isMobile && (
                <>
                  <button style={{ background: 'none', border: 'none', padding: '8px 16px', fontSize: 13, color: '#212121', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                    <span style={{ fontSize: 15 }}>✈️</span> Travel
                  </button>
                  <button style={{ background: 'none', border: 'none', padding: '8px 16px', fontSize: 13, color: '#212121', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                    <span style={{ fontSize: 15 }}>🛒</span> Grocery
                  </button>
                </>
              )}
            </div>

            <div style={{ flex: 1 }} />

            {/* Location */}
            {!isMobile && (
              <div onClick={() => setShowAddressPicker(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#212121', cursor: 'pointer' }}>
                <svg width="16" height="16" fill="#212121" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span style={{ fontWeight: 600 }}>{userAddress?.pincode || 'Add'}</span>
                <span style={{ color: '#2874f0', fontWeight: 500 }}>{userAddress ? `${userAddress.city || userAddress.locality || 'Deliver here'} ›` : 'Select delivery location ›'}</span>
              </div>
            )}

            {/* SuperCoins */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#212121', cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>🪙</span> <span style={{ fontWeight: 600 }}>0</span>
              </div>
            )}
          </div>
        )}

        {/* ── Search Bar Row ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: scrolled ? '6px 16px' : '0 16px 8px', display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          {/* Logo in scrolled mode */}
          {scrolled && (
            <Link href="/" style={{
              background: '#ffe500', padding: '6px 14px', borderRadius: 8,
              fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
              color: '#212121', flexShrink: 0,
            }}>
              <span style={{ background: '#2874f0', color: '#fff', width: 20, height: 20, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, fontStyle: 'italic' }}>f</span>
              <span style={{ color: '#212121', fontWeight: 700 }}>Flipkart</span>
            </Link>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', minWidth: isMobile ? '100%' : 'auto', order: isMobile ? 10 : 0 }}>
            <div style={{ flex: 1, display: 'flex', border: '2px solid #2874f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
              <div style={{ padding: isMobile ? '8px 10px' : '10px 14px', display: 'flex', alignItems: 'center', color: '#878787' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={isMobile ? 'Search products...' : 'Search for Products, Brands and More'}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#212121', background: 'transparent', minWidth: 0 }}
              />
            </div>
          </form>

          {/* Account */}
          <div ref={accountRef} style={{ position: 'relative' }}>
            <button onClick={() => { setShowAccountMenu(!showAccountMenu); setShowMoreMenu(false); }}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 0', fontSize: 14, color: '#212121' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5.5 20.5a7.5 7.5 0 0 1 13 0"/></svg>
              <span style={{ fontWeight: 500 }}>Account</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {showAccountMenu && (
              <div style={{ 
                position: isMobile ? 'fixed' : 'absolute', 
                top: isMobile ? 0 : '100%', 
                right: isMobile ? 0 : 0, 
                left: isMobile ? 0 : 'auto',
                bottom: isMobile ? 0 : 'auto',
                background: isMobile ? 'rgba(0,0,0,.5)' : 'transparent', 
                zIndex: 9999 
              }}>
                <div style={{ background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,.15)', borderRadius: isMobile ? 0 : 4, minWidth: isMobile ? '100%' : 220, maxHeight: isMobile ? '100vh' : 'auto', overflowY: 'auto', border: isMobile ? 'none' : '1px solid #e0e0e0' }}>
                  {/* Mobile header */}
                  {isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', background: '#2874f0' }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>My Account</span>
                      <button onClick={() => setShowAccountMenu(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>
                  )}
                  {isAuthenticated ? (
                    <>
                      {[
                        { label: 'My Profile', href: '/account' },
                        { label: 'Orders', href: '/orders' },
                        { label: 'Wishlist', href: '/wishlist' },
                        { label: 'Coupons', href: '/account/coupons' },
                        { label: 'Gift Cards', href: '/account/gift-cards' },
                        { label: 'Saved Addresses', href: '/account/addresses' },
                        { label: 'Notifications', href: '#' },
                      ].map(item => (
                        <Link key={item.label} href={item.href} onClick={() => setShowAccountMenu(false)}
                          style={{ display: 'block', padding: isMobile ? '14px 16px' : '10px 16px', fontSize: isMobile ? 15 : 13, color: '#212121', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { logout(); setShowAccountMenu(false); }}
                        style={{ display: 'block', width: '100%', padding: isMobile ? '14px 16px' : '10px 16px', fontSize: isMobile ? 15 : 13, color: '#ff6161', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', borderTop: '1px solid #f0f0f0' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: 13, color: '#878787', marginBottom: 10 }}>New customer?</p>
                      <Link href="/login" onClick={() => setShowAccountMenu(false)}
                        style={{ display: 'block', background: '#2874f0', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: 4, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                        Login / Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* More */}
          {!isMobile && (
            <div ref={moreRef} style={{ position: 'relative' }}>
              <button onClick={() => { setShowMoreMenu(!showMoreMenu); setShowAccountMenu(false); }}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 0', fontSize: 14, color: '#212121' }}>
                <span style={{ fontWeight: 500 }}>More</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showMoreMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,.15)', borderRadius: 4, minWidth: 220, zIndex: 999, border: '1px solid #e0e0e0' }}>
                  {['Become a Seller', 'Notification Settings', '24x7 Customer Care', 'Advertise on Flipkart'].map(label => (
                    <div key={label}
                      style={{ padding: '10px 16px', fontSize: 13, color: '#212121', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 14, color: '#212121', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: '#ff4081', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </div>
            <span style={{ fontWeight: 500 }}>Cart</span>
          </Link>
        </div>

        {/* ── Category Icon Tabs ── */}
        <div style={{ borderTop: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 8px' }}>
            {HOMEPAGE_TABS.map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', flexDirection: scrolled ? 'row' : 'column', alignItems: 'center', gap: scrolled ? 6 : 2,
                  padding: scrolled ? '8px 14px' : '6px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  flexShrink: 0, minWidth: scrolled ? 'auto' : 80,
                  borderBottom: activeTab === tab.key ? '3px solid #2874f0' : '3px solid transparent',
                  transition: 'all .15s',
                }}>
                {!scrolled && <span style={{ fontSize: 32, lineHeight: 1.1 }}>{tab.icon}</span>}
                <span style={{
                  fontSize: scrolled ? 13 : 12, fontWeight: activeTab === tab.key ? 700 : 500,
                  color: activeTab === tab.key ? '#2874f0' : '#212121',
                  whiteSpace: 'nowrap',
                }}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px' }}>

        {/* ── Banner Carousel (only for "For You" tab) ── */}
        {activeTab === 'for-you' && (
          <div style={{ position: 'relative', margin: '0 0 8px' }}>
            <div style={{ display: 'flex', gap: 8, overflow: 'hidden', borderRadius: 8 }}>
              {visiblePanels.map((panel, i) => (
                <div key={i} style={{
                  flex: i === 0 ? 2 : 1.5,
                  background: panel.bg,
                  borderRadius: 8,
                  padding: '24px 20px',
                  minHeight: 180,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  overflow: 'hidden', position: 'relative', cursor: 'pointer',
                }}
                  onClick={() => router.push('/products')}
                >
                  <div>
                    <h3 style={{ fontSize: i === 0 ? 28 : 18, fontWeight: 800, color: panel.dark ? '#212121' : '#fff', lineHeight: 1.2, marginBottom: 4 }}>{panel.title}</h3>
                    <p style={{ fontSize: 14, color: panel.dark ? '#555' : 'rgba(255,255,255,.85)', marginBottom: 4 }}>{panel.subtitle}</p>
                    {panel.extra && <p style={{ fontSize: 16, fontWeight: 700, color: panel.dark ? '#212121' : '#ffe500' }}>{panel.extra}</p>}
                  </div>
                  {panel.img && (
                    <img src={panel.img} alt="" style={{ height: 140, objectFit: 'cover', borderRadius: 8, opacity: 0.9 }}
                      onError={e => e.target.style.display = 'none'} />
                  )}
                </div>
              ))}
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
              {Array.from({ length: maxSlides }).map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  style={{ width: i === bannerIdx ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === bannerIdx ? '#2874f0' : '#c2c2c2', transition: 'all .3s', padding: 0 }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Subcategory Chips (for category tabs) ── */}
        {activeTab !== 'for-you' && getTabSubcategories().length > 0 && (
          <div style={{ background: '#fff', borderRadius: 8, padding: '12px 20px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', padding: '4px 0' }}>
              {getTabSubcategories().map((sub, i) => {
                const catSlug = TAB_TO_CATEGORY[activeTab];
                return (
                  <Link key={i} href={`/products?category=${catSlug}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                      border: '1px solid #e0e0e0', borderRadius: 20, textDecoration: 'none',
                      fontSize: 13, color: '#212121', fontWeight: 500, whiteSpace: 'nowrap',
                      background: '#fff', flexShrink: 0, transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2874f0'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#2874f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#212121'; e.currentTarget.style.borderColor = '#e0e0e0'; }}>
                    {sub}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── "Still looking for these?" / Products Section ── */}
        <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#212121', marginBottom: 16 }}>
            {activeTab === 'for-you' ? 'Still looking for these?' : `Best of ${HOMEPAGE_TABS.find(t => t.key === activeTab)?.label || ''}`}
          </h2>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
                  <div style={{ paddingBottom: '100%', background: '#e8e8e8', borderRadius: 8, marginBottom: 10 }} />
                  <div style={{ height: 14, background: '#e8e8e8', borderRadius: 4, marginBottom: 6, width: '80%' }} />
                  <div style={{ height: 12, background: '#e8e8e8', borderRadius: 4, width: '50%' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#878787' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
              <p style={{ fontSize: 16 }}>No products found in this category</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: isMobile ? 8 : 16 }}>
              {products.map(product => (
                <Link key={product.id} href={`/product/${product.id}`}
                  style={{ textDecoration: 'none', background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', transition: 'box-shadow .2s, transform .15s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: '100%', height: 180, overflow: 'hidden', background: '#f5f5f5', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                    <img src={product.images?.[0] || 'https://placehold.co/200x200/f1f3f6/878787?text=Product'}
                      alt={product.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 12 }}
                      onError={e => e.target.src = 'https://placehold.co/200x200/f1f3f6/878787?text=Product'} />
                    {product.discount_percent >= 40 && (
                      <span style={{ position: 'absolute', top: 6, left: 6, background: '#ff6161', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
                        Hot Deal
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 90 }}>
                    <p style={{ fontSize: 13, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {product.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#212121' }}>{formatPrice(product.price)}</span>
                      {parseFloat(product.mrp) > parseFloat(product.price) && (
                        <>
                          <span style={{ fontSize: 12, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</span>
                          <span style={{ fontSize: 12, color: '#388e3c', fontWeight: 600 }}>{product.discount_percent}% off</span>
                        </>
                      )}
                    </div>
                    {product.rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ background: product.rating >= 4 ? '#388e3c' : product.rating >= 3 ? '#ff9f00' : '#ff6161', color: '#fff', fontSize: 11, padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>
                          {parseFloat(product.rating).toFixed(1)} ★
                        </span>
                        {product.review_count > 0 && (
                          <span style={{ fontSize: 11, color: '#878787' }}>({product.review_count?.toLocaleString()})</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Unbeatable Prices Section (only for-you) ── */}
        {activeTab === 'for-you' && products.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#212121' }}>Unbeatable prices</h2>
              <Link href="/products" style={{ background: '#2874f0', color: '#fff', padding: '8px 20px', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>VIEW ALL</Link>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8 }}>
              {products.slice(0, 8).map(product => (
                <Link key={product.id} href={`/product/${product.id}`}
                  style={{ flexShrink: 0, width: 160, textDecoration: 'none', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0', transition: 'box-shadow .2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ height: 160, overflow: 'hidden', background: '#f5f5f5' }}>
                    <img src={product.images?.[0] || 'https://placehold.co/160x160/f1f3f6/878787?text=Product'}
                      alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                      onError={e => e.target.src = 'https://placehold.co/160x160/f1f3f6/878787?text=Product'} />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p style={{ fontSize: 12, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{product.name}</p>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#212121' }}>{formatPrice(product.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Flipkart Plus Promo ── */}
        {activeTab === 'for-you' && (
          <div style={{ background: 'linear-gradient(90deg,#2874f0,#6C63FF)', padding: '20px 28px', marginBottom: 8, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Flipkart Plus</h3>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>Earn SuperCoins on every purchase. Get exclusive deals & early access!</p>
            </div>
            <Link href="/products" style={{ background: '#fff', color: '#2874f0', padding: '10px 28px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Explore Plus
            </Link>
          </div>
        )}
      </div>

      {/* ═══════════════════ ADDRESS PICKER MODAL ═══════════════════ */}
      {showAddressPicker && (
        <>
          {/* Backdrop */}
          <div onClick={() => setShowAddressPicker(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000 }} />
          {/* Side Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, width: isMobile ? '100%' : 420, maxWidth: isMobile ? '100%' : '90vw', height: '100vh',
            background: '#fff', zIndex: 1001, boxShadow: '-4px 0 24px rgba(0,0,0,.15)',
            display: 'flex', flexDirection: 'column', animation: 'slideInRight .25s ease-out',
          }}>
            {/* Header */}
            <div style={{ padding: isMobile ? '16px' : '20px 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: '#212121' }}>Select delivery address</h2>
              <button onClick={() => setShowAddressPicker(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#878787', padding: 4 }}>&times;</button>
            </div>
            {/* Search */}
            <div style={{ padding: isMobile ? '12px 16px' : '16px 24px' }}>
              <div style={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' }}>
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', color: '#878787' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </div>
                <input placeholder="Search by area, street name, pin code" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', padding: '10px 0', minWidth: 0 }} />
              </div>
            </div>
            {/* Use current location */}
            <div style={{ padding: isMobile ? '4px 16px 12px' : '4px 24px 12px', borderBottom: '1px solid #e0e0e0' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#2874f0', fontWeight: 600, fontSize: 14, padding: '8px 0' }}>
                <svg width="18" height="18" fill="#2874f0" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
                Use my current location
              </button>
            </div>
            {/* Saved addresses */}
            <div style={{ padding: isMobile ? '12px 16px' : '16px 24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#878787', textTransform: 'uppercase' }}>Saved addresses</span>
                <button onClick={() => { setShowAddressPicker(false); window.location.href = '/account/addresses'; }} style={{ background: 'none', border: 'none', color: '#2874f0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add New</button>
              </div>
              {/* Dynamic address items from user's saved addresses */}
              {allAddresses.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#878787' }}>
                  <p style={{ fontSize: 14, marginBottom: 8 }}>No saved addresses</p>
                  <button onClick={() => { setShowAddressPicker(false); window.location.href = '/account/addresses'; }}
                    style={{ background: '#2874f0', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Add Address
                  </button>
                </div>
              ) : (
                allAddresses.map((addr, i) => {
                  const isSelected = userAddress?.id === addr.id;
                  return (
                    <div key={addr.id || i} onClick={() => { setUserAddress(addr); setShowAddressPicker(false); }}
                      style={{
                        padding: isMobile ? '12px' : '14px 16px', borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                        border: isSelected ? '2px solid #2874f0' : '1px solid #e0e0e0',
                        background: isSelected ? '#f0f4ff' : '#fff',
                      }}
                      onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f5f5f5')}
                      onMouseLeave={e => !isSelected && (e.currentTarget.style.background = '#fff')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <svg width="16" height="16" fill={isSelected ? '#2874f0' : '#878787'} viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>{addr.name}</span>
                        <span style={{ fontSize: 11, color: '#878787', background: '#f0f0f0', padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase', fontWeight: 600 }}>{addr.address_type || 'HOME'}</span>
                        {isSelected && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#2874f0', color: '#fff', fontWeight: 600 }}>Selected</span>}
                      </div>
                      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.4, marginLeft: 24 }}>
                        {addr.address}{addr.locality ? `, ${addr.locality}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p style={{ fontSize: 12, color: '#878787', marginLeft: 24, marginTop: 2 }}>{addr.phone}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        </>
      )}
    </div>
  );
}
