import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiCopy, FiBox, FiShoppingBag } from 'react-icons/fi';
import axiosInstance from '../utils/axios';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: FiShoppingBag },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
  { key: 'processing', label: 'Processing', icon: FiBox },
  { key: 'shipped', label: 'Shipped', icon: FiPackage },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiMapPin },
];

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const initialNumber = searchParams.get('number') || '';
  
  const [trackingNumber, setTrackingNumber] = useState(initialNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialNumber) {
      fetchOrderDetails(false, initialNumber);
    }
  }, [initialNumber]);

  const fetchOrderDetails = async (quiet = false, tNumber = trackingNumber) => {
    if (!tNumber.trim()) return;
    if (!quiet) setLoading(true);
    setError('');

    try {
      const { data } = await axiosInstance.get(`/orders/track/${tNumber.trim()}`);
      setOrder(data);
    } catch (err) {
      if (!quiet) {
        setError(err.response?.data?.message || 'Order not found. Please check your tracking number.');
        setOrder(null);
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    fetchOrderDetails();
  };

  // Status Polling
  useEffect(() => {
    let interval;
    if (order && order.status !== 'delivered' && order.status !== 'cancelled') {
      interval = setInterval(() => {
        fetchOrderDetails(true);
      }, 15000); // Poll every 15 seconds
    }
    return () => clearInterval(interval);
  }, [order, trackingNumber]);

  const copyTracking = () => {
    navigator.clipboard.writeText(order?.trackingNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepIndex = (status) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const currentStepIndex = order ? getStepIndex(order.status) : -1;

  const getHistoryTime = (status) => {
    if (!order?.statusHistory) return null;
    const entry = order.statusHistory.find(h => h.status === status);
    return entry ? new Date(entry.timestamp).toLocaleString() : null;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
          }}>
            <FiTruck size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Track Your Order
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Enter your tracking number to see real-time delivery status
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          onSubmit={handleTrack}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex', gap: '12px', marginBottom: '32px',
            background: 'var(--bg-secondary)', borderRadius: '16px',
            padding: '8px', border: '1px solid var(--border-color)'
          }}
        >
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            placeholder="ALX-XXXXXX-XXX"
            style={{
              flex: 1, padding: '16px 20px', border: 'none', outline: 'none',
              background: 'transparent', fontSize: '1.1rem', fontFamily: 'monospace',
              letterSpacing: '2px', color: 'var(--text-primary)', fontWeight: '600'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px 32px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem',
              opacity: loading ? 0.7 : 1, transition: 'all 0.3s ease'
            }}
          >
            <FiSearch size={18} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', textAlign: 'center', fontWeight: '500'
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Tracking Header Card */}
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
                borderRadius: '20px', padding: '32px', marginBottom: '24px',
                color: 'white', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', top: '-50px', right: '-50px',
                  width: '200px', height: '200px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)'
                }} />
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Tracking Number
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '3px' }}>
                    {order.trackingNumber}
                  </span>
                  <button onClick={copyTracking} style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px',
                    padding: '6px 10px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <FiCopy size={14} />
                    <span style={{ fontSize: '0.8rem' }}>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Status</p>
                    <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                      {order.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Payment</p>
                    <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                      {order.paymentMethod.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Total</p>
                    <p style={{ fontWeight: '600' }}>
                      {order.totalPrice?.toLocaleString()} ETB
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: '20px',
                padding: '32px', border: '1px solid var(--border-color)', marginBottom: '24px'
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '28px', fontWeight: '600', fontSize: '1.1rem' }}>
                  Delivery Progress
                </h3>

                <div style={{ position: 'relative' }}>
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const timeStr = getHistoryTime(step.key);
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} style={{ display: 'flex', gap: '20px', marginBottom: index < statusSteps.length - 1 ? '0' : '0', position: 'relative' }}>
                        {/* Line */}
                        {index < statusSteps.length - 1 && (
                          <div style={{
                            position: 'absolute', left: '23px', top: '48px',
                            width: '2px', height: '40px',
                            background: isCompleted ? 'linear-gradient(180deg, #6366f1, #8b5cf6)' : 'var(--border-color)',
                            transition: 'background 0.5s ease'
                          }} />
                        )}

                        {/* Icon */}
                        <motion.div
                          animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                          style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, zIndex: 1,
                            background: isCompleted
                              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                              : 'var(--bg-primary)',
                            border: isCompleted ? 'none' : '2px solid var(--border-color)',
                            boxShadow: isCurrent ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                            transition: 'all 0.5s ease'
                          }}
                        >
                          <StepIcon size={20} color={isCompleted ? 'white' : 'var(--text-muted)'} />
                        </motion.div>

                        {/* Text */}
                        <div style={{ paddingBottom: index < statusSteps.length - 1 ? '40px' : '0', flex: 1 }}>
                          <p style={{
                            fontWeight: isCurrent ? '700' : '500',
                            color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontSize: isCurrent ? '1.05rem' : '0.95rem',
                            marginBottom: '2px'
                          }}>
                            {step.label}
                            {isCurrent && (
                              <span style={{
                                marginLeft: '10px', padding: '2px 10px', borderRadius: '20px',
                                background: 'rgba(99,102,241,0.15)', color: '#6366f1',
                                fontSize: '0.75rem', fontWeight: '600'
                              }}>
                                Current
                              </span>
                            )}
                          </p>
                          {timeStr && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiClock size={12} /> {timeStr}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: '20px',
                padding: '32px', border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '600', fontSize: '1.1rem' }}>
                  Order Items
                </h3>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{
                        width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover'
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {(item.price * item.quantity).toLocaleString()} ETB
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackOrderPage;
