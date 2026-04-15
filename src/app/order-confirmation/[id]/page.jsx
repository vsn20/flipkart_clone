'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track which item_id is the "primary" item being viewed
  const [primaryItemId, setPrimaryItemId] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ordersAPI.getById(id);
        setOrder(res.data.order);
        // Default to first item
        if (res.data.order?.items?.length > 0) {
          setPrimaryItemId(res.data.order.items[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDownloadInvoice = () => {
    alert('Invoice download will be available shortly');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#f0f0f0] border-t-[#2874f0] rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="text-xl font-medium text-[#212121] mb-2">Order not found</h2>
        <Link href="/orders" className="text-sm text-[#2874f0] hover:underline">
          View all orders
        </Link>
      </div>
    );
  }

  const orderDateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  /* ── helpers ── */
  const isDelivered = order.status === 'Delivered';
  const isReturned  = order.status === 'Returned';
  const isCancelled = order.status === 'Cancelled';

  // Timeline steps for vertical tracker
  const timelineSteps =
    isReturned
      ? [
          { label: 'Return', date: orderDateStr, done: true },
          { label: 'Refund', date: '', done: true },
        ]
      : isCancelled
      ? [
          { label: 'Ordered', date: orderDateStr, done: true },
          { label: 'Cancelled', date: '', done: true },
        ]
      : [
          { label: 'Ordered',   date: orderDateStr, done: true },
          { label: 'Packed',    date: orderDateStr, done: true },
          { label: 'Shipped',   date: '',           done: false },
          { label: 'Delivered', date: '',           done: isDelivered },
        ];

  const primaryItem = order.items?.find(i => i.id === primaryItemId) || order.items?.[0];
  const otherItems  = order.items?.filter(i => i.id !== primaryItem?.id) || [];

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-4">
      <div className="max-w-[1050px] mx-auto px-3">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#878787] mb-3 flex items-center gap-1">
          <Link href="/"        className="text-[#878787] hover:text-[#2874f0] no-underline">Home</Link>
          <span>›</span>
          <Link href="/account" className="text-[#878787] hover:text-[#2874f0] no-underline">My Account</Link>
          <span>›</span>
          <Link href="/orders"  className="text-[#878787] hover:text-[#2874f0] no-underline">My Orders</Link>
          <span>›</span>
          <span className="text-[#212121]">{order.order_number}</span>
        </nav>

        {/* ── MAIN GRID: left content + right sidebar ── */}
        <div className="flex gap-3 items-start">

          {/* ══ LEFT COLUMN ══ */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* PRIMARY ITEM CARD */}
            {primaryItem && (
              <div className="bg-white shadow-sm">

                {/* Product row */}
                <div className="flex gap-5 px-6 pt-6 pb-5">
                  <Link href={`/product/${primaryItem.product_id}`} className="shrink-0">
                    <img
                      src={primaryItem.product_image || primaryItem.product?.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={primaryItem.product_name}
                      className="w-[100px] h-[100px] object-contain"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${primaryItem.product_id}`} className="no-underline">
                      <p className="text-sm text-[#212121] leading-snug mb-1 line-clamp-2">
                        {primaryItem.product_name}
                      </p>
                    </Link>
                    <p className="text-xs text-[#878787] mb-2">
                      Seller: {primaryItem.product?.brand || 'RetailNet'}
                    </p>
                    <p className="text-base font-semibold text-[#212121]">
                      {formatPrice(primaryItem.price)}
                    </p>
                    {primaryItem.quantity > 1 && (
                      <p className="text-xs text-[#878787] mt-1">Qty: {primaryItem.quantity}</p>
                    )}
                  </div>
                </div>

                {/* ── Vertical Timeline ── */}
                <div className="px-6 pb-5">
                  <div className="flex flex-col gap-0 pl-1">
                    {timelineSteps.map((step, i) => (
                      <div key={step.label} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          {step.done ? (
                            <div className="w-5 h-5 rounded-full bg-[#26a541] flex items-center justify-center shrink-0">
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-[14px] h-[14px] rounded-full border-2 border-[#c2c2c2] bg-white shrink-0 mt-[3px]" />
                          )}
                          {i < timelineSteps.length - 1 && (
                            <div className={`w-[2px] h-8 mt-[2px] ${step.done ? 'bg-[#26a541]' : 'bg-[#e0e0e0]'}`} />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-medium text-[#212121] leading-5">{step.label}</p>
                          {step.date && (
                            <p className="text-xs text-[#878787]">{step.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* See All Updates */}
                  <div className="mt-4 pl-1">
                    <Link href="#" className="text-sm text-[#2874f0] font-medium no-underline flex items-center gap-1 hover:underline">
                      See All Updates <span className="text-xs">›</span>
                    </Link>
                  </div>
                </div>

                {/* Chat with us */}
                <div className="border-t border-[#f0f0f0] px-6 py-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#fafafa]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#878787" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span className="text-sm text-[#212121] font-medium">Chat with us</span>
                </div>

              </div>
            )}

            {/* ── OTHER ITEMS IN THIS ORDER ── */}
            {otherItems.length > 0 && (
              <div className="bg-white shadow-sm">

                {/* Section heading */}
                <div className="px-6 pt-4 pb-3 border-b border-[#f0f0f0]">
                  <p className="text-sm font-semibold text-[#212121]">Other Items In This Order</p>
                </div>

                {otherItems.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/order-confirmation/${order.id}`}
                    onClick={() => setPrimaryItemId(item.id)}
                    className={`flex items-center px-6 py-4 hover:bg-[#f5f5f6] transition-colors no-underline cursor-pointer ${
                      index < otherItems.length - 1 ? 'border-b border-[#f0f0f0]' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center mr-4">
                      <img
                        src={item.product_image || item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={item.product_name}
                        className="w-[60px] h-[60px] object-contain"
                      />
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#212121] leading-snug line-clamp-2 mb-1">
                        {item.product_name}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-[#212121]">{formatPrice(item.price)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-[#878787]">Qty: {item.quantity}</p>
                        )}
                      </div>
                    </div>

                    {/* Status dot */}
                    <div className="shrink-0 flex items-center gap-1 ml-4">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#26a541] shrink-0" />
                      <span className="text-xs text-[#212121]">
                        {order.status === 'Delivered'
                          ? `Delivered on ${new Date(order.updated_at || order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : order.status}
                      </span>
                    </div>

                    {/* Chevron */}
                    <svg className="ml-3 shrink-0 text-[#878787]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            )}

          </div>

          {/* ══ RIGHT SIDEBAR ══ */}
          <div className="w-[300px] shrink-0 flex flex-col gap-3">

            {/* Delivery details */}
            <div className="bg-white shadow-sm px-5 py-4">
              <h3 className="text-base font-semibold text-[#212121] mb-4">Delivery details</h3>

              <div className="flex gap-3 mb-3">
                <svg className="shrink-0 mt-[2px] text-[#878787]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <div>
                  <span className="text-xs font-semibold text-[#212121] uppercase mr-2">
                    {order.address_type || 'Home'}
                  </span>
                  <span className="text-xs text-[#878787] leading-relaxed">
                    {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="shrink-0 mt-[2px] text-[#878787]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <div>
                  <span className="text-xs font-semibold text-[#212121]">{order.shipping_name}</span>
                  <span className="text-xs text-[#878787] ml-2">{order.shipping_phone}</span>
                </div>
              </div>
            </div>

            {/* Price details */}
            <div className="bg-white shadow-sm px-5 py-4">
              <h3 className="text-base font-semibold text-[#212121] mb-4">Price details</h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#212121]">Listing price</span>
                  <span className="text-[#878787] line-through">
                    {formatPrice(order.items?.reduce((s, i) => s + (i.original_price || i.price * 1.2), 0))}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#212121] flex items-center gap-1">
                    Special price
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#878787" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </span>
                  <span className="text-[#212121]">{formatPrice(order.items?.reduce((s, i) => s + i.price, 0))}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#212121] flex items-center gap-1">
                    Total fees
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#878787" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                  <span className="text-[#212121]">{formatPrice(order.shipping_fee || 0)}</span>
                </div>

                <div className="border-t border-dashed border-[#e0e0e0] my-1" />

                <div className="flex justify-between font-semibold text-[#212121]">
                  <span>Total amount</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-[#212121] text-sm">Paid By</span>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="12" viewBox="0 0 24 16" fill="none" stroke="#878787" strokeWidth="1.5">
                      <rect x="1" y="1" width="22" height="14" rx="2"/>
                      <line x1="1" y1="5" x2="23" y2="5" strokeWidth="2"/>
                    </svg>
                    <span className="text-sm text-[#212121]">
                      {order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method === 'CARD' ? 'Credit Card' : 'Debit Card'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadInvoice}
                className="mt-5 w-full border border-[#e0e0e0] rounded py-3 flex items-center justify-center gap-2 text-sm text-[#212121] font-medium hover:bg-[#f5f5f6] transition-colors cursor-pointer bg-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Invoice
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}