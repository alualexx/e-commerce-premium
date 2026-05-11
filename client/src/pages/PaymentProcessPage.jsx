import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSmartphone, FiShield, FiCheck, FiClock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import { formatPrice } from '../utils/formatters';

const PAYMENT_CONFIG = {
  telebirr: {
    name: 'Telebirr',
    color: '#0066FF',
    gradient: 'linear-gradient(135deg, #0066FF 0%, #00AAFF 100%)',
    icon: '📱',
    instructions: [
      'Open Telebirr app on your phone',
      'Go to "Pay Bill" or scan the QR code',
      'Enter the payment amount shown below',
      'Confirm the transaction with your PIN'
    ],
    ussd: '*127#'
  },
  cbe_birr: {
    name: 'CBE Birr',
    color: '#1B5E20',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
    icon: '🏦',
    instructions: [
      'Open CBE Birr app or dial *847#',
      'Select "Make Payment"',
      'Enter merchant code: ALEX-RETAIL',
      'Confirm the amount and authorize'
    ],
    ussd: '*847#'
  },
  amole: {
    name: 'Amole',
    color: '#FF6F00',
    gradient: 'linear-gradient(135deg, #FF6F00 0%, #FFA726 100%)',
    icon: '💳',
    instructions: [
      'Open Amole app on your phone',
      'Tap "Pay" and enter the merchant code',
      'Verify the payment amount',
      'Authorize with your Amole PIN'
    ],
    ussd: '*817#'
  }
};

const PaymentProcessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method') || 'telebirr';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('instructions'); // instructions → processing → success
  const [countdown, setCountdown] = useState(5);
  const [phone, setPhone] = useState('');

  const config = PAYMENT_CONFIG[method] || PAYMENT_CONFIG.telebirr;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        const { data } = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Countdown timer when processing
  useEffect(() => {
    if (step === 'processing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (step === 'processing' && countdown === 0) {
      handlePaymentConfirm();
    }
  }, [step, countdown]);

  const handlePaymentConfirm = async () => {
    try {
      await axiosInstance.put(`/orders/${orderId}/pay`, {
        transactionId: `TXN-${Date.now()}`,
        phoneNumber: phone
      });
      setStep('success');
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate(`/payment/success?orderId=${orderId}`);
      }, 2000);
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setStep('instructions');
      alert('Payment confirmation failed. Please try again.');
    }
  };

  const handlePay = () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    setStep('processing');
    setCountdown(5);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #222', borderTopColor: config.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
          <p style={{ color: '#666', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Connecting to {config.name}...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: `radial-gradient(circle at 50% 50%, ${config.color}08 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}
      >
        {/* Payment Card */}
        <div style={{
          background: '#111',
          borderRadius: '28px',
          border: '1px solid #222',
          overflow: 'hidden',
          boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${config.color}15`
        }}>
          {/* Header */}
          <div style={{
            background: config.gradient,
            padding: '2.5rem 2rem 2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Pattern overlay */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.4rem' }}>Pay With</p>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                    {config.icon} {config.name}
                  </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '8px', padding: '0.4rem 0.8rem' }}>
                  <FiShield size={12} color="#fff" />
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure</span>
                </div>
              </div>

              {/* Amount */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1.25rem 1.5rem', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>Total Amount</p>
                <p style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                  {order ? formatPrice(order.totalPrice) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>
            <AnimatePresence mode="wait">
              {step === 'instructions' && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Phone Number Input */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                      <FiSmartphone size={12} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                      Your {config.name} Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+251 9XX XXX XXX"
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        background: '#1a1a1a',
                        border: `1px solid ${phone.length >= 10 ? config.color : '#333'}`,
                        borderRadius: '14px',
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: "'Outfit', monospace",
                        letterSpacing: '0.05em',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Instructions */}
                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Payment Steps</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {config.instructions.map((instruction, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '8px',
                            background: `${config.color}15`, color: config.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 900, flexShrink: 0
                          }}>{i + 1}</div>
                          <p style={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, lineHeight: 1.5, paddingTop: '0.15rem' }}>{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* USSD shortcut */}
                  <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #222' }}>
                    <div>
                      <p style={{ fontSize: '0.6rem', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Dial (USSD)</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 900, color: config.color, fontFamily: 'monospace', letterSpacing: '0.1em' }}>{config.ussd}</p>
                    </div>
                    <FiSmartphone size={24} color="#444" />
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePay}
                    disabled={!phone || phone.length < 10}
                    style={{
                      width: '100%',
                      height: '60px',
                      background: phone.length >= 10 ? config.gradient : '#222',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: phone.length >= 10 ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: phone.length >= 10 ? `0 8px 32px ${config.color}30` : 'none'
                    }}
                    onMouseEnter={e => { if (phone.length >= 10) { e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <FiShield size={18} />
                    Pay {order ? formatPrice(order.totalPrice) : ''}
                    <FiArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: '2rem 0' }}
                >
                  <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    border: `3px solid #222`,
                    borderTopColor: config.color,
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 2rem'
                  }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>Processing Payment</h2>
                  <p style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, marginBottom: '1.5rem' }}>
                    Verifying your {config.name} transaction...
                  </p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: '#1a1a1a', borderRadius: '10px', padding: '0.6rem 1.2rem',
                    border: '1px solid #222'
                  }}>
                    <FiClock size={14} color={config.color} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#999' }}>Confirming in {countdown}s</span>
                  </div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '2rem 0' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                    style={{
                      width: '72px', height: '72px',
                      borderRadius: '50%',
                      background: `${config.color}15`,
                      border: `2px solid ${config.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}
                  >
                    <FiCheck size={32} color={config.color} />
                  </motion.div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Payment Successful!</h2>
                  <p style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>Redirecting to your receipt...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Security Notice */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#444', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <FiShield size={12} />
            256-bit SSL Encrypted · Alex Retail Secure Gateway
          </div>
        </div>

        {/* Cancel link */}
        {step === 'instructions' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: 'none', border: 'none', color: '#555',
                fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.1em'
              }}
            >
              Cancel Payment
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentProcessPage;
