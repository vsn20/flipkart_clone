'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { wishlistAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(product.is_wishlisted || false);
  const [wishLoading, setWishLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discPct = product.discount_percent || Math.round(((parseFloat(product.mrp) - parseFloat(product.price)) / parseFloat(product.mrp)) * 100);
  const rating = parseFloat(product.rating) || 0;
  const ratingBg = rating >= 4 ? '#388e3c' : rating >= 3 ? '#ff9f00' : '#ff6161';
  const isHotDeal = discPct >= 40;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to add to wishlist'); router.push('/login'); return; }
    setWishLoading(true);
    try {
      if (isWishlisted) { await wishlistAPI.remove(product.id); setIsWishlisted(false); toast.success('Removed from wishlist'); }
      else { await wishlistAPI.add(product.id); setIsWishlisted(true); toast.success('Added to wishlist'); }
    } catch { toast.error('Failed to update wishlist'); }
    finally { setWishLoading(false); }
  };

  return (
    <div
      style={{
        background: '#fff', position: 'relative', cursor: 'pointer',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,.12)' : 'none',
        transition: 'box-shadow .2s', zIndex: hovered ? 2 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Wishlist Heart – top right */}
      <button
        onClick={handleWishlist}
        disabled={wishLoading}
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 3,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, lineHeight: 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill={isWishlisted ? '#ff4343' : 'none'}
          stroke={isWishlisted ? '#ff4343' : '#c2c2c2'}
          strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {/* Image */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
          <img
            src={product.images?.[0] || 'https://placehold.co/280x280/f5f5f5/878787?text=No+Image'}
            alt={product.name}
            style={{
              position: 'absolute', inset: 0, maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain', margin: 'auto', display: 'block',
            }}
            loading="lazy"
            onError={e => { e.target.src = 'https://placehold.co/280x280/f5f5f5/878787?text=No+Image'; }}
          />
        </div>

        {/* Card Body */}
        <div style={{ padding: '10px 7.75px 14px' }}>
          {/* Product Name */}
          <p style={{
            fontSize: 14, color: '#212121', lineHeight: '18px', marginBottom: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontWeight: 400,
          }}
            onMouseEnter={e => e.target.style.color = '#2874f0'}
            onMouseLeave={e => e.target.style.color = '#212121'}
          >
            {product.name}
          </p>

          {/* Rating + Review Count + Assured */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, minHeight: 20 }}>
            {rating > 0 && (
              <span style={{
                background: ratingBg, color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '1px 5px', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 2,
                lineHeight: '16px',
              }}>
                {rating.toFixed(1)} ★
              </span>
            )}
            {(product.review_count || 0) > 0 && (
              <span style={{ fontSize: 12, color: '#878787', fontWeight: 500 }}>
                ({(product.review_count).toLocaleString('en-IN')})
              </span>
            )}
            {rating >= 4 && (
              <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png"
                alt="assured" style={{ height: 16, marginLeft: 2 }} />
            )}
          </div>

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#212121' }}>
              {formatPrice(product.price)}
            </span>
            {parseFloat(product.mrp) > parseFloat(product.price) && (
              <>
                <span style={{ fontSize: 13, color: '#878787', textDecoration: 'line-through' }}>
                  {formatPrice(product.mrp)}
                </span>
                <span style={{ fontSize: 13, color: '#388e3c', fontWeight: 500 }}>
                  {discPct}% off
                </span>
              </>
            )}
          </div>

          {/* Hot Deal or Bank Offer */}
          {isHotDeal ? (
            <span style={{
              display: 'inline-block', background: '#388e3c', color: '#fff',
              fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 2,
              marginTop: 2,
            }}>
              Hot Deal
            </span>
          ) : (
            <p style={{ fontSize: 12, color: '#388e3c', fontWeight: 500, marginTop: 2, minHeight: 16 }}>
              {parseFloat(product.price) >= 500 ? 'Free delivery' : 'Bank Offer'}
            </p>
          )}
        </div>
      </Link>

      {/* Add to Compare – bottom of card */}
      <div style={{ padding: '0 7.75px 10px' }}>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/compare?base_id=${product.id}`); }}
        >
          <input type="checkbox" readOnly style={{ width: 14, height: 14, accentColor: '#2874f0', cursor: 'pointer' }} />
          <span style={{ fontSize: 12, color: '#212121' }}>Add to Compare</span>
        </label>
      </div>
    </div>
  );
}