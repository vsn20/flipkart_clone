'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { addressAPI } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, summary, loading, updateQuantity, removeFromCart, fetchCart } = useCart();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [pincode, setPincode] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  useEffect(() => { fetchCart(); }, []);

  // Auto-load addresses on mount so we always have a default
  useEffect(() => {
    if (isAuthenticated) {
      addressAPI.getAll().then(res => {
        const addrs = res.data.addresses || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) setSelectedAddress(def.id);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const openAddressModal = async () => {
    setShowAddressModal(true);
    setLoadingAddresses(true);
    try {
      const res = await addressAPI.getAll();
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      const def = addrs.find(a => a.is_default) || addrs[0];
      if (def &&!selectedAddress) setSelectedAddress(def.id);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  if (!isAuthenticated) return null;

  const items = cart?.items || [];
  const currentAddr = addresses.find(a => a.id === selectedAddress);

  if (!loading && items.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ background: '#fff', padding: '60px 20px', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: '#212121', marginBottom: 8 }}>Your cart is empty!</h2>
          <p style={{ fontSize: 14, color: '#878787', marginBottom: 24 }}>Add items to it now.</p>
          <Link href="/products" style={{ background: '#2874f0', color: '#fff', padding: '12px 48px', borderRadius: 2, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const mrp = parseFloat(summary?.totalMRP) || 0;
  const discount = parseFloat(summary?.totalDiscount) || 0;
  const total = parseFloat(summary?.totalAmount) || 0;
  const savings = discount;
  const platformFee = 7;
  const deliveryCharges = total >= 500 ? 0 : 40;

  return (
    <div style={{ background: '#f1f3f6', minHeight: '80vh', padding: '12px 0' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 12px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, alignItems: 'flex-start' }}>

        {/* Left: Cart Items */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: isMobile ? '100%' : '65%', width: '100%' }}>
          {/* Tabs - exactly like Flipkart */}
<div style={{ background: '#fff', display: 'flex', marginBottom: 8, height: 56, alignItems: 'center' }}>
  <button style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', height: '100%' }}>
    <span style={{ 
      color: '#2874f0', 
      fontSize: 16, 
      fontWeight: 500,
      paddingBottom: 12,
      paddingLeft: 50,      
      paddingRight: 50,
      borderBottom: '3px solid #2874f0',
      display: 'inline-block'
    }}>
      Flipkart ({summary?.itemCount || 0})
    </span>
  </button>
  <button style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', height: '100%' }}>
    <span style={{ 
      color: '#212121', 
      fontSize: 16, 
      fontWeight: 500 
    }}>
      Grocery
    </span>
  </button>
</div>

       <div style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#212121', marginRight: 4 }}>Deliver to:</span>
            <div style={{ flex: 1 }}>
              {currentAddr? (
                <>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{currentAddr.name}, {currentAddr.pincode}</span>
                  <span style={{ marginLeft: 8, fontSize: 11, background: '#e8e8e8', color: '#212121', padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>{currentAddr.address_type?.toUpperCase() || 'HOME'}</span>
                  <p style={{ fontSize: 12, color: '#878787', marginTop: 2 }}>{currentAddr.address}, {currentAddr.locality}</p>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>Your Address</span>
                  <span style={{ marginLeft: 8, fontSize: 11, background: '#e8e8e8', color: '#212121', padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>HOME</span>
                  <p style={{ fontSize: 12, color: '#878787', marginTop: 2 }}>Add delivery address to continue</p>
                </>
              )}
            </div>
           <button onClick={openAddressModal}
  style={{ fontSize: 14, color: '#2874f0', fontWeight: 600, background: 'none', border: '1px solid #e0e0e0', borderRadius: 2, padding: '8px 16px', cursor: 'pointer', flexShrink: 0, marginTop: 4, backgroundColor: '#fff' }}>
  Change
</button>
          </div>

          <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
            {loading? (
              <div style={{ padding: 20 }}>
                {[1,2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 100, height: 100, background: '#f0f0f0', borderRadius: 2 }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, background: '#f0f0', borderRadius: 2, marginBottom: 8, width: '70%' }}/>
                      <div style={{ height: 14, background: '#f0f0f0', borderRadius: 2, width: '40%' }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.map((item, idx) => (
              <CartItem key={item.id} item={item} isLast={idx === items.length - 1}
                onUpdateQty={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}

            {!loading && items.length > 0 && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', position: 'sticky', bottom: 0, background: '#fff', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}>
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (selectedAddress) params.set('address_id', selectedAddress);
                    router.push(`/checkout${params.toString() ? '?' + params.toString() : ''}`);
                  }}
                  style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '14px 56px', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,.2)', letterSpacing: 0.5 }}
                >
                  PLACE ORDER
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Price Details */}
        <div style={{ width: isMobile ? '100%' : '35%', minWidth: isMobile ? 'auto' : 300, flexShrink: 0 }}>
          <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', position: 'sticky', top: 12 }}>
           <div style={{ padding: '14px 20px 8px 20px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: '#212121' }}>Price details</h3>
            </div>

            {/* GREY BOX - THIS WAS MISSING */}
            <div style={{ padding: '0 16px 16px' }}>
           <div style={{ background: '#f5f5f5', padding: '16px 20px', marginTop: 8 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
    <span style={{ color: '#212121', borderBottom: '1px dashed #a0a0a0', paddingBottom: 2 }}>MRP</span>
    <span>{formatPrice(mrp)}</span>
  </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
    <span style={{ color: '#212121', display: 'flex', alignItems: 'center', gap: 4 }}>Fees <span style={{ fontSize: 10 }}>▲</span></span>
    <span></span>
  </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, paddingLeft: 12 }}>
    <span style={{ color: '#878787', borderBottom: '1px dashed #a0a0a0', paddingBottom: 2 }}>Platform Fee</span>
    <span>₹{platformFee}</span>
  </div>                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, paddingLeft: 12 }}>
    <span style={{ color: '#878787', borderBottom: '1px dashed #a0a0a0', paddingBottom: 2 }}>Delivery Charges</span>
    <span style={{ color: deliveryCharges === 0 ? '#388e3c' : '#212121' }}>
      {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
    </span>
  </div>                <div style={{ borderTop: '1px dashed #d0d0d0', margin: '12px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: '#212121', display: 'flex', alignItems: 'center', gap: 4 }}>Discounts <span style={{ fontSize: 10 }}>▲</span></span>
                  <span></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, paddingLeft: 12 }}>
                  <span style={{ color: '#878787' }}>Discount on MRP</span>
                  <span style={{ color: '#388e3c' }}>−{formatPrice(discount)}</span>
                </div>
                <div style={{ borderTop: '1px solid #d0d0d0', margin: '12px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                  <span>Total Amount</span>
                  <span>{formatPrice(total + platformFee + deliveryCharges)}</span>
                </div>
              </div>

              {savings > 0 && (
                <div style={{ background: '#e6f4ea', color: '#1e8e3e', padding: '12px 16px', borderRadius: 4, fontSize: 14, fontWeight: 500, marginTop: 16, textAlign: 'center' }}>
                  You will save {formatPrice(savings)} on this order
                </div>
              )}
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 12, color: '#878787', lineHeight: 1.4 }}>Safe and Secure Payments.Easy returns.100% Authentic products.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal - unchanged */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowAddressModal(false)}>
          <div style={{ background: '#fff', borderRadius: 4, width: isMobile ? '90vw' : 520, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#212121' }}>Select Delivery Address</h3>
              <button onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 24, color: '#878787', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {loadingAddresses? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#878787' }}>Loading addresses...</div>
              ) : addresses.length === 0? (
                <div style={{ padding: '30px 0', textAlign: 'center' }}>
                  <p style={{ color: '#878787', marginBottom: 16 }}>No saved addresses found</p>
                  <button onClick={() => { setShowAddressModal(false); router.push('/account/addresses'); }}
                    style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: 2, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Add New Address
                  </button>
                </div>
              ) : (
                <>
                  {addresses.map(addr => (
                    <label key={addr.id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', alignItems: 'flex-start' }}>
                      <input type="radio" name="delivery-address" checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        style={{ accentColor: '#2874f0', width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>{addr.name}, {addr.pincode}</span>
                          <span style={{ fontSize: 10, background: '#e8e8e8', color: '#212121', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                            {addr.address_type?.toUpperCase() || 'HOME'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#878787', lineHeight: 1.5 }}>
                          {addr.address}, {addr.locality}, {addr.city}, {addr.state}
                        </p>
                      </div>
                    </label>
                  ))}
                  <div style={{ padding: '16px 0' }}>
                    <button onClick={() => setShowAddressModal(false)}
                      style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '10px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>
                      DELIVER HERE
                    </button>
                    <button onClick={() => { setShowAddressModal(false); router.push('/account/addresses'); }}
                      style={{ background: 'none', color: '#2874f0', border: '1px solid #2874f0', borderRadius: 2, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Add New Address
                    </button>
                  </div>
                </>
              )}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#212121', marginBottom: 8 }}>Use pincode to check delivery info</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Enter pincode" value={pincode} onChange={e => setPincode(e.target.value)}
                    style={{ flex: 1, border: '1px solid #c2c2c2', borderRadius: 2, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
                  <button style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: 2, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItem({ item, isLast, onUpdateQty, onRemove }) {
  const product = item.product || {};
  const discPct = product.discount_percent || Math.round(((parseFloat(product.mrp) - parseFloat(product.price)) / parseFloat(product.mrp)) * 100) || 0;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const dateStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div style={{ padding: '20px', borderBottom: isLast? 'none' : '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Link href={`/product/${product.id}`} style={{ flexShrink: 0 }}>
          <img src={product.images?.[0] || 'https://placehold.co/96x96/f1f3f6/878787?text=•'} alt={product.name}
            style={{ width: 96, height: 96, objectFit: 'contain' }}/>
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 14, color: '#212121', marginBottom: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.name}
            </p>
          </Link>
          <p style={{ fontSize: 12, color: '#878787', marginBottom: 6 }}>
            {product.variant || 'Color - Brown'}
          </p>
          <p style={{ fontSize: 12, color: '#878787', marginBottom: 8 }}>
            Seller: {product.brand || 'RetailNet'}
            <span style={{ background: '#2874f0', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 2, fontWeight: 700, marginLeft: 6 }}>Assured</span>
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#212121' }}>{formatPrice(product.price)}</span>
            <span style={{ fontSize: 13, color: '#388e3c', fontWeight: 600 }}>{discPct}% Off</span>
          </div>
        </div>

        <div style={{ width: 180, textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 13, color: '#212121' }}>Delivery by {dateStr}</p>
        </div>
      </div>

      {/* QUANTITY BELOW IMAGE - FLIPKART STYLE */}
      {/* QUANTITY BELOW IMAGE - FLIPKART STYLE */}
<div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 16 }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button onClick={() => onUpdateQty(Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1}
      style={{ 
        width: 28, height: 28, borderRadius: '50%', border: '1px solid #c2c2c2', 
        background: '#fff', fontSize: 16, cursor: 'pointer', 
        color: item.quantity <= 1 ? '#c2c2c2' : '#212121',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>−</button>
    
    <div style={{ 
      width: 46, height: 28, border: '1px solid #c2c2c2', margin: '0 5px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: 14, fontWeight: 500, background: '#fff'
    }}>
      {item.quantity}
    </div>
    
    <button onClick={() => onUpdateQty(item.quantity + 1)}
      style={{ 
        width: 28, height: 28, borderRadius: '50%', border: '1px solid #c2c2c2',
        background: '#fff', fontSize: 16, cursor: 'pointer', color: '#212121',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>+</button>
  </div>

  <button style={{ background: 'none', border: 'none', fontSize: 14, color: '#212121', fontWeight: 600, cursor: 'pointer' }}>
    SAVE FOR LATER
  </button>
  <button onClick={onRemove} style={{ background: 'none', border: 'none', fontSize: 14, color: '#212121', fontWeight: 600, cursor: 'pointer' }}>
    REMOVE
  </button>
</div>
    </div>
  );
}