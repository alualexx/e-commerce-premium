import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatters';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';

const ProductCard = ({ product, index = 0 }) => {
  const addItem = useCartStore(s => s.addItem);
  const { user, toggleWishlist } = useAuthStore();

  const isWishlisted = user?.wishlist?.includes(product._id);
  const isOutOfStock = product.stock === 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) addItem(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) toggleWishlist(product._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div style={{ 
          background: 'var(--bg-card)', 
          borderRadius: '32px', 
          padding: '1.25rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.08)';
          e.currentTarget.querySelector('.card-actions').style.opacity = '1';
          e.currentTarget.querySelector('.card-actions').style.transform = 'translateY(0)';
          e.currentTarget.querySelector('.product-img').style.transform = 'scale(1.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.querySelector('.card-actions').style.opacity = '0';
          e.currentTarget.querySelector('.card-actions').style.transform = 'translateY(20px)';
          e.currentTarget.querySelector('.product-img').style.transform = 'scale(1)';
        }}
        >
          {/* Badges */}
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {hasDiscount && (
              <span style={{ background: 'var(--danger-color)', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '0.4rem 0.8rem', borderRadius: '100px', letterSpacing: '0.05em' }}>SALE</span>
            )}
            {product.featured && (
              <span style={{ background: 'var(--primary-color)', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '0.4rem 0.8rem', borderRadius: '100px', letterSpacing: '0.05em' }}>FEATURED</span>
            )}
          </div>

          {/* Image Wrapper */}
          <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '24px', overflow: 'hidden', background: 'var(--bg-sub)', marginBottom: '1.5rem' }}>
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="product-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
            
            {/* Quick Actions Overlay */}
            <div className="card-actions" style={{ 
              position: 'absolute', inset: 'auto 1rem 1rem 1rem', 
              display: 'flex', gap: '0.5rem', opacity: 0, transform: 'translateY(20px)', 
              transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)' 
            }}>
              <button 
                onClick={handleWishlist}
                style={{ 
                  flex: 1, height: '48px', borderRadius: '16px', border: 'none',
                  background: isWishlisted ? 'var(--danger-color)' : 'rgba(255,255,255,0.9)',
                  color: isWishlisted ? '#fff' : '#111', backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <div style={{ 
                flex: 1, height: '48px', borderRadius: '16px', 
                background: 'rgba(255,255,255,0.9)', color: '#111', 
                backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', cursor: 'pointer' 
              }}>
                <FiEye size={18} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} size={10} style={{ color: i < 4 ? '#facc15' : 'var(--border-color)', fill: i < 4 ? '#facc15' : 'none' }} />
                ))}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>(42)</span>
            </div>

            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              {product.category}
            </p>
            
            <h3 style={{ 
              fontFamily: 'Outfit, sans-serif', fontSize: '1.125rem', fontWeight: 800, 
              color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '1.25rem', height: '2.6em',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
            }}>
              {product.name}
            </h3>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {hasDiscount && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>{formatPrice(product.compareAtPrice)}</span>
                )}
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{formatPrice(product.price)}</span>
              </div>

              {!isOutOfStock ? (
                <button
                  onClick={handleAddToCart}
                  style={{ 
                    width: '48px', height: '48px', borderRadius: '16px', background: 'var(--text-main)', 
                    color: 'var(--bg-main)', border: 'none', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-color)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--text-main)'}
                >
                  <FiShoppingCart size={18} />
                </button>
              ) : (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sold Out</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
