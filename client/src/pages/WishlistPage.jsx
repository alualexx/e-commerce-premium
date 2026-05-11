import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiArrowRight, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { formatPrice } from '../utils/formatters';
import LoadingScreen from '../components/common/LoadingScreen';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

const WishlistPage = () => {
  const { user, toggleWishlist } = useAuthStore();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.wishlist?.length) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get('/products');
        const items = data.products.filter(p => user.wishlist.includes(p._id));
        setWishlistProducts(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user?.wishlist]);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '10rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Your Selection</p>
           <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '4.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1 }}>Favorites</h1>
           <div style={{ width: '60px', height: '6px', background: 'var(--text-main)', borderRadius: '3px' }} />
        </div>

         {wishlistProducts.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: '48px', padding: '6rem 2rem', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
             <div style={{ width: '80px', height: '80px', background: 'var(--bg-sub)', color: 'var(--text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <FiHeart size={36} fill="currentColor" />
             </div>
             <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem' }}>Your Wishlist is Empty</h2>
             <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                You haven't added any items to your wishlist yet. Explore our collections and find something you love.
             </p>
             <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--text-main)', color: 'var(--bg-main)', padding: '1.25rem 2.5rem', borderRadius: '16px', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.3s' }}>
                Discover Shop <FiArrowRight />
             </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
             <AnimatePresence mode="popLayout">
                {wishlistProducts.map((product) => (
                   <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: '32px',
                        border: '1px solid var(--border-color)',
                        padding: '1.25rem',
                        transition: 'all 0.4s',
                        position: 'relative'
                      }}
                   >
                      <Link to={`/product/${product.slug}`} style={{ display: 'block', aspectRatio: '4/5', background: 'var(--bg-sub)', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
                         <img src={product.images?.[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                            <button 
                               onClick={(e) => {
                                  e.preventDefault();
                                  toggleWishlist(product._id);
                               }}
                               style={{
                                 width: '44px',
                                 height: '44px',
                                 background: 'var(--bg-card)',
                                 backdropFilter: 'blur(10px)',
                                 borderRadius: '12px',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 color: 'var(--danger-color)',
                                 border: '1px solid var(--border-color)',
                                 cursor: 'pointer',
                                 boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                               }}
                            >
                               <FiTrash2 size={18} />
                            </button>
                         </div>
                      </Link>

                      <div style={{ padding: '0 0.5rem 0.5rem' }}>
                         <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{product.category}</p>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                         </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>{formatPrice(product.price)}</p>
                            <Link 
                               to={`/product/${product.slug}`}
                               style={{
                                 width: '44px',
                                 height: '44px',
                                 background: 'var(--text-main)',
                                 color: 'var(--bg-main)',
                                 borderRadius: '12px',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 textDecoration: 'none',
                                 marginLeft: 'auto'
                               }}
                            >
                               <FiShoppingBag size={18} />
                            </Link>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

