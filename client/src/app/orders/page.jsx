'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { FiSearch } from 'react-icons/fi';

const orderCardStyles = `
  .order-item-card {
    transition: box-shadow 0.2s ease, transform 0.2s ease, border-left-color 0.15s ease;

  }
  .order-item-card:hover {
    box-shadow: 0 4px 16px rgba(40, 116, 240, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  .order-item-card:active {
    transform: translateY(0px);
    box-shadow: 0 2px 8px rgba(40, 116, 240, 0.1);
  }
`;

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    let matches = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        order.order_number?.toLowerCase().includes(query) ||
        order.items?.some(item => item.product_name?.toLowerCase().includes(query))
      );
    }

    if (statusFilter) {
      matches = matches && order.status === statusFilter;
    }

    if (dateFilter) {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const days = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      if (dateFilter === '30') matches = matches && days <= 30;
      else if (dateFilter === '2024') matches = matches && orderDate.getFullYear() === 2024;
      else if (dateFilter === '2023') matches = matches && orderDate.getFullYear() === 2023;
      else if (dateFilter === 'older') matches = matches && orderDate.getFullYear() < 2023;
    }

    return matches;
  });

  if (!isAuthenticated) return null;

  const clearAll = () => {
    setStatusFilter('');
    setDateFilter('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Inject hover animation styles */}
      <style>{orderCardStyles}</style>

      <div className="max-w-[1248px] mx-auto px-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 py-3 text-[12px] text-[#878787]">
          <Link href="/" className="hover:text-[#2874f0]">Home</Link>
          <span>›</span>
          <Link href="/account" className="hover:text-[#2874f0]">My Account</Link>
          <span>›</span>
          <span className="text-[#212121]">My Orders</span>
          {(statusFilter || dateFilter) && (
            <>
              <span>›</span>
              <span className="text-[#212121]">Search Results</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start">
          {/* LEFT SIDEBAR */}
          <aside className="hidden md:block w-[270px] shrink-0 bg-white shadow-sm">
            <div className="border-b border-[#f0f0f0]">
              <div className="flex items-center justify-between px-4 h-[52px]">
                <h2 className="text-[18px] font-[500] text-[#212121]">Filters</h2>
                {(statusFilter || dateFilter) && (
                  <button onClick={clearAll} className="text-[12px] font-[500] text-[#2874f0] uppercase tracking-wide hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {(statusFilter || dateFilter) && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {statusFilter && (
                    <div className="flex items-center gap-1.5 bg-[#e0e0e0] pl-2 pr-2.5 py-1 rounded-[3px]">
                      <button onClick={() => setStatusFilter('')} className="text-[14px] leading-none text-[#212121] hover:text-black">✕</button>
                      <span className="text-[12px] text-[#212121]">{statusFilter}</span>
                    </div>
                  )}
                  {dateFilter && (
                    <div className="flex items-center gap-1.5 bg-[#e0e0e0] pl-2 pr-2.5 py-1 rounded-[3px]">
                      <button onClick={() => setDateFilter('')} className="text-[14px] leading-none">✕</button>
                      <span className="text-[12px]">
                        {dateFilter === '30' ? 'Last 30 days' : dateFilter === 'older' ? 'Older' : dateFilter}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ORDER STATUS */}
            <div className="px-4 py-4 border-b border-[#f0f0f0]">
              <h3 className="text-[13px] font-[500] text-[#212121] uppercase mb-4 tracking-wide">Order Status</h3>
              <div className="space-y-4">
                {['On the way', 'Delivered', 'Cancelled', 'Returned'].map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={statusFilter === status}
                      onChange={() => setStatusFilter(statusFilter === status ? '' : status)}
                      className="w-[18px] h-[18px] rounded-[2px] border-2 border-[#c2c2c2] accent-[#2874f0] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#212121] group-hover:text-[#2874f0]">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ORDER TIME */}
            <div className="px-4 py-4">
              <h3 className="text-[13px] font-[500] text-[#212121] uppercase mb-4 tracking-wide">Order Time</h3>
              <div className="space-y-4">
                {[
                  { label: 'Last 30 days', value: '30' },
                  { label: '2024', value: '2024' },
                  { label: '2023', value: '2023' },
                  { label: 'Older', value: 'older' },
                ].map(item => (
                  <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={dateFilter === item.value}
                      onChange={() => setDateFilter(dateFilter === item.value ? '' : item.value)}
                      className="w-[18px] h-[18px] rounded-[2px] border-2 border-[#c2c2c2] accent-[#2874f0] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#212121] group-hover:text-[#2874f0]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="bg-white border border-[#dbdbdb] mb-3 flex h-[48px] md:h-[52px] shadow-sm">
              <input
                type="text"
                placeholder="Search your orders here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 md:px-4 text-[13px] md:text-[14px] text-[#212121] placeholder-[#878787] outline-none bg-transparent min-w-0"
              />
              <button className="bg-[#2874f0] hover:bg-[#1a68e8] text-white px-4 md:px-8 flex items-center gap-2 text-[14px] font-[500] transition-colors shrink-0">
                <FiSearch size={18} />
                <span className="hidden md:inline">Search Orders</span>
              </button>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="bg-white border border-[#e0e0e0] rounded-lg py-20 text-center">
                <div className="inline-block w-8 h-8 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-[14px] text-[#878787]">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-[#e0e0e0] rounded-lg py-16 flex flex-col items-center">
                <div className="w-[120px] h-[120px] mb-6 relative">
                  <img
                    src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/error-no-search-results_2353c5.png"
                    alt="No results"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-[20px] text-[#212121] mb-2">Sorry, no results found</h3>
                <p className="text-[14px] text-[#878787] mb-6">Edit search or go back to My Orders Page</p>
                <button
                  onClick={clearAll}
                  className="bg-[#2874f0] hover:bg-[#1a68e8] text-white px-8 h-[40px] text-[14px] font-[500] rounded-[2px] shadow-[0_2px_4px_0_rgba(0,0,0,.2)] transition-all"
                >
                  Go to My Orders
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === 'Delivered';
                  const isReturned = order.status === 'Returned' || order.status?.toLowerCase().includes('refund');
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <div key={order.id} className="flex flex-col gap-[10px]">

                      {/* Shared banner */}
                      {order.shared_by && (
                        <div className="px-0">
                          <div className="inline-flex items-center bg-[#fff7e6] border border-[#ffe0b2] px-3 py-1.5 rounded-full">
                            <span className="text-[12px] text-[#212121]">
                              <span className="font-[500]">{order.shared_by}</span> shared this order with you.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Each item card — rounded corners, wider than search bar, animated hover */}
                      {order.items?.map((item) => (
                        <Link
                          key={item.id}
                          href={`/order-confirmation/${order.id}?item=${item.id}`}
                          className="order-item-card flex flex-wrap md:flex-nowrap items-center bg-white border border-[#e0e0e0] rounded-lg px-3 md:px-5 py-2 md:-mr-[80px]"
                        >
                          {/* Product Image */}
                          <div className="w-[60px] h-[60px] md:w-[96px] md:h-[96px] flex items-center justify-center shrink-0 mr-3 md:mr-5">
                            <img
                              src={item.product_image || item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                              alt={item.product_name}
                              className="max-w-[50px] max-h-[50px] md:max-w-[80px] md:max-h-[80px] object-contain"
                            />
                          </div>

                          {/* Product Name + Qty */}
                          <div className="flex-1 min-w-0 pr-6">
                            <h3 className="text-[14px] leading-[20px] text-[#212121] line-clamp-2 hover:text-[#2874f0]">
                              {item.product_name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[12px] text-[#878787]">Qty: {item.quantity}</span>
                              {item.variant && <span className="text-[12px] text-[#878787]">{item.variant}</span>}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="w-auto md:w-[150px] shrink-0 pr-2 md:pr-4">
                            <div className="text-[14px] font-[500] text-[#212121] flex items-center gap-1">
                              <span>₹{item.price?.toLocaleString('en-IN')}</span>
                              {item.supercoins && (
                                <>
                                  <span className="text-[#878787]">+</span>
                                  <img src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/supercoin_1_16x16.png" className="w-3.5 h-3.5" alt="" />
                                  <span>{item.supercoins}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="w-full md:w-[300px] shrink-0 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#f0f0f0]">
                            <div className="flex items-start gap-2">
                              <span
                                className="w-[10px] h-[10px] rounded-full mt-[5px] shrink-0"
                                style={{
                                  backgroundColor:
                                    getStatusColor(order.status) ||
                                    (isDelivered ? '#26a541' : isReturned ? '#ff9f00' : isCancelled ? '#ff6161' : '#2874f0'),
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-[500] text-[#212121] leading-[20px]">
                                  {isDelivered
                                    ? `Delivered on ${new Date(order.delivered_at || order.updated_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      }).replace(/(\d{2}) (\w{3}) (\d{4})/, '$1 $2, $3')}`
                                    : isReturned
                                    ? 'Refund Completed'
                                    : order.status}
                                </p>
                                <p className="text-[12px] text-[#212121] mt-0.5 leading-[18px]">
                                  {isDelivered
                                    ? 'Your item has been delivered'
                                    : isReturned
                                    ? 'You returned this order because there were quality issues with the product.'
                                    : isCancelled
                                    ? 'Your order has been cancelled'
                                    : 'Your item is on the way'}
                                </p>
                                {isReturned && (
                                  <button className="flex items-center gap-1 mt-2.5 text-[#2874f0] text-[13px] font-[500] hover:underline">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#2874f0">
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    Rate &amp; Review Product
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}

                      {/* Refund Details card — also rounded + wider */}
                      {isReturned && (
                        <div className="bg-white border border-[#e0e0e0] rounded-lg px-5 py-4 -mr-[80px]">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[14px] font-[500] text-[#26a541]">Refund Completed</span>
                            <span className="text-[12px] text-[#878787]">
                              (Refund ID: {order.refund_id || '12203615508371110487'})
                            </span>
                          </div>
                          <ul className="mt-2.5 space-y-1.5">
                            <li className="flex gap-2 text-[12px] leading-[18px] text-[#212121]">
                              <span className="mt-[5px] w-1 h-1 bg-[#212121] rounded-full shrink-0"></span>
                              <span>
                                Refund was added to your {order.refund_method || 'UNIONBANK RUPAY Debit Card ************5852'} on{' '}
                                {new Date(order.refunded_at || order.updated_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: '2-digit',
                                  year: 'numeric',
                                })}
                                , 01:45 PM. If you can&apos;t see the refund in your bank statement(bank app/passbook), contact your bank and share refund reference number{' '}
                                {order.refund_ref || '30001053385329260659621'} to track it.
                              </span>
                            </li>
                          </ul>

                          {order.refund_supercoins && (
                            <div className="border-t border-[#f0f0f0] mt-3 pt-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[14px] font-[500] text-[#26a541]">Refund Completed</span>
                                <span className="text-[12px] text-[#878787]">(Refund ID: {order.refund_id_2})</span>
                              </div>
                              <ul className="mt-2.5">
                                <li className="flex gap-2 text-[12px] leading-[18px] text-[#212121]">
                                  <span className="mt-[5px] w-1 h-1 bg-[#212121] rounded-full shrink-0"></span>
                                  <span>
                                    The refund was added to your SuperCoins balance on by{' '}
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}, 08:55 PM.
                                  </span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}