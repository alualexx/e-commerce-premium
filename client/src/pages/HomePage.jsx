import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiShoppingBag, FiTruck,
  FiShield, FiRotateCcw, FiStar, FiChevronRight, FiChevronLeft
} from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/product/ProductCard';
import PromotionBanner from '../components/home/PromotionBanner';
import axiosInstance from '../utils/api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const PromotionSection = () => {
  const { t } = useTranslation();
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    axiosInstance.get('/notifications/latest-promotion')
      .then(({ data }) => {
        if (data && data.type === 'promotion') setPromo(data);
      })
      .catch(() => {});
  }, []);

  if (!promo) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: '#fff',
        borderRadius: '2.5rem',
        padding: '0',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        minHeight: '500px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        position: 'relative'
      }}
      className="promotion-box"
    >
      {/* Content Side */}
      <div style={{ 
        padding: '5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '2.5rem',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            background: '#111', color: '#fff', 
            padding: '0.5rem 1rem', borderRadius: '100px', 
            fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', 
            letterSpacing: '0.2em'
          }}>
            {t('home.promotion.exclusive')}
          </span>
          <div style={{ width: '40px', height: '1px', background: 'rgba(0,0,0,0.1)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            {t('home.promotion.limited')}
          </span>
        </div>

        <div>
          <h2 style={{ 
            fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
            fontWeight: 900, color: '#111', letterSpacing: '-0.05em', 
            lineHeight: 0.95, marginBottom: '1.5rem' 
          }}>
            {promo.title}
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', fontSize: '1.25rem', 
            maxWidth: '35ch', lineHeight: 1.5, fontWeight: 500
          }}>
            {promo.message}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link 
            to={promo.link || '/shop'} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '1rem', 
              background: '#111', color: '#fff', padding: '1.5rem 3rem', 
              borderRadius: '100px', fontWeight: 800, fontSize: '1.1rem',
              textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; e.currentTarget.style.background = '#222'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.background = '#111'; }}
          >
            {t('home.promotion.shop_now')} <FiArrowRight size={22} />
          </Link>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('home.promotion.ending')}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111' }}>{t('home.promotion.pricing')}</span>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div style={{ 
        position: 'relative', 
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', width: '140%', height: '140%', background: 'radial-gradient(circle at center, #a3e63515 0%, transparent 70%)', top: '-20%', left: '-20%' }} />
        
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ zIndex: 2, position: 'relative' }}
        >
          <div style={{ 
            width: '320px', height: '420px', background: '#fff', 
            borderRadius: '2rem', boxShadow: '0 50px 100px rgba(0,0,0,0.08)',
          }}>
            <div style={{ height: '72%', background: 'linear-gradient(135deg, var(--bg-sub) 0%, var(--bg-card) 100%)', borderRadius: '1.75rem 1.75rem 0 0' }} />
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ height: '12px', width: '60%', background: 'var(--bg-sub)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '40%', background: 'var(--bg-sub)', borderRadius: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                 <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>79 ETB</span>
                 <span style={{ color: '#a3e635', fontWeight: 900, fontSize: '0.75rem' }}>{t('home.promotion.active')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Badge */}
        <motion.div
          initial={{ rotate: 15 }}
          animate={{ rotate: -5 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: '120px',
            height: '120px',
            background: '#a3e635',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            zIndex: 3,
            boxShadow: '0 20px 40px rgba(163, 230, 53, 0.4)'
          }}
        >
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>SALE</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#111', textTransform: 'uppercase' }}>{t('home.promotion.live')}</span>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .promotion-box {
            grid-template-columns: 1fr !important;
          }
          .promotion-box > div:first-child {
            padding: 3rem !important;
          }
          .promotion-box > div:last-child {
            height: 400px !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

/* ─── Component ─────────────────────────────────────────── */
const HomePage = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);

  const HERO_SLIDES = [
    {
      subtitle: t('home.hero.slides.0.subtitle'),
      title: t('home.hero.slides.0.title'),
      description: t('home.hero.slides.0.description'),
      cta: t('home.hero.slides.0.cta'),
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1920',
      link: '/shop',
    },
    {
      subtitle: t('home.hero.slides.1.subtitle'),
      title: t('home.hero.slides.1.title'),
      description: t('home.hero.slides.1.description'),
      cta: t('home.hero.slides.1.cta'),
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920',
      link: '/shop',
    },
  ];

  const TRUST_ITEMS = [
    { icon: FiTruck,     title: t('home.trust.shipping.title'), desc: t('home.trust.shipping.desc') },
    { icon: FiShield,    title: t('home.trust.secure.title'),   desc: t('home.trust.secure.desc') },
    { icon: FiStar,      title: t('home.trust.support.title'),  desc: t('home.trust.support.desc') },
    { icon: FiRotateCcw, title: t('home.trust.returns.title'),  desc: t('home.trust.returns.desc') },
  ];

  const CATEGORIES = [
    {
      name: 'Clothing',
      items: '120+ items',
      accent: '#a3e635',
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
      tag: t('home.categories.tags.featured'),
      featured: true,
    },
    {
      name: 'Accessories',
      items: '48 items',
      accent: '#f59e0b',
      img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
      tag: t('home.categories.tags.new'),
      featured: false,
    },
    {
      name: 'Footwear',
      items: '64 items',
      accent: '#60a5fa',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      tag: t('home.categories.tags.sale'),
      featured: false,
    },
    {
      name: 'Home & Living',
      items: '35 items',
      accent: '#f472b6',
      img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
      tag: t('home.categories.tags.new'),
      featured: false,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axiosInstance.get('/products?fromShop=true&featured=true&limit=4')
      .then(({ data }) => setFeaturedProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--bg-main)' }}>
      <PromotionBanner />

      {/* ════════════════════════════════════════
          HERO CAROUSEL
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '80vh', overflow: 'hidden', background: '#0a0a0a' }}>
        <AnimatePresence mode="wait">
          {HERO_SLIDES.map((slide, index) => (
            index === activeSlide && (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'absolute', inset: 0 }}
              >
                {/* Background Image with Ken Burns Effect */}
                <motion.img
                  src={slide.image}
                  alt={slide.title}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6, ease: 'linear' }}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                  }}
                />
                
                {/* Dynamic Overlays */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                }} />
                
                {/* Content Container */}
                <div style={{
                  position: 'relative', zIndex: 10,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  height: '100%', padding: '0 8%', maxWidth: '1600px', margin: '0 auto'
                }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                      background: 'rgba(163, 230, 53, 0.1)', color: '#a3e635',
                      padding: '0.6rem 1.2rem', borderRadius: '100px',
                      fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em',
                      textTransform: 'uppercase', marginBottom: '1.5rem',
                      backdropFilter: 'blur(10px)', border: '1px solid rgba(163, 230, 53, 0.2)'
                    }}>
                      <FiStar size={14} /> {slide.subtitle}
                    </span>

                    <h1 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                      fontWeight: 900, color: '#fff',
                      lineHeight: 0.9, letterSpacing: '-0.04em',
                      marginBottom: '1.5rem', maxWidth: '12ch'
                    }}>
                      {slide.title}
                    </h1>

                    <p style={{
                      color: 'rgba(255,255,255,0.6)', fontSize: '1.125rem',
                      maxWidth: '45ch', lineHeight: 1.6, marginBottom: '2.5rem',
                      fontWeight: 500
                    }}>
                      {slide.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <Link
                        to={slide.link}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                          background: '#fff', color: '#111',
                          padding: '1.25rem 2.5rem', borderRadius: '100px',
                          fontWeight: 800, fontSize: '1rem',
                          textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        }}
                        onMouseEnter={e => { 
                          e.currentTarget.style.background = '#a3e635';
                          e.currentTarget.style.transform = 'translateY(-5px)';
                        }}
                        onMouseLeave={e => { 
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {slide.cta} <FiArrowRight size={20} />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Carousel Controls */}
        <div style={{
          position: 'absolute', bottom: '3rem', left: '8%', zIndex: 20,
          display: 'flex', alignItems: 'center', gap: '2rem'
        }}>
          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                style={{
                  width: i === activeSlide ? '48px' : '12px',
                  height: '4px',
                  borderRadius: '10px',
                  background: i === activeSlide ? '#a3e635' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s', backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <FiChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              onClick={() => setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length)}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s', backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Vertical Branding Line */}
        <div style={{
          position: 'absolute', right: '4%', top: '50%', transform: 'translateY(-50%) rotate(90deg)',
          fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase', letterSpacing: '0.5em', whiteSpace: 'nowrap', zIndex: 15
        }}>
          {t('home.hero.branding')}
        </div>
      </section>


      {/* ════════════════════════════════════════
          TRUST BAR
      ════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '2.5rem 6%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
        }}>
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                background: 'var(--bg-sub)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <Icon size={18} style={{ color: 'var(--primary-color)' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>{title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SHOP BY CATEGORY  — Premium Editorial
      ════════════════════════════════════════ */}
      <section style={{ padding: '6rem 6%', background: 'var(--bg-main)' }}>
        {/* Section header */}
        <motion.div {...fadeUp(0.05)} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '0.6rem' }}>{t('home.categories.explore')}</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0 }}>{t('home.categories.title')}</h2>
            </div>
            <Link
              to="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--text-main)', color: 'var(--bg-main)', padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', transition: 'opacity 0.2s', letterSpacing: '0.02em' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {t('common.view_all')} <FiArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Category tag strip */}
        <motion.div {...fadeUp(0.12)} style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {CATEGORIES.map((c, i) => (
            <motion.button
              key={c.name}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/shop?category=${c.name}`)}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '9999px',
                border: `1.5px solid ${c.accent}40`,
                background: `${c.accent}12`,
                color: c.accent,
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.25s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.color = '#111'; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${c.accent}12`; e.currentTarget.style.color = c.accent; }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.accent, display: 'inline-block', flexShrink: 0 }} />
              {c.name}
              <span style={{ opacity: 0.7, fontWeight: 600 }}>{c.items}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Editorial grid: 1 large + 3 small */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto', gap: '1.25rem' }} className="cat-grid">

          {/* Featured card — spans 2 rows */}
          {CATEGORIES.filter(c => c.featured).map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(`/shop?category=${cat.name}`)}
              style={{ gridRow: 'span 2', cursor: 'pointer', position: 'relative', borderRadius: '2rem', overflow: 'hidden', minHeight: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
              onMouseEnter={e => {
                e.currentTarget.querySelector('.cat-img').style.transform = 'scale(1.06)';
                e.currentTarget.querySelector('.cat-btn').style.background = cat.accent;
                e.currentTarget.querySelector('.cat-btn').style.color = '#111';
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector('.cat-img').style.transform = 'scale(1)';
                e.currentTarget.querySelector('.cat-btn').style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.querySelector('.cat-btn').style.color = '#fff';
              }}
            >
              <img className="cat-img" src={cat.img} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1)' }} />
              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)' }} />
              {/* Top badge */}
              <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: cat.accent, color: '#111', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat.tag}</div>
              {/* Bottom content */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 2rem 2rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>{cat.items}</p>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '1.5rem' }}>{cat.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    className="cat-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(`/shop?category=${cat.name}`); }}
                    style={{ padding: '0.7rem 1.5rem', borderRadius: '9999px', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {t('common.shop_now')} <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Smaller cards */}
          {CATEGORIES.filter(c => !c.featured).map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(`/shop?category=${cat.name}`)}
              style={{ cursor: 'pointer', position: 'relative', borderRadius: '1.75rem', overflow: 'hidden', minHeight: '254px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
              onMouseEnter={e => {
                e.currentTarget.querySelector('.cat-img').style.transform = 'scale(1.07)';
                e.currentTarget.querySelector('.cat-arrow').style.background = cat.accent;
                e.currentTarget.querySelector('.cat-arrow').style.color = '#111';
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector('.cat-img').style.transform = 'scale(1)';
                e.currentTarget.querySelector('.cat-arrow').style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.querySelector('.cat-arrow').style.color = '#fff';
              }}
            >
              <img className="cat-img" src={cat.img} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, rgba(0,0,0,0.0) 20%, rgba(0,0,0,0.62) 100%)' }} />
              {/* Tag badge */}
              <div style={{ position: 'absolute', top: '1.1rem', left: '1.1rem', background: `${cat.accent}22`, border: `1px solid ${cat.accent}60`, color: cat.accent, backdropFilter: 'blur(8px)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{cat.tag}</div>
              {/* Bottom row */}
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{cat.items}</p>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>{cat.name}</h3>
                </div>
                <div
                  className="cat-arrow"
                  onClick={(e) => { e.stopPropagation(); navigate(`/shop?category=${cat.name}`); }}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.3s' }}
                >
                  <FiArrowRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom count strip */}
        <motion.div {...fadeUp(0.3)} style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'var(--border-color)', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/shop?category=${cat.name}`)}
              style={{ padding: '1.2rem 1rem', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-sub)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.accent, display: 'block' }} />
              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-main)' }}>{cat.name}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{cat.items}</span>
            </button>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          LIVE PROMOTIONS / NEWS RELEASE
      ════════════════════════════════════════ */}
      <section style={{ padding: '4rem 6% 0', background: 'var(--bg-main)' }}>
        <PromotionSection />
      </section>

      {/* ════════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════════ */}
      <section style={{ padding: '0 6% 6rem', background: 'var(--bg-main)' }}>
        <motion.div {...fadeUp(0.1)} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '3rem',
        }}>
          <div>
            <p style={{
              fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '0.75rem',
            }}>
              {t('home.featured.subtitle')}
            </p>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800, color: 'var(--text-main)',
              letterSpacing: '-0.03em', lineHeight: 1.05,
            }}>
              {t('home.featured.title')}
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {t('common.view_all')} <FiArrowRight size={15} />
          </Link>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '4/5', borderRadius: '1.5rem',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))
            : featuredProducts.length > 0
              ? featuredProducts.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))
              : (
                <div style={{
                  gridColumn: '1/-1', padding: '5rem 2rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '1rem', textAlign: 'center',
                  background: 'var(--bg-card)', borderRadius: '2rem',
                  border: '1px dashed var(--border-color)',
                }}>
                  <FiShoppingBag size={36} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('home.featured.empty')}</p>
                  <Link to="/shop" style={{
                    color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
                  }}>{t('home.featured.browse')} →</Link>
                </div>
              )
          }
        </div>
      </section>

      {/* ════════════════════════════════════════
          BRAND STORY STRIP
      ════════════════════════════════════════ */}
      <section style={{
        margin: '0 6% 6rem',
        borderRadius: '2.5rem', overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        minHeight: '480px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.08)',
      }}
        className="brand-story-grid"
      >
        {/* Text side */}
        <div style={{
          background: '#1a3626', padding: '4rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2rem',
        }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#a3e635',
          }}>
            {t('home.story.subtitle')}
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 800, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            {t('home.story.title')}<br />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 300, fontStyle: 'italic' }}>
              {t('home.story.title_italic')}
            </span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
            fontSize: '1rem', maxWidth: '36ch',
          }}>
            {t('home.story.description')}
          </p>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#a3e635', color: '#111',
              padding: '0.875rem 1.75rem', borderRadius: '9999px',
              fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none', width: 'fit-content',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#a3e635'; }}
          >
            {t('home.story.cta')} <FiArrowRight size={15} />
          </Link>
        </div>

        {/* Image side */}
        <div style={{ position: 'relative', minHeight: '360px' }}>
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900"
            alt="Alex Retail brand story"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════
          NEWSLETTER
      ════════════════════════════════════════ */}
      <section style={{
        margin: '0 6% 6rem',
        background: 'var(--bg-sub)',
        borderRadius: '2.5rem',
        padding: '4rem 6%',
        textAlign: 'center',
        border: '1px solid var(--border-color)'
      }}>
        <motion.div {...fadeUp(0.1)}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '1rem',
          }}>
            {t('home.newsletter.subtitle')}
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800, color: 'var(--text-main)',
            letterSpacing: '-0.03em', marginBottom: '1rem',
          }}>
            {t('home.newsletter.title')}
          </h2>
          <p style={{
            color: 'var(--text-muted)', fontSize: '1rem',
            maxWidth: '44ch', margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            {t('home.newsletter.description')}
          </p>

          <form
            onSubmit={e => {
              e.preventDefault();
              alert(t('footer.newsletter.success') || 'Thank you for subscribing!');
            }}
            style={{
              display: 'flex', gap: '0.75rem',
              maxWidth: '28rem', margin: '0 auto',
              flexWrap: 'wrap', justifyContent: 'center',
            }}
          >
            <input
              type="email"
              placeholder={t('home.newsletter.placeholder')}
              required
              style={{
                flex: 1, minWidth: '200px',
                padding: '0.875rem 1.25rem', borderRadius: '9999px',
                border: '1.5px solid var(--border-color)', background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9375rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
            <button
              type="submit"
              style={{
                background: 'var(--text-main)', color: 'var(--bg-main)',
                padding: '0.875rem 1.75rem', borderRadius: '9999px',
                fontWeight: 700, fontSize: '0.9rem',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-color)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--text-main)'}
            >
              {t('home.newsletter.button')}
            </button>
          </form>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t('home.newsletter.spam_note')}
          </p>
        </motion.div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .brand-story-grid {
            grid-template-columns: 1fr !important;
          }
          .cat-grid {
            grid-template-columns: 1fr !important;
          }
          .cat-grid > *:first-child {
            grid-row: span 1 !important;
            min-height: 340px !important;
          }
        }
        @media (max-width: 480px) {
          .cat-count-strip {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
