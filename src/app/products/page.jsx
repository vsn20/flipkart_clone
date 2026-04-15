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
  const subcategorySlug = searchParams.get('subcategory') || '';
  const subSubcategorySlug = searchParams.get('sub_subcategory') || '';

  const [products, setProducts] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: categorySlug, subcategory: subcategorySlug, sub_subcategory: subSubcategorySlug,
    min_price: '', max_price: '', min_rating: '', brand: '', color: '',
    sort: 'rating', search: searchQuery, page: 1,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch category tree on mount
  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategoryTree(r.data.categories || [])).catch(() => {});
  }, []);

  // Sync URL params to filters
  useEffect(() => {
    setFilters(p => ({ ...p, search: searchQuery, category: categorySlug, subcategory: subcategorySlug, sub_subcategory: subSubcategorySlug, page: 1 }));
  }, [searchQuery, categorySlug, subcategorySlug, subSubcategorySlug]);

  // Fetch products when filters change
  useEffect(() => { fetchProducts(); }, [filters]);

  // Fetch brands when category/subcategory changes
  useEffect(() => {
    const params = {};
    const activeCat = categoryTree.find(c => c.slug === filters.category);
    if (activeCat) params.category_id = activeCat.id;
    const activeSub = activeCat?.subcategories?.find(s => s.slug === filters.subcategory);
    if (activeSub) params.subcategory_id = activeSub.id;
    productsAPI.getBrands(params).then(r => setBrands(r.data.brands || [])).catch(() => setBrands([]));
  }, [filters.category, filters.subcategory, categoryTree]);

  // Fetch colors when category/subcategory changes
  useEffect(() => {
    const params = {};
    const activeCat = categoryTree.find(c => c.slug === filters.category);
    if (activeCat) params.category_id = activeCat.id;
    const activeSub = activeCat?.subcategories?.find(s => s.slug === filters.subcategory);
    if (activeSub) params.subcategory_id = activeSub.id;
    productsAPI.getColors(params).then(r => setAvailableColors(r.data.colors || [])).catch(() => setAvailableColors([]));
  }, [filters.category, filters.subcategory, categoryTree]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 24 };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.subcategory) params.subcategory = filters.subcategory;
      if (filters.sub_subcategory) params.sub_subcategory = filters.sub_subcategory;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      if (filters.brand) params.brand = filters.brand;
      if (filters.color) params.color = filters.color;
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

  // Resolve active hierarchy for breadcrumb + title
  const activeCat = categoryTree.find(c => c.slug === filters.category);
  const activeSub = activeCat?.subcategories?.find(s => s.slug === filters.subcategory);
  const activeSubSub = activeSub?.subSubcategories?.find(ss => ss.slug === filters.sub_subcategory);
  const pageTitle = activeSubSub?.name || activeSub?.name || activeCat?.name || (filters.search ? `"${filters.search}"` : 'All Products');

  // Color hex map for swatches
  const colorHexMap = { Black: '#000', White: '#fff', Blue: '#2196F3', Red: '#F44336', Green: '#4CAF50', Gold: '#FFD700', Silver: '#C0C0C0', Pink: '#E91E63', Grey: '#9E9E9E', Brown: '#795548', Yellow: '#FFEB3B', Purple: '#9C27B0' };

  /* ─── Sidebar ───────────────────────────── */
  const Sidebar = () => (
    <div style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.08)', position: 'sticky', top: 56, maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#212121' }}>Filters</span>
        {(filters.category || filters.subcategory || filters.sub_subcategory || filters.min_price || filters.min_rating || filters.brand || filters.color) && (
          <button onClick={() => setFilters(p => ({ ...p, category: '', subcategory: '', sub_subcategory: '', min_price: '', max_price: '', min_rating: '', brand: '', color: '', page: 1 }))}
            style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
            Clear All
          </button>
        )}
      </div>

      {/* CATEGORIES — 3 tier drilldown */}
      <FilterSection title="CATEGORIES">
        {/* Back navigation */}
        {filters.sub_subcategory && (
          <button onClick={() => setFilters(p => ({ ...p, sub_subcategory: '', page: 1 }))}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2874f0', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 6, padding: 0 }}>
            ‹ {activeSub?.name || 'Back'}
          </button>
        )}
        {!filters.sub_subcategory && filters.subcategory && (
          <button onClick={() => setFilters(p => ({ ...p, subcategory: '', sub_subcategory: '', page: 1 }))}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2874f0', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 6, padding: 0 }}>
            ‹ {activeCat?.name || 'Back'}
          </button>
        )}
        {!filters.subcategory && filters.category && (
          <button onClick={() => setFilters(p => ({ ...p, category: '', subcategory: '', sub_subcategory: '', page: 1 }))}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2874f0', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 6, padding: 0 }}>
            ‹ All Categories
          </button>
        )}

        {/* Show sub-subcategories if subcategory selected */}
        {filters.subcategory && activeSub ? (
          (activeSub.subSubcategories || []).map(ss => (
            <div key={ss.id}
              onClick={() => setFilters(p => ({ ...p, sub_subcategory: ss.slug, page: 1 }))}
              style={{
                padding: '4px 0', cursor: 'pointer', fontSize: 13,
                color: filters.sub_subcategory === ss.slug ? '#212121' : '#555',
                fontWeight: filters.sub_subcategory === ss.slug ? 600 : 400,
              }}>
              {filters.sub_subcategory === ss.slug && <span style={{ marginRight: 4 }}>▾</span>}
              {ss.name}
            </div>
          ))
        ) : filters.category && activeCat ? (
          /* Show subcategories of selected category */
          (activeCat.subcategories || []).map(sub => (
            <div key={sub.id}
              onClick={() => setFilters(p => ({ ...p, subcategory: sub.slug, sub_subcategory: '', page: 1 }))}
              style={{
                padding: '4px 0', cursor: 'pointer', fontSize: 13,
                color: filters.subcategory === sub.slug ? '#212121' : '#555',
                fontWeight: filters.subcategory === sub.slug ? 600 : 400,
              }}>
              {filters.subcategory === sub.slug && <span style={{ marginRight: 4 }}>▾</span>}
              {sub.name}
            </div>
          ))
        ) : (
          /* Show top-level categories */
          categoryTree.map(cat => (
            <div key={cat.id}
              onClick={() => setFilters(p => ({ ...p, category: cat.slug, subcategory: '', sub_subcategory: '', page: 1 }))}
              style={{
                padding: '4px 0', cursor: 'pointer', fontSize: 13,
                color: filters.category === cat.slug ? '#212121' : '#555',
                fontWeight: filters.category === cat.slug ? 600 : 400,
              }}>
              {cat.name}
            </div>
          ))
        )}
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

      {/* COLOR */}
      {availableColors.length > 0 && (
        <FilterSection title="COLOR">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {availableColors.map(c => {
              const selectedColors = filters.color ? filters.color.split(',') : [];
              const isChecked = selectedColors.includes(c);
              return (
                <button key={c} onClick={() => {
                  let next;
                  if (isChecked) next = selectedColors.filter(x => x !== c).join(',');
                  else next = [...selectedColors, c].join(',');
                  setFilters(p => ({ ...p, color: next, page: 1 }));
                }}
                  title={c}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: colorHexMap[c] || '#ccc',
                    border: isChecked ? '3px solid #2874f0' : c === 'White' ? '1px solid #ddd' : '2px solid transparent',
                    cursor: 'pointer', position: 'relative',
                    boxShadow: isChecked ? '0 0 0 2px #fff, 0 0 0 4px #2874f0' : 'none',
                  }}>
                  {isChecked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c === 'White' || c === 'Yellow' || c === 'Gold' ? '#333' : '#fff'} strokeWidth="3" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {/* Color names below */}
          {filters.color && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
              Selected: {filters.color.split(',').join(', ')}
            </div>
          )}
        </FilterSection>
      )}

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

        {/* Sidebar - Desktop */}
        {!isMobile && (
          <div style={{ width: 230, flexShrink: 0 }}>
            <Sidebar />
          </div>
        )}

        {/* Mobile Filter Overlay */}
        {isMobile && showMobileFilters && (
          <>
            <div onClick={() => setShowMobileFilters(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '85vw', maxWidth: 320, height: '100vh', zIndex: 1001, overflowY: 'auto', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Filters</span>
                <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#878787' }}>&times;</button>
              </div>
              <Sidebar />
            </div>
          </>
        )}

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: '#878787', marginBottom: 4, padding: '4px 0' }}>
            <Link href="/" style={{ color: '#878787', textDecoration: 'none' }}
              onMouseEnter={e=>e.target.style.color='#2874f0'} onMouseLeave={e=>e.target.style.color='#878787'}>Home</Link>
            {activeCat && (
              <>
                <span style={{ margin: '0 6px' }}>&gt;</span>
                <Link href={`/products?category=${activeCat.slug}`} style={{ color: activeSub ? '#878787' : '#212121', textDecoration: 'none' }}
                  onMouseEnter={e=>e.target.style.color='#2874f0'} onMouseLeave={e=>e.target.style.color= activeSub ? '#878787' : '#212121'}>{activeCat.name}</Link>
              </>
            )}
            {activeSub && (
              <>
                <span style={{ margin: '0 6px' }}>&gt;</span>
                <Link href={`/products?category=${activeCat.slug}&subcategory=${activeSub.slug}`} style={{ color: activeSubSub ? '#878787' : '#212121', textDecoration: 'none' }}
                  onMouseEnter={e=>e.target.style.color='#2874f0'} onMouseLeave={e=>e.target.style.color= activeSubSub ? '#878787' : '#212121'}>{activeSub.name}</Link>
              </>
            )}
            {activeSubSub && (
              <>
                <span style={{ margin: '0 6px' }}>&gt;</span>
                <span style={{ color: '#212121' }}>{activeSubSub.name}</span>
              </>
            )}
            {filters.search && <><span style={{ margin: '0 6px' }}>&gt;</span><span style={{ color: '#212121' }}>{filters.search}</span></>}
          </div>

          {/* Title bar */}
          <div style={{ background: '#fff', padding: '12px 16px', marginBottom: 0, boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: '#212121', display: 'inline', margin: 0 }}>{pageTitle}</h1>
              <span style={{ fontSize: 12, color: '#878787', marginLeft: 8 }}>
                (Showing 1 – {products.length} of {pagination?.total || 0} products)
              </span>
            </div>
          </div>

          {/* Sort Bar */}
          <div style={{
            background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px',
            borderBottom: '2px solid #f0f0f0', boxShadow: '0 1px 2px rgba(0,0,0,.04)',
            overflowX: 'auto', scrollbarWidth: 'none', gap: isMobile ? 0 : undefined,
          }}>
            {isMobile && (
              <button onClick={() => setShowMobileFilters(true)}
                style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#212121', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, borderRight: '1px solid #e0e0e0', marginRight: 8 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
                Filters
              </button>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#212121', paddingRight: 12, whiteSpace: 'nowrap' }}>Sort By</span>
            {sortOptions.map(opt => (
              <button key={opt.value} onClick={() => setFilters(p => ({ ...p, sort: opt.value }))}
                style={{
                  padding: isMobile ? '10px 10px' : '12px 14px', fontSize: isMobile ? 12 : 14, background: 'none', border: 'none',
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
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: '1px', background: '#f1f3f6', width: '100%' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: '1px', background: '#f1f3f6' }}>
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
