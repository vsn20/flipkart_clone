'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsAPI, wishlistAPI, addressAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showFullName, setShowFullName] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getById(id);
        setProduct(res.data.product);
        setSimilarProducts(res.data.similarProducts || []);
        setAddedToCart(false);
        setSelectedImageIndex(0);
        if (isAuthenticated) {
          try { const w = await wishlistAPI.check(id); setInWishlist(w.data.inWishlist); } catch {}
          try {
            const res = await addressAPI.getAll();
            const addrs = res.data.addresses || [];
            setAddresses(addrs);
            const def = addrs.find(a => a.is_default) || addrs[0];
            if (def) setSelectedAddress(def.id);
          } catch(e) {}
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchProduct();
  }, [id, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login'); router.push('/login'); return; }
    const ok = await addToCart(product.id);
    if (ok) { setAddedToCart(true); }
  };
  
  const openAddressModal = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to change address');
      router.push('/login');
      return;
    }
    setShowAddressModal(true);
    setLoadingAddresses(true);
    try {
      const res = await addressAPI.getAll();
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      const def = addrs.find(a => a.is_default) || addrs[0];
      if (def && !selectedAddress) setSelectedAddress(def.id);
    } catch (err) { console.error(err); } finally { setLoadingAddresses(false); }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const query = new URLSearchParams({
      loginFlow: 'false',
      checkoutInitiated: 'true',
      product_id: product.id,
      ...(selectedAddress && { address_id: selectedAddress })
    });
    router.push(`/checkout?${query.toString()}`);
  };
  const toggleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Login for wishlist'); return; }
    try {
      if (inWishlist) { await wishlistAPI.remove(product.id); setInWishlist(false); }
      else { await wishlistAPI.add(product.id); setInWishlist(true); }
    } catch {}
  };

  if (loading) return <div style={{height:'100vh', background:'#fff'}}/>;
  if (!product) return null;

  let images = product.images?.length ? [...product.images] : ['https://placehold.co/600'];
  while (images.length < 4) {
    images.push(images[0]);
  }
  const discountPercent = product.discount_percent || Math.round(((product.mrp - product.price)/product.mrp)*100);
  const rating = parseFloat(product.rating) || 3.7;
  const wowPrice = Math.round(product.price - 50);
  const deliveryDate = new Date(); deliveryDate.setDate(deliveryDate.getDate()+3);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN',{day:'numeric', month:'short'}) + ', ' + deliveryDate.toLocaleDateString('en-IN',{weekday:'short'});

  // Parse specifications
  let specs = {};
  try {
    if (typeof product.specifications === 'string') specs = JSON.parse(product.specifications);
    else if (product.specifications) specs = product.specifications;
  } catch {}
  const specEntries = Object.entries(specs);

  // Stock status
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div style={{background:'#fff', minHeight:'100vh'}}>
      <div style={{maxWidth:1366, margin:'0 auto', padding:'0 16px'}}>
        {/* Breadcrumb */}
        <div style={{fontSize:12, color:'#878787', padding:'12px 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
          <Link href="/" style={{color:'#878787', textDecoration:'none'}}>Home</Link> / 
          <Link href="/" style={{color:'#878787', textDecoration:'none', marginLeft:4}}>Furniture</Link> / 
          <Link href="/" style={{color:'#878787', textDecoration:'none', marginLeft:4}}>Sofas</Link> / 
          <span style={{marginLeft:4}}>{product.name}</span>
        </div>

        <div style={{display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 32, alignItems:'flex-start'}}>
          {/* LEFT - Image Carousel */}
          <div style={{flex: 1.5, width: isMobile ? '100%' : 'auto'}}>
            {/* Main Image */}
            <div style={{background:'#f7f7f7', borderRadius:12, overflow:'hidden', aspectRatio:'1/1', position:'relative', marginBottom:8}}>
              <img src={images[selectedImageIndex]} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              {/* Prev/Next Arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImageIndex(i => (i - 1 + images.length) % images.length)}
                    style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'1px solid #e0e0e0', boxShadow:'0 1px 4px rgba(0,0,0,.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#212121'}}>‹</button>
                  <button onClick={() => setSelectedImageIndex(i => (i + 1) % images.length)}
                    style={{position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'1px solid #e0e0e0', boxShadow:'0 1px 4px rgba(0,0,0,.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#212121'}}>›</button>
                </>
              )}
              {/* Wishlist / Share */}
              <div style={{position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:8}}>
                <button onClick={toggleWishlist} style={{width:40, height:40, borderRadius:'50%', background:'#fff', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,.15)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={inWishlist?'#ff4343':'none'} stroke={inWishlist?'#ff4343':'#212121'} strokeWidth="1.5"><path d="M12 21s-6.7-4.3-9.3-7.3C-0.3 10.7 1 6.5 4.7 5c2-.8 4.3-.3 5.8 1.3A6 6 0 0 1 19.3 5c3.7 1.5 5 5.7 2 8.7C18.7 16.7 12 21 12 21z"/></svg>
                </button>
                <button style={{width:40, height:40, borderRadius:'50%', background:'#fff', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,.15)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="1.5"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>
                </button>
              </div>
            </div>
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:4}}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImageIndex(i)}
                    style={{width:56, height:56, flexShrink:0, borderRadius:8, border: i === selectedImageIndex ? '2px solid #2874f0' : '1px solid #e0e0e0', background:'#f7f7f7', cursor:'pointer', padding:2, overflow:'hidden', opacity: i === selectedImageIndex ? 1 : 0.7}}>
                    <img src={img} alt="" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:6}} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - Details */}
          <div style={{flex: 1, minWidth: isMobile ? 0 : 380, maxWidth: isMobile ? '100%' : 480, position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 12, width: isMobile ? '100%' : 'auto'}}>
            <h1 style={{fontSize:20, fontWeight:400, color:'#212121', lineHeight:'28px', margin:'0 0 8px'}}>
              {product.name.length > 65 && !showFullName ? (
                <>
                  {product.name.substring(0,65)}...
                  <span onClick={() => setShowFullName(true)} style={{color:'#2874f0', fontWeight:500, cursor:'pointer'}}>more</span>
                </>
              ) : (
                <>
                  {product.name}
                  {product.name.length > 65 && (
                    <span onClick={() => setShowFullName(false)} style={{color:'#2874f0', fontWeight:500, cursor:'pointer', marginLeft: 6}}>less</span>
                  )}
                </>
              )}
            </h1>

            <div style={{display:'inline-flex', alignItems:'center', background:'#f5f5f5', borderRadius:4, padding:'3px 6px', gap:4, marginBottom:16}}>
              <span style={{fontSize:13, fontWeight:600, color:'#212121'}}>{rating}</span>
              <span style={{color:'#388e3c', fontSize:12}}>★</span>
              <span style={{width:1, height:12, background:'#d5d5d5', margin:'0 4px'}}/>
              <span style={{fontSize:13, color:'#878787', fontWeight:500}}>{product.review_count || 124}</span>
            </div>

            <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:14}}>
              <span style={{color:'#008c00', fontSize:22, fontWeight:700}}>↓{discountPercent}%</span>
              <span style={{color:'#878787', fontSize:20, textDecoration:'line-through'}}>{formatPrice(product.mrp)}</span>
              <span style={{color:'#212121', fontSize:28, fontWeight:700}}>{formatPrice(product.price)}</span>
            </div>

            {/* Stock Status */}
            <div style={{marginBottom:12}}>
              {inStock ? (
                <span style={{color:'#388e3c', fontSize:14, fontWeight:600}}>
                  ✓ In Stock ({product.stock} units available)
                  {lowStock && <span style={{color:'#ff6161', marginLeft:8, fontWeight:500}}>— Only {product.stock} left, hurry!</span>}
                </span>
              ) : (
                <span style={{color:'#ff6161', fontSize:14, fontWeight:600}}>✕ Out of Stock</span>
              )}
            </div>

            {/* WOW DEAL */}
            <div style={{marginBottom:12}}>
              <div style={{background:'#1a3c8f', borderRadius:'8px 8px 0 0', padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                  <div style={{background:'#fff', color:'#1a3c8f', fontSize:10, fontWeight:800, padding:'3px 5px', borderRadius:3, lineHeight:1}}>WOW!</div>
                  <div style={{background:'#fff', color:'#1a3c8f', fontSize:10, fontWeight:800, padding:'3px 5px', borderRadius:3, lineHeight:1}}>DEAL</div>
                  <span style={{color:'#fff', fontSize:17, fontWeight:700, marginLeft:8}}>Buy at {formatPrice(wowPrice)}</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
              <div style={{background:'#e8f0fe', padding:'10px 14px', borderRadius:'0 0 8px 8px', fontSize:13, color:'#1a3c8f'}}>Apply offers for maximum savings!</div>
            </div>

            {/* EMI Card */}
            <div style={{background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:8, padding:12, marginBottom:20}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <span style={{fontSize:14, fontWeight:600, color:'#212121'}}>Apply for Card and Instant EMI</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#878787"><path d="M18 15l-6-6 6"/></svg>
              </div>
              <div style={{background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontSize:13, fontWeight:700, color:'#212121'}}>₹1,250 Gift Vouchers | 5% Cash...</div>
                  <div style={{fontSize:12, color:'#878787'}}>Flipkart Axis Bank Credit Card</div>
                  <div style={{fontSize:13, color:'#2874f0', fontWeight:600, marginTop:4}}>Apply Now</div>
                </div>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/axis_5f31f6.png" alt="" style={{height:24}}/>
              </div>
            </div>

            <h2 style={{fontSize:18, fontWeight:600, margin:'0 0 12px'}}>Delivery details</h2>
            {addresses.length > 0 && selectedAddress ? (() => {
              const addr = addresses.find(a => a.id === selectedAddress);
              return (
                <div onClick={openAddressModal} style={{background:'#e8f4ff', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2874f0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <span style={{fontSize:13, fontWeight:700, color:'#212121'}}>{addr?.address_type?.toUpperCase() || 'HOME'}</span>
                  <span style={{fontSize:13, color:'#212121', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{addr?.address}, {addr?.locality}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#878787"><path d="M9 18l6-6"/></svg>
                </div>
              );
            })() : (
              <div onClick={openAddressModal} style={{background:'#e8f4ff', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2874f0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span style={{fontSize:13, fontWeight:700, color:'#212121'}}>Select Delivery Location</span>
                <span style={{fontSize:13, color:'#212121', flex:1}}>Add or choose an address</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#878787"><path d="M9 18l6-6"/></svg>
              </div>
            )}
            <div style={{background:'#f5f5f5', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:8, marginBottom:20}}>
              <svg width="18" height="18" viewBox="0 0 24" fill="none" stroke="#212121"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span style={{fontSize:14, fontWeight:600}}>Delivery by {deliveryStr}</span>
            </div>

            <div style={{display:'flex', justifyContent:'space-around', borderTop:'1px solid #f0f0', borderBottom:'1px solid #f0f0f0', padding:'16px 0', marginBottom:20}}>
              {[{img:'https://rukminim2.flixcart.com/www/80/80/promos/18/07/2018/3d8e9b84-cbb9-499e-8c5e-43ea45d99a47.png',t:'10-Day',s:'Return'},{img:'https://rukminim2.flixcart.com/www/80/80/promos/18/07/2018/5ff7d96b-06b4-40ab-a8b9-5c9c1d5e4f1c.png',t:'Cash on',s:'Delivery'},{img:'https://rukminim2.flixcart.com/www/80/80/promos/18/07/2018/9b5f7f8f-7a2a-4c8d-9c2a-1f5e4f1c5c9c.png',t:'Customer',s:'support'}].map((x,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <img src={x.img} alt="" style={{width:32, height:32, marginBottom:6}}/>
                  <div style={{fontSize:12, color:'#212121', lineHeight:1.2}}>{x.t}<br/>{x.s}</div>
                </div>
              ))}
            </div>

            {/* All details */}
            <div style={{borderBottom:'1px solid #f0f0f0', paddingBottom:16, marginBottom:16}}>
              <div onClick={() => setShowDetails(!showDetails)} style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
                <div>
                  <div style={{fontSize:18, fontWeight:600}}>All details</div>
                  <div style={{fontSize:13, color:'#878787'}}>Features, description and more</div>
                </div>
                <div style={{width:28, height:28, borderRadius:'50%', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center'}}>{showDetails ? '⌃' : '⌄'}</div>
              </div>

              {showDetails && (
                <div style={{marginTop:16}}>
                  {/* Description */}
                  {product.description && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:15, fontWeight:600, color:'#212121', marginBottom:8}}>Description</div>
                      <div style={{fontSize:14, color:'#212121', lineHeight:'22px', whiteSpace:'pre-wrap'}}>{product.description}</div>
                    </div>
                  )}

                  {/* Specifications */}
                  {specEntries.length > 0 && (
                    <div>
                      <div style={{fontSize:15, fontWeight:600, color:'#212121', marginBottom:8}}>Specifications</div>
                      <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <tbody>
                          {specEntries.map(([key, val]) => (
                            <tr key={key}>
                              <td style={{padding:'8px 12px 8px 0', fontSize:13, color:'#878787', width:'35%', verticalAlign:'top', borderBottom:'1px solid #f5f5f5'}}>{key}</td>
                              <td style={{padding:'8px 0', fontSize:13, color:'#212121', borderBottom:'1px solid #f5f5f5'}}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ratings */}
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                <div style={{fontSize:18, fontWeight:600}}>Ratings and reviews</div>
                <div style={{width:28, height:28, borderRadius:'50%', background:'#f5f5', display:'flex', alignItems:'center', justifyContent:'center'}}>⌃</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span style={{fontSize:24, fontWeight:600}}>{rating}</span>
                <span style={{color:'#388e3c'}}>★</span>
                <span style={{background:'#e8f5e9', color:'#388e3c', fontSize:12, padding:'2px 6px', borderRadius:4, fontWeight:600}}>Good</span>
              </div>
              <div style={{fontSize:13, color:'#878787', marginBottom:16}}>based on {product.review_count||124} ratings by <span style={{color:'#2874f0'}}>✓</span>Verified Buyers</div>
            </div>

            {/* Buttons */}
            <div style={{display:'flex', gap:12, position: 'sticky', bottom: 0, background: '#fff', padding: '16px 0', borderTop: '1px solid #f0f0f0', zIndex: 10, marginTop: 16}}>
              <button onClick={handleAddToCart} style={{flex:1, height:48, border:'1px solid #e0e0e0', borderRadius:8, background:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', color: '#212121'}}>
                {addedToCart ? 'Go to cart' : 'Add to cart'}
              </button>
              <button onClick={handleBuyNow} style={{flex:1.3, height:48, border:'none', borderRadius:8, background:'#ffca28', fontSize:15, fontWeight:700, cursor:'pointer', color: '#212121'}}>
                Buy at {formatPrice(product.price)}
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length>0 && (
          <div style={{marginTop:16, paddingBottom:40, borderTop: '1px solid #f0f0f0', paddingTop: 24}}>
            <h2 style={{fontSize:20, fontWeight:600, color: '#212121', marginBottom:16}}>Similar Products</h2>
            <div style={{display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: isMobile ? 8 : 16}}>
              {similarProducts.slice(0,5).map(p=> <ProductCard key={p.id} product={p}/>) }
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
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
            </div>
          </div>
        </div>
      )}

    </div>
  );
}