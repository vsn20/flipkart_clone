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

  const discPct = product.discount_percent || Math.round(((parseFloat(product.mrp) - parseFloat(product.price)) / parseFloat(product.mrp)) * 100);
  const rating = parseFloat(product.rating) || 0;
  const isSponsored = product.is_sponsored || Math.random() > 0.7; // Remove this line, use your actual field

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      router.push('/login');
      return;
    }

    setWishLoading(true);
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', position: 'relative', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Heart - Top Right */}
      <button
        onClick={handleWishlist}
        disabled={wishLoading}
       style={{
  position: 'absolute', top: 16, right: 16, zIndex: 2,
  background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
  padding: 6, lineHeight: 1, borderRadius: '50%'
}}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted? '#ff4343' : 'none'} stroke={isWishlisted? '#ff4343' : '#c2c2c2'} strokeWidth="1.8">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Image */}
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' }}>
          <img
            src={product.images?.[0] || 'https://rukminim2.flixcart.com/image/312/xif0q/headphone/placeholder.jpg'}
            alt={product.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>

        {/* Sponsored */}
        {isSponsored && (
          <div style={{ fontSize: 12, color: '#878787', marginBottom: 4, fontWeight: 500 }}>Sponsored</div>
        )}

        {/* Title */}
        <h3 style={{
          fontSize: 14, color: '#212121', lineHeight: '1.4', marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: 39, fontWeight: 400
        }}
        onMouseEnter={e => e.target.style.color = '#2874f0'}
        onMouseLeave={e => e.target.style.color = '#212121'}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          {rating > 0 && (
            <>
              <span style={{
                background: '#388e3c', color: '#fff', fontSize: 12, fontWeight: 600,
                padding: '2px 4px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2
              }}>
                {rating.toFixed(1)} <span style={{ fontSize: 10 }}>★</span>
              </span>
              <span style={{ fontSize: 12, color: '#878787', fontWeight: 500 }}>
                ({(product.review_count || 0).toLocaleString('en-IN')})
              </span>
            </>
          )}
          {rating >= 4 && (
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="assured" style={{ height: 16, marginLeft: 2 }} />
          )}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#212121' }}>{formatPrice(product.price)}</span>
          {parseFloat(product.mrp) > parseFloat(product.price) && (
            <>
              <span style={{ fontSize: 14, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</span>
              <span style={{ fontSize: 13, color: '#388e3c', fontWeight: 600 }}>{discPct}% off</span>
            </>
          )}
        </div>

        {/* Bank Offer / Free Delivery */}
        <div style={{ fontSize: 12, color: '#388e3c', fontWeight: 500, marginBottom: 8, minHeight: 16 }}>
          {parseFloat(product.price) > 500? 'Free delivery' : 'Bank Offer'}
        </div>

        {/* Add to Compare - Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/compare?base_id=${product.id}`); }}>
            <input type="checkbox" style={{ width: 14, height: 14, accentColor: '#2874f0', cursor: 'pointer' }} readOnly />
            <span style={{ fontSize: 12, color: '#212121' }}>Add to Compare</span>
          </label>
        </div>
      </Link>
    </div>
  );
}