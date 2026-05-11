import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiAlertCircle, FiLoader, FiArrowRight,
  FiShoppingBag, FiStar, FiTruck, FiShield,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore from '../store/useAuthStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/* ─── Ad Slide Data ──────────────────────────────────────── */
const AD_SLIDES = [
  {
    badge: '🌿 Spring Collection',
    headline: 'Elevate Your\nEveryday Style',
    sub: 'Curated pieces crafted for the modern minimalist.',
    cta: 'Shop New Arrivals',
    grad: 'linear-gradient(135deg, #1a3626 0%, #2d5a3d 100%)',
    pill: '#d4f0d0',
    pillText: '#1a3626',
    tag: 'FREE SHIPPING on orders over $75',
  },
  {
    badge: '⚡ Limited Time',
    headline: 'Up to 40% Off\nPremium Essentials',
    sub: "Don't miss the season's most anticipated sale.",
    cta: 'View Sale Items',
    grad: 'linear-gradient(135deg, #2c1a5c 0%, #4a2d8a 100%)',
    pill: '#ede0ff',
    pillText: '#2c1a5c',
    tag: 'SALE ENDS SUNDAY',
  },
  {
    badge: '✨ Members Only',
    headline: 'Exclusive Perks\nJust for You',
    sub: 'Early access, member prices, and priority support.',
    cta: 'Discover Benefits',
    grad: 'linear-gradient(135deg, #5c1a1a 0%, #8a3030 100%)',
    pill: '#ffe0e0',
    pillText: '#5c1a1a',
    tag: 'JOIN FREE — NO CREDIT CARD',
  },
];

const TRUST_ITEMS = [
  { icon: FiTruck,       label: 'Free Returns',    sub: '30-day window' },
  { icon: FiShield,      label: 'Secure Checkout', sub: '256-bit SSL'   },
  { icon: FiStar,        label: '4.9 Rating',      sub: '12k+ reviews'  },
  { icon: FiShoppingBag, label: '50k+ Products',   sub: 'New daily'     },
];

/* ─── Component ─────────────────────────────────────────── */
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % AD_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => () => clearError(), [clearError]);

  const onSubmit = async (data) => {
    try { 
      const user = await login(data.email, data.password); 
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'store_keeper') {
        navigate('/store');
      } else if (user.role === 'delivery') {
        navigate('/delivery');
      } else {
        navigate('/');
      }
    } catch (_) {}
  };

  const slide = AD_SLIDES[slideIdx];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f1eb' }}>

      {/* ════════════════════════════════════════
          LEFT — Promotional Ad Panel
      ════════════════════════════════════════ */}
      <div
        style={{
          position: 'relative',
          width: '52%',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'none',
        }}
        className="login-left-panel"
      >
        {/* Animated gradient BG */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{
              position: 'absolute', inset: 0,
              background: slide.grad,
            }}
          />
        </AnimatePresence>

        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', top: '-8rem', left: '-8rem',
          width: '24rem', height: '24rem', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', filter: 'blur(48px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-6rem', right: '-6rem',
          width: '20rem', height: '20rem', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', filter: 'blur(48px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '36rem', height: '36rem', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%', padding: '3rem 3.5rem',
        }}>
          {/* Brand name */}
          <div>
            <span style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              fontFamily: 'Outfit, sans-serif',
            }}>
              Aurora Earth
            </span>
          </div>

          {/* Slide content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIdx}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ maxWidth: '26rem' }}
            >
              {/* Badge pill */}
              <span style={{
                display: 'inline-block',
                background: slide.pill, color: slide.pillText,
                fontSize: '0.7rem', fontWeight: 800,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '0.35rem 0.9rem', borderRadius: '9999px',
                marginBottom: '1.25rem',
              }}>
                {slide.badge}
              </span>

              {/* Headline */}
              <h1 style={{
                color: '#fff',
                fontSize: 'clamp(2.8rem, 4vw, 3.75rem)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                whiteSpace: 'pre-line',
                marginBottom: '1.25rem',
              }}>
                {slide.headline}
              </h1>

              {/* Subtitle */}
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1.0625rem', lineHeight: 1.7,
                maxWidth: '22rem', marginBottom: '1.75rem',
              }}>
                {slide.sub}
              </p>

              {/* CTA button */}
              <button
                onClick={() => navigate('/shop')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: '#fff', fontWeight: 600, fontSize: '0.9375rem',
                  border: '2px solid rgba(255,255,255,0.45)',
                  borderRadius: '9999px', padding: '0.7rem 1.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'all 0.25s',
                  marginBottom: '1.25rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                {slide.cta}
                <FiArrowRight size={16} />
              </button>

              {/* Tag */}
              <p style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.6875rem', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>
                {slide.tag}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bottom section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem' }}>
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '0.4rem', textAlign: 'center',
                }}>
                  <div style={{
                    width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={15} style={{ color: 'rgba(255,255,255,0.8)' }} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.6875rem', fontWeight: 600, lineHeight: 1.3 }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.625rem', lineHeight: 1.3 }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              {AD_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  style={{
                    height: '4px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                    width: i === slideIdx ? '1.5rem' : '0.5rem',
                    background: i === slideIdx ? '#fff' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.35s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Login Form
      ════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff',
        padding: '2.5rem 2rem',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '26rem' }}>

          {/* Mobile logo */}
          <div className="login-mobile-logo" style={{ marginBottom: '2rem', textAlign: 'center', display: 'none' }}>
            <span style={{
              fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif',
              fontWeight: 800, color: '#1a3626', letterSpacing: '0.2em',
            }}>
              AURORA <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#888' }}>EARTH</span>
            </span>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{ marginBottom: '2rem' }}
          >
            <h2 style={{
              fontSize: '2rem', fontFamily: 'Outfit, sans-serif',
              fontWeight: 800, color: '#111', letterSpacing: '-0.02em',
              marginBottom: '0.4rem',
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#6b7280' }}>
              Sign in to continue shopping.
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  marginBottom: '1.25rem', padding: '0.875rem 1rem',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '0.75rem', display: 'flex', alignItems: 'center',
                  gap: '0.625rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500,
                  overflow: 'hidden',
                }}
              >
                <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Email field */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.8125rem', fontWeight: 600,
                color: '#374151', marginBottom: '0.4rem',
              }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <FiMail size={15} style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none',
                }} />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={{
                    width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                    paddingTop: '0.75rem', paddingBottom: '0.75rem',
                    borderRadius: '0.75rem', fontSize: '0.9375rem',
                    color: '#111', background: errors.email ? '#fef2f2' : '#f9fafb',
                    border: `1.5px solid ${errors.email ? '#fca5a5' : '#e5e7eb'}`,
                    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = errors.email ? '#f87171' : '#6b7280';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(107,114,128,0.08)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = errors.email ? '#fca5a5' : '#e5e7eb';
                    e.target.style.background = errors.email ? '#fef2f2' : '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock size={15} style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none',
                }} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: '100%', paddingLeft: '2.5rem', paddingRight: '3rem',
                    paddingTop: '0.75rem', paddingBottom: '0.75rem',
                    borderRadius: '0.75rem', fontSize: '0.9375rem',
                    color: '#111', background: errors.password ? '#fef2f2' : '#f9fafb',
                    border: `1.5px solid ${errors.password ? '#fca5a5' : '#e5e7eb'}`,
                    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = errors.password ? '#f87171' : '#6b7280';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(107,114,128,0.08)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = errors.password ? '#fca5a5' : '#e5e7eb';
                    e.target.style.background = errors.password ? '#fef2f2' : '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', color: '#9ca3af',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: '0.25rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                </button>
              </div>

              {/* Action Links Below Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                <Link to="/register" style={{ fontSize: '0.75rem', color: '#1a3626', fontWeight: 700, textDecoration: 'none' }}>
                  New here? Create account
                </Link>
                <button
                  type="button"
                  style={{
                    fontSize: '0.75rem', color: '#6b7280', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {errors.password && (
                <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', background: loading ? '#2d5a3d' : '#1a3626',
                color: '#fff', padding: '0.875rem 1rem',
                borderRadius: '0.75rem', fontSize: '0.9375rem', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(26,54,38,0.28)',
                transition: 'all 0.2s', marginTop: '0.25rem',
                opacity: loading ? 0.75 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#122a1c'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1a3626'; }}
            >
              {loading
                ? <FiLoader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <><span>Sign in</span><FiArrowRight size={16} /></>
              }
            </button>
          </motion.form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1.25rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em' }}>
              OR
            </span>
            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
          </div>

          {/* Google button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.625rem', border: '1.5px solid #e5e7eb', background: '#f9fafb',
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              fontSize: '0.9375rem', fontWeight: 500, color: '#374151',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9ca3af'; e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
          >
            <FcGoogle size={20} />
            Continue with Google
          </motion.button>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                fontSize: '0.8125rem', color: '#9ca3af', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#374151'}
              onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            >
              Continue as Guest
            </button>
            <p style={{ fontSize: '0.6875rem', color: '#d1d5db', textAlign: 'center', maxWidth: '18rem', lineHeight: 1.6 }}>
              By signing in you agree to our{' '}
              <span style={{ color: '#9ca3af', cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: '#9ca3af', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </motion.div>

        </div>
      </div>

      {/* ── Responsive styles ─────────────────── */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (min-width: 1024px) {
          .login-left-panel { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }

        @media (max-width: 1023px) {
          .login-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
