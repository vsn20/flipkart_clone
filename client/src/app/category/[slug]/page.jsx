'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { categoriesAPI } from '@/lib/api';

const CATEGORY_SUBCATEGORIES = {
  'home-furniture': [
    { name: 'Decor', slug: 'decor', icon: '🎨' },
    { name: 'Furniture', slug: 'furniture', icon: '🛋️' },
    { name: 'Bulb', slug: 'bulb', icon: '💡' },
    { name: 'Sofas', slug: 'sofas', icon: '🛋️' },
    { name: 'Mosquito nets', slug: 'mosquito-nets', icon: '🥅' },
    { name: 'Dining', slug: 'dining', icon: '🍽️' },
    { name: 'Drinkware', slug: 'drinkware', icon: '🥤' },
    { name: 'Cookware', slug: 'cookware', icon: '🍳' },
    { name: 'View all', slug: 'all', icon: '👁️' },
    { name: 'Bedsheets', slug: 'bedsheets', icon: '🛏️' },
    { name: 'Furnishing', slug: 'furnishing', icon: '🪟' },
    { name: 'Insect killer', slug: 'insect-killer', icon: '🦟' },
    { name: 'Bath linen', slug: 'bath-linen', icon: '🛁️' },
    { name: 'Containers', slug: 'containers', icon: '📦' },
    { name: 'Cleaning', slug: 'cleaning', icon: '🧹' },
    { name: 'Pooja needs', slug: 'pooja-needs', icon: '🕯️' },
    { name: 'Mats & rugs', slug: 'mats-rugs', icon: '🏠' },
    { name: 'Wallpaper', slug: 'wallpaper', icon: '🎭' },
  ],
  'appliances': [
    { name: 'Television', slug: 'television', icon: '📺' },
    { name: 'Washing Machine', slug: 'washing-machine', icon: '🧹' },
    { name: 'Air Conditioners', slug: 'ac', icon: '❄️' },
    { name: 'Refrigerators', slug: 'refrigerators', icon: '❄️' },
    { name: 'Microwave', slug: 'microwave', icon: '🔥' },
    { name: 'Induction', slug: 'induction', icon: '🍳' },
  ],
  'electronics': [
    { name: 'Mobiles', slug: 'mobiles', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'Tablets', slug: 'tablets', icon: '📱' },
    { name: 'Headphones', slug: 'headphones', icon: '🎧' },
    { name: 'Speakers', slug: 'speakers', icon: '🔊' },
    { name: 'Cameras', slug: 'cameras', icon: '📷' },
  ],
  'fashion': [
    { name: 'T-Shirts', slug: 't-shirts', icon: '👕' },
    { name: 'Shirts', slug: 'shirts', icon: '👔' },
    { name: 'Jeans', slug: 'jeans', icon: '👖' },
    { name: 'Dresses', slug: 'dresses', icon: '👗' },
    { name: 'Shoes', slug: 'shoes', icon: '👞' },
    { name: 'Watches', slug: 'watches', icon: '⌚' },
  ],
};

const CATEGORY_BANNERS = {
  'home-furniture': [
    {
      bg: 'linear-gradient(135deg, #e8a957 0%, #d4a574 100%)',
      title: 'HOME SAVER',
      subtitle: "Har din savings ki guarantee!",
      detail: 'Home decor, kitchen...',
      img: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&q=80',
    },
    {
      bg: 'linear-gradient(135deg, #2874f0 0%, #1565c0 100%)',
      title: 'Maximise your savings!',
      subtitle: 'Avail GST benefits',
      detail: 'on home & furniture',
      img: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=80',
    },
    {
      bg: 'linear-gradient(135deg, #4db8a8 0%, #1098ad 100%)',
      title: 'Quick fixes?',
      subtitle: 'Just DIY!',
      detail: 'All needs to level up your home - Up to 50% Off',
      img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    },
  ],
  'appliances': [
    {
      bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      title: 'Super Appliances',
      subtitle: 'Latest Offers',
      detail: 'On all major appliances',
      img: 'https://images.unsplash.com/photo-1561758033-d462a5cb7b93?w=400&q=80',
    },
  ],
};

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Decode slug to find matching category
  const decodedSlug = slug?.replace(/%20/g, ' ').toLowerCase();
  const categoryKey = Object.keys(CATEGORY_SUBCATEGORIES).find(
    key => key === slug || key.replace('-', ' ') === decodedSlug
  );

  if (!categoryKey) {
    return (
      <div style={{ maxWidth: 1300, margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 20, color: '#878787' }}>Category not found</p>
        <Link href="/" style={{ color: '#2874f0', fontSize: 14, marginTop: 8, display: 'inline-block' }}>
          Go back home
        </Link>
      </div>
    );
  }

  const subcategories = CATEGORY_SUBCATEGORIES[categoryKey];
  const banners = CATEGORY_BANNERS[categoryKey] || [];
  const categoryTitle = categoryKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh', paddingBottom: 70 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 8px' }}>

        {/* Banners Carousel */}
        {banners.length > 0 && (
          <BannerCarousel banners={banners} />
        )}

        {/* Subcategories Grid */}
        <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.07)', margin: '8px 0', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
            {subcategories.map(subcat => (
              <Link
                key={subcat.slug}
                href={subcat.slug === 'all' ? `/products?category=${categoryKey}` : `/products?category=${subcat.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 8px', borderRadius: 4, cursor: 'pointer', transition: 'all .2s',
                  background: '#fff'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ fontSize: 36 }}>{subcat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#212121', textAlign: 'center', lineHeight: 1.3 }}>
                    {subcat.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Product Section - can add featured products here */}
        <FeaturedSection categoryKey={categoryKey} />
      </div>
    </div>
  );
}

function BannerCarousel({ banners }) {
  const [banner, setBanner] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBanner(p => (p + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <div style={{ position: 'relative', height: isMobile ? 180 : 280, overflow: 'hidden', background: banners[banner].bg, margin: '8px 0', borderRadius: 4 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ background: '#ffe500', color: '#212121', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 2, display: 'inline-block', marginBottom: isMobile ? 8 : 14, letterSpacing: 0.5 }}>
            HOT DEAL
          </div>
          <h2 style={{ color: '#fff', fontSize: isMobile ? 22 : 36, fontWeight: 800, lineHeight: 1.2, marginBottom: isMobile ? 6 : 10 }}>
            {banners[banner].title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: isMobile ? 13 : 16, marginBottom: isMobile ? 4 : 8 }}>
            {banners[banner].subtitle}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 12 : 14 }}>
            {banners[banner].detail}
          </p>
        </div>
        {!isMobile && banners[banner].img && (
          <img src={banners[banner].img} alt="" style={{ height: 240, objectFit: 'cover', borderRadius: 4, opacity: 0.9 }}
            onError={e => e.target.style.display = 'none'}/>
        )}
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {banners.map((_, i) => (
          <button key={i} onClick={() => setBanner(i)}
            style={{ width: i === banner ? 22 : 8, height: 8, borderRadius: 4, background: i === banner ? '#fff' : 'rgba(255,255,255,.5)', border: 'none', cursor: 'pointer', transition: 'width .3s, background .3s', padding: 0 }}/>
        ))}
      </div>
    </div>
  );
}

function FeaturedSection({ categoryKey }) {
  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.07)', margin: '8px 0', padding: '16px' }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#212121', marginBottom: 16 }}>
        Unbeatable prices
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12,
        background: '#f0f0f0',
        padding: 8
      }}>
        {[
          { name: 'Bottles & flasks', price: '₹299', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=180&q=80' },
          { name: 'Curtains', price: '₹299', img: 'https://images.unsplash.com/photo-1598928506696-ae58fbbf107c?w=180&q=80' },
          { name: 'Dryer stands', price: '₹999', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=180&q=80' },
          { name: 'Extension boards', price: '₹329', img: 'https://images.unsplash.com/photo-1621905251313-37f379d76e65?w=180&q=80' },
          { name: 'Mosquito nets', price: '₹319', img: 'https://images.unsplash.com/photo-1598984499696-4b73476b946c?w=180&q=80' },
          { name: 'Pressure cookers', price: '₹599', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=180&q=80' },
        ].map((item, i) => (
          <div key={i} style={{ background: '#fff', cursor: 'pointer', transition: 'transform .2s', position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ width: '100%', height: 120, overflow: 'hidden' }}>
              <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <div style={{ padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#212121', marginBottom: 4 }}>From {item.price}</div>
              <div style={{ fontSize: 12, color: '#878787' }}>{item.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
