import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiSearch, FiX, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import axiosInstance from '../utils/axios';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true); // Default to showing on desktop
  const navigate = useNavigate();

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          axiosInstance.get(`/products?${searchParams.toString()}`),
          axiosInstance.get('/products/categories/list'),
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };
 
  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '120px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 6%' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary-color)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'} onClick={() => navigate('/')}>Home</span>
            <span>/</span>
            <span style={{ color: 'var(--text-main)' }}>Catalog</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {currentCategory || 'The Collection'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '1rem', maxWidth: '600px' }}>
            Explore our curated selection of premium minimalist essentials, designed for the modern individual who values quality and simplicity.
          </p>
        </div>

        {/* Toolbar */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '1.5rem', 
          marginBottom: '3rem',
          padding: '1rem',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '16px',
                background: showFilters ? 'var(--text-main)' : 'var(--bg-sub)',
                color: showFilters ? 'var(--bg-main)' : 'var(--text-secondary)',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FiFilter size={16} /> Filters
            </button>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {products.length} Units Available
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
              <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
              <input 
                type="text" 
                placeholder="Search collection..." 
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 1rem 0 3rem',
                  borderRadius: '16px',
                  background: 'var(--bg-sub)',
                  color: 'var(--text-main)',
                  border: '1px solid transparent',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                defaultValue={currentSearch}
                onKeyDown={(e) => e.key === 'Enter' && updateFilters('search', e.target.value)}
                onFocus={e => { e.target.style.background = 'var(--bg-card)'; e.target.style.borderColor = 'var(--primary-color)'; }}
                onBlur={e => { e.target.style.background = 'var(--bg-sub)'; e.target.style.borderColor = 'transparent'; }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select 
                value={currentSort}
                onChange={(e) => updateFilters('sort', e.target.value)}
                style={{
                  height: '48px',
                  padding: '0 2.5rem 0 1.25rem',
                  borderRadius: '16px',
                  background: 'var(--bg-sub)',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none'
                }}
              >
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Highest Rated</option>
              </select>
              <FiChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} size={14} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4rem', flexDirection: 'column', lg: 'row' }} className="shop-layout">
          {/* Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ width: '100%', lg: '280px', flexShrink: 0 }}
                className="shop-sidebar"
              >
                <div style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-main)' }}>Categories</h3>
                    {(currentCategory || currentSearch) && (
                      <button 
                        onClick={clearFilters} 
                        style={{ background: 'none', border: 'none', color: 'var(--danger-color)', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <FiX size={12} /> Clear
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateFilters('category', '')}
                      style={{
                        padding: '0.875rem 1.25rem',
                        borderRadius: '12px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: !currentCategory ? 'var(--bg-sub)' : 'transparent',
                        color: !currentCategory ? 'var(--primary-color)' : 'var(--text-secondary)'
                      }}
                      onMouseEnter={e => { if(!currentCategory) return; e.target.style.background = 'var(--bg-sub)'; }}
                      onMouseLeave={e => { if(!currentCategory) return; e.target.style.background = 'transparent'; }}
                    >
                      All Collections
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateFilters('category', cat)}
                        style={{
                          padding: '0.875rem 1.25rem',
                          borderRadius: '12px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          textAlign: 'left',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: currentCategory === cat ? 'var(--bg-sub)' : 'transparent',
                          color: currentCategory === cat ? 'var(--primary-color)' : 'var(--text-secondary)'
                        }}
                        onMouseEnter={e => { if(currentCategory === cat) return; e.target.style.background = 'var(--bg-sub)'; }}
                        onMouseLeave={e => { if(currentCategory === cat) return; e.target.style.background = 'transparent'; }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo Card */}
                <div style={{ 
                  padding: '2rem', 
                  background: 'var(--text-main)', 
                  borderRadius: '24px', 
                  color: 'var(--bg-main)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>Join the Circle</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      Get early access to exclusive drops and premium member-only pricing.
                    </p>
                    <button style={{ 
                      background: 'var(--primary-color)', 
                      color: 'var(--bg-main)', 
                      border: 'none', 
                      padding: '0.75rem 1.25rem', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      Join Now <FiArrowRight size={14} />
                    </button>
                  </div>
                  {/* Subtle pattern */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '2rem' 
              }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ aspectRatio: '4/5', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '2.5rem' 
              }}>
                {products.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--bg-card)',
                borderRadius: '32px',
                border: '1px dashed var(--border-color)',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--bg-sub)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  <FiSearch size={28} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No results found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '300px' }}>
                  We couldn't find any products matching your current filters. Try a different search or clear your filters.
                </p>
                <button 
                  onClick={clearFilters} 
                  style={{ 
                    marginTop: '2rem', 
                    padding: '0.875rem 2rem', 
                    background: 'var(--bg-sub)', 
                    color: 'var(--primary-color)', 
                    border: 'none', 
                    borderRadius: '999px', 
                    fontSize: '0.875rem', 
                    fontWeight: 800, 
                    cursor: 'pointer' 
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (min-width: 1024px) {
          .shop-layout {
            flex-direction: row !important;
          }
          .shop-sidebar {
            width: 280px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShopPage;
