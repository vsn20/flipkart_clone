'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productsAPI } from '@/lib/api';
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
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

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
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Logo */}
                   <Link href="/" style={{ textDecoration: 'none', minWidth: isWhiteNav ? 130 : 90, marginRight: 4 }}>
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
          <div ref={searchRef} style={{ flex: 1, maxWidth: 590, position: 'relative' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', marginRight: isCartPage ? '72px' : '0' }}>

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
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,.18)', zIndex: 300, minWidth: 230, borderRadius: 2 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{user?.name}</p>
                    <p style={{ fontSize: 12, color: '#878787', marginTop: 2 }}>{user?.email}</p>
                  </div>
                  {[
                    { href: '/account', icon: '👤', label: 'My Profile' },
                    { href: '/account', icon: '🪙', label: 'SuperCoin Zone' },
                    { href: '/flipkart-plus', icon: '✨', label: 'Flipkart Plus Zone' },
                    { href: '/orders', icon: '📦', label: 'Orders' },
                    { href: '/wishlist', icon: '❤️', label: 'Wishlist', badge: null },
                    { href: '/', icon: '🏷️', label: 'Coupons' },
                    { href: '/', icon: '🎁', label: 'Gift Cards' },
                    { href: '/', icon: '🔔', label: 'Notifications' },
                  ].map(item => (
                    <Link key={item.label} href={item.href} onClick={() => setShowUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#212121', textDecoration: 'none', borderBottom: '1px solid #f9f9f9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5faff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setShowUserMenu(false); router.push('/'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', fontSize: 13, color: '#ff6161', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span>🚪</span>Logout
                  </button>
                </div>
              )}
            </div>

            {/* Become a Seller */}
            {!isCartPage && !isWhiteNav && (
              <button style={{ color: textColor, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: 15, fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Become a Seller
              </button>
            )}

            {/* More */}
            {!isCartPage && (
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
{!isCartPage && !isWhiteNav && <SubNav />}
    </>
  );
}

/* ────────────────────────────────────────────────────────
   SubNav – Full-width Mega Menu Dropdowns
   ──────────────────────────────────────────────────────── */
function SubNav() {
  const [activeMenu, setActiveMenu] = useState(null);

  const navItems = [
    {
      name: 'Electronics', slug: 'electronics',
      mega: [
        {
          heading: 'Mobiles',
          links: [
            { label: 'Mi', slug: 'electronics' },
            { label: 'Realme', slug: 'electronics' },
            { label: 'Samsung', slug: 'electronics' },
            { label: 'Infinix', slug: 'electronics' },
            { label: 'OPPO', slug: 'electronics' },
            { label: 'Apple', slug: 'electronics' },
            { label: 'Vivo', slug: 'electronics' },
            { label: 'Honor', slug: 'electronics' },
            { label: 'Asus', slug: 'electronics' },
            { label: 'POCO', slug: 'electronics' },
          ],
        },
        {
          heading: 'Mobile Accessories',
          links: [
            { label: 'Mobile Cases', slug: 'electronics' },
            { label: 'Headphones & Headsets', slug: 'electronics' },
            { label: 'Power Banks', slug: 'electronics' },
            { label: 'Screenguards', slug: 'electronics' },
            { label: 'Smart Headphones', slug: 'electronics' },
            { label: 'Mobile Cables', slug: 'electronics' },
            { label: 'Mobile Chargers', slug: 'electronics' },
            { label: 'Mobile Holders', slug: 'electronics' },
          ],
        },
        {
          heading: 'Smart Wearable Tech',
          links: [
            { label: 'Smart Watches', slug: 'electronics' },
            { label: 'Smart Bands', slug: 'electronics' },
            { label: 'Smart Glasses', slug: 'electronics' },
          ],
        },
        {
          heading: 'Laptops',
          links: [
            { label: 'Gaming Laptops', slug: 'electronics' },
            { label: 'Desktop PCs', slug: 'electronics' },
            { label: 'Laptop Accessories', slug: 'electronics' },
            { label: 'Printers & Ink', slug: 'electronics' },
            { label: 'Storage', slug: 'electronics' },
          ],
        },
        {
          heading: 'Camera & Accessories',
          links: [
            { label: 'DSLR & Mirrorless', slug: 'electronics' },
            { label: 'Compact & Bridge Cameras', slug: 'electronics' },
            { label: 'Sports & Action', slug: 'electronics' },
            { label: 'Camera Accessories', slug: 'electronics' },
          ],
        },
        {
          heading: 'Speakers & Audio',
          links: [
            { label: 'Bluetooth Speakers', slug: 'electronics' },
            { label: 'Home Audio Speakers', slug: 'electronics' },
            { label: 'Soundbars', slug: 'electronics' },
            { label: 'Home Theatres', slug: 'electronics' },
          ],
        },
        {
          heading: 'Featured',
          isFeatured: true,
          links: [
            { label: 'Google Assistant Store', slug: 'electronics' },
            { label: 'Laptops on Buyback Guarantee', slug: 'electronics' },
            { label: 'Flipkart SmartBuy', slug: 'electronics' },
            { label: 'Li-Polymer Power Banks', slug: 'electronics' },
          ],
        },
      ],
    },
    {
      name: 'TVs & Appliances', slug: 'appliances',
      mega: [
        {
          heading: 'Television',
          links: [
            { label: 'OLED TVs', slug: 'appliances' },
            { label: 'QLED TVs', slug: 'appliances' },
            { label: '4K Ultra HD TVs', slug: 'appliances' },
            { label: 'Full HD TVs', slug: 'appliances' },
            { label: 'HD Ready TVs', slug: 'appliances' },
            { label: 'Android TVs', slug: 'appliances' },
            { label: 'Smart TVs', slug: 'appliances' },
          ],
        },
        {
          heading: 'Washing Machine',
          links: [
            { label: 'Fully Automatic Front Load', slug: 'appliances' },
            { label: 'Fully Automatic Top Load', slug: 'appliances' },
            { label: 'Semi Automatic', slug: 'appliances' },
            { label: 'Dryers', slug: 'appliances' },
          ],
        },
        {
          heading: 'Air Conditioners',
          links: [
            { label: 'Inverter ACs', slug: 'appliances' },
            { label: 'Split ACs', slug: 'appliances' },
            { label: 'Window ACs', slug: 'appliances' },
            { label: 'Portable ACs', slug: 'appliances' },
          ],
        },
        {
          heading: 'Refrigerators',
          links: [
            { label: 'Single Door', slug: 'appliances' },
            { label: 'Double Door', slug: 'appliances' },
            { label: 'Triple Door', slug: 'appliances' },
            { label: 'Side By Side', slug: 'appliances' },
            { label: 'Mini Refrigerators', slug: 'appliances' },
          ],
        },
        {
          heading: 'Kitchen Appliances',
          links: [
            { label: 'Microwave Ovens', slug: 'appliances' },
            { label: 'OTGs', slug: 'appliances' },
            { label: 'Dishwashers', slug: 'appliances' },
            { label: 'Chimneys', slug: 'appliances' },
            { label: 'Juicer/Mixer/Grinder', slug: 'appliances' },
            { label: 'Electric Cookers', slug: 'appliances' },
            { label: 'Induction Cooktops', slug: 'appliances' },
          ],
        },
        {
          heading: 'Small Home Appliances',
          links: [
            { label: 'Air Purifiers', slug: 'appliances' },
            { label: 'Vacuum Cleaners', slug: 'appliances' },
            { label: '   Irons', slug: 'appliances' },
            { label: 'Water Purifiers', slug: 'appliances' },
            { label: 'Fans', slug: 'appliances' },
            { label: 'Geysers', slug: 'appliances' },
          ],
        },
      ],
    },
    {
      name: 'Men', slug: 'fashion-men',
      mega: [
        {
          heading: 'Top Wear',
          links: [
            { label: "Men's T-Shirts", slug: 'fashion-men' },
            { label: 'Casual Shirts', slug: 'fashion-men' },
            { label: 'Formal Shirts', slug: 'fashion-men' },
            { label: 'Sweatshirts', slug: 'fashion-men' },
            { label: 'Sweaters', slug: 'fashion-men' },
            { label: 'Jackets', slug: 'fashion-men' },
            { label: 'Blazers & Coats', slug: 'fashion-men' },
            { label: 'Suits', slug: 'fashion-men' },
            { label: 'Rain Jackets', slug: 'fashion-men' },
          ],
        },
        {
          heading: 'Bottom Wear',
          links: [
            { label: 'Jeans', slug: 'fashion-men' },
            { label: 'Casual Trousers', slug: 'fashion-men' },
            { label: 'Formal Trousers', slug: 'fashion-men' },
            { label: 'Shorts', slug: 'fashion-men' },
            { label: 'Track Pants & Joggers', slug: 'fashion-men' },
            { label: 'Cargos', slug: 'fashion-men' },
            { label: 'Three Fourths', slug: 'fashion-men' },
          ],
        },
        {
          heading: 'Innerwear & Sleepwear',
          links: [
            { label: 'Briefs & Trunks', slug: 'fashion-men' },
            { label: 'Boxers', slug: 'fashion-men' },
            { label: 'Vests', slug: 'fashion-men' },
            { label: 'Sleepwear & Loungewear', slug: 'fashion-men' },
            { label: 'Thermals', slug: 'fashion-men' },
          ],
        },
        {
          heading: 'Footwear',
          links: [
            { label: 'Casual Shoes', slug: 'fashion-men' },
            { label: 'Sports Shoes', slug: 'fashion-men' },
            { label: 'Formal Shoes', slug: 'fashion-men' },
            { label: 'Sneakers', slug: 'fashion-men' },
            { label: 'Sandals & Floaters', slug: 'fashion-men' },
            { label: 'Flip-Flops', slug: 'fashion-men' },
            { label: 'Loafers', slug: 'fashion-men' },
            { label: 'Boots', slug: 'fashion-men' },
          ],
        },
        {
          heading: 'Watches & Accessories',
          links: [
            { label: 'Watches', slug: 'fashion-men' },
            { label: 'Wallets', slug: 'fashion-men' },
            { label: 'Belts', slug: 'fashion-men' },
            { label: 'Sunglasses', slug: 'fashion-men' },
            { label: 'Caps & Hats', slug: 'fashion-men' },
            { label: 'Bags & Backpacks', slug: 'fashion-men' },
            { label: 'Ties, Cufflinks & Pocket Squares', slug: 'fashion-men' },
          ],
        },
        {
          heading: 'Ethnic Wear',
          links: [
            { label: "Men's Kurtas", slug: 'fashion-men' },
            { label: 'Ethnic Sets', slug: 'fashion-men' },
            { label: 'Sherwanis', slug: 'fashion-men' },
            { label: 'Nehru Jackets', slug: 'fashion-men' },
            { label: 'Dhotis & Mundus', slug: 'fashion-men' },
          ],
        },
      ],
    },
    {
      name: 'Women', slug: 'fashion-women',
      mega: [
        {
          heading: 'Indian & Fusion Wear',
          links: [
            { label: 'Kurtas & Kurtis', slug: 'fashion-women' },
            { label: 'Sarees', slug: 'fashion-women' },
            { label: 'Ethnic Wear', slug: 'fashion-women' },
            { label: 'Lehengas', slug: 'fashion-women' },
            { label: 'Salwar Suits', slug: 'fashion-women' },
            { label: 'Blouses', slug: 'fashion-women' },
            { label: 'Dress Materials', slug: 'fashion-women' },
            { label: 'Leggings, Salwars & Churidars', slug: 'fashion-women' },
            { label: 'Skirts & Palazzos', slug: 'fashion-women' },
            { label: 'Dupattas & Shawls', slug: 'fashion-women' },
          ],
        },
        {
          heading: 'Western Wear',
          links: [
            { label: 'Dresses', slug: 'fashion-women' },
            { label: 'Tops', slug: 'fashion-women' },
            { label: 'T-Shirts', slug: 'fashion-women' },
            { label: 'Jeans', slug: 'fashion-women' },
            { label: 'Trousers & Capris', slug: 'fashion-women' },
            { label: 'Shorts & Skirts', slug: 'fashion-women' },
            { label: 'Jumpsuits', slug: 'fashion-women' },
            { label: 'Shrugs', slug: 'fashion-women' },
            { label: 'Sweaters & Sweatshirts', slug: 'fashion-women' },
            { label: 'Jackets & Coats', slug: 'fashion-women' },
          ],
        },
        {
          heading: 'Footwear',
          links: [
            { label: 'Flats', slug: 'fashion-women' },
            { label: 'Casual Shoes', slug: 'fashion-women' },
            { label: 'Heels', slug: 'fashion-women' },
            { label: 'Boots', slug: 'fashion-women' },
            { label: 'Sports Shoes & Floaters', slug: 'fashion-women' },
          ],
        },
        {
          heading: 'Jewellery',
          links: [
            { label: 'Fashion Jewellery', slug: 'fashion-women' },
            { label: 'Fine Jewellery', slug: 'fashion-women' },
            { label: 'Earrings', slug: 'fashion-women' },
            { label: 'Rings', slug: 'fashion-women' },
          ],
        },
        {
          heading: 'Beauty & Personal Care',
          links: [
            { label: 'Make Up', slug: 'fashion-women' },
            { label: 'Skincare', slug: 'fashion-women' },
            { label: 'Hair Care', slug: 'fashion-women' },
            { label: 'Fragrances', slug: 'fashion-women' },
            { label: 'Lipsticks', slug: 'fashion-women' },
          ],
        },
        {
          heading: 'Handbags & Accessories',
          links: [
            { label: 'Handbags', slug: 'fashion-women' },
            { label: 'Clutches', slug: 'fashion-women' },
            { label: 'Watches', slug: 'fashion-women' },
            { label: 'Sunglasses & Frames', slug: 'fashion-women' },
            { label: 'Belts', slug: 'fashion-women' },
          ],
        },
      ],
    },
    {
      name: 'Baby & Kids', slug: 'toys-baby',
      mega: [
        {
          heading: "Boys' Clothing",
          links: [
            { label: 'T-Shirts', slug: 'toys-baby' },
            { label: 'Shirts', slug: 'toys-baby' },
            { label: 'Shorts', slug: 'toys-baby' },
            { label: 'Jeans', slug: 'toys-baby' },
            { label: 'Trousers', slug: 'toys-baby' },
            { label: 'Clothing Sets', slug: 'toys-baby' },
            { label: 'Ethnic Wear', slug: 'toys-baby' },
          ],
        },
        {
          heading: "Girls' Clothing",
          links: [
            { label: 'Dresses', slug: 'toys-baby' },
            { label: 'Tops', slug: 'toys-baby' },
            { label: 'T-Shirts', slug: 'toys-baby' },
            { label: 'Clothing Sets', slug: 'toys-baby' },
            { label: 'Lehenga Cholis', slug: 'toys-baby' },
            { label: 'Kurta Sets', slug: 'toys-baby' },
          ],
        },
        {
          heading: "Kids' Footwear",
          links: [
            { label: "Boys' Footwear", slug: 'toys-baby' },
            { label: "Girls' Footwear", slug: 'toys-baby' },
            { label: 'Infant Footwear', slug: 'toys-baby' },
          ],
        },
        {
          heading: 'Toys',
          links: [
            { label: 'Remote Control Toys', slug: 'toys-baby' },
            { label: 'Educational Toys', slug: 'toys-baby' },
            { label: 'Soft Toys', slug: 'toys-baby' },
            { label: 'Action Figures', slug: 'toys-baby' },
            { label: 'Board Games', slug: 'toys-baby' },
            { label: 'Puzzles', slug: 'toys-baby' },
            { label: 'Musical Toys', slug: 'toys-baby' },
          ],
        },
        {
          heading: 'Baby Care',
          links: [
            { label: 'Diapers', slug: 'toys-baby' },
            { label: 'Wipes', slug: 'toys-baby' },
            { label: 'Baby Bath', slug: 'toys-baby' },
            { label: 'Baby Grooming', slug: 'toys-baby' },
            { label: 'Baby Food', slug: 'toys-baby' },
            { label: 'Baby Gear', slug: 'toys-baby' },
          ],
        },
        {
          heading: 'Featured Brands',
          isFeatured: true,
          links: [
            { label: 'Miss & Chief', slug: 'toys-baby' },
            { label: 'Barbie', slug: 'toys-baby' },
            { label: 'Disney', slug: 'toys-baby' },
            { label: 'Lego', slug: 'toys-baby' },
            { label: 'Funskool', slug: 'toys-baby' },
          ],
        },
      ],
    },
    {
      name: 'Home & Furniture', slug: 'home-furniture',
      mega: [
        {
          heading: 'Kitchen, Cookware & Serveware',
          links: [
            { label: 'Pans', slug: 'home-furniture' },
            { label: 'Tawas', slug: 'home-furniture' },
            { label: 'Pressure Cookers', slug: 'home-furniture' },
            { label: 'Kitchen Tools', slug: 'home-furniture' },
            { label: 'Gas Stoves', slug: 'home-furniture' },
            { label: 'Coffee Mugs', slug: 'home-furniture' },
            { label: 'Dinner Set', slug: 'home-furniture' },
            { label: 'Barware', slug: 'home-furniture' },
          ],
        },
        {
          heading: 'Bed Room Furniture',
          links: [
            { label: 'Beds', slug: 'home-furniture' },
            { label: 'Mattresses', slug: 'home-furniture' },
            { label: 'Wardrobes', slug: 'home-furniture' },
            { label: 'Bedsheets', slug: 'home-furniture' },
            { label: 'Curtains', slug: 'home-furniture' },
            { label: 'Cushions & Pillows', slug: 'home-furniture' },
            { label: 'Blankets', slug: 'home-furniture' },
          ],
        },
        {
          heading: 'Living Room Furniture',
          links: [
            { label: 'Sofas', slug: 'home-furniture' },
            { label: 'Sofa Beds', slug: 'home-furniture' },
            { label: 'TV Units', slug: 'home-furniture' },
            { label: 'Dining Tables & Chairs', slug: 'home-furniture' },
            { label: 'Coffee Tables', slug: 'home-furniture' },
            { label: 'Shoe Racks', slug: 'home-furniture' },
          ],
        },
        {
          heading: 'Home Decor',
          links: [
            { label: 'Paintings', slug: 'home-furniture' },
            { label: 'Clocks', slug: 'home-furniture' },
            { label: 'Wall Shelves', slug: 'home-furniture' },
            { label: 'Stickers', slug: 'home-furniture' },
            { label: 'Showpieces & Figurines', slug: 'home-furniture' },
          ],
        },
        {
          heading: 'Home Lighting',
          links: [
            { label: 'Bulbs', slug: 'home-furniture' },
            { label: 'Wall Lamp', slug: 'home-furniture' },
            { label: 'Table Lamp', slug: 'home-furniture' },
            { label: 'Ceiling Lamp', slug: 'home-furniture' },
            { label: 'Emergency Lights', slug: 'home-furniture' },
          ],
        },
        {
          heading: 'Smart Home Automation',
          links: [
            { label: 'Smart Security System', slug: 'home-furniture' },
            { label: 'Smart Door Locks', slug: 'home-furniture' },
          ],
        },
        {
          heading: 'Home Improvement',
          links: [
            { label: 'Tools & Measuring Equipment', slug: 'home-furniture' },
            { label: 'Home Utilities & Organizers', slug: 'home-furniture' },
            { label: 'Lawn & Gardening', slug: 'home-furniture' },
            { label: 'Bathroom & Kitchen Fittings', slug: 'home-furniture' },
          ],
        },
      ],
    },
    {
      name: 'Sports, Books & More', slug: '',
      mega: [
        {
          heading: 'Sports',
          links: [
            { label: 'Cricket', slug: '' },
            { label: 'Badminton', slug: '' },
            { label: 'Cycling', slug: '' },
            { label: 'Football', slug: '' },
            { label: 'Fitness Gadgets', slug: '' },
            { label: 'Gym Equipment', slug: '' },
            { label: 'Yoga & Accessories', slug: '' },
          ],
        },
        {
          heading: 'Books',
          links: [
            { label: 'Entrance Exams', slug: '' },
            { label: 'Academic & Professional', slug: '' },
            { label: 'Fiction', slug: '' },
            { label: 'Non-Fiction', slug: '' },
            { label: 'Children Books', slug: '' },
          ],
        },
        {
          heading: 'Music',
          links: [
            { label: 'Musical Instruments', slug: '' },
            { label: 'Guitar', slug: '' },
            { label: 'Keyboard', slug: '' },
          ],
        },
        {
          heading: 'Stationery',
          links: [
            { label: 'Pens & Writing', slug: '' },
            { label: 'Art & Craft Supplies', slug: '' },
            { label: 'School Supplies', slug: '' },
            { label: 'Office Supplies', slug: '' },
          ],
        },
        {
          heading: 'Gaming',
          links: [
            { label: 'Gaming Consoles', slug: '' },
            { label: 'Gaming Titles', slug: '' },
            { label: 'Gaming Accessories', slug: '' },
          ],
        },
      ],
    },
    { name: 'Flights', slug: '', mega: null },
    { name: 'Offer Zone', slug: 'products', mega: null },
  ];
  const rightAlignedItems = ['Home & Furniture', 'Sports, Books & More'];

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 1px 3px rgba(0,0,0,.08)', position: 'relative', zIndex: 100 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {navItems.map((item) => {
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
                  href={item.slug ? `/category/${item.slug}` : '/products'}
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
                      <p style={{
                        fontSize: 12.5, fontWeight: 700, color: col.isFeatured ? '#2874f0' : '#212121',
                        marginBottom: 8, paddingBottom: 5,
                        borderBottom: col.isFeatured ? 'none' : '1px solid #f0f0f0',
                        cursor: 'pointer',
                      }}>
                        {col.heading} {!col.isFeatured && <span style={{ float: 'right', fontSize: 11, color: '#2874f0' }}>›</span>}
                      </p>
                      {col.links.map((link) => (
                        <Link key={link.label} href={link.slug ? `/products?category=${link.slug}` : '/products'}
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
