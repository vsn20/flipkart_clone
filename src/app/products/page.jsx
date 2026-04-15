'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { productsAPI, categoriesAPI } from '@/lib/api';

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: categorySlug, min_price: '', max_price: '', min_rating: '', brand: '', sort: 'rating', search: searchQuery, page: 1,
  });

  useEffect(() => { categoriesAPI.getAll().then(r => setCategories(r.data.categories || [])); }, []);
  useEffect(() => { setFilters(p => ({ ...p, search: searchQuery, category: categorySlug, page: 1 })); }, [searchQuery, categorySlug]);
  useEffect(() => { fetchProducts(); }, [filters]);

  // Fetch brands whenever category changes
  useEffect(() => {
    const activeCategory = categories.find(c => c.slug === filters.category);
    productsAPI.getBrands(activeCategory?.id).then(r => setBrands(r.data.brands || [])).catch(() => setBrands([]));
  }, [filters.category, categories]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 24 };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      if (filters.brand) params.brand = filters.brand;
      if (filters.sort) params.sort = filters.sort;
      const res = await productsAPI.getAll(params);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination);
    } catch { setProducts([]); } finally { setLoading(false); }
  }

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Popularity' },
    { value: 'price_low', label: 'Price -- Low to High' },
    { value: 'price_high', label: 'Price -- High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'discount', label: 'Discount' },
  ];

  const activeCategory = categories.find(c => c.slug === filters.category);

  /* ─── Sidebar ───────────────────────────── */
  const Sidebar = () => (
    <div style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.08)', position: 'sticky', top: 56, maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#212121' }}>Filters</span>
        {(filters.category || filters.min_price || filters.min_rating || filters.brand) && (
          <button onClick={() => setFilters(p => ({ ...p, category: '', min_price: '', max_price: '', min_rating: '', brand: '', page: 1 }))}
            style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
            Clear All
          </button>
        )}
      </div>

      {/* CATEGORIES */}
      <FilterSection title="CATEGORIES">
        {filters.category && (
          <button onClick={() => setFilters(p => ({ ...p, category: '', page: 1 }))}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2874f0', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 6, padding: 0 }}>
            ‹ All Categories
          </button>
        )}
        {categories.map(cat => (
          <div key={cat.id}
            onClick={() => setFilters(p => ({ ...p, category: cat.slug, page: 1 }))}
            style={{
              padding: '4px 0', cursor: 'pointer', fontSize: 13,
              color: filters.category === cat.slug ? '#212121' : '#555',
              fontWeight: filters.category === cat.slug ? 600 : 400,
            }}>
            {filters.category === cat.slug && <span style={{ marginRight: 4 }}>▾</span>}
            {cat.name}
          </div>
        ))}
      </FilterSection>

      {/* BRAND */}
      <FilterSection title="BRAND">
        <input type="text" placeholder="Search Brand" value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
          style={{ width: '100%', border: '1px solid #c2c2c2', borderRadius: 2, padding: '6px 10px', fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}/>
        {brands
          .filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
          .slice(0, 10)
          .map(b => {
            const selectedBrands = filters.brand ? filters.brand.split(',') : [];
            const isChecked = selectedBrands.includes(b);
            return (
              <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={isChecked}
                  onChange={() => {
                    let next;
                    if (isChecked) next = selectedBrands.filter(x => x !== b).join(',');
                    else next = [...selectedBrands, b].join(',');
                    setFilters(p => ({ ...p, brand: next, page: 1 }));
                  }}
                  style={{ accentColor: '#2874f0', width: 14, height: 14 }}/>
                <span style={{ fontSize: 13, color: '#212121' }}>{b}</span>
              </label>
            );
          })}
        {brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase())).length > 10 && (
          <button style={{ fontSize: 12, color: '#2874f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, padding: 0 }}>
            {brands.length - 10} MORE
          </button>
        )}
      </FilterSection>

      {/* PRICE */}
      <FilterSection title="PRICE">
        <PriceRangeSlider
          min={0} max={100000}
          valueMin={filters.min_price ? parseInt(filters.min_price) : 0}
          valueMax={filters.max_price ? parseInt(filters.max_price) : 100000}
          onChange={(min, max) => setFilters(p => ({ ...p, min_price: min > 0 ? String(min) : '', max_price: max < 100000 ? String(max) : '', page: 1 }))}
        />
        {[
          { min: '', max: '500', label: 'Under ₹500' },
          { min: '500', max: '1000', label: '₹500 - ₹1,000' },
          { min: '1000', max: '5000', label: '₹1,000 - ₹5,000' },
          { min: '5000', max: '10000', label: '₹5,000 - ₹10,000' },
          { min: '10000', max: '50000', label: '₹10,000 - ₹50,000' },
          { min: '50000', max: '', label: 'Above ₹50,000' },
        ].map(r => (
          <label key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.min_price === r.min && filters.max_price === r.max}
              onChange={() => {
                const same = filters.min_price === r.min && filters.max_price === r.max;
                setFilters(p => ({ ...p, min_price: same ? '' : r.min, max_price: same ? '' : r.max, page: 1 }));
              }}
              style={{ accentColor: '#2874f0', width: 14, height: 14 }}/>
            <span style={{ fontSize: 13, color: '#212121' }}>{r.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* CUSTOMER RATINGS */}
      <FilterSection title="CUSTOMER RATINGS">
        {[{v:'4',l:'4★ & above'},{v:'3',l:'3★ & above'},{v:'2',l:'2★ & above'},{v:'1',l:'1★ & above'}].map(opt => (
          <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.min_rating === opt.v}
              onChange={() => setFilters(p => ({ ...p, min_rating: p.min_rating === opt.v ? '' : opt.v, page: 1 }))}
              style={{ accentColor: '#2874f0', width: 14, height: 14 }}/>
            <span style={{ fontSize: 13, color: '#212121' }}>{opt.l}</span>
          </label>
        ))}
      </FilterSection>

      {/* Assured */}
      <FilterSection title="OFFERS" last>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer' }}>
          <input type="checkbox" style={{ accentColor: '#2874f0', width: 14, height: 14 }}/>
          <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Flipkart Assured" style={{ height: 16 }} />
        </label>
      </FilterSection>
    </div>
  );

  /* ─── Main Content ───────────────────────── */
  return (
    <div style={{ background: '#f1f3f6', minHeight: '80vh', padding: '8px 0' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 8px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: 230, flexShrink: 0 }}>
          <Sidebar />
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: '#878787', marginBottom: 4, padding: '4px 0' }}>
            <Link href="/" style={{ color: '#878787', textDecoration: 'none' }}
              onMouseEnter={e=>e.target.style.color='#2874f0'} onMouseLeave={e=>e.target.style.color='#878787'}>Home</Link>
            {activeCategory && <><span style={{ margin: '0 6px' }}>&gt;</span><span style={{ color: '#212121' }}>{activeCategory.name}</span></>}
            {filters.search && <><span style={{ margin: '0 6px' }}>&gt;</span><span style={{ color: '#212121' }}>{filters.search}</span></>}
          </div>

          {/* Title bar */}
          <div style={{ background: '#fff', padding: '12px 16px', marginBottom: 0, boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>
            {activeCategory ? (
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 600, color: '#212121', display: 'inline', margin: 0 }}>{activeCategory.name}</h1>
                <span style={{ fontSize: 12, color: '#878787', marginLeft: 8 }}>
                  (Showing 1 – {products.length} of {pagination?.total || 0} products)
                </span>
              </div>
            ) : filters.search ? (
              <span style={{ fontSize: 14, color: '#212121' }}>
                Showing 1 – {products.length} of <strong>{pagination?.total || 0}</strong> results for &quot;<strong>{filters.search}</strong>&quot;
              </span>
            ) : (
              <span style={{ fontSize: 14, color: '#212121' }}>
                Showing 1 – {products.length} of <strong>{pagination?.total || 0}</strong> products
              </span>
            )}
          </div>

          {/* Sort Bar */}
          <div style={{
            background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px',
            borderBottom: '2px solid #f0f0f0', boxShadow: '0 1px 2px rgba(0,0,0,.04)',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#212121', paddingRight: 12, whiteSpace: 'nowrap' }}>Sort By</span>
            {sortOptions.map(opt => (
              <button key={opt.value} onClick={() => setFilters(p => ({ ...p, sort: opt.value }))}
                style={{
                  padding: '12px 14px', fontSize: 14, background: 'none', border: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  color: filters.sort === opt.value ? '#2874f0' : '#212121',
                  fontWeight: filters.sort === opt.value ? 600 : 400,
                  borderBottom: filters.sort === opt.value ? '3px solid #2874f0' : '3px solid transparent',
                }}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1px', background: '#f1f3f6', width: '100%' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ background: '#fff', padding: 16 }}>
                  <div style={{ paddingBottom: '100%', background: '#f5f5f5', marginBottom: 10 }}/>
                  <div style={{ height: 14, background: '#f5f5f5', marginBottom: 6, width: '80%' }}/>
                  <div style={{ height: 14, background: '#f5f5f5', width: '50%' }}/>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ background: '#fff', padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 500, color: '#212121', marginBottom: 8 }}>No products found</h3>
              <p style={{ fontSize: 14, color: '#878787' }}>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              {/* CSS Grid – 4 columns, 1px gap = #f1f3f6 background showing through */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1px', background: '#f1f3f6' }}>
                {products.map(p => <ProductCard key={p.id} product={p}/>)}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div style={{ background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, padding: 16, marginTop: 4 }}>
                  <button disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                    style={{
                      padding: '8px 24px', fontSize: 13, fontWeight: 600, color: '#2874f0',
                      background: 'none', border: '1px solid #e0e0e0', borderRadius: 2,
                      cursor: filters.page <= 1 ? 'not-allowed' : 'pointer',
                      opacity: filters.page <= 1 ? 0.4 : 1,
                    }}>
                    ‹ PREVIOUS
                  </button>
                  <span style={{ fontSize: 14, color: '#212121' }}>
                    Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                  </span>
                  <button disabled={filters.page >= pagination.totalPages}
                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                    style={{
                      padding: '8px 24px', fontSize: 13, fontWeight: 600, color: '#2874f0',
                      background: 'none', border: '1px solid #e0e0e0', borderRadius: 2,
                      cursor: filters.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                      opacity: filters.page >= pagination.totalPages ? 0.4 : 1,
                    }}>
                    NEXT ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Section Component ─────────────── */
function FilterSection({ title, children, last }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: last ? 'none' : '1px solid #f0f0f0', padding: '12px 14px' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          marginBottom: open ? 8 : 0, padding: 0,
        }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#212121', letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ─── Price Range Slider ──────────────────── */
function PriceRangeSlider({ min, max, valueMin, valueMax, onChange }) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);
  const [dragging, setDragging] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!dragging) { setLocalMin(valueMin); setLocalMax(valueMax); }
  }, [valueMin, valueMax, dragging]);

  const handleMinChange = (e) => {
    const val = Math.min(parseInt(e.target.value), localMax - 1000);
    setLocalMin(val); setDragging(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { onChange(val, localMax); setDragging(false); }, 300);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(parseInt(e.target.value), localMin + 1000);
    setLocalMax(val); setDragging(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { onChange(localMin, val); setDragging(false); }, 300);
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;
  const formatVal = (v) => {
    if (v >= 100000) return '₹1L+';
    if (v >= 1000) return `₹${(v/1000).toFixed(0)}K`;
    return `₹${v}`;
  };

  return (
    <div style={{ marginBottom: 10, padding: '0 2px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#2874f0', fontWeight: 600 }}>{formatVal(localMin)}</span>
        <span style={{ fontSize: 11, color: '#2874f0', fontWeight: 600 }}>{formatVal(localMax)}</span>
      </div>
      <div style={{ position: 'relative', height: 30 }}>
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 4, background: '#e0e0e0', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 12, height: 4, background: '#2874f0', borderRadius: 2, left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }} />
        <input type="range" min={min} max={max} step={500} value={localMin} onChange={handleMinChange}
          style={{ position: 'absolute', top: 2, left: 0, width: '100%', height: 24, appearance: 'none', WebkitAppearance: 'none', background: 'transparent', pointerEvents: 'none', zIndex: 3, margin: 0, padding: 0 }}
          className="price-range-thumb" />
        <input type="range" min={min} max={max} step={500} value={localMax} onChange={handleMaxChange}
          style={{ position: 'absolute', top: 2, left: 0, width: '100%', height: 24, appearance: 'none', WebkitAppearance: 'none', background: 'transparent', pointerEvents: 'none', zIndex: 4, margin: 0, padding: 0 }}
          className="price-range-thumb" />
      </div>
      <style>{`
        .price-range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #2874f0; border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,.3);
          cursor: pointer; pointer-events: auto;
        }
        .price-range-thumb::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #2874f0; border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,.3);
          cursor: pointer; pointer-events: auto;
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTop: '3px solid #2874f0', borderRadius: '50%', animation: 'spin 1s linear infinite' }}/>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
