import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiShield } from 'react-icons/fi';
import useCartStore from '../store/useCartStore';
import { formatPrice } from '../utils/formatters';

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, shippingPrice, grandTotal } = useCartStore();
  const subtotal = totalPrice();
  const shipping = shippingPrice();
  const total = grandTotal();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '400px' }}
        >
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', margin: '0 auto 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
             <FiShoppingBag size={32} />
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Your bag is empty</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Discover our latest collection of premium minimalist essentials and start building your wardrobe.
          </p>
          <Link 
            to="/shop" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              background: 'var(--text-main)', 
              color: 'var(--bg-main)', 
              padding: '1rem 2.5rem', 
              borderRadius: '999px', 
              fontWeight: 800, 
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.target.style.background = 'var(--primary-color)'}
            onMouseLeave={e => e.target.style.background = 'var(--text-main)'}
          >
            Start Shopping <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 6%' }}>
        <div style={{ marginBottom: '4rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
            Shopping Bag
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
            {items.length} {items.length === 1 ? 'Item' : 'Items'} Selected
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }} className="cart-grid">
          {/* Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 2 }}>
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ 
                    background: 'var(--bg-card)', 
                    padding: '1.5rem', 
                    borderRadius: '24px', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <Link to={`/product/${item.slug}`} style={{ width: '120px', height: '150px', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-sub)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                    <img src={item.images?.[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{item.category}</p>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>{item.name}</h3>
                    <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{formatPrice(item.price)}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem' }}>
                     <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: 'var(--bg-sub)', 
                      borderRadius: '12px', 
                      padding: '0.25rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item._id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger-color)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <FiTrash2 size={14} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button 
              onClick={clearCart}
              style={{ 
                width: 'fit-content',
                padding: '0.75rem 1.5rem', 
                background: 'transparent', 
                color: 'var(--text-muted)', 
                border: 'none',
                borderRadius: '12px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.background = 'var(--bg-danger-light)'; e.target.style.color = 'var(--danger-color)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-muted)'; }}
            >
              Clear Entire Bag
            </button>
          </div>

          {/* Summary Sidebar */}
          <div style={{ flex: 1, minWidth: '320px' }}>
            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '2.5rem', 
              borderRadius: '32px', 
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
              position: 'sticky',
              top: '120px'
            }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '2rem' }}>Summary</h2>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Total</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <button 
                   onClick={() => navigate('/checkout')}
                   style={{ 
                     width: '100%', 
                     height: '56px', 
                     background: 'var(--text-main)', 
                     color: 'var(--bg-main)', 
                     borderRadius: '16px', 
                     border: 'none',
                     fontSize: '0.9rem', 
                     fontWeight: 800, 
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '0.75rem',
                     transition: 'background 0.2s',
                     boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                   }}
                   onMouseEnter={e => e.target.style.background = 'var(--primary-color)'}
                   onMouseLeave={e => e.target.style.background = 'var(--text-main)'}
                 >
                   Checkout Now <FiArrowRight />
                 </button>
                 <Link 
                   to="/shop" 
                   style={{ 
                     width: '100%', 
                     height: '56px', 
                     background: 'var(--bg-sub)', 
                     color: 'var(--text-muted)', 
                     borderRadius: '16px', 
                     textDecoration: 'none',
                     fontSize: '0.9rem', 
                     fontWeight: 800, 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     transition: 'all 0.2s',
                     border: '1px solid var(--border-color)'
                   }}
                   onMouseEnter={e => { e.target.style.background = 'var(--border-color)'; e.target.style.color = 'var(--text-main)'; }}
                   onMouseLeave={e => { e.target.style.background = 'var(--bg-sub)'; e.target.style.color = 'var(--text-muted)'; }}
                 >
                   Continue Shopping
                 </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                 <FiShield style={{ color: 'var(--primary-color)' }} size={20} />
                 <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Secure transaction powered by industry standard encryption.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
