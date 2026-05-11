import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiChevronRight, FiCheckCircle, FiClock, FiXCircle, FiShoppingBag } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import { formatPrice, formatDate } from '../utils/formatters';
import LoadingScreen from '../components/common/LoadingScreen';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get('/orders/mine');
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.isPaid === (filter === 'Paid'));

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '10rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem' }}>
           <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Account</p>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>My Orders</h1>
           </div>

           <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '16px', border: '1px solid var(--border-color)', width: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              {['All', 'Paid', 'Pending'].map(f => (
                 <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{ 
                      padding: '0.6rem 1.5rem', 
                      borderRadius: '12px', 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em', 
                      border: 'none',
                      background: filter === f ? 'var(--text-main)' : 'transparent',
                      color: filter === f ? 'var(--bg-main)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                 >
                    {f}
                 </button>
              ))}
           </div>
        </div>

         {filteredOrders.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '5rem 2rem', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
             <div style={{ width: '64px', height: '64px', background: 'var(--bg-sub)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', margin: '0 auto 2rem' }}>
                <FiPackage size={32} strokeWidth={1} />
             </div>
             <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', marginBottom: '1rem' }}>No Orders Found</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '2.5rem' }}>You haven't placed any orders yet.</p>
             <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--text-main)', color: 'var(--bg-main)', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.3s' }}>
                Go to Shop <FiChevronRight />
             </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => (
                   <motion.div
                      key={order._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ 
                        background: 'var(--bg-card)', 
                        borderRadius: '24px', 
                        border: '1px solid var(--border-color)', 
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                      }}
                   >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', position: 'relative' }}>
                               {order.items.slice(0, 1).map((item, i) => (
                                  <div key={i} style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-sub)', border: '1px solid var(--border-color)' }}>
                                     <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                               ))}
                            </div>
                            <div>
                               <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ORD-{order._id ? order._id.toString().slice(-6).toUpperCase() : 'N/A'}</p>
                               <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
                                  {order.items[0].name} {order.items.length > 1 ? `& ${order.items.length - 1} more` : ''}
                               </h3>
                            </div>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{formatPrice(order.totalPrice)}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{formatDate(order.createdAt)}</p>
                         </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {order.isPaid ? (
                               <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-sub)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)' }}>
                                  <FiCheckCircle size={12} /> Paid
                               </div>
                            ) : (
                               <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-sub)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)' }}>
                                  <FiClock size={12} /> Pending
                               </div>
                            )}
                            <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-sub)', color: order.isDelivered ? 'var(--primary-color)' : 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                               {order.isDelivered ? 'Delivered' : 'Processing'}
                            </div>
                         </div>
                         <Link 
                           to={`/order/${order._id}`}
                           style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                         >
                            View Details <FiChevronRight />
                         </Link>
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

export default OrdersPage;
