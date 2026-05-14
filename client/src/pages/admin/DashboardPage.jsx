import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiBox,
  FiActivity, FiArrowUpRight, FiInfo, FiTruck,
  FiCheckCircle, FiStar, FiPackage
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { formatPrice } from '../../utils/formatters';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userRes, orderRes] = await Promise.all([
          api.get('/users/stats/summary'),
          api.get('/orders/analytics/summary')
        ]);
        setStats(userRes.data);
        setOrderStats(orderRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingScreen /></div>;

  const kpis = [
    { label: t('admin.dashboard.kpi.revenue'), value: formatPrice(orderStats?.totalRevenue || 0), icon: FiTrendingUp, color: 'var(--primary-color)', bg: 'var(--bg-sub)', trend: '+12.5%' },
    { label: t('admin.dashboard.kpi.orders'), value: orderStats?.totalOrders || 0, icon: FiShoppingBag, color: 'var(--primary-color)', bg: 'var(--bg-sub)', trend: '+8.2%' },
    { label: t('admin.dashboard.kpi.customers'), value: stats?.totalUsers || 0, icon: FiUsers, color: 'var(--primary-color)', bg: 'var(--bg-sub)', trend: '+2.4%' },
    { label: t('admin.dashboard.kpi.delivered'), value: orderStats?.deliveredToday || 0, icon: FiTruck, color: 'var(--success-color)', bg: 'var(--bg-sub)', trend: 'Live' },
  ];

  const recentFeedback = orderStats?.recentFeedback || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>{t('admin.dashboard.subtitle')}</p>
           <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{t('admin.dashboard.title')}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
           <div style={{ width: '8px', height: '8px', background: 'var(--success-color)', borderRadius: '50%', boxShadow: '0 0 10px rgba(16,185,129,0.3)' }} />
           <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.system_status')}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--bg-card)',
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ width: '48px', height: '48px', background: kpi.bg, color: kpi.color, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={22} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: kpi.trend.startsWith('+') ? 'var(--success-color)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {kpi.trend} {kpi.trend.startsWith('+') && <FiArrowUpRight />}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{kpi.label}</p>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Status Overview */}
      {orderStats?.statusCounts && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('admin.orders.title')} Breakdown</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {orderStats.statusCounts.map((sc, i) => {
              const colors = {
                pending: 'var(--warning-color)', confirmed: 'var(--info-color)', processing: 'var(--primary-color)',
                shipped: 'var(--info-color)', out_for_delivery: 'var(--warning-color)', delivered: 'var(--success-color)', cancelled: 'var(--danger-color)'
              };
              return (
                <div key={i} style={{
                  padding: '1rem 1.5rem', borderRadius: '16px', background: 'var(--bg-sub)',
                  border: '1px solid var(--border-color)', minWidth: '120px', textAlign: 'center'
                }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: colors[sc._id] || 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{sc.count}</p>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{t(`admin.orders.status.${sc._id}`, { defaultValue: sc._id?.replace(/_/g, ' ') })}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
        {/* Recent Orders */}
        <div style={{ flex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{t('admin.dashboard.recent_orders.title')}</h3>
              <button 
                onClick={() => navigate('/admin/orders')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
              >
                {t('admin.dashboard.recent_orders.view_all')}
              </button>
           </div>

           <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                       {[t('admin.orders.table.id'), t('admin.orders.table.customer'), t('admin.orders.table.amount'), t('admin.orders.table.status')].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '1.25rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody>
                    {orderStats?.recentOrders?.map((order) => (
                       <tr 
                         key={order._id} 
                         onClick={() => navigate(`/admin/orders?search=${order._id}`)}
                         style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                        >
                          <td style={{ padding: '1.25rem' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>#{order._id ? order._id.toString().slice(-6).toUpperCase() : 'N/A'}</p>
                             {order.trackingNumber && (
                               <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--primary-color)', fontWeight: 700, marginTop: '2px' }}>
                                 {order.trackingNumber}
                               </p>
                             )}
                          </td>
                          <td style={{ padding: '1.25rem' }}>
                             <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{order.shippingAddress?.fullName || 'Guest'}</p>
                             <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)' }}>{formatPrice(order.totalPrice)}</td>
                          <td style={{ padding: '1.25rem' }}>
                             <span style={{
                               padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.6rem',
                               fontWeight: 800, textTransform: 'uppercase',
                               background: 'var(--bg-sub)',
                                color: order.status === 'delivered' ? 'var(--success-color)' : order.isPaid ? 'var(--success-color)' : 'var(--warning-color)',
                                border: '1px solid var(--border-color)'
                              }}>
                                 {t(`admin.orders.status.${order.status}`, { defaultValue: order.status?.replace(/_/g, ' ') || (order.isPaid ? 'Paid' : 'Pending') })}
                              </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Customer Feedback */}
        <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              <FiStar size={18} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--warning-color)' }} />
              {t('admin.dashboard.feedback.title')}
            </h3>
           <div style={{
             background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '24px',
             border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
             display: 'flex', flexDirection: 'column', gap: '1rem'
           }}>
              {recentFeedback.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <FiStar size={32} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t('admin.dashboard.feedback.empty')}</p>
                </div>
              ) : (
                recentFeedback.slice(0, 5).map((fb, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: '1rem', borderRadius: '16px', background: 'var(--bg-sub)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {fb.user?.name || 'Customer'}
                      </p>
                      <div style={{ display: 'flex', gap: '2px' }}>
                         {[1,2,3,4,5].map(s => (
                           <FiStar key={s} size={12}
                             fill={s <= fb.feedback?.rating ? 'var(--warning-color)' : 'none'}
                             color={s <= fb.feedback?.rating ? 'var(--warning-color)' : 'var(--text-muted)'}
                           />
                         ))}
                      </div>
                    </div>
                    {fb.feedback?.comment && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{fb.feedback.comment}"
                      </p>
                    )}
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'monospace' }}>
                      📦 {fb.trackingNumber}
                    </p>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', width: 'fit-content', margin: '0 auto' }}>
         <FiInfo style={{ color: 'var(--accent-color)' }} size={14} />
         <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('common.refresh')} — {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
