'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, guestLogin, googleLogin, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) e.email = 'Enter a valid email';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Min 6 characters';
    if (!isLogin) {
      if (!formData.name.trim()) e.name = 'Name is required';
      if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) e.phone = 'Enter valid 10-digit number';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    const result = isLogin
      ? await login(formData.email, formData.password)
      : await register(formData.name, formData.email, formData.password, formData.phone);
    setLoading(false);
    if (result.success) router.push('/');
    else setError(result.message || 'Something went wrong');
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    const result = await guestLogin();
    setLoading(false);
    if (result.success) router.push('/');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await googleLogin('Google User', `user${Date.now()}@gmail.com`, '');
    setLoading(false);
    if (result.success) router.push('/');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#f1f3f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 12px' }}>
      <div style={{ display: 'flex', maxWidth: 750, width: '100%', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,.15)', borderRadius: 2, overflow: 'hidden', minHeight: 480 }}>

        {/* Left Panel – Blue */}
        <div style={{ background: '#2874f0', width: '40%', padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }} className="hidden-mobile">
          <div>
            <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
              {isLogin ? 'Login' : "Looks like you're new here!"}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, lineHeight: 1.6 }}>
              {isLogin
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Sign up with your email & mobile number to get started'}
            </p>
          </div>
          {/* Illustration */}
          <svg viewBox="0 0 220 160" width="100%" style={{ marginTop: 24 }}>
            <rect x="50" y="30" width="120" height="90" rx="8" fill="rgba(255,255,255,.13)"/>
            <rect x="65" y="48" width="90" height="12" rx="4" fill="rgba(255,255,255,.22)"/>
            <rect x="65" y="68" width="90" height="12" rx="4" fill="rgba(255,255,255,.22)"/>
            <rect x="80" y="90" width="60" height="18" rx="4" fill="#fb641b"/>
            <circle cx="110" cy="20" r="14" fill="rgba(255,255,255,.18)"/>
            <circle cx="110" cy="20" r="8" fill="rgba(255,255,255,.3)"/>
            <rect x="140" y="90" width="18" height="24" rx="2" fill="#ffe500" opacity=".9"/>
            <rect x="62" y="108" width="20" height="8" rx="2" fill="#ffe500" opacity=".8"/>
          </svg>
        </div>

        {/* Right Panel – Form */}
        <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <form onSubmit={handleSubmit}>
            {/* Name (signup) */}
            {!isLogin && (
              <div style={{ marginBottom: 20 }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', borderBottom: `1px solid ${fieldErrors.name ? '#ff6161' : '#c2c2c2'}`, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '10px 0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {fieldErrors.name && <p style={{ fontSize: 11, color: '#ff6161', marginTop: 4 }}>{fieldErrors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', borderBottom: `1px solid ${fieldErrors.email ? '#ff6161' : '#c2c2c2'}`, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '10px 0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              {fieldErrors.email && <p style={{ fontSize: 11, color: '#ff6161', marginTop: 4 }}>{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', borderBottom: `1px solid ${fieldErrors.password ? '#ff6161' : '#c2c2c2'}`, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '10px 0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#2874f0', fontSize: 13, fontWeight: 600 }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {fieldErrors.password && <p style={{ fontSize: 11, color: '#ff6161', marginTop: 4 }}>{fieldErrors.password}</p>}
            </div>

            {/* Phone (signup) */}
            {!isLogin && (
              <div style={{ marginBottom: 20 }}>
                <input
                  type="tel"
                  placeholder="Mobile Number (optional)"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', borderBottom: `1px solid ${fieldErrors.phone ? '#ff6161' : '#c2c2c2'}`, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '10px 0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {fieldErrors.phone && <p style={{ fontSize: 11, color: '#ff6161', marginTop: 4 }}>{fieldErrors.phone}</p>}
              </div>
            )}

            {error && <p style={{ color: '#ff6161', fontSize: 13, marginBottom: 10 }}>{error}</p>}

            <p style={{ fontSize: 11.5, color: '#878787', lineHeight: 1.6, marginBottom: 16 }}>
              By continuing, you agree to Flipkart&apos;s{' '}
              <span style={{ color: '#2874f0', cursor: 'pointer' }}>Terms of Use</span> and{' '}
              <span style={{ color: '#2874f0', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>

            {/* Login Button */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 2px 4px rgba(0,0,0,.2)', marginBottom: 14, letterSpacing: 0.3 }}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ flex: 1, height: 1, background: '#e8e8e8' }}/>
              <span style={{ fontSize: 13, color: '#878787' }}>OR</span>
              <span style={{ flex: 1, height: 1, background: '#e8e8e8' }}/>
            </div>

            {/* Google */}
            <button type="button" onClick={handleGoogleLogin} disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid #e8e8e8', borderRadius: 2, padding: '11px 0', fontSize: 14, color: '#212121', background: '#fff', cursor: 'pointer', marginBottom: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.1C33.3 33 29 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.4 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.4 29.2 4 24 4 16.2 4 9.4 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-4.9C29 35.9 26.6 37 24 37c-4.9 0-9.1-3-10.9-7.3L6.9 35c3 6.2 9.7 9 17.1 9z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.1c-1 2.7-2.8 5-5.3 6.6l6 4.9C40 35.8 43.6 30.4 43.6 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </button>

            {/* Guest */}
            <button type="button" onClick={handleGuestLogin} disabled={loading}
              style={{ width: '100%', border: '1px solid #2874f0', borderRadius: 2, padding: '11px 0', fontSize: 14, color: '#2874f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f5ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              Continue as Guest
            </button>
          </form>

          <button onClick={() => { setIsLogin(v => !v); setFormData({ name: '', email: '', password: '', phone: '' }); setError(''); setFieldErrors({}); }}
            style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#2874f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            {isLogin ? "New to Flipkart? Create an account" : "Existing User? Log in"}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}
