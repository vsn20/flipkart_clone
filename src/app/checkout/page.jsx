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
  const { cart, fetchCart, updateQuantity } = useCart();

  const [step, setStep] = useState(2); // 2=summary, 3=payment
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [directItem, setDirectItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const productId = searchParams.get('product_id');
  const queryAddressId = searchParams.get('address_id');

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

  const items = directItem? [directItem] : (cart?.items || []);
  const item = items[0];
  if (!item) return <div style={{padding:60, textAlign:'center', background:'#f1f3f6', minHeight:'100vh'}}>Loading...</div>;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const qty = Number(item.quantity) || 1; // FIX NaN

  // FIX: multiply by quantity
  const mrp = parseFloat(item.product.mrp) * qty;
  const price = parseFloat(item.product.price) * qty;
  const discount = mrp - price;
  const fee = 36;
  const total = price + fee;
  const save = discount - fee;

  const handleQtyChange = async (newQty) => {
    const n = parseInt(newQty);
    if (directItem) {
      setDirectItem({...directItem, quantity: n});
    } else {
      await updateQuantity(item.id, n);
      fetchCart();
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
      const res = directItem
      ? await ordersAPI.placeDirect({...payload, product_id: item.product.id, quantity: qty})
        : await ordersAPI.place(payload);
      toast.success('Order placed!');
      router.push(`/order-confirmation/${res.data.order.id}`);
    } catch (e) { toast.error('Failed'); } finally { setPlacing(false); }
  };

  return (
    <div style={{background:'#f1f3f6', minHeight:'100vh'}}>
      <div style={{background:'#fff', borderBottom:'1px solid #e0e0e0'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:40}}>
          {[
            {l:'Address', done:true, active:false},
            {l:'Order Summary', active:step===2, done:step>2},
            {l:'Payment', active:step===3, done:step>3}
          ].map((s,i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:8}}>
              {i>0 && <div style={{width:80, height:1, background:i<=step-1?'#2874f0':'#e0e0e0', marginRight:8}}/>}
              <div style={{width:20,height:20,borderRadius:'50%',background:s.active?'#2874f0':'#fff',border:`2px solid ${s.active||s.done?'#2874f0':'#e0e0e0'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:s.active?'#fff':s.done?'#2874f0':'#878787'}}>{s.done?'✓':i+1}</div>
              <span style={{fontSize:13,color:s.active?'#000':'#878787',fontWeight:s.active?600:400}}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'12px 16px', display:'flex', gap:16, alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <div style={{background:'#fff', padding:'16px 20px', marginBottom:8, boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
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
            <div style={{background:'#fff7e6', padding:'12px 16px', marginTop:14, borderRadius:4, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:13, color:'#212121'}}>Help us reach you faster.</div>
                <div style={{fontSize:13, color:'#878787'}}>Please set exact location on map.</div>
              </div>
              <button style={{background:'#fff', border:'1px solid #dbdb', padding:'8px 20px', borderRadius:2, color:'#2874f0', fontWeight:500, cursor:'pointer'}}>Set Location</button>
            </div>
          </div>

          <div style={{background:'#fff', padding:'20px', marginBottom:8, boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
            <div style={{color:'#008c00', fontSize:12, fontWeight:700, marginBottom:14, letterSpacing:.5}}>SUPER DEALS</div>
            <div style={{display:'flex', gap:24}}>
              <img src={item.product.images?.[0]} alt="" style={{width:90, height:110, objectFit:'contain'}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:16, fontWeight:500, marginBottom:4}}>{item.product.name}</div>
                <div style={{fontSize:14, color:'#878787', marginBottom:8}}>6 GB RAM</div>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                  <div style={{display:'flex', alignItems:'center', gap:2}}>
                    {[...Array(5)].map((_,i)=><span key={i} style={{color:i<4?'#388e3c':'#e0e0e0', fontSize:16}}>★</span>)}
                    <span style={{marginLeft:4, fontSize:14, color:'#878787'}}>4.2</span>
                  </div>
                  <span style={{color:'#878787', fontSize:14}}>• (680)</span>
                  <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="assured" style={{height:18, marginLeft:4}}/>
                </div>
                <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:6}}>
                  <span style={{color:'#388e3c', fontSize:18, fontWeight:700}}>↓{Math.round((discount/mrp)*100)}%</span>
                  <span style={{color:'#878787', textDecoration:'line-through', fontSize:16}}>{formatPrice(parseFloat(item.product.mrp))}</span>
                  <span style={{fontSize:22, fontWeight:700}}>{formatPrice(parseFloat(item.product.price))}</span>
                </div>
                <div style={{fontSize:14, marginBottom:4}}>+ ₹{fee} Protect Promise Fee <span style={{color:'#878787', cursor:'pointer'}}>ⓘ</span></div>
                <div style={{fontSize:13, color:'#878787'}}>Or Pay ₹9,399 + <span style={{color:'#ffd700'}}>●</span> 100</div>
              </div>
              <div>
                <select value={qty} onChange={e=>handleQtyChange(e.target.value)} style={{padding:'6px 24px 6px 12px', border:'1px solid #e0e0e0', borderRadius:2, fontSize:14, background:'#fff', cursor:'pointer'}}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>Qty: {n}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginTop:20, fontSize:14}}>Delivery by <span style={{fontWeight:500}}>Apr 18, Sat</span></div>
            <div style={{marginTop:24, display:'flex', alignItems:'center', gap:10}}>
              <input type="checkbox" id="gst" style={{width:18, height:18}}/>
              <label htmlFor="gst" style={{fontSize:14}}>Use GST Invoice</label>
            </div>
          </div>

          {step === 3 && (
            <div style={{background:'#fff', padding:'20px', marginBottom:8, boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
              <div style={{fontSize:16, fontWeight:500, marginBottom:16, color:'#2874f0', borderBottom:'2px solid #2874f0', paddingBottom:8, display:'inline-block'}}>PAYMENT OPTIONS</div>
              {['Cash on Delivery','UPI','Credit / Debit / ATM Card','EMI','Net Banking'].map(opt=>(
                <label key={opt} style={{display:'flex', alignItems:'center', gap:12, padding:'16px', borderBottom:'1px solid #f0f0f0', cursor:'pointer'}}>
                  <input type="radio" name="pay" checked={paymentMethod===opt} onChange={()=>setPaymentMethod(opt)} style={{width:18, height:18, accentColor:'#2874f0'}}/>
                  <span style={{fontSize:14}}>{opt}</span>
                </label>
              ))}
            </div>
          )}

          <div style={{background:'#fff', padding:'16px 20px', marginBottom:8, boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
              <div style={{width:24, height:24, background:'#ff9f00', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14}}>📦</div>
              <span style={{fontSize:16, fontWeight:500}}>Rest assured with Open Box Delivery</span>
            </div>
            <div style={{fontSize:14, color:'#212121', lineHeight:'20px', paddingLeft:34}}>
              Delivery agent will open the package so you can check for correct product, damage or missing items. Share OTP to accept the delivery. <span style={{color:'#2874f0', cursor:'pointer'}}>Why?</span>
            </div>
          </div>
        </div>

        <div style={{width:330, flexShrink:0}}>
          <div style={{background:'#fff', marginBottom:12, boxShadow:'0 1px 2px rgba(0,0,0,.1)', borderRadius:4, overflow:'hidden'}}>
            <div style={{padding:14, display:'flex', gap:12, background:'#f5f5f5'}}>
              <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fk-plus_3b0baa.png" style={{width:56, height:56, borderRadius:4, background:'#000', padding:8}} alt=""/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, fontSize:14, marginBottom:2}}>Get privileges worth ₹1,259</div>
                <div style={{fontSize:12, color:'#878787', lineHeight:'16px'}}>FREE YouTube Premium, 5% SuperCoin cashback only with Black membership →</div>
              </div>
            </div>
            <div style={{padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:14}}><span style={{textDecoration:'line-through', color:'#878787', marginRight:6}}>₹499</span>₹349 for 3 months</div>
              <button style={{background:'#2874f0', color:'#fff', border:'none', padding:'8px 24px', borderRadius:4, fontWeight:500, cursor:'pointer'}}>Add</button>
            </div>
          </div>

          <div style={{background:'#fff', padding:'16px', boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
            {[
              {l:'MRP', v:formatPrice(mrp), d:true},
              {l:'Fees', v:formatPrice(fee), d:true},
              {l:'Discounts', v:`- ${formatPrice(discount)}`, c:'#388e3c', d:true},
            ].map((r,i)=>(
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:i<2?'1px dashed #e0e0e0':'none', fontSize:14}}>
                <span style={{color:'#212121', borderBottom:r.d?'1px dotted #878787':''}}>{r.l} {r.d&&'⌄'}</span>
                <span style={{color:r.c||'#212121', fontWeight:r.l==='Discounts'?500:400}}>{r.v}</span>
              </div>
            ))}
            <div style={{display:'flex', justifyContent:'space-between', padding:'14px 0 8px', fontSize:15, fontWeight:500}}>
              <span>Total Amount</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div style={{background:'#e8f5e9', color:'#388e3c', padding:'10px', borderRadius:4, textAlign:'center', fontSize:14, marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
              <span style={{background:'#388e3c', color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11}}>₹</span>
              You'll save <b>{formatPrice(save)}</b> on this order!
            </div>
          </div>

          <div style={{background:'#fff', marginTop:12, padding:'12px 16px', boxShadow:'0 1px 2px rgba(0,0,0,.1)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', bottom:12}}>
            <div>
              <div style={{fontSize:12, color:'#878787', textDecoration:'line-through'}}>{formatPrice(mrp)}</div>
              <div style={{fontSize:20, fontWeight:600}}>{formatPrice(total)} <span style={{fontSize:12, color:'#878787', cursor:'pointer'}}>ⓘ</span></div>
            </div>
            {/* FIX: white text, goes to payment */}
            <button
              onClick={()=> step===2? setStep(3) : handlePlace()}
              disabled={placing}
              style={{background:'#fb641b', color:'#fff', border:'none', padding:'12px 32px', borderRadius:4, fontWeight:600, fontSize:15, cursor:'pointer', minWidth:140, color:'#fff'}}>
              {placing? 'Processing...' : step===2? 'CONTINUE' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>

      {showAddressDrawer && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000}} onClick={()=>setShowAddressDrawer(false)}>
          <div onClick={e=>e.stopPropagation()} style={{position:'absolute', right:0, top:0, bottom:0, width:420, background:'#fff', boxShadow:'-2px 0 8px rgba(0,0,0,.2)', display:'flex', flexDirection:'column'}}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}