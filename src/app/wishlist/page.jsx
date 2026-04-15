'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.get();
      setWishlist(res.data.wishlist);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleMoveToCart = async (productId) => {
    const success = await addToCart(productId);
    if (success) {
      await wishlistAPI.remove(productId);
      fetchWishlist();
    }
  };

  if (!isAuthenticated) return null;

  const items = wishlist?.items || [];

  return (
    <div style={{ background: '#f1f3f6', minHeight: 'calc(100vh - 120px)', padding: '16px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 12px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <AccountSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.05)', borderRadius: 2, marginBottom: 12, padding: '16px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#212121', margin: 0 }}>
            My Wishlist ({items.length})
          </h1>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, background: '#f5f5f5' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 2, boxShadow: '0 1px 2px rgba(0,0,0,.05)', overflow: 'hidden' }}>
                <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: '#e8e8e8' }} />
                <div style={{ padding: 12 }}>
                  <div style={{ height: 12, background: '#e8e8e8', borderRadius: 2, marginBottom: 8 }} />
                  <div style={{ height: 10, background: '#e8e8e8', borderRadius: 2, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.05)', borderRadius: 2, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#212121', marginBottom: 4 }}>Your wishlist is empty</h3>
            <p style={{ fontSize: 13, color: '#878787', marginBottom: 16 }}>Save items you love for later</p>
            <Link
              href="/products"
              style={{ background: '#2874f0', color: '#fff', padding: '10px 28px', borderRadius: 2, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, background: '#f5f5f5' }}>
            {items.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: '#fff',
                  borderRadius: 2,
                  boxShadow: hoveredId === item.id ? '0 4px 12px rgba(0,0,0,.15)' : '0 1px 2px rgba(0,0,0,.05)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  transform: hoveredId === item.id ? 'translateY(-4px)' : 'translateY(0)',
                }}
              >
                {/* Product Image */}
                <Link
                  href={`/product/${item.product?.id}`}
                  style={{
                    display: 'block',
                    position: 'relative',
                    paddingBottom: '100%',
                    background: '#f5f5f5',
                    overflow: 'hidden',
                    textDecoration: 'none',
                  }}
                >
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/200'}
                    alt={item.product?.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: 8,
                    }}
                  />
                </Link>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product?.id)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#878787',
                    boxShadow: '0 2px 4px rgba(0,0,0,.1)',
                    transition: 'color 0.2s, box-shadow 0.2s',
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#e84343';
                    e.target.style.boxShadow = '0 4px 8px rgba(232, 67, 67, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#878787';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,.1)';
                  }}
                >
                  <FiTrash2 size={16} />
                </button>

                {/* Product Info */}
                <div style={{ padding: 12 }}>
                  <Link href={`/product/${item.product?.id}`} style={{ textDecoration: 'none' }}>
                    <h3
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#212121',
                        marginBottom: 8,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.product?.name}
                    </h3>
                  </Link>

                  {/* Pricing */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#212121' }}>
                        {formatPrice(item.product?.price)}
                      </span>
                      {parseFloat(item.product?.mrp) > parseFloat(item.product?.price) && (
                        <span style={{ fontSize: 11, color: '#878787', textDecoration: 'line-through' }}>
                          {formatPrice(item.product?.mrp)}
                        </span>
                      )}
                    </div>
                    {parseFloat(item.product?.mrp) > parseFloat(item.product?.price) && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#388e3c' }}>
                        {Math.round(((parseFloat(item.product?.mrp) - parseFloat(item.product?.price)) / parseFloat(item.product?.mrp)) * 100)}% off
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleMoveToCart(item.product?.id)}
                    style={{
                      width: '100%',
                      border: '1px solid #2874f0',
                      background: hoveredId === item.id ? '#2874f0' : '#fff',
                      color: hoveredId === item.id ? '#fff' : '#2874f0',
                      padding: 8,
                      borderRadius: 2,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s, color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#2874f0';
                      e.target.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#fff';
                      e.target.style.color = '#2874f0';
                    }}
                  >
                    <FiShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
