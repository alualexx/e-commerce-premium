import { useState, useEffect } from 'react';
import { FiPackage, FiEye, FiCheck, FiTruck, FiSearch, FiShoppingBag, FiActivity, FiUser, FiMapPin, FiClock, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import LoadingScreen from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const StoreDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); // 'new' (pending/confirmed), 'processing', 'all'

  useEffect(() => {
    fetchOrders();
    fetchInventoryStats();
    fetchDeliveryPersonnel();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      const { data } = await api.get('/products/inventory/stats');
      setInventoryStats(data);
    } catch (error) {
      console.error('Failed to fetch inventory stats');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/store/orders');
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersonnel = async () => {
    try {
      const { data } = await api.get('/orders/delivery/personnel');
      setDeliveryPersonnel(data);
    } catch (error) {
      console.error('Failed to fetch delivery personnel');
    }
  };

  const handleUpdateStatus = async (id, status, note = '') => {
    try {
      await api.put(`/orders/${id}/status`, { status, note });
      toast.success(`Order updated to ${status.replace(/_/g, ' ')}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignDelivery = async (orderId, deliveryPersonId) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: 'out_for_delivery',
        deliveryPerson: deliveryPersonId,
        note: 'Assigned to delivery personnel'
      });
      toast.success('Assigned to delivery personnel');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to assign delivery');
    }
  };

  const filteredOrders = orders.filter(order => {
    const sSearch = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.trackingNumber || '').toLowerCase().includes(sSearch) ||
      (order.shippingAddress?.fullName || '').toLowerCase().includes(sSearch) ||
      (order._id || '').toString().includes(sSearch);

    if (activeTab === 'new') {
      return matchesSearch && (order.status === 'pending' || order.status === 'confirmed');
    }
    if (activeTab === 'processing') {
      return matchesSearch && (order.status === 'processing' || order.status === 'shipped');
    }
    return matchesSearch;
  });

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Fulfillment Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage incoming orders and monitor stock levels.</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[
          { 
            label: 'Active Orders', 
            value: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
            icon: <FiShoppingBag />, 
            color: 'var(--primary-color)',
            bg: 'var(--bg-sub)'
          },
          { 
            label: 'Ready to Dispatch', 
            value: orders.filter(o => o.status === 'processing').length,
            icon: <FiPackage />, 
            color: 'var(--primary-color)',
            bg: 'var(--bg-sub)'
          },
          { 
            label: 'Out of Stock', 
            value: inventoryStats?.outOfStock || 0,
            icon: <FiAlertCircle />, 
            color: 'var(--danger-color)',
            bg: 'var(--bg-danger-light)',
            alert: (inventoryStats?.outOfStock || 0) > 0
          },
          { 
            label: 'Low Stock', 
            value: inventoryStats?.lowStock || 0,
            icon: <FiActivity />, 
            color: 'var(--warning-color)',
            bg: 'var(--bg-sub)',
            alert: (inventoryStats?.lowStock || 0) > 0
          }
        ].map((stat, idx) => (
          <div key={idx} style={{ 
            background: 'var(--bg-secondary)', padding: '24px', borderRadius: '24px', 
            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '18px', 
              background: stat.bg, color: stat.color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', background: 'var(--bg-sub)', padding: '4px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'new', label: 'New Orders', count: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length },
            { id: 'processing', label: 'In Prep / Shipped', count: orders.filter(o => o.status === 'processing' || o.status === 'shipped').length },
            { id: 'all', label: 'All History', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span style={{ 
                  fontSize: '0.7rem', background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)', 
                  color: activeTab === tab.id ? 'white' : 'var(--text-muted)', 
                  padding: '2px 8px', borderRadius: '6px', fontWeight: 800
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input
            type="text"
            placeholder="Tracking # or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px',
              border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
              color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 0 0 4px var(--primary-light)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence mode='popLayout'>
          {filteredOrders.map((order) => (
            <motion.div
              layout
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--bg-secondary)', borderRadius: '24px',
                border: '1px solid var(--border-color)', padding: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px'
              }}
            >
              {/* Order Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>ORD-{order._id.toString().slice(-6).toUpperCase()}</span>
                    {order.paymentMethod === 'cash_on_delivery' && (
                      <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-sub)', color: 'var(--warning-color)', fontWeight: 800, border: '1px solid var(--border-color)' }}>COD</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{order.shippingAddress?.fullName}</h3>
                </div>
                <div style={{ 
                  padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: 'var(--bg-sub)',
                  color: order.status === 'pending' ? 'var(--warning-color)' : order.status === 'confirmed' ? 'var(--primary-color)' : 'var(--primary-color)',
                  border: '1px solid var(--border-color)'
                }}>
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ background: 'var(--bg-sub)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <FiPackage size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{order.items.length} Items</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.quantity}x {item.name}</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '6px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Total</span>
                    <span style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sub)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <FiMapPin size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>{order.shippingAddress?.city}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{order.shippingAddress?.street}</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'processing')}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                      background: 'var(--primary-color)', color: 'white',
                      fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FiCheck size={18} /> Accept & Start Processing
                  </button>
                )}

                {order.status === 'processing' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'shipped')}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                      background: 'var(--info-color)', color: 'white',
                      fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FiPackage size={18} /> Mark as Shipped
                  </button>
                )}

                {order.status === 'shipped' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign Delivery Personnel</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        onChange={(e) => e.target.value && handleAssignDelivery(order._id, e.target.value)}
                        style={{
                          flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)',
                          background: 'var(--bg-sub)', color: 'var(--text-main)',
                          fontSize: '0.85rem', fontWeight: 700, outline: 'none', cursor: 'pointer',
                          fontFamily: 'Outfit, sans-serif'
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Driver...</option>
                        {deliveryPersonnel.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {order.status === 'out_for_delivery' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <FiTruck size={20} color="var(--success-color)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--success-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Transit</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Driver: {order.deliveryPerson?.name || 'Driver'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 20px', background: 'var(--bg-secondary)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--bg-sub)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              <FiShoppingBag size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>No matches found</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;
