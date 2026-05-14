import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiMapPin, FiCreditCard, FiCheckCircle, FiClock, FiChevronLeft, FiPrinter, FiInfo, FiCopy, FiTruck, FiShoppingBag, FiBox, FiStar } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import { formatPrice, formatDate } from '../utils/formatters';
import LoadingScreen from '../components/common/LoadingScreen';
import Invoice from '../components/order/Invoice';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: FiShoppingBag },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
  { key: 'processing', label: 'Processing', icon: FiBox },
  { key: 'shipped', label: 'Shipped', icon: FiPackage },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiMapPin },
];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        setOrder(data);
        if (data.feedback?.rating) setFeedbackSubmitted(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const copyTracking = () => {
    navigator.clipboard.writeText(order?.trackingNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) return;
    setFeedbackSubmitting(true);
    try {
      const { data } = await axiosInstance.post(`/orders/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment
      });
      setOrder(data);
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!order) return <div style={{ paddingTop: '10rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-main)' }}>Order not found.</div>;

  const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
  };

  const badgeStyle = (isSuccess) => ({
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'var(--bg-sub)',
    color: isSuccess ? 'var(--primary-color)' : 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid var(--border-color)'
  });

  const handlePrint = () => { window.print(); };

  const orderItems = order.orderItems || order.items || [];
  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  const getHistoryTime = (status) => {
    if (!order?.statusHistory) return null;
    const entry = order.statusHistory.find(h => h.status === status);
    return entry ? new Date(entry.timestamp).toLocaleString() : null;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '10rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
           <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <FiChevronLeft /> Back to Orders
           </Link>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                 <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Order Detail</h1>
                 <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>ID: ORD-{order._id.toUpperCase()}</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button
                  disabled={order.paymentMethod === 'cash_on_delivery' && !order.isPaid}
                  onClick={handlePrint}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)', 
                    background: (order.paymentMethod === 'cash_on_delivery' && !order.isPaid) ? 'var(--bg-sub)' : 'var(--bg-card)', 
                    fontSize: '0.75rem', 
                    fontWeight: 800, 
                    cursor: (order.paymentMethod === 'cash_on_delivery' && !order.isPaid) ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: (order.paymentMethod === 'cash_on_delivery' && !order.isPaid) ? 'var(--text-muted)' : 'var(--text-main)',
                    opacity: (order.paymentMethod === 'cash_on_delivery' && !order.isPaid) ? 0.6 : 1,
                    transition: 'all 0.3s'
                  }}
                  title={(order.paymentMethod === 'cash_on_delivery' && !order.isPaid) ? 'Invoice available after payment' : 'Print Invoice'}
                 >
                    <FiPrinter size={16} /> Print Invoice
                 </button>
              </div>
           </div>
        </div>

        {/* Tracking Number Banner */}
        {order.trackingNumber && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
              borderRadius: '20px', padding: '24px 32px', marginBottom: '2rem',
              color: 'white', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '16px',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)'
            }} />
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Tracking Number
              </p>
              <p style={{ fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '3px' }}>
                {order.trackingNumber}
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '6px' }}>
                Share this with the delivery person when receiving your items
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', zIndex: 1 }}>
              <button onClick={copyTracking} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px',
                padding: '10px 18px', cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.85rem'
              }}>
                <FiCopy size={14} /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <Link to="/track" style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px',
                padding: '10px 18px', color: 'white', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.85rem'
              }}>
                <FiTruck size={14} /> Track Live
              </Link>
            </div>
          </motion.div>
        )}

        {/* Invoice Pending Notice */}
        {order.paymentMethod === 'cash_on_delivery' && !order.isPaid && (
          <div style={{
            ...cardStyle,
            marginBottom: '2rem',
            background: 'linear-gradient(to right, var(--bg-sub), var(--bg-card))',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            border: '1px solid var(--border-color)',
            padding: '2.5rem'
          }}>
            <div style={{ 
              width: '56px', height: '56px', background: 'var(--text-main)', borderRadius: '18px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}>
              <FiPrinter size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>Official Invoice Pending</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                For Cash on Delivery orders, official tax invoices are generated and unlocked only after the delivery person confirms the collection of payment. 
                Thank you for your patience.
              </p>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</span>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--warning-color)' }}>Awaiting Payment</p>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
            Delivery Progress
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
            {/* Progress Line */}
            <div style={{
              position: 'absolute', top: '24px', left: '34px', right: '34px',
              height: '3px', background: 'var(--border-color)', zIndex: 0
            }} />
            <div style={{
              position: 'absolute', top: '24px', left: '34px',
              height: '3px', zIndex: 1,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
              transition: 'width 0.8s ease',
              borderRadius: '2px'
            }} />

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const timeStr = getHistoryTime(step.key);
              const StepIcon = step.icon;

              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCompleted ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)',
                      border: isCompleted ? 'none' : '2px solid var(--border-color)',
                      boxShadow: isCurrent ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <StepIcon size={18} color={isCompleted ? 'white' : 'var(--text-muted)'} />
                  </motion.div>
                  <p style={{
                    marginTop: '10px', fontSize: '0.7rem', fontWeight: isCurrent ? 700 : 500,
                    color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                    textAlign: 'center'
                  }}>
                    {step.label}
                  </p>
                  {timeStr && (
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px', textAlign: 'center' }}>
                      {new Date(timeStr).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
           {/* Items */}
           <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Order Items</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 {orderItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: i === orderItems.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                       <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-sub)', border: '1px solid var(--border-color)' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{item.name}</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{formatPrice(item.price)} × {item.quantity}</p>
                       </div>
                       <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* Shipping */}
           <div style={cardStyle}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Shipping Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                    <FiMapPin style={{ color: 'var(--primary-color)', marginTop: '0.2rem' }} size={16} />
                    <div>
                       <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{order.shippingAddress.fullName}</p>
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>
                          {order.shippingAddress.street || order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, Ethiopia<br />
                          Phone: {order.shippingAddress.phone}
                       </p>
                    </div>
                 </div>
                 <div style={badgeStyle(order.status === 'delivered')}>
                    {order.status === 'delivered' ? <><FiCheckCircle size={14} /> Delivered on {formatDate(order.deliveredAt)}</> : <><FiClock size={14} /> {order.status.replace(/_/g, ' ')}</>}
                 </div>
              </div>
           </div>

           {/* Payment */}
           <div style={cardStyle}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Payment Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                    <FiCreditCard style={{ color: 'var(--primary-color)', marginTop: '0.2rem' }} size={16} />
                    <div>
                       <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>{order.paymentMethod?.replace(/_/g, ' ')}</p>
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Transaction verified through secure gateway</p>
                    </div>
                 </div>
                 <div style={badgeStyle(order.isPaid)}>
                    {order.isPaid ? <><FiCheckCircle size={14} /> Paid on {formatDate(order.paidAt)}</> : <><FiClock size={14} /> Pending Payment</>}
                 </div>
              </div>
           </div>

           {/* Summary */}
           <div style={{ ...cardStyle, gridColumn: 'span 2', background: 'var(--text-main)', color: 'var(--bg-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--bg-sub)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Order Summary</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>{formatPrice(order.totalPrice)}</p>
                 </div>
                 <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', fontSize: '0.85rem', fontWeight: 700 }}>
                       <span style={{ color: 'var(--bg-sub)' }}>Subtotal</span>
                       <span>{formatPrice(order.itemsPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', fontSize: '0.85rem', fontWeight: 700 }}>
                       <span style={{ color: 'var(--bg-sub)' }}>Shipping</span>
                       <span>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Feedback Section */}
        {order.status === 'delivered' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...cardStyle, marginBottom: '2rem' }}
          >
            <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
              {feedbackSubmitted ? '✨ Your Feedback' : '⭐ Rate Your Experience'}
            </h2>

            {feedbackSubmitted ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
                  {[1,2,3,4,5].map(star => (
                    <FiStar
                      key={star}
                      size={28}
                      fill={star <= (order.feedback?.rating || 0) ? '#f59e0b' : 'none'}
                      color={star <= (order.feedback?.rating || 0) ? '#f59e0b' : 'var(--text-muted)'}
                    />
                  ))}
                </div>
                {order.feedback?.comment && (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                    "{order.feedback.comment}"
                  </p>
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                  Thank you for your feedback!
                </p>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                  How was your delivery experience? Your feedback helps us improve.
                </p>

                {/* Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                  {[1,2,3,4,5].map(star => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFeedbackRating(star)}
                      onMouseEnter={() => setFeedbackHover(star)}
                      onMouseLeave={() => setFeedbackHover(0)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px'
                      }}
                    >
                      <FiStar
                        size={36}
                        fill={(feedbackHover || feedbackRating) >= star ? '#f59e0b' : 'none'}
                        color={(feedbackHover || feedbackRating) >= star ? '#f59e0b' : 'var(--text-muted)'}
                        style={{ transition: 'all 0.15s ease' }}
                      />
                    </motion.button>
                  ))}
                </div>

                {feedbackRating > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Tell us about your experience (optional)..."
                      rows={3}
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: '12px',
                        border: '1px solid var(--border-color)', background: 'var(--bg-sub)',
                        color: 'var(--text-main)', fontSize: '0.95rem', resize: 'vertical',
                        outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        marginBottom: '16px'
                      }}
                    />
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={feedbackSubmitting}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
                        opacity: feedbackSubmitting ? 0.7 : 1
                      }}
                    >
                      {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 2rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
           <FiInfo style={{ color: 'var(--primary-color)' }} size={16} />
           <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>If you have any questions regarding your order, please contact our concierge service.</p>
        </div>
      </div>

      {/* Hidden Invoice for printing */}
      {!(order.paymentMethod === 'cash_on_delivery' && !order.isPaid) && (
        <div className="invoice-print-wrapper" style={{ display: 'none' }}>
          <Invoice order={order} />
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
