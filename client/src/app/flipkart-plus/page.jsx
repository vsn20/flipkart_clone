'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiStar, FiGift, FiTruck, FiShield, FiZap, FiAward } from 'react-icons/fi';

export default function FlipkartPlusPage() {
  const { user, isAuthenticated } = useAuth();
  const superCoins = user?.super_coins || 0;
  const plusTier = user?.plus_tier || 'none';
  const totalOrders = user?.total_orders || 0;

  const tiers = [
    { name: 'None', minOrders: 0, color: '#9e9e9e', current: plusTier === 'none' },
    { name: 'Silver', minOrders: 10, color: '#90a4ae', current: plusTier === 'silver' },
    { name: 'Gold', minOrders: 20, color: '#ffd700', current: plusTier === 'gold' },
  ];

  const benefits = [
    { icon: <FiTruck size={24} />, title: 'Free Delivery', desc: 'Free delivery on all orders, no minimum' },
    { icon: <FiZap size={24} />, title: 'Early Access', desc: 'Get early access to sales & new launches' },
    { icon: <FiGift size={24} />, title: 'Plus Treats', desc: 'Post-order surprise rewards & gift cards' },
    { icon: <FiShield size={24} />, title: 'Priority Support', desc: 'Priority customer service for all queries' },
    { icon: <FiAward size={24} />, title: 'Exclusive Offers', desc: 'Special bank offers during major sales' },
    { icon: <FiStar size={24} />, title: 'SuperCoin Rewards', desc: 'Earn more SuperCoins on every purchase' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-2 sm:px-4 py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2874f0] to-[#6C63FF] rounded-lg p-8 sm:p-12 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">⭐</span>
            <h1 className="text-3xl sm:text-4xl font-bold">Flipkart Plus</h1>
          </div>
          <p className="text-white/80 text-lg mb-6 max-w-lg">
            Get rewarded for shopping! Earn SuperCoins on every purchase and unlock exclusive benefits.
          </p>
          {!isAuthenticated && (
            <Link
              href="/login"
              className="inline-block bg-white text-[#2874f0] px-8 py-3 rounded-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Login to Get Started
            </Link>
          )}
        </div>
      </div>

      {/* SuperCoins Balance */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Your SuperCoins Balance</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-4xl">🪙</span>
                <span className="text-4xl font-bold text-[#ff9f00]">{superCoins}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">1 SuperCoin = ₹1 savings</p>
            </div>

            <div className="h-px sm:h-20 sm:w-px bg-gray-200 w-full sm:w-auto" />

            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Your Membership Tier</p>
              <span className={`inline-flex items-center gap-2 text-2xl font-bold capitalize ${
                plusTier === 'gold' ? 'text-[#ffd700]' : plusTier === 'silver' ? 'text-[#90a4ae]' : 'text-gray-400'
              }`}>
                {plusTier === 'gold' ? '🥇' : plusTier === 'silver' ? '🥈' : '🎯'}
                {plusTier === 'none' ? 'Regular' : `Plus ${plusTier}`}
              </span>
              <p className="text-xs text-gray-400 mt-1">{totalOrders} orders completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Membership Tiers</h2>
        <div className="relative">
          {/* Progress bar */}
          <div className="flex items-center gap-0 mb-6">
            {tiers.map((tier, i) => (
              <div key={tier.name} className="flex items-center flex-1">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
                  tier.current ? 'ring-4 ring-yellow-200 scale-110' : ''
                }`} style={{ background: tier.color }}>
                  {tier.current ? '✓' : tier.minOrders}
                </div>
                {i < tiers.length - 1 && (
                  <div className="flex-1 h-1.5 mx-1 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2874f0] transition-all"
                      style={{ width: totalOrders >= tiers[i + 1].minOrders ? '100%' : `${Math.min(100, (totalOrders / tiers[i + 1].minOrders) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Regular</span>
            <span>Silver (10 orders)</span>
            <span>Gold (20 orders)</span>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">How to Earn SuperCoins</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-3xl mb-2">🛒</div>
            <h3 className="font-semibold text-gray-800 mb-1">Shop</h3>
            <p className="text-xs text-gray-500">Earn 1 SuperCoin for every ₹100 spent</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
            <div className="text-3xl mb-2">⬆️</div>
            <h3 className="font-semibold text-gray-800 mb-1">Level Up</h3>
            <p className="text-xs text-gray-500">Reach Silver at 10 orders, Gold at 20 orders</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-800 mb-1">Save</h3>
            <p className="text-xs text-gray-500">Use SuperCoins for discounts on future orders</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Plus Membership Benefits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex gap-3 p-4 border border-gray-100 rounded-lg hover:border-[#2874f0] hover:shadow-sm transition-all">
              <div className="text-[#2874f0] shrink-0 mt-0.5">{benefit.icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{benefit.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
