'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ordersAPI, addressAPI, productsAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { cart, fetchCart } = useCart();

  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [directItem, setDirectItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [expandedOption, setExpandedOption] = useState('cod');
  const [isMobile, setIsMobile] = useState(false);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [giftForm, setGiftForm] = useState({ number: '', pin: '' });
  const [giftErrors, setGiftErrors] = useState({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const productId = searchParams.get('product_id');
  const addressId = searchParams.get('address_id');
  const qtyParam = searchParams.get('qty');

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  useEffect(() => {
    if (productId) {
      productsAPI.getById(productId).then(res => {
        setDirectItem({ quantity: parseInt(qtyParam) || 1, product: res.data.product });
      });
    } else { fetchCart(); }
  }, [productId, fetchCart, qtyParam]);

  useEffect(() => {
    addressAPI.getAll().then(res => {
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      if (addressId) {
        setSelectedAddress(addrs.find(a => String(a.id) === addressId) || addrs[0]);
      } else {
        setSelectedAddress(addrs.find(a => a.is_default) || addrs[0]);
      }
    });
  }, [addressId]);

  const items = directItem ? [directItem] : (cart?.items || []);
  const item = items[0];

  if (!item) return (
    <div style={{background:'#f1f3f6', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{width:40, height:40, border:'3px solid #f0f0f0', borderTop:'3px solid #2874f0', borderRadius:'50%', animation:'spin 1s linear infinite'}}/>
    </div>
  );

  const qty = Number(item.quantity) || 1;
  const mrp = parseFloat(item.product.mrp) * qty;
  const price = parseFloat(item.product.price) * qty;
  const discount = mrp - price;
  const fee = 19;
  const total = price + fee;

  const validateCard = () => {
    const e = {};
    const num = cardForm.number.replace(/\s/g, '');
    if (!num) e.number = 'Card number is required';
    else if (!/^\d{16}$/.test(num)) e.number = 'Enter valid 16-digit card number';
    if (!cardForm.expiry) e.expiry = 'Expiry is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry)) e.expiry = 'Use MM/YY format';
    if (!cardForm.cvv) e.cvv = 'CVV is required';
    else if (!/^\d{3}$/.test(cardForm.cvv)) e.cvv = 'Enter 3-digit CVV';
    setCardErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateGift = () => {
    const e = {};
    if (!giftForm.number.trim()) e.number = 'Gift card number is required';
    if (!giftForm.pin.trim()) e.pin = 'PIN is required';
    setGiftErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlace = async () => {
    if (!selectedAddress) return toast.error('No address selected');
    // Validate card fields if card payment is selected
    if (expandedOption === 'card') {
      if (!validateCard()) return;
    }
    if (expandedOption === 'gift') {
      if (!validateGift()) return;
    }
    setPlacing(true);
    try {
      const payload = {
        shipping_name: selectedAddress.name,
        shipping_phone: selectedAddress.phone,
        shipping_address: selectedAddress.address,
        shipping_city: selectedAddress.city,
        shipping_state: selectedAddress.state,
        shipping_pincode: selectedAddress.pincode,
        payment_method: paymentMethod
      };
      const res = directItem
        ? await ordersAPI.placeDirect({...payload, product_id: item.product.id, quantity: qty})
        : await ordersAPI.place(payload);
      toast.success('Payment successful! Order placed.');
      router.push(`/order-confirmation/${res.data.order.id}`);
    } catch (e) { toast.error('Payment failed. Try again.'); } finally { setPlacing(false); }
  };

  const paymentOptions = [
    { key: 'card', icon: '💳', label: 'Credit / Debit / ATM Card', sub: 'Add and secure cards as per RBI guidelines', extra: 'Get upto 5% cashback · 2 offers available', method: 'UPI' },
    { key: 'emi', icon: '📋', label: 'EMI', sub: 'Credit Card EMI', method: 'UPI' },
    { key: 'cod', icon: '📦', label: 'Cash on Delivery', sub: null, method: 'COD' },
    { key: 'gift', icon: '🎁', label: 'Have a Flipkart Gift Card?', sub: null, method: 'COD' },
    { key: 'upi', icon: '📱', label: 'UPI', sub: 'Unavailable', disabled: true, method: 'UPI' },
  ];

  return (
    <div style={{background:'#f1f3f6', minHeight:'100vh'}}>
      {/* Minimal header — Flipkart logo + Complete Payment */}
      <div style={{background:'#2874f0', padding:'12px 0'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <Link href="/" style={{color:'#fff', textDecoration:'none', fontSize:20, fontWeight:700, letterSpacing:-.5}}>
            Flipkart
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div style={{maxWidth:1100, margin:'0 auto', padding:'16px'}}>
        {/* Back + Title */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <button onClick={() => router.back()} style={{background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#212121'}}>←</button>
            <h1 style={{fontSize:20, fontWeight:600, color:'#212121', margin:0}}>Complete Payment</h1>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, color:'#878787', fontSize:13}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            100% Secure
          </div>
        </div>

        <div style={{display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:16, alignItems:'flex-start'}}>
          {/* Left — Payment Options */}
          <div style={{flex:1, background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.08)', overflow:'hidden'}}>
            {paymentOptions.map((opt, i) => (
              <div key={opt.key}>
                <div
                  onClick={() => { if (!opt.disabled) { setExpandedOption(opt.key); setPaymentMethod(opt.method); } }}
                  style={{
                    display:'flex', alignItems:'flex-start', gap:14, padding:'18px 20px',
                    borderBottom:'1px solid #f0f0f0', cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    background: expandedOption === opt.key ? '#f5faff' : '#fff',
                    borderLeft: expandedOption === opt.key ? '3px solid #2874f0' : '3px solid transparent',
                    opacity: opt.disabled ? 0.5 : 1,
                  }}>
                  <span style={{fontSize:20, marginTop:2, flexShrink:0}}>{opt.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15, fontWeight:500, color:'#212121', marginBottom:2}}>{opt.label}</div>
                    {opt.sub && <div style={{fontSize:13, color: opt.extra ? '#2874f0' : '#878787'}}>{opt.sub}</div>}
                    {opt.extra && <div style={{fontSize:12, color:'#388e3c', marginTop:2}}>{opt.extra}</div>}
                    {opt.disabled && <span style={{fontSize:12, color:'#878787', marginLeft:8}}>ⓘ</span>}
                  </div>
                  {!opt.disabled && (
                    <input type="radio" name="payopt" checked={expandedOption === opt.key}
                      onChange={() => {}} style={{width:18, height:18, accentColor:'#2874f0', marginTop:4}}/>
                  )}
                </div>

                {/* Expanded content for COD */}
                {expandedOption === opt.key && opt.key === 'cod' && (
                  <div style={{padding: isMobile ? '12px 12px 16px 12px' : '16px 24px 20px 56px', background:'#f5faff', borderBottom:'1px solid #f0f0f0'}}>
                    <button
                      onClick={handlePlace}
                      disabled={placing}
                      style={{
                        background: '#fb641b', color:'#fff', border:'none',
                        padding:'14px 48px', fontSize:16, fontWeight:600,
                        borderRadius:4, cursor: placing ? 'not-allowed' : 'pointer',
                        width:'100%', maxWidth:300,
                      }}>
                      {placing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                    </button>
                  </div>
                )}

                {/* Expanded content for Card */}
                {expandedOption === opt.key && opt.key === 'card' && (
                  <div style={{padding: isMobile ? '12px 12px 16px 12px' : '16px 24px 20px 56px', background:'#f5faff', borderBottom:'1px solid #f0f0f0'}}>
                    <div style={{marginBottom:16}}>
                      <input type="text" placeholder="Card Number" value={cardForm.number}
                        onChange={e => setCardForm({...cardForm, number: e.target.value})}
                        maxLength={19}
                        style={{width:'100%', padding:'10px 14px', border:`1px solid ${cardErrors.number ? '#ff6161' : '#c2c2c2'}`, borderRadius:4, fontSize:14, outline:'none', boxSizing:'border-box'}}/>
                      {cardErrors.number && <p style={{fontSize:11, color:'#ff6161', marginTop:4}}>{cardErrors.number}</p>}
                    </div>
                    <div style={{display:'flex', gap:12, marginBottom:16, flexWrap: isMobile ? 'wrap' : 'nowrap'}}>
                      <div style={{flex:1, minWidth: isMobile ? '100%' : 'auto'}}>
                        <input type="text" placeholder="Valid Thru (MM/YY)" value={cardForm.expiry}
                          onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                          maxLength={5}
                          style={{width:'100%', padding:'10px 14px', border:`1px solid ${cardErrors.expiry ? '#ff6161' : '#c2c2c2'}`, borderRadius:4, fontSize:14, outline:'none', boxSizing:'border-box'}}/>
                        {cardErrors.expiry && <p style={{fontSize:11, color:'#ff6161', marginTop:4}}>{cardErrors.expiry}</p>}
                      </div>
                      <div style={{width: isMobile ? '100%' : 120}}>
                        <input type="password" placeholder="CVV" value={cardForm.cvv}
                          onChange={e => setCardForm({...cardForm, cvv: e.target.value})}
                          maxLength={3}
                          style={{width:'100%', padding:'10px 14px', border:`1px solid ${cardErrors.cvv ? '#ff6161' : '#c2c2c2'}`, borderRadius:4, fontSize:14, outline:'none', boxSizing:'border-box'}}/>
                        {cardErrors.cvv && <p style={{fontSize:11, color:'#ff6161', marginTop:4}}>{cardErrors.cvv}</p>}
                      </div>
                    </div>
                    <button
                      onClick={handlePlace}
                      disabled={placing}
                      style={{
                        background: '#fb641b', color:'#fff', border:'none',
                        padding:'14px 48px', fontSize:16, fontWeight:600,
                        borderRadius:4, cursor: placing ? 'not-allowed' : 'pointer',
                        width:'100%', maxWidth:300,
                      }}>
                      {placing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                    </button>
                  </div>
                )}

                {/* Expanded content for EMI */}
                {expandedOption === opt.key && opt.key === 'emi' && (
                  <div style={{padding: isMobile ? '12px 12px 16px 12px' : '16px 24px 20px 56px', background:'#f5faff', borderBottom:'1px solid #f0f0f0'}}>
                    <p style={{fontSize:14, color:'#878787', marginBottom:12}}>Select your bank for EMI options</p>
                    <button
                      onClick={handlePlace}
                      disabled={placing}
                      style={{
                        background: '#fb641b', color:'#fff', border:'none',
                        padding:'14px 48px', fontSize:16, fontWeight:600,
                        borderRadius:4, cursor: placing ? 'not-allowed' : 'pointer',
                        width:'100%', maxWidth:300,
                      }}>
                      {placing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                    </button>
                  </div>
                )}

                {/* Expanded content for Gift Card */}
                {expandedOption === opt.key && opt.key === 'gift' && (
                  <div style={{padding: isMobile ? '12px 12px 16px 12px' : '16px 24px 20px 56px', background:'#f5faff', borderBottom:'1px solid #f0f0f0'}}>
                    <div style={{display:'flex', gap:12, marginBottom:16, flexWrap: isMobile ? 'wrap' : 'nowrap'}}>
                      <div style={{flex:1, minWidth: isMobile ? '100%' : 'auto'}}>
                        <input type="text" placeholder="Enter Gift Card Number" value={giftForm.number}
                          onChange={e => setGiftForm({...giftForm, number: e.target.value})}
                          style={{width:'100%', padding:'10px 14px', border:`1px solid ${giftErrors.number ? '#ff6161' : '#c2c2c2'}`, borderRadius:4, fontSize:14, outline:'none', boxSizing:'border-box'}}/>
                        {giftErrors.number && <p style={{fontSize:11, color:'#ff6161', marginTop:4}}>{giftErrors.number}</p>}
                      </div>
                      <div style={{width: isMobile ? '100%' : 120}}>
                        <input type="text" placeholder="PIN" value={giftForm.pin}
                          onChange={e => setGiftForm({...giftForm, pin: e.target.value})}
                          style={{width:'100%', padding:'10px 14px', border:`1px solid ${giftErrors.pin ? '#ff6161' : '#c2c2c2'}`, borderRadius:4, fontSize:14, outline:'none', boxSizing:'border-box'}}/>
                        {giftErrors.pin && <p style={{fontSize:11, color:'#ff6161', marginTop:4}}>{giftErrors.pin}</p>}
                      </div>
                    </div>
                    <button
                      onClick={handlePlace}
                      disabled={placing}
                      style={{
                        background: '#fb641b', color:'#fff', border:'none',
                        padding:'14px 48px', fontSize:16, fontWeight:600,
                        borderRadius:4, cursor: placing ? 'not-allowed' : 'pointer',
                        width:'100%', maxWidth:300,
                      }}>
                      {placing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right — Price Summary */}
          <div style={{width: isMobile ? '100%' : 320, flexShrink:0}}>
            <div style={{background:'#fff', padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,.08)'}}>
              <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', fontSize:14}}>
                <span>MRP (incl. of all taxes)</span>
                <span>{formatPrice(mrp)}</span>
              </div>

              {/* Fees expandable */}
              <div style={{borderTop:'1px solid #f0f0f0'}}>
                <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', fontSize:14}}>
                  <span style={{cursor:'pointer'}}>Fees ⌃</span>
                  <span></span>
                </div>
                <div style={{paddingLeft:12, paddingBottom:8}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'#878787', padding:'4px 0'}}>
                    <span>Protect Promise Fee</span>
                    <span>₹{fee}</span>
                  </div>
                </div>
              </div>

              {/* Discounts */}
              <div style={{borderTop:'1px solid #f0f0f0'}}>
                <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', fontSize:14}}>
                  <span style={{cursor:'pointer'}}>Discounts ⌃</span>
                  <span></span>
                </div>
                <div style={{paddingLeft:12, paddingBottom:8}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0'}}>
                    <span style={{color:'#878787'}}>MRP Discount</span>
                    <span style={{color:'#388e3c'}}>-{formatPrice(discount)}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div style={{borderTop:'1px solid #e0e0e0', display:'flex', justifyContent:'space-between', padding:'14px 0 8px', fontSize:16, fontWeight:600, color:'#2874f0'}}>
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Cashback offer */}
              <div style={{background:'#e8f5e9', padding:'10px 14px', borderRadius:4, marginTop:8, display:'flex', alignItems:'center', gap:10}}>
                <span style={{color:'#388e3c', fontWeight:600, fontSize:13}}>5% Cashback</span>
                <span style={{fontSize:12, color:'#878787'}}>Claim now with payment offers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center', padding:'24px 0', fontSize:12, color:'#878787', marginTop:24, borderTop:'1px solid #e0e0e0'}}>
          Policies: Returns Policy | Terms of use | Security | Privacy &nbsp;&nbsp; © 2007-2026 Flipkart.com
        </div>
      </div>
    </div>
  );
}
