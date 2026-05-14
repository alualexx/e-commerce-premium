import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiShield, FiTruck, FiRotateCcw, FiPlus, FiMinus, FiStar, FiChevronRight, FiCheck } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import { formatPrice } from '../utils/formatters';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import LoadingScreen from '../components/common/LoadingScreen';

/* ── helpers ─────────────────────────────────────────── */
const S = {
  /* Quantity button */
  qBtn: (disabled) => ({
    width: '44px', height: '44px', borderRadius: '50%',
    border: 'none', background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: 'var(--text-main)', flexShrink: 0,
    opacity: disabled ? 0.35 : 1,
    transition: 'background 0.2s, opacity 0.2s',
    outline: 'none',
    WebkitAppearance: 'none',
  }),
  /* Add to bag */
  addBtn: (disabled, adding) => ({
    flex: 1, minWidth: '200px', height: '56px',
    borderRadius: '999px', border: 'none', outline: 'none',
    background: adding ? 'var(--primary-color)' : disabled ? '#9ca3af' : 'var(--text-main)',
    color: '#ffffff',
    fontSize: '0.9rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
    transition: 'background 0.3s, transform 0.15s',
    boxShadow: disabled ? 'none' : '0 8px 24px rgba(0,0,0,0.15)',
    WebkitAppearance: 'none',
  }),
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const addItem = useCartStore(s => s.addItem);
  const { user, toggleWishlist } = useAuthStore();
  const isWishlisted = user?.wishlist?.includes(product?._id);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/products/${slug}`)
      .then(({ data }) => { setProduct(data); setQuantity(1); })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0 || adding) return;
    addItem(product, quantity);
    setAdding(true);
    setAdded(true);
    setTimeout(() => { setAdding(false); setAdded(false); }, 1500);
  };

  const decrement = () => setQuantity(q => Math.max(1, q - 1));
  const increment = () => setQuantity(q => Math.min(product.stock, q + 1));

  if (loading) return <LoadingScreen />;
  if (!product) return null;

  const outOfStock = product.stock === 0;
  const atMax = quantity >= product.stock;
  const atMin = quantity <= 1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '120px', paddingBottom: '100px' }}>
      {/* Scoped style reset to protect against Tailwind preflight */}
      <style>{`
        .pdp-btn { -webkit-appearance: none; appearance: none; }
        .pdp-btn::-moz-focus-inner { border: 0; }
        .pdp-qty-num { color: var(--text-main) !important; }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 6%' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >Home</Link>
          <FiChevronRight size={11} />
          <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >Collections</Link>
          <FiChevronRight size={11} />
          <span style={{ color: 'var(--text-main)' }}>{product.name}</span>
        </nav>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '5rem', alignItems: 'start' }}>

          {/* ── Gallery ─────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Main image */}
            <div style={{ aspectRatio: '4/5', background: 'var(--bg-sub)', borderRadius: '32px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images?.[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </AnimatePresence>

              {/* Stock badge */}
              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                {outOfStock ? (
                  <span style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626', fontSize: '0.6rem', fontWeight: 800, padding: '0.4rem 0.9rem', borderRadius: '999px', letterSpacing: '0.08em', border: '1px solid rgba(220,38,38,0.25)', fontFamily: 'Outfit, sans-serif' }}>SOLD OUT</span>
                ) : (
                  <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: '0.6rem', fontWeight: 800, padding: '0.4rem 0.9rem', borderRadius: '999px', letterSpacing: '0.08em', border: '1px solid rgba(22,163,74,0.25)', fontFamily: 'Outfit, sans-serif' }}>IN STOCK</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(product.images.length, 4)}, 1fr)`, gap: '0.75rem' }}>
                {product.images.map((img, i) => (
                  <button key={i} type="button" className="pdp-btn"
                    onClick={() => setActiveImage(i)}
                    style={{ aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', padding: 0, background: 'var(--bg-sub)', cursor: 'pointer', border: `2px solid ${activeImage === i ? 'var(--primary-color)' : 'transparent'}`, transition: 'border-color 0.2s, opacity 0.2s', outline: 'none' }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeImage === i ? 1 : 0.55, transition: 'opacity 0.2s' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Details ─────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} size={13} fill={i < Math.round(product.rating || 4) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                {product.numReviews ? `(${product.numReviews} reviews)` : '(New)'}
              </span>
            </div>

            {/* Name */}
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice > product.price && (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 500 }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              {product.description}
            </p>

            {/* ── Actions Row ──────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>

              {/* Quantity pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', height: '56px', borderRadius: '999px', border: '1.5px solid var(--border-color)', background: 'var(--bg-sub)', padding: '0 6px', gap: '2px', flexShrink: 0 }}>
                <button type="button" className="pdp-btn" style={S.qBtn(atMin || outOfStock)} onClick={decrement}
                  onMouseEnter={e => { if (!atMin && !outOfStock) e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <FiMinus size={13} strokeWidth={2.5} />
                </button>
                <div className="pdp-qty-num" style={{ width: '38px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', userSelect: 'none', lineHeight: 1, color: 'var(--text-main)' }}>
                  {quantity}
                </div>
                <button type="button" className="pdp-btn" style={S.qBtn(atMax || outOfStock)} onClick={increment}
                  onMouseEnter={e => { if (!atMax && !outOfStock) e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <FiPlus size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* Stock info */}
              {!outOfStock && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>
                  {product.stock} left
                </span>
              )}

              {/* Add to Bag */}
              <button type="button" className="pdp-btn"
                style={{ ...S.addBtn(outOfStock, adding), flex: 1, minWidth: '180px' }}
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
                onMouseEnter={e => { if (!outOfStock && !adding) e.currentTarget.style.background = 'var(--primary-color)'; }}
                onMouseLeave={e => { if (!outOfStock) e.currentTarget.style.background = adding ? 'var(--primary-color)' : 'var(--text-main)'; }}
              >
                {added ? (
                  <><FiCheck size={17} strokeWidth={3} /> Added!</>
                ) : outOfStock ? (
                  <>Out of Stock</>
                ) : (
                  <><FiShoppingCart size={17} /> Add to Bag</>
                )}
              </button>

              {/* Wishlist */}
              <button type="button" className="pdp-btn"
                onClick={() => user && toggleWishlist(product._id)}
                title={user ? (isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist') : 'Sign in to save'}
                style={{ width: '56px', height: '56px', borderRadius: '50%', border: `1.5px solid ${isWishlisted ? '#dc2626' : 'var(--border-color)'}`, background: isWishlisted ? 'rgba(220,38,38,0.08)' : 'transparent', color: isWishlisted ? '#dc2626' : 'var(--text-muted)', cursor: user ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', outline: 'none' }}
                onMouseEnter={e => { if (user) { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}}
                onMouseLeave={e => { e.currentTarget.style.color = isWishlisted ? '#dc2626' : 'var(--text-muted)'; e.currentTarget.style.borderColor = isWishlisted ? '#dc2626' : 'var(--border-color)'; e.currentTarget.style.background = isWishlisted ? 'rgba(220,38,38,0.08)' : 'transparent'; }}
              >
                <FiHeart size={19} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
              {[
                { 
                  icon: <FiTruck size={16} />, 
                  label: product.shippingPrice > 0 ? formatPrice(product.shippingPrice) : 'Free Shipping', 
                  sub: product.shippingPrice > 0 ? 'Shipping Cost' : 'Worldwide' 
                },
                { icon: <FiShield size={16} />, label: 'Secure Pay', sub: '100% Guaranteed' },
                { icon: <FiRotateCcw size={16} />, label: 'Easy Returns', sub: '30 Day Window' },
              ].map(({ icon, label, sub }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--primary-color)', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Outfit, sans-serif' }}>{label}</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              {[
                { id: 'composition', title: 'Composition & Care', content: product.composition },
                { id: 'shipping', title: 'Shipping & Returns', content: product.returnPolicy }
              ].map(item => (
                <div key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', cursor: 'pointer' }}
                    onClick={() => setActiveAccordion(activeAccordion === item.id ? null : item.id)}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Outfit, sans-serif' }}>{item.title}</span>
                    <FiChevronRight 
                      size={16} 
                      style={{ 
                        color: 'var(--text-muted)', 
                        transform: activeAccordion === item.id ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.3s ease'
                      }} 
                    />
                  </div>
                  <AnimatePresence>
                    {activeAccordion === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ paddingBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                          {item.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
