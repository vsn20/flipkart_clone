'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [primaryItemId, setPrimaryItemId] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ordersAPI.getById(id);
        setOrder(res.data.order);
        if (res.data.order?.items?.length > 0) {
 const itemFromUrl = searchParams.get('item');
 setPrimaryItemId(
 itemFromUrl? Number(itemFromUrl) : res.data.order.items[0].id
 );
 }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, searchParams]);

  const handleDownloadInvoice = () => {
    alert('Invoice download will be available shortly');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#f1f3f6]">
        <div className="w-10 h-10 border-4 border-[#f0f0f0] border-t-[#2874f0] rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-xl font-medium text-[#212121] mb-2">Order not found</h2>
          <Link href="/orders" className="text-sm text-[#2874f0] hover:underline">
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = order.status === 'Delivered';
  const isReturned  = order.status === 'Returned';
  const isCancelled = order.status === 'Cancelled';

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short', day: '2-digit', year: 'numeric',
        })
      : '';

  const orderDate    = formatDate(order.created_at);
  const deliveryDate = formatDate(order.delivered_at || order.updated_at);

  const timelineSteps = isReturned
    ? [
        { label: 'Return Initiated', date: orderDate, done: true },
        { label: 'Refund Completed', date: deliveryDate, done: true },
      ]
    : isCancelled
    ? [
        { label: 'Order Confirmed', date: orderDate, done: true },
        { label: 'Cancelled',       date: '',         done: true },
      ]
    : [
        { label: 'Order Confirmed', date: orderDate,    done: true },
        { label: 'Delivered',       date: isDelivered ? deliveryDate : '', done: isDelivered },
      ];

  const primaryItem = order.items?.find(i => i.id === primaryItemId) || order.items?.[0];
  const otherItems  = order.items?.filter(i => i.id !== primaryItem?.id) || [];

  const subtotal      = order.items?.reduce((s, i) => s + i.price * (i.quantity || 1), 0) || 0;
  const listingTotal  = order.items?.reduce((s, i) => s + (i.original_price || i.price * 1.47), 0) || 0;
  const totalAmount   = order.total_amount || subtotal;

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="max-w-[1100px] mx-auto px-4 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#878787] mb-3">
          <Link href="/" className="hover:text-[#2874f0]">Home</Link>
          <span>›</span>
          <Link href="/account" className="hover:text-[#2874f0]">My Account</Link>
          <span>›</span>
          <Link href="/orders" className="hover:text-[#2874f0]">My Orders</Link>
          <span>›</span>
          <span className="text-[#212121]">{order.order_number}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* LEFT */}
          <div className="flex-1 min-w-0">
            {/* Shared banner */}
            {order.shared_by && (
              <div className="bg-[#fffde7] px-6 py-2.5 mb-3 text-[13px] text-[#5d4037]">
                {order.shared_by} shared this order with you.
              </div>
            )}
            
            {/* Primary Item */}
            {primaryItem && (
              <div className="bg-white mb-3">
                {/* Product header - image RIGHT */}
                <div className="flex items-start justify-between px-6 pt-5 pb-5">
                  <div className="flex-1 pr-6">
                    <h1 className="text-[17px] text-[#212121] leading-[24px] mb-1">
                      {primaryItem.product_name}
                    </h1>
                    <p className="text-[14px] text-[#878787] mb-2">
                      {primaryItem.variant || 'Single, Maroon'}
                    </p>
                    <p className="text-[13px] text-[#878787] mb-3">
                      Seller: {primaryItem.product?.brand || order.seller_name || 'PROPELSLEEP'}
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-[20px] font-[500] text-[#212121]">
                        {formatPrice(primaryItem.price)}
                      </p>
                      <span className="text-[13px] text-[#878787] bg-[#f0f0f0] px-2 py-1 rounded">
                        Qty: {primaryItem.quantity || 1}
                      </span>
                    </div>
                  </div>
                  <div className="w-[80px] h-[80px] shrink-0">
                    <img
                      src={primaryItem.product_image || primaryItem.product?.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={primaryItem.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Divider line after product */}
                <div className="border-t border-[#f0f0f0] mx-6"></div>

                {/* Timeline */}
                <div className="px-6 pt-5 pb-4">
                  <div className="relative">
                    {timelineSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 pb-6 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center z-10 ${step.done ? 'bg-[#26a541]' : 'border-2 border-[#dbdbdb] bg-white'}`}>
                            {step.done && (
                              <svg width="10" height="8" viewBox="0 0 12 9" fill="none">
                                <path d="M1 4.5L4 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            )}
                          </div>
                          {idx < timelineSteps.length - 1 && (
                            <div className={`absolute top-[18px] w-[2px] h-[calc(100%+6px)] ${step.done ? 'bg-[#26a541]' : 'bg-[#e0e0e0]'}`} />
                          )}
                        </div>
                        <div className="pt-[1px]">
                          <p className="text-[14px] text-[#212121]">
                            {step.label}{step.date ? `, ${step.date}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="text-[#2874f0] text-[14px] font-[500] flex items-center gap-1 mt-2 hover:underline">
                    See All Updates
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>

                {/* Chat */}
                <div className="border-t border-[#f0f0f0]">
                  <button className="w-full py-4 flex items-center justify-center gap-2 hover:bg-[#fafafa] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="1.5">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span className="text-[14px] font-[500] text-[#212121]">Chat with us</span>
                  </button>
                </div>
              </div>
            )}

            {/* Other Items In This Order - FIXED */}
            {otherItems.length > 0 && (
              <div className="bg-white mb-3">
                <div className="px-6 py-3 border-b border-[#f0f0f0]">
                  <p className="text-[13px] text-[#878787] font-[500]">Other Items In This Order</p>
                </div>
                {otherItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPrimaryItemId(item.id)}
                    className="w-full flex items-start justify-between px-6 py-4 hover:bg-[#fafafa] border-b border-[#f0f0f0] last:border-0 text-left transition-colors"
                  >
                    <div className="flex-1 pr-4 min-w-0">
                      <p className="text-[14px] text-[#212121] leading-[20px] line-clamp-2 mb-2">
                        {item.product_name}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] font-[500] text-[#212121]">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-[12px] text-[#878787] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                          Qty: {item.quantity || 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-[8px] h-[8px] rounded-full bg-[#26a541] shrink-0"></span>
                        <span className="text-[12px] text-[#878787]">
                          Delivered on {formatDate(order.delivered_at || order.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="w-[60px] h-[60px] shrink-0 flex items-center justify-center">
                      <img
                        src={item.product_image || item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={item.product_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full md:w-[340px] shrink-0">
            {/* Delivery details */}
            <div className="bg-white p-5 mb-3">
              <h2 className="text-[18px] font-[500] text-[#212121] mb-4" style={{fontFamily: 'serif'}}>Delivery details</h2>
              
              <div className="bg-[#f8f8f8] rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="1.8">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-[18px]">
                      <span className="font-[600] text-[#212121] mr-1.5">Other</span>
                      <span className="text-[#212121]">
                        {order.shipping_address || 'IIIT SRICITY BOYS HOSTEL,BH1 Sricity,A...'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#e5e5e5] my-3"></div>

                <div className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <p className="text-[13px]">
                    <span className="font-[600] text-[#212121]">{order.shipping_name || 'Vuppala Sai Naman'}</span>
                    <span className="text-[#212121] ml-2">{order.shipping_phone || '8500222356'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Price details */}
            <div className="bg-white p-5">
              <h2 className="text-[18px] font-[500] text-[#212121] mb-4" style={{fontFamily: 'serif'}}>Price details</h2>
              
              {primaryItem && (
                <div className="border border-[#f0f0f0] rounded-xl overflow-hidden bg-white">
                  <div className="p-4 space-y-4">
                    {/* Selected product breakdown only */}
                    {(() => {
                      const itemSubtotal = primaryItem.price * (primaryItem.quantity || 1);
                      
                      return (
                        <div>
                          <p className="text-[13px] font-[500] text-[#212121] mb-3 line-clamp-2">
                            {primaryItem.product_name}
                          </p>
                          <div className="space-y-2.5 ml-2">
                            <div className="flex justify-between text-[13px]">
                              <span className="text-[#878787]">Price per unit</span>
                              <span className="text-[#212121]">{formatPrice(primaryItem.price)}</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                              <span className="text-[#878787]">Quantity</span>
                              <span className="text-[#212121]">{primaryItem.quantity || 1}</span>
                            </div>
                            <div className="flex justify-between text-[13px] font-[500] text-[#212121]">
                              <span>Subtotal</span>
                              <span>{formatPrice(itemSubtotal)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="border-t border-dashed border-[#d5d5d5]"></div>
                  
                  <div className="p-4 flex justify-between">
                    <span className="text-[15px] font-[600] text-[#212121]">Total order amount</span>
                    <span className="text-[15px] font-[600] text-[#212121]">{formatPrice(order.total_amount || totalAmount)}</span>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg px-3.5 py-2.5 flex items-center justify-between">
                      <span className="text-[13px] text-[#878787]">Paid By</span>
                      <div className="flex items-center gap-1.5">
                        {order.payment_method === 'COD' || order.payment_method === 'cash_on_delivery' ? (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.3">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M9 12l2 2 4-4"/>
                            </svg>
                            <span className="text-[13px] text-[#5f6368]">Cash on Delivery</span>
                          </>
                        ) : order.payment_method === 'UPI' ? (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.3">
                              <rect x="2" y="5" width="20" height="14" rx="2"/>
                              <path d="M2 9h20"/>
                            </svg>
                            <span className="text-[13px] text-[#5f6368]">UPI</span>
                          </>
                        ) : (
                          <>
                            <svg width="20" height="14" viewBox="0 0 24 16" fill="none" stroke="#5f6368" strokeWidth="1.3">
                              <rect x="1" y="2" width="22" height="12" rx="2"/>
                              <line x1="1" y1="6" x2="23" y2="6"/>
                            </svg>
                            <span className="text-[13px] text-[#5f6368]">{order.payment_method || 'Credit Card'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
              )}

              <button
                onClick={handleDownloadInvoice}
                className="w-full mt-3 border border-[#e0e0e0] bg-white rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-[#fafafa] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="1.7">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                <span className="text-[14px] font-[500] text-[#212121]">Download Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
