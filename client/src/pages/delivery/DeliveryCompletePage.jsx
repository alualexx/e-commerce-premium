import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiHash, FiArrowRight, FiAlertTriangle, FiUser, FiMapPin, FiDollarSign } from 'react-icons/fi';
import api from '../../utils/api';

const DeliveryCompletePage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.put('/orders/delivery/complete', {
        trackingNumber: trackingNumber.trim()
      });
      setResult(data);
      setTrackingNumber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
        Complete Delivery
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Enter the customer's tracking number to mark the order as delivered
      </p>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-secondary)', borderRadius: '24px', padding: '32px',
          border: '1px solid var(--border-color)', marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px',
          background: 'var(--primary-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <FiHash size={28} color="white" />
        </div>

        <form onSubmit={handleComplete}>
          <label style={{
            display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem',
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
            fontWeight: '700', textAlign: 'center'
          }}>
            Order Tracking ID
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            placeholder="ALX-XXXXXX-XXX"
            style={{
              width: '100%', padding: '20px', borderRadius: '16px',
              border: '2px solid var(--border-color)', background: 'var(--bg-sub)',
              color: 'var(--text-main)', fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif',
              letterSpacing: '2px', fontWeight: '800', textAlign: 'center',
              outline: 'none', transition: 'all 0.3s ease',
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

          <button
            type="submit"
            disabled={loading || !trackingNumber.trim()}
            style={{
              width: '100%', marginTop: '24px', padding: '18px', borderRadius: '16px',
              border: 'none', background: 'var(--primary-color)',
              color: 'white', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              opacity: loading || !trackingNumber.trim() ? 0.5 : 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
                Updating Status...
              </>
            ) : (
              <>
                <FiCheckCircle size={22} />
                Confirm Delivery
                <FiArrowRight size={20} />
              </>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              padding: '20px', borderRadius: '16px', marginBottom: '24px',
              background: 'var(--bg-danger-light)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}
          >
            <FiAlertTriangle size={20} color="var(--danger-color)" />
            <p style={{ color: 'var(--danger-color)', fontWeight: '600', fontSize: '0.9rem' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: 'var(--bg-secondary)', borderRadius: '24px', padding: '40px 32px',
              border: '1px solid var(--primary-color)',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'var(--primary-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(34,197,94,0.3)'
              }}
            >
              <FiCheckCircle size={44} color="white" />
            </motion.div>

            <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
              Order Delivered!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: '500' }}>
              Status successfully updated for customer
            </p>

            <div style={{
              background: 'var(--bg-sub)', borderRadius: '20px', padding: '24px',
              textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiPackage size={18} color="var(--primary-color)" />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>TRACKING:</span>
                <span style={{ color: 'var(--primary-color)', fontFamily: 'Outfit, sans-serif', fontWeight: '800' }}>
                  {result.trackingNumber}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiUser size={18} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>CUSTOMER:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{result.shippingAddress?.fullName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiMapPin size={18} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>DESTINATION:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{result.shippingAddress?.street}, {result.shippingAddress?.city}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <FiDollarSign size={18} color={result.isPaid ? 'var(--success-color)' : 'var(--text-muted)'} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>PAYMENT:</span>
                <span style={{ color: result.isPaid ? 'var(--success-color)' : 'var(--text-main)', fontWeight: '800', fontSize: '1.1rem' }}>
                  {result.totalPrice?.toLocaleString()} ETB {result.isPaid && '(PAID)'}
                </span>
              </div>
              {result.paymentMethod === 'cash_on_delivery' && result.isPaid && (
                <p style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: '700', marginTop: '-8px', marginLeft: '30px' }}>
                  ✓ Cash collected and confirmed
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryCompletePage;
