'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { FiSearch } from 'react-icons/fi';

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

  // Flatten orders into individual item rows, each carrying their parent order
  const flatItems = filteredOrders.flatMap(order =>
    (order.items || []).map(item => ({ item, order }))
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-3">
      <div className="max-w-[1050px] mx-auto px-3">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#878787] mb-3">
          <span>Home</span>
          <span className="mx-1">›</span>
          <span>My Account</span>
          <span className="mx-1">›</span>
          <span className="text-[#212121] font-medium">My Orders</span>
        </nav>

        <div className="flex gap-3 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="w-[230px] shrink-0 bg-white shadow-sm">

            <div className="px-4 py-3 border-b border-[#e0e0e0]">
              <span className="text-base font-semibold text-[#212121]">Filters</span>
            </div>

            {/* ORDER STATUS */}
            <div className="px-4 pt-4 pb-3 border-b border-[#e0e0e0]">
              <p className="text-xs font-bold text-[#212121] uppercase tracking-wider mb-3">
                Order Status
              </p>
              {['On the way', 'Delivered', 'Cancelled', 'Returned'].map(status => (
                <label key={status} className="flex items-center gap-2 mb-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={statusFilter === status}
                    onChange={() => setStatusFilter(statusFilter === status ? '' : status)}
                    className="w-[15px] h-[15px] accent-[#2874f0] cursor-pointer"
                  />
                  <span className="text-sm text-[#212121] group-hover:text-[#2874f0]">{status}</span>
                </label>
              ))}
            </div>

            {/* ORDER TIME */}
            <div className="px-4 pt-4 pb-4">
              <p className="text-xs font-bold text-[#212121] uppercase tracking-wider mb-3">
                Order Time
              </p>
              {[
                { label: 'Last 30 days', value: '30' },
                { label: '2024', value: '2024' },
                { label: '2023', value: '2023' },
                { label: 'Older', value: 'older' },
              ].map(item => (
                <label key={item.value} className="flex items-center gap-2 mb-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={dateFilter === item.value}
                    onChange={() => setDateFilter(dateFilter === item.value ? '' : item.value)}
                    className="w-[15px] h-[15px] accent-[#2874f0] cursor-pointer"
                  />
                  <span className="text-sm text-[#212121] group-hover:text-[#2874f0]">{item.label}</span>
                </label>
              ))}
            </div>

          </aside>

          {/* ── RIGHT CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Search bar */}
            <div className="bg-white shadow-sm mb-3">
              <div className="flex">
                <div className="flex-1 flex items-center px-4">
                  <input
                    type="text"
                    placeholder="Search your orders here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-none outline-none text-sm py-4 text-[#212121] placeholder-[#9e9e9e] bg-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 bg-[#2874f0] text-white text-sm font-semibold px-8 py-4 hover:bg-[#1a65d6] transition-colors shrink-0">
                  <FiSearch size={18} />
                  <span>Search Orders</span>
                </button>
              </div>
            </div>

            {/* Orders list — each item is its own card with gap between */}
            {loading ? (
              <div className="bg-white shadow-sm py-16 text-center text-sm text-[#878787]">
                Loading orders...
              </div>
            ) : flatItems.length === 0 ? (
              <div className="bg-white shadow-sm py-16 text-center">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-base font-semibold text-[#212121] mb-1">No orders found</p>
                <p className="text-sm text-[#878787]">Looks like your filters didn't match any orders</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flatItems.map(({ item, order }) => (
                  <Link
                    key={item.id}
                    href={`/order-confirmation/${order.id}`}
                    className="bg-white rounded-sm shadow-sm flex items-center hover:bg-[#f5f5f6] transition-colors no-underline overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="flex items-center justify-center w-[110px] shrink-0 py-5 px-4">
                      <img
                        src={item.product_image || item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                        alt={item.product_name}
                        className="w-[72px] h-[72px] object-contain"
                      />
                    </div>

                    {/* Product Name + Qty */}
                    <div className="flex-1 py-5 pr-4 min-w-0">
                      <p className="text-sm text-[#212121] leading-[1.4] mb-1 line-clamp-2">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-[#878787]">Qty: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="w-[120px] shrink-0 py-5 px-2 text-sm font-medium text-[#212121]">
                      {formatPrice(item.price)}
                    </div>

                    {/* Status */}
                    <div className="w-[260px] shrink-0 py-5 px-4">
                      <div className="flex items-center gap-[6px] mb-[3px]">
                        <span
                          className="w-[10px] h-[10px] rounded-full shrink-0"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        />
                        <span className="text-sm font-semibold text-[#212121]">
                          {order.status === 'Delivered'
                            ? `Delivered on ${new Date(order.updated_at || order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#878787] pl-4">
                        {order.status === 'Delivered'
                          ? 'Your item has been delivered'
                          : order.status === 'Cancelled'
                          ? 'Your order has been cancelled'
                          : order.status === 'Returned'
                          ? 'Your return request is processed'
                          : 'Your item is on the way'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}