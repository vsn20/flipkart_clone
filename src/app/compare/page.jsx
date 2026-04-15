'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const baseId = searchParams.get('base_id');

  const [slots, setSlots] = useState([null, null, null, null]); // up to 4 products
  const [sameCategoryProducts, setSameCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  useEffect(() => {
    if (!baseId) return;
    setLoading(true);
    productsAPI.getById(baseId).then(res => {
      const prod = res.data.product;
      const similar = res.data.similarProducts || [];
      setSlots([prod, null, null, null]);
      setSameCategoryProducts(similar);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [baseId]);

  const addProduct = async (slotIndex, productId) => {
    if (!productId) {
      setSlots(prev => { const n = [...prev]; n[slotIndex] = null; return n; });
      return;
    }
    try {
      const res = await productsAPI.getById(productId);
      setSlots(prev => { const n = [...prev]; n[slotIndex] = res.data.product; return n; });
    } catch {}
  };

  const removeProduct = (slotIndex) => {
    if (slotIndex === 0) return; // can't remove base
    setSlots(prev => { const n = [...prev]; n[slotIndex] = null; return n; });
  };

  const filledSlots = slots.filter(Boolean);
  const filledCount = filledSlots.length;

  // Collect all specification keys across all filled products
  const allSpecKeys = [];
  filledSlots.forEach(p => {
    if (p.specifications && typeof p.specifications === 'object') {
      Object.keys(p.specifications).forEach(k => {
        if (!allSpecKeys.includes(k)) allSpecKeys.push(k);
      });
    }
  });

  // Also collect description-based highlights
  const highlightKeys = ['Brand', 'Model', 'Color', 'Warranty'];
  const getSpecValue = (product, key) => {
    if (!product) return '';
    if (product.specifications && product.specifications[key]) return product.specifications[key];
    if (key === 'Brand') return product.brand || '';
    return '';
  };

  // Filter to only differing rows
  const shouldShowRow = (key) => {
    if (!showDiffOnly) return true;
    const vals = slots.map(p => getSpecValue(p, key));
    const nonEmpty = vals.filter(v => v);
    if (nonEmpty.length <= 1) return true;
    return new Set(nonEmpty).size > 1;
  };

  // IDs already in slots
  const usedIds = slots.filter(Boolean).map(p => p.id);
  const availableProducts = sameCategoryProducts.filter(p => !usedIds.includes(p.id));

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f3f6' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTop: '3px solid #2874f0', borderRadius: '50%', animation: 'spin 1s linear infinite' }}/>
      </div>
    );
  }

  if (!slots[0]) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f3f6' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>⚖️</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#212121', marginBottom: 8 }}>No product to compare</h2>
        <p style={{ fontSize: 14, color: '#878787', marginBottom: 16 }}>Go to a product listing and click "Add to Compare"</p>
        <Link href="/products" style={{ background: '#2874f0', color: '#fff', padding: '10px 32px', borderRadius: 2, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Browse Products</Link>
      </div>
    );
  }

  const baseProduct = slots[0];
  const categoryName = baseProduct.category?.name || 'Products';

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 24px', marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#212121', lineHeight: 1.4, marginBottom: 4 }}>
            Compare {baseProduct.name} vs others
          </h1>
          <p style={{ fontSize: 13, color: '#878787' }}>{filledCount} item{filledCount > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 16px' }}>
        {/* Product Cards Row */}
        <div style={{ background: '#fff', padding: '20px 0', marginBottom: 4, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {slots.map((product, idx) => (
              <div key={idx} style={{ padding: '0 20px', borderRight: idx < 3 ? '1px solid #f0f0f0' : 'none', position: 'relative' }}>
                {product ? (
                  <div>
                    {/* Remove button (not for base) */}
                    {idx > 0 && (
                      <button onClick={() => removeProduct(idx)}
                        style={{ position: 'absolute', top: 0, right: 12, background: 'none', border: 'none', fontSize: 20, color: '#878787', cursor: 'pointer', lineHeight: 1 }}>
                        ✕
                      </button>
                    )}
                    {/* Image */}
                    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <img src={product.images?.[0] || 'https://placehold.co/200x200/f1f3f6/878787?text=No+Image'}
                        alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    {/* Name */}
                    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ fontSize: 14, color: '#212121', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        onMouseEnter={e => e.target.style.color = '#2874f0'}
                        onMouseLeave={e => e.target.style.color = '#212121'}>
                        {product.name}
                      </p>
                    </Link>
                    {/* Rating */}
                    {parseFloat(product.rating) > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <span style={{ background: '#388e3c', color: '#fff', fontSize: 11, fontWeight: 600, padding: '1px 5px', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          {parseFloat(product.rating).toFixed(1)} ★
                        </span>
                        <span style={{ fontSize: 12, color: '#878787' }}>({(product.review_count || 0).toLocaleString('en-IN')})</span>
                        {parseFloat(product.rating) >= 4 && (
                          <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="assured" style={{ height: 14, marginLeft: 2 }} />
                        )}
                      </div>
                    )}
                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#212121' }}>{formatPrice(product.price)}</span>
                      {parseFloat(product.mrp) > parseFloat(product.price) && (
                        <>
                          <span style={{ fontSize: 13, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</span>
                          <span style={{ fontSize: 12, color: '#388e3c', fontWeight: 600 }}>
                            {product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Empty Slot - Add a product */
                  <div>
                    <div style={{ height: 160, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 36, color: '#c2c2c2' }}>+</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#212121', marginBottom: 12 }}>Add a product</p>
                    {/* Brand dropdown (placeholder) */}
                    <div style={{ marginBottom: 8 }}>
                      <select disabled style={{ width: '100%', padding: '8px 10px', border: '1px solid #c2c2c2', borderRadius: 2, fontSize: 13, color: '#878787', background: '#fff', appearance: 'none', cursor: 'not-allowed' }}>
                        <option>Choose Brand</option>
                      </select>
                    </div>
                    {/* Product dropdown */}
                    <div>
                      <select
                        onChange={e => addProduct(idx, e.target.value)}
                        value=""
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #c2c2c2', borderRadius: 2, fontSize: 13, color: '#212121', background: '#fff', cursor: 'pointer' }}>
                        <option value="">Choose a Product</option>
                        {availableProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Show only differences */}
        {filledCount > 1 && (
          <div style={{ background: '#fff', padding: '12px 20px', marginBottom: 4, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={showDiffOnly} onChange={e => setShowDiffOnly(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#2874f0' }} />
              <span style={{ fontSize: 14, color: '#212121', fontWeight: 500 }}>Show only differences</span>
            </label>
          </div>
        )}

        {/* Specifications Table */}
        <div style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.08)', marginBottom: 24 }}>
          {/* General Section */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#212121', margin: 0 }}>Highlights</h3>
          </div>

          {/* Brand row */}
          {shouldShowRow('Brand') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ padding: '12px 20px', fontSize: 13, color: '#878787', fontWeight: 500, background: '#fafafa' }}>Brand</div>
              {slots.map((p, i) => (
                <div key={i} style={{ padding: '12px 20px', fontSize: 13, color: '#212121', borderLeft: '1px solid #f0f0f0' }}>
                  {p?.brand || '—'}
                </div>
              ))}
            </div>
          )}

          {/* Description row */}
          {shouldShowRow('Description') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ padding: '12px 20px', fontSize: 13, color: '#878787', fontWeight: 500, background: '#fafafa' }}>Description</div>
              {slots.map((p, i) => (
                <div key={i} style={{ padding: '12px 20px', fontSize: 13, color: '#212121', borderLeft: '1px solid #f0f0f0', lineHeight: 1.5 }}>
                  {p ? (p.description?.substring(0, 200) || '—') : '—'}
                </div>
              ))}
            </div>
          )}

          {/* Specification rows */}
          {allSpecKeys.length > 0 && (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '4px solid #f0f0f0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#212121', margin: 0 }}>Specifications</h3>
              </div>
              {allSpecKeys.filter(k => shouldShowRow(k)).map(key => (
                <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ padding: '12px 20px', fontSize: 13, color: '#878787', fontWeight: 500, background: '#fafafa' }}>{key}</div>
                  {slots.map((p, i) => (
                    <div key={i} style={{ padding: '12px 20px', fontSize: 13, color: '#212121', borderLeft: '1px solid #f0f0f0', lineHeight: 1.5 }}>
                      {getSpecValue(p, key) || '—'}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Price comparison row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', borderBottom: '1px solid #f0f0f0', borderTop: '4px solid #f0f0f0' }}>
            <div style={{ padding: '12px 20px', fontSize: 14, color: '#212121', fontWeight: 700, background: '#fafafa' }}>Price</div>
            {slots.map((p, i) => (
              <div key={i} style={{ padding: '12px 20px', fontSize: 15, color: '#212121', fontWeight: 600, borderLeft: '1px solid #f0f0f0' }}>
                {p ? formatPrice(p.price) : '—'}
              </div>
            ))}
          </div>

          {/* Rating row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ padding: '12px 20px', fontSize: 14, color: '#212121', fontWeight: 700, background: '#fafafa' }}>Rating</div>
            {slots.map((p, i) => (
              <div key={i} style={{ padding: '12px 20px', fontSize: 13, color: '#212121', borderLeft: '1px solid #f0f0f0' }}>
                {p && parseFloat(p.rating) > 0 ? (
                  <span style={{ background: '#388e3c', color: '#fff', padding: '2px 6px', borderRadius: 3, fontSize: 12, fontWeight: 600 }}>
                    {parseFloat(p.rating).toFixed(1)} ★
                  </span>
                ) : '—'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTop: '3px solid #2874f0', borderRadius: '50%', animation: 'spin 1s linear infinite' }}/></div>}>
      <CompareContent />
    </Suspense>
  );
}
