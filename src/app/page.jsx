'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsAPI, categoriesAPI } from '@/lib/api';
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
  { key: 'books', label: 'Books &...', icon: '📚' },
  { key: 'furniture', label: 'Furniture', icon: '🪑' },
];

const TAB_TO_CATEGORY = {
  'for-you': '',
  'fashion': 'fashion-men',
  'mobiles': 'mobiles',
  'beauty': 'beauty',
  'electronics': 'electronics',
  'home': 'home-furniture',
  'appliances': 'appliances',
  'toys': 'toys-baby',
  'sports': '',
  'books': '',
  'furniture': 'home-furniture',
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
  const accountRef = useRef(null);
  const moreRef = useRef(null);

  // Fetch categories once
  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  // Fetch products when activeTab changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const catSlug = TAB_TO_CATEGORY[activeTab];
        const params = { limit: 20 };
        if (catSlug) params.category = catSlug;
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
    const t = setInterval(() => setBannerIdx(p => (p + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

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

  // Get subcategories for the selected tab from our categories
  const getTabSubcategories = () => {
    const catSlug = TAB_TO_CATEGORY[activeTab];
    if (!catSlug) return [];
    const cat = categories.find(c => c.slug === catSlug);
    if (!cat) return [];
    // Generate pseudo-subcategories from category data
    const subNames = {
      'mobiles': ['Smartphones', 'Feature Phones', 'Mobile Accessories', 'Cases & Covers', 'Screen Guards', 'Power Banks', 'Headphones', 'View all'],
      'electronics': ['Laptops', 'Tablets', 'Cameras', 'Smart Watches', 'Audio', 'Gaming', 'Computer Accessories', 'View all'],
      'fashion-men': ['T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Watches', 'Wallets', 'Sunglasses', 'View all'],
      'fashion-women': ['Kurtas', 'Sarees', 'Tops', 'Dresses', 'Handbags', 'Jewellery', 'Footwear', 'View all'],
      'home-furniture': ['Decor', 'Furniture', 'Bedsheets', 'Curtains', 'Dining', 'Cookware', 'Cleaning', 'View all'],
      'appliances': ['ACs', 'Refrigerators', 'Washing Machines', 'Microwaves', 'Chimneys', 'Water Purifiers', 'Fans', 'View all'],
      'beauty': ['Skincare', 'Haircare', 'Perfumes', 'Makeup', 'Bath & Body', 'Grooming', 'Deodorants', 'View all'],
      'toys-baby': ['Remote Control', 'Board Games', 'Soft Toys', 'Educational', 'Baby Care', 'Diapers', 'Strollers', 'View all'],
    };
    return subNames[catSlug] || [];
  };

  const currentBanner = BANNERS[bannerIdx];

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh' }}>
      {/* ═══════════════════ HOMEPAGE HEADER ═══════════════════ */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        {/* Top Bar */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            <Link href="/" style={{
              background: '#2874f0', color: '#fff', padding: '8px 20px', borderRadius: 8,
              fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ background: '#ffe500', color: '#2874f0', width: 18, height: 18, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>f</span>
              Flipkart
            </Link>
            <button style={{ background: 'none', border: 'none', padding: '8px 16px', fontSize: 13, color: '#212121', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#ff4081' }}>✈</span> Travel
            </button>
            <button style={{ background: 'none', border: 'none', padding: '8px 16px', fontSize: 13, color: '#212121', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#43a047' }}>🛒</span> Grocery
            </button>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#212121', cursor: 'pointer' }}>
            <span style={{ color: '#2874f0' }}>📍</span>
            <span style={{ fontWeight: 600 }}>503001</span>
            <span style={{ color: '#2874f0', fontWeight: 500 }}>Select delivery location &gt;</span>
          </div>

          {/* SuperCoins */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#212121', cursor: 'pointer' }}>
            <span style={{ fontSize: 16 }}>🪙</span> <span style={{ fontWeight: 600 }}>0</span>
          </div>
        </div>

        {/* Search Bar Row */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex' }}>
            <div style={{ flex: 1, display: 'flex', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', color: '#878787' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search for Products, Brands and More"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#212121', background: 'transparent' }}
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
              <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,.15)', borderRadius: 4, minWidth: 220, zIndex: 999, border: '1px solid #e0e0e0' }}>
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
                        style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#212121', textDecoration: 'none', borderBottom: '1px solid #f5f5f5' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { logout(); setShowAccountMenu(false); }}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, color: '#212121', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
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
            )}
          </div>

          {/* More */}
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
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  flexShrink: 0, minWidth: 80,
                  borderBottom: activeTab === tab.key ? '3px solid #2874f0' : '3px solid transparent',
                  transition: 'border-color .15s',
                }}>
                <span style={{ fontSize: 22 }}>{tab.icon}</span>
                <span style={{
                  fontSize: 12, fontWeight: activeTab === tab.key ? 700 : 500,
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
              {currentBanner.panels.map((panel, i) => (
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
              {BANNERS.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  style={{ width: i === bannerIdx ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === bannerIdx ? '#2874f0' : '#c2c2c2', transition: 'all .3s', padding: 0 }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Subcategory Grid (for category tabs) ── */}
        {activeTab !== 'for-you' && getTabSubcategories().length > 0 && (
          <div style={{ background: '#fff', borderRadius: 8, padding: '20px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 16 }}>
              {getTabSubcategories().map((sub, i) => {
                const catSlug = TAB_TO_CATEGORY[activeTab];
                return (
                  <Link key={i} href={`/products?category=${catSlug}`}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer', padding: 8 }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={`https://placehold.co/72x72/f1f3f6/2874f0?text=${sub.charAt(0)}`} alt={sub}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#212121', textAlign: 'center', fontWeight: 500 }}>{sub}</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {products.map(product => (
                <Link key={product.id} href={`/product/${product.id}`}
                  style={{ textDecoration: 'none', background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #f0f0f0', transition: 'box-shadow .2s, transform .15s', display: 'block' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden', borderRadius: 8, background: '#f5f5f5', marginBottom: 10 }}>
                    <img src={product.images?.[0] || 'https://placehold.co/200x200/f1f3f6/878787?text=Product'}
                      alt={product.name}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                      onError={e => e.target.src = 'https://placehold.co/200x200/f1f3f6/878787?text=Product'} />
                    {product.discount_percent >= 40 && (
                      <span style={{ position: 'absolute', top: 6, left: 6, background: '#ff6161', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
                        Hot Deal
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#212121', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
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
    </div>
  );
}
