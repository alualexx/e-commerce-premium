import { useState, useEffect } from 'react';
import { FiPackage, FiEye, FiCheck, FiTruck, FiX, FiFilter, FiSearch, FiPrinter, FiShoppingBag, FiInfo, FiActivity, FiStar, FiUser, FiMapPin, FiCopy } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import LoadingScreen from '../../components/common/LoadingScreen';

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersonnel();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders');
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

  // Status is driven automatically by role actions:
  // Store Keeper → marks processing/shipped
  // Admin → assigns delivery person (auto sets out_for_delivery)
  // Delivery Person → completes delivery (auto sets delivered)

  const handleAssignDelivery = async (orderId, deliveryPersonId) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: 'out_for_delivery',
        deliveryPerson: deliveryPersonId
      });
      fetchOrders();
    } catch (error) {
      console.error('Failed to assign delivery');
    }
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    
    const sId = (order._id || '').toString().toLowerCase();
    const sUserName = (order.user?.name || '').toLowerCase();
    const sFullName = (order.shippingAddress?.fullName || '').toLowerCase();
    const sTracking = (order.trackingNumber || '').toLowerCase();
    const sSearch = searchTerm.toLowerCase();

    const matchesSearch = 
      sId.includes(sSearch) || 
      sUserName.includes(sSearch) || 
      sFullName.includes(sSearch) || 
      sTracking.includes(sSearch);

    return matchesFilter && matchesSearch;
  });

  if (loading && orders.length === 0) return <LoadingScreen />;

  const statusColors = {
    pending: { bg: 'var(--bg-sub)', text: 'var(--warning-color)' },
    confirmed: { bg: 'var(--bg-sub)', text: 'var(--primary-color)' },
    processing: { bg: 'var(--bg-sub)', text: 'var(--primary-color)' },
    shipped: { bg: 'var(--bg-sub)', text: 'var(--primary-color)' },
    out_for_delivery: { bg: 'var(--bg-sub)', text: 'var(--warning-color)' },
    delivered: { bg: 'var(--bg-sub)', text: 'var(--success-color)' },
    cancelled: { bg: 'var(--bg-sub)', text: 'var(--danger-color)' }
  };

  const getStatusStyle = (status) => {
    const colors = statusColors[status] || { bg: 'var(--bg-sub)', text: 'var(--text-main)' };
    return {
      padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem',
      fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
      background: colors.bg, color: colors.text, display: 'inline-flex',
      alignItems: 'center', gap: '0.4rem'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Fulfillment</p>
           <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Orders</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', padding: '0.75rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
           <div style={{ width: '32px', height: '32px', background: 'var(--bg-sub)', color: 'var(--accent-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiActivity size={14} />
           </div>
           <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} Active Orders
           </p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
         <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, or Tracking..."
              style={{
                width: '100%', padding: '1rem 1.25rem 1rem 3.5rem', borderRadius: '16px',
                border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700, outline: 'none'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.65rem',
                  fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                  border: '1px solid',
                  borderColor: filter === f ? 'var(--text-main)' : 'var(--border-color)',
                  background: filter === f ? 'var(--text-main)' : 'var(--bg-card)',
                  color: filter === f ? 'var(--bg-main)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
         </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
           <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                       {['Order / Tracking', 'Customer', 'Date', 'Amount', 'Status', 'Delivery', 'Feedback', 'Actions'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody>
                    {filteredOrders.map((order) => (
                       <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                          {/* Order ID + Tracking */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                   <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: order.isPaid ? 'var(--success-color)' : 'var(--warning-color)' }} />
                                   <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-color)' }}>ORD-{order._id ? order._id.toString().slice(-6).toUpperCase() : 'N/A'}</span>
                                </div>
                                {order.trackingNumber && (
                                  <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '0.5px' }}>
                                    📦 {order.trackingNumber}
                                  </span>
                                )}
                             </div>
                          </td>

                          {/* Customer */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                             <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{order.shippingAddress?.fullName || order.user?.name || 'Guest'}</p>
                             <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{order.shippingAddress?.phone || order.user?.email}</p>
                          </td>

                          {/* Date */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                             <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatDate(order.createdAt)}</p>
                          </td>

                          {/* Amount */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                             <p style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}>{formatPrice(order.totalPrice)}</p>
                             <p style={{ fontSize: '0.6rem', fontWeight: 800, color: order.isPaid ? 'var(--success-color)' : 'var(--warning-color)', textTransform: 'uppercase', marginTop: '2px' }}>{order.isPaid ? 'Paid' : 'Unpaid'}</p>
                          </td>

                          {/* Status Badge (Read-Only — driven by role actions) */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                            <span style={getStatusStyle(order.status)}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>

                          {/* Delivery Person */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                            {order.status === 'delivered' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiCheck size={12} color="var(--success-color)" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success-color)' }}>
                                  {order.deliveryPerson?.name || 'Completed'}
                                </span>
                              </div>
                            ) : deliveryPersonnel.length > 0 ? (
                              <select
                                value={order.deliveryPerson?._id || order.deliveryPerson || ''}
                                onChange={(e) => handleAssignDelivery(order._id, e.target.value)}
                                style={{
                                  padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem',
                                  fontWeight: 700, border: '1px solid var(--border-color)',
                                  background: 'var(--bg-sub)', color: 'var(--text-main)',
                                  outline: 'none', cursor: 'pointer', maxWidth: '120px'
                                }}
                              >
                                <option value="">Assign...</option>
                                {deliveryPersonnel.map(p => (
                                  <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>

                          {/* Feedback */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                            {order.feedback?.rating ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {[1,2,3,4,5].map(s => (
                                  <FiStar key={s} size={11}
                                    fill={s <= order.feedback.rating ? 'var(--warning-color)' : 'none'}
                                    color={s <= order.feedback.rating ? 'var(--warning-color)' : 'var(--text-muted)'}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '1.25rem 1rem' }}>
                             <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'none', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                  <FiEye size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {filteredOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
                 <div style={{ width: '64px', height: '64px', background: 'var(--bg-sub)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-muted)' }}>
                    <FiShoppingBag size={32} strokeWidth={1} />
                 </div>
                 <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No orders found</p>
              </div>
           )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FiInfo style={{ color: 'var(--accent-color)' }} size={16} />
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Entries: {orders.length}</p>
         </div>
         <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orders are updated in real-time</p>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', borderRadius: '24px',
                border: '1px solid var(--border-color)',
                maxWidth: '600px', width: '100%', maxHeight: '80vh',
                overflow: 'auto', padding: '2rem'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>Order Details</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontFamily: 'monospace', fontWeight: 700 }}>
                    {selectedOrder.trackingNumber || 'No tracking number'}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sub)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-main)'
                }}>
                  <FiX size={18} />
                </button>
              </div>

              {/* Status Badge */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={getStatusStyle(selectedOrder.status)}>
                  {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-sub)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Customer</p>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  <FiUser size={12} style={{ marginRight: '6px' }} />
                  {selectedOrder.shippingAddress?.fullName}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <FiMapPin size={12} style={{ marginRight: '6px' }} />
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}
                </p>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Items</p>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                    borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '1rem',
                background: 'var(--text-main)', color: 'var(--bg-main)', borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontWeight: 800 }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{formatPrice(selectedOrder.totalPrice)}</span>
              </div>

              {/* Feedback Display */}
              {selectedOrder.feedback?.rating && (
                <div style={{ padding: '1rem', background: 'var(--bg-sub)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Customer Feedback</p>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {[1,2,3,4,5].map(s => (
                      <FiStar key={s} size={16}
                        fill={s <= selectedOrder.feedback.rating ? 'var(--warning-color)' : 'none'}
                        color={s <= selectedOrder.feedback.rating ? 'var(--warning-color)' : 'var(--text-muted)'}
                      />
                    ))}
                  </div>
                  {selectedOrder.feedback.comment && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                      "{selectedOrder.feedback.comment}"
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOrdersPage;
