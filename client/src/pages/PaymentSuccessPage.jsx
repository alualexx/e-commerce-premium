import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiPrinter, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import { formatPrice, formatDate } from '../utils/formatters';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printReady, setPrintReady] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(data);
        // Mark print ready after a short delay so the DOM renders
        setTimeout(() => setPrintReady(true), 600);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Auto-open print dialog once receipt is ready
  useEffect(() => {
    if (printReady && order) {
      window.print();
    }
  }, [printReady, order]);

  const handlePrint = () => window.print();

  const handleTrackOrder = () => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confirming your order...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '6rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', alignItems: 'start' }}>

        {/* ── LEFT: Receipt / Invoice ── */}
        <motion.div
          ref={invoiceRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="invoice-container"
          style={{
            background: '#fff',
            color: '#111',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            padding: '4rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
            fontFamily: "'Outfit', 'Inter', sans-serif"
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <div style={{ width: '36px', height: '36px', background: '#111', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>A</div>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em' }}>ALEX <span style={{ color: '#3d7a28' }}>RETAIL</span></span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Premium Minimalist Boutique</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Receipt</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>INVOICE</div>
              {order && <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d7a28', marginTop: '0.4rem' }}>#{order._id.slice(-8).toUpperCase()}</div>}
            </div>
          </div>

          {order ? (
            <>
              {/* Billing & Order Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>Billed To</div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem' }}>{order.shippingAddress.fullName}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.7 }}>
                    {order.shippingAddress.street || order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, Ethiopia<br />
                    {order.shippingAddress.phone}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>Order Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[
                      ['Date', formatDate(order.createdAt || new Date())],
                      ['Payment', order.paymentMethod.replace('_', ' ').toUpperCase()],
                      ['Status', order.isPaid ? 'PAID' : 'PENDING'],
                      ['Tracking', order.trackingNumber || '—'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#9ca3af', fontWeight: 600 }}>{label}</span>
                        <span style={{ fontWeight: 800, color: label === 'Status' && !order.isPaid ? '#6b7280' : label === 'Status' ? '#3d7a28' : label === 'Tracking' ? '#6366f1' : '#111', fontFamily: label === 'Tracking' ? 'monospace' : 'inherit', letterSpacing: label === 'Tracking' ? '1px' : 'normal' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracking Number Banner */}
              {order.trackingNumber && (
                <div style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  borderRadius: '16px', padding: '20px 24px', marginBottom: '2rem',
                  color: 'white', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                      Your Tracking Number
                    </p>
                    <p style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '3px' }}>
                      {order.trackingNumber}
                    </p>
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, maxWidth: '240px', lineHeight: 1.5 }}>
                    📦 Share this number with the delivery person when receiving your order
                  </div>
                </div>
              )}

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #111' }}>
                    {['Item', 'Qty', 'Price', 'Total'].map((h, i) => (
                      <th key={h} style={{ padding: '0.75rem 0', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(order.orderItems || order.items || []).map((item, i, arr) => (
                    <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '1.25rem 0' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0 }}>{item.name}</p>
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>Premium Collection</p>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 700 }}>{formatPrice(item.price)}</td>
                      <td style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 900 }}>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px' }}>
                  {[
                    ['Subtotal', formatPrice(order.itemsPrice)],
                    ['Shipping', order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', fontSize: '0.8rem' }}>
                      <span style={{ color: '#9ca3af', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontWeight: 800 }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderTop: '2px solid #111', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900 }}>Total</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3d7a28' }}>{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
              <p style={{ fontWeight: 700 }}>Receipt details could not be loaded.</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: '#d1d5db', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Thank you for shopping with Alex Retail · Computer generated receipt
            </p>
          </div>
        </motion.div>

        {/* ── RIGHT: Actions Card ── */}
        <div style={{ position: 'sticky', top: '8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Success Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '28px',
              border: '1px solid var(--border-color)',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
              style={{
                width: '72px',
                height: '72px',
                background: '#f0fdf4',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '2px solid #bbf7d0'
              }}
            >
              <FiCheckCircle size={36} color="#3d7a28" />
            </motion.div>

            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Order Confirmed!
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your receipt has been generated. We're preparing your order for delivery.
            </p>

            {orderId && (
              <div style={{ background: 'var(--bg-sub)', borderRadius: '14px', padding: '1rem 1.5rem', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.35rem' }}>Order Reference</p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                  #{orderId.slice(-8).toUpperCase()}
                </p>
              </div>
            )}
          </motion.div>

          {/* Primary CTA: Track Order */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleTrackOrder}
            style={{
              width: '100%',
              height: '64px',
              background: 'var(--text-main)',
              color: 'var(--bg-main)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
          >
            <FiPackage size={20} />
            Track My Order
            <FiArrowRight size={16} />
          </motion.button>

          {/* Secondary CTA: Print Receipt */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handlePrint}
            disabled={!order}
            style={{
              width: '100%',
              height: '56px',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: order ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: order ? 1 : 0.5,
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => { if (order) e.currentTarget.style.background = 'var(--bg-sub)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            <FiPrinter size={18} />
            Print / Save Receipt
          </motion.button>

          {/* Tertiary: Continue Shopping */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate('/shop')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            <FiShoppingBag size={14} /> Continue Shopping
          </motion.button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .invoice-container, .invoice-container * { visibility: visible !important; }
          .invoice-container {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            padding: 2rem !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          @page { margin: 1cm; size: A4; }
        }

        @media (max-width: 768px) {
          /* Stack on mobile */
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccessPage;
