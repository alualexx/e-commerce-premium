import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import api from '../../utils/api';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, todayDelivered: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/delivery/mine');
      setOrders(data.orders || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to fetch delivery orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return ['shipped', 'out_for_delivery', 'confirmed', 'processing'].includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    return true;
  });

  const statusColors = {
    confirmed: 'var(--primary-color)',
    processing: 'var(--primary-color)',
    shipped: 'var(--primary-color)',
    out_for_delivery: 'var(--warning-color)',
    delivered: 'var(--success-color)',
    pending: 'var(--text-muted)'
  };

  const statCards = [
    { label: 'Total Assigned', value: stats.total, icon: FiPackage, color: 'var(--primary-color)' },
    { label: 'Active Deliveries', value: stats.pending, icon: FiTruck, color: 'var(--warning-color)' },
    { label: 'Completed Today', value: stats.todayDelivered, icon: FiCheckCircle, color: 'var(--success-color)' },
    { label: 'All Time Delivered', value: stats.delivered, icon: FiMapPin, color: 'var(--primary-color)' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
        Delivery Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Manage your assigned deliveries
      </p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--bg-secondary)', borderRadius: '20px', padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <card.icon size={22} color={card.color} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
            <p style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', padding: '4px', background: 'var(--bg-sub)', borderRadius: '14px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
        {[
          { key: 'active', label: 'Active' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'all', label: 'All' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: filter === tab.key ? 'var(--primary-color)' : 'transparent',
              color: filter === tab.key ? '#fff' : 'var(--text-secondary)',
              fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '0.9rem',
              boxShadow: filter === tab.key ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', background: 'var(--bg-secondary)',
          borderRadius: '24px', border: '1px solid var(--border-color)'
        }}>
          <FiPackage size={56} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>No deliveries found in this category</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--bg-secondary)', borderRadius: '24px', padding: '28px',
                border: '1px solid var(--border-color)',
                borderLeft: `5px solid ${statusColors[order.status] || '#6b7280'}`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.1rem',
                      color: 'var(--primary-color)', letterSpacing: '0.5px'
                    }}>
                      #{order.trackingNumber}
                    </span>
                    <span style={{
                      padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: `${statusColors[order.status]}15`,
                      color: statusColors[order.status],
                      border: `1px solid ${statusColors[order.status]}20`
                    }}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiUser size={16} color="var(--text-muted)" /> {order.shippingAddress?.fullName || 'Customer'}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiMapPin size={16} color="var(--text-muted)" /> {order.shippingAddress?.street}, {order.shippingAddress?.city}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiPhone size={16} color="var(--text-muted)" /> {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--text-main)', fontWeight: '900', fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                    {order.totalPrice?.toLocaleString()} ETB
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <FiClock size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
