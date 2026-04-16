'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ordersAPI, addressAPI, productsAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { cart, fetchCart, updateQuantity, clearCart } = useCart();

  const [step, setStep] = useState(2); // 2=summary, 3=payment
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [directItem, setDirectItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const productId = searchParams.get('product_id');
  const queryAddressId = searchParams.get('address_id');
  const isDirectCheckout = Boolean(productId);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  useEffect(() => {
    if (productId) {
      productsAPI.getById(productId).then(res => {
        setDirectItem({ quantity: 1, product: res.data.product });
      });
    } else { fetchCart(); }
  }, [productId, fetchCart]);

  useEffect(() => {
    addressAPI.getAll().then(res => {
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      if (queryAddressId && addrs.some(a => String(a.id) === queryAddressId)) {
        setSelectedAddressId(parseInt(queryAddressId));
      } else {
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) setSelectedAddressId(def.id);
      }
    });
  }, [queryAddressId]);

  const items = isDirectCheckout ? (directItem ? [directItem] : []) : (cart?.items || []);
  if (items.length === 0) return <div style={{padding:60, textAlign:'center', background:'#f1f3f6', minHeight:'100vh'}}>Loading...</div>;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const totals = items.reduce(
    (acc, cartItem) => {
      const qty = Number(cartItem.quantity) || 1;
      const product = cartItem.product || {};
      const unitMrp = parseFloat(product.mrp) || 0;
      const unitPrice = parseFloat(product.price) || 0;
      acc.mrp += unitMrp * qty;
      acc.price += unitPrice * qty;
      return acc;
    },
    { mrp: 0, price: 0 }
  );

  const mrp = totals.mrp;
  const price = totals.price;
  const discount = mrp - price;
  const fee = 36;
  const total = price + fee;
  const save = discount - fee;

  const handleQtyChange = async (cartItem, newQty) => {
    const n = parseInt(newQty);
    if (isDirectCheckout) {
      setDirectItem((prev) => (prev ? { ...prev, quantity: n } : prev));
    } else {
      await updateQuantity(cartItem.id, n);
    }
  };

  const handlePlace = async () => {
    if (!selectedAddress) return toast.error('Select address');
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
      const res = isDirectCheckout
      ? await ordersAPI.placeDirect({
          ...payload,
          product_id: directItem.product.id,
          quantity: Number(directItem.quantity) || 1,
        })
        : await ordersAPI.place(payload);
      
      // Clear cart after successful order
      if (!isDirectCheckout) {
        await clearCart();
      }
      
      toast.success('Order placed!');
      router.push(`/order-confirmation/${res.data.order.id}`);
    } catch (e) { toast.error('Failed'); } finally { setPlacing(false); }
  };

  // Navigate to payment page
  const goToPayment = () => {
    const params = new URLSearchParams();
    if (selectedAddress) params.set('address_id', selectedAddress.id);
    if (isDirectCheckout) {
      params.set('product_id', productId);
      const qty = Number(directItem?.quantity) || 1;
      if (qty > 1) params.set('qty', qty);
    }
    router.push(`/checkout/payment?${params.toString()}`);
  };

  return (
    <div style={{background:'#f1f3f6', minHeight:'100vh'}}>
      <div style={{background:'#fff', borderBottom:'1px solid #e0e0e0'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap: isMobile ? 12 : 40, flexWrap: isMobile ? 'wrap' : 'nowrap'}}>
          {[
            {l:'Address', done:true, active:false},
            {l:'Order Summary', active:true, done:false},
            {l:'Payment', active:false, done:false}
          ].map((s,i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:8}}>
              {i>0 && <div style={{width: isMobile ? 30 : 80, height:1, background:s.done||s.active||i===0?'#2874f0':'#e0e0e0', marginRight:8}}/>}
              <div style={{width:20,height:20,borderRadius:'50%',background:s.active?'#2874f0':'#fff',border:`2px solid ${s.active||s.done?'#2874f0':'#e0e0e0'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:s.active?'#fff':s.done?'#2874f0':'#878787'}}>{s.done?'✓':i+1}</div>
              <span style={{fontSize:13,color:s.active?'#000':'#878787',fontWeight:s.active?600:400}}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth: isMobile ? '100%' : (isTablet ? '95%' : 1100), margin:'0 auto', padding: isMobile ? '8px 12px' : (isTablet ? '10px 14px' : '12px 16px'), display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : (isTablet ? 14 : 16), alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <div style={{background:'#fff', padding: isMobile ? '12px 14px' : '16px 20px', marginBottom:8, boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14, color:'#878787', marginBottom:8}}>Deliver to:</div>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span style={{fontWeight:600, fontSize:15}}>{selectedAddress?.name}</span>
                  <span style={{background:'#f0f0f0', color:'#878787', fontSize:11, padding:'2px 8px', borderRadius:2, fontWeight:600}}>{selectedAddress?.address_type?.toUpperCase()||'HOME'}</span>
                </div>
                <div style={{fontSize:14, lineHeight:'20px', color:'#212121'}}>
                  {selectedAddress?.address}, {selectedAddress?.locality}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
                </div>
                <div style={{fontSize:14, marginTop:4, color:'#212121'}}>{selectedAddress?.phone}</div>
              </div>
              <button onClick={()=>setShowAddressDrawer(true)} style={{padding:'8px 20px', border:'1px solid #e0e0e0', background:'#fff', color:'#2874f0', borderRadius:2, fontWeight:500, cursor:'pointer', height:36}}>Change</button>
            </div>
          </div>

          <div style={{background:'#fff', padding: isMobile ? '12px' : (isTablet ? '14px' : '20px'), marginBottom:8, boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
            {items.map((cartItem, idx) => {
              const product = cartItem.product || {};
              const qty = Number(cartItem.quantity) || 1;
              const unitMrp = parseFloat(product.mrp) || 0;
              const unitPrice = parseFloat(product.price) || 0;
              const pct = unitMrp > 0 ? Math.round(((unitMrp - unitPrice) / unitMrp) * 100) : 0;

              return (
                <div key={`${product.id || 'item'}-${idx}`} style={{ borderBottom: idx < items.length - 1 ? '1px solid #f0f0f0' : 'none', paddingBottom: idx < items.length - 1 ? 16 : 0, marginBottom: idx < items.length - 1 ? 16 : 0 }}>
                  <div style={{display:'flex', gap: isMobile ? 12 : (isTablet ? 16 : 24), flexWrap: 'wrap'}}>
                    <img src={product.images?.[0]} alt="" style={{width: isMobile ? 60 : (isTablet ? 70 : 90), height: isMobile ? 75 : (isTablet ? 85 : 110), objectFit:'contain', flexShrink: 0}} />
                    <div style={{flex:1, minWidth: isMobile ? '100%' : (isTablet ? '180px' : 'auto')}}>
                      <div style={{fontSize:16, fontWeight:500, marginBottom:4}}>{product.name}</div>
                      <div style={{fontSize:14, color:'#878787', marginBottom:8}}>{product.color || 'Standard'}</div>
                      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:2}}>
                          {[...Array(5)].map((_,i)=><span key={i} style={{color:i<Math.round(parseFloat(product.rating)||4)?'#388e3c':'#e0e0e0', fontSize:16}}>★</span>)}
                          <span style={{marginLeft:4, fontSize:14, color:'#878787'}}>{parseFloat(product.rating||4).toFixed(1)}</span>
                        </div>
                        <span style={{color:'#878787', fontSize:14}}>• ({(product.review_count||680).toLocaleString()})</span>
                        <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="assured" style={{height:18, marginLeft:4}}/>
                      </div>
                      <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:6}}>
                        <span style={{color:'#388e3c', fontSize:18, fontWeight:700}}>↓{pct}%</span>
                        <span style={{color:'#878787', textDecoration:'line-through', fontSize:16}}>{formatPrice(unitMrp)}</span>
                        <span style={{fontSize:22, fontWeight:700}}>{formatPrice(unitPrice)}</span>
                      </div>
                    </div>
                    <div style={{flexShrink: 0}}>
                      <select value={qty} onChange={e=>handleQtyChange(cartItem, e.target.value)} style={{padding:'6px 24px 6px 12px', border:'1px solid #e0e0e0', borderRadius:2, fontSize: isMobile ? 12 : 14, background:'#fff', cursor:'pointer'}}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>Qty: {n}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{fontSize:14, marginBottom:4}}>+ ₹{fee} Protect Promise Fee <span style={{color:'#878787', cursor:'pointer'}}>ⓘ</span></div>
            <div style={{borderTop:'1px solid #f0f0f0', marginTop:16, paddingTop:16, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:14}}>🚚</span>
              <span style={{fontSize:14, fontWeight:500}}>EXPRESS</span>
              <span style={{fontSize:14}}> Delivery in 2 days, {new Date(Date.now()+2*86400000).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span>
            </div>
            <div style={{marginTop:16, display:'flex', alignItems:'center', gap:10}}>
              <input type="checkbox" id="gst" style={{width:18, height:18}}/>
              <label htmlFor="gst" style={{fontSize:14}}>Use GST Invoice</label>
            </div>
          </div>

          <div style={{background:'#fff', padding:'16px 20px', marginBottom:8, boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
              <span style={{fontSize:20}}>👍</span>
              <span style={{fontSize:16, fontWeight:500}}>Rest assured with Open Box Delivery</span>
            </div>
            <div style={{fontSize:14, color:'#212121', lineHeight:'20px', paddingLeft:34}}>
              Delivery agent will open the package so you can check for correct product, damage or missing items. Share OTP to accept the delivery. <span style={{color:'#2874f0', cursor:'pointer'}}>Why?</span>
            </div>
          </div>
        </div>

        <div style={{width: isMobile ? '100%' : (isTablet ? '280px' : 330), flexShrink:0}}>
          <div style={{background:'#fff', padding:'16px', boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
            {[
              {l:'MRP', v:formatPrice(mrp), d:true},
              {l:'Fees', v:`₹${fee}`, d:true},
              {l:'Discounts', v:`-${formatPrice(discount)}`, c:'#388e3c', d:true},
            ].map((r,i)=>(
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:i<2?'1px dashed #e0e0e0':'none', fontSize:14}}>
                <span style={{color:'#212121'}}>{r.l} {r.d&&'⌄'}</span>
                <span style={{color:r.c||'#212121', fontWeight:r.l==='Discounts'?500:400}}>{r.v}</span>
              </div>
            ))}
            <div style={{display:'flex', justifyContent:'space-between', padding:'14px 0 8px', fontSize:16, fontWeight:600, borderTop:'1px solid #e0e0e0'}}>
              <span>Total Amount</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div style={{background:'#e8f5e9', color:'#388e3c', padding:'10px', borderRadius:4, textAlign:'center', fontSize:14, marginTop:8}}>
              You will save {formatPrice(save)} on this order
            </div>
          </div>

          {/* Safe & Secure */}
          <div style={{background:'#fff', marginTop:12, padding:'14px 16px', boxShadow:'0 1px 2px rgba(0,0,0,.1)', display:'flex', alignItems:'center', gap:10}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            <div style={{fontSize:13, color:'#878787', lineHeight:'18px'}}>Safe and secure payments. Easy returns. 100% Authentic products.</div>
          </div>

          {/* Continue sticky bar */}
          <div style={{background:'#fff', marginTop:12, padding: isMobile ? '10px 12px' : (isTablet ? '11px 14px' : '12px 16px'), boxShadow:'0 1px 2px rgba(0,0,0,.1)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', bottom:12, gap: isMobile ? 8 : 12, flexWrap: 'wrap'}}>
            <div>
              <div style={{fontSize:12, color:'#878787', textDecoration:'line-through'}}>{formatPrice(mrp)}</div>
              <div style={{fontSize: isMobile ? 18 : 20, fontWeight:600}}>{formatPrice(total)}</div>
              <div style={{fontSize:11, color:'#2874f0', cursor:'pointer'}}>View price details</div>
            </div>
            <button
              onClick={goToPayment}
              style={{background:'#fb641b', color:'#fff', border:'none', padding: isMobile ? '12px 24px' : (isTablet ? '13px 32px' : '14px 40px'), borderRadius:4, fontWeight:600, fontSize: isMobile ? 14 : (isTablet ? 15 : 16), cursor:'pointer', whiteSpace:'nowrap', flex: isMobile ? '1 1 100%' : 'auto'}}>
              CONTINUE
            </button>
          </div>
        </div>
      </div>

      {showAddressDrawer && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000}} onClick={()=>setShowAddressDrawer(false)}>
          <div onClick={e=>e.stopPropagation()} style={{position:'absolute', right:0, top:0, bottom:0, width: isMobile ? '100%' : 420, background:'#fff', boxShadow:'-2px 0 8px rgba(0,0,0,.2)', display:'flex', flexDirection:'column'}}>
            <div style={{padding:'18px 20px', borderBottom:'1px solid #f0f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3 style={{fontSize:18, fontWeight:500}}>Select delivery address</h3>
              <button onClick={()=>setShowAddressDrawer(false)} style={{background:'none', border:'none', fontSize:24, cursor:'pointer', color:'#878787'}}>×</button>
            </div>
            <div style={{flex:1, overflowY:'auto'}}>
              {addresses.map(addr=>(
                <div key={addr.id} onClick={()=>{setSelectedAddressId(addr.id); setShowAddressDrawer(false);}} style={{padding:'16px 20px', borderBottom:'1px solid #f0f0', cursor:'pointer', background:selectedAddressId===addr.id?'#f5faff':'#fff'}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                    <span style={{fontSize:16}}>🏠</span>
                    <span style={{fontWeight:600}}>{addr.name}</span>
                    {selectedAddressId===addr.id && <span style={{background:'#e3f2fd', color:'#2874f0', fontSize:11, padding:'2px 8px', borderRadius:2, fontWeight:600}}>Currently selected</span>}
                  </div>
                  <div style={{fontSize:13, color:'#878787', lineHeight:'18px', paddingLeft:24}}>
                    {addr.address}, {addr.locality}, {addr.city}...
                  </div>
                </div>
              ))}
              <button onClick={() => {setShowAddressDrawer(false); router.push('/account/addresses');}} style={{display:'flex', alignItems:'center', gap:10, width:'100%', padding:'16px 20px', background:'#f5faff', border:'none', borderTop:'2px solid #e0e0e0', cursor:'pointer', fontSize:14, fontWeight:600, color:'#2874f0', textTransform:'uppercase'}}>
                <span style={{fontSize:20}}>+</span>
                ADD A NEW ADDRESS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}