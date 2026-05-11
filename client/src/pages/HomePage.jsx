import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiShoppingBag, FiTruck,
  FiShield, FiRotateCcw, FiStar, FiChevronRight, FiChevronLeft
} from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import axiosInstance from '../utils/api';

/* ─── Static data ────────────────────────────────────────── */
const TRUST_ITEMS = [
  { icon: FiTruck,      title: 'Free Express Shipping', desc: 'On all orders over $75'            },
  { icon: FiShield,     title: 'Purchase Protection',   desc: '100% secure transactions'          },
  { icon: FiRotateCcw,  title: 'Easy 30-Day Returns',   desc: 'Hassle-free exchange window'       },
  { icon: FiStar,       title: '4.9 / 5 Rating',        desc: 'Trusted by 12,000+ customers'     },
];

const HERO_SLIDES = [
  {
    subtitle: 'New Arrival | Spring 2026',
    title: 'Elevate Your Everyday.',
    description: 'Experience the intersection of luxury and simplicity. Curated pieces for the modern minimalist, delivered with precision.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1800',
    cta: 'Shop Collection',
    link: '/shop'
  },
  {
    subtitle: 'Limited Edition | Accessories',
    title: 'Refined By Detail.',
    description: 'Discover our artisanal accessory line. Handcrafted excellence designed to complement the discerning professional.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1800',
    cta: 'Explore Accessories',
    link: '/shop?category=Accessories'
  },
  {
    subtitle: 'Premium | Sustainability',
    title: 'Conscious Luxury.',
    description: 'Style that respects the planet. Our eco-certified materials ensure you look good while doing good.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1800',
    cta: 'Learn More',
    link: '/shop?featured=true'
  }
];

const CATEGORIES = [
  {
    name: 'Clothing',
    tag: 'Most Popular',
    items: '120+ Items',
    img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=900',
    accent: '#a3e635',
    featured: true,
  },
  {
    name: 'Accessories',
    tag: 'New Arrivals',
    items: '80+ Items',
    img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    accent: '#f59e0b',
  },
  {
    name: 'Footwear',
    tag: 'Trending',
    items: '60+ Items',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    accent: '#3b82f6',
  },
  {
    name: 'Bags',
    tag: 'Limited',
    items: '40+ Items',
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
    accent: '#ec4899',
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Component ─────────────────────────────────────────── */
const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axiosInstance.get('/products?featured=true&limit=4')
      .then(({ data }) => setFeaturedProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--bg-main)' }}>

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
          ESTABLISHED MMXXVI — ALEX RETAIL
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
              <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '0.6rem' }}>Explore</p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0 }}>Shop by Category</h2>
            </div>
            <Link
              to="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--text-main)', color: 'var(--bg-main)', padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', transition: 'opacity 0.2s', letterSpacing: '0.02em' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              View All <FiArrowRight size={14} />
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
                    style={{ padding: '0.7rem 1.5rem', borderRadius: '9999px', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Shop Now <FiArrowRight size={14} />
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
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, transition: 'all 0.3s' }}
                >
                  <FiArrowRight size={16} />
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
              Handpicked
            </p>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800, color: 'var(--text-main)',
              letterSpacing: '-0.03em', lineHeight: 1.05,
            }}>
              Featured Collection
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
            View All <FiArrowRight size={15} />
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
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No featured products yet.</p>
                  <Link to="/shop" style={{
                    color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
                  }}>Browse all products →</Link>
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
            Our Story
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 800, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            Conscious Style.<br />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 300, fontStyle: 'italic' }}>
              Simply Delivered.
            </span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
            fontSize: '1rem', maxWidth: '36ch',
          }}>
            ALEX RETAIL was founded on the belief that great design
            and ethical sourcing can coexist. Every piece in our
            collection is curated with intention — for you and the planet.
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
            Explore the Mission <FiArrowRight size={15} />
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
            Stay in the loop
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800, color: 'var(--text-main)',
            letterSpacing: '-0.03em', marginBottom: '1rem',
          }}>
            Join the Inner Circle
          </h2>
          <p style={{
            color: 'var(--text-muted)', fontSize: '1rem',
            maxWidth: '44ch', margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Early access to drops, member-only pricing, and curated style guides —
            straight to your inbox.
          </p>

          <form
            onSubmit={e => e.preventDefault()}
            style={{
              display: 'flex', gap: '0.75rem',
              maxWidth: '28rem', margin: '0 auto',
              flexWrap: 'wrap', justifyContent: 'center',
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
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
              onMouseEnter={e => e.currentTarget.style.background = '#2d5a3d'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a3626'}
            >
              Subscribe
            </button>
          </form>
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            No spam, ever. Unsubscribe anytime.
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
