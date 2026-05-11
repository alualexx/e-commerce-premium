import { formatPrice, formatDate } from '../../utils/formatters';

const Invoice = ({ order }) => {
  if (!order) return null;

  return (
    <div className="invoice-container" style={{ 
      padding: '4rem', 
      background: '#fff', 
      color: '#111', 
      minHeight: '297mm', // A4 height
      width: '210mm',    // A4 width
      margin: '0 auto',
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#111', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.25rem' }}>A</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>ALEX <span style={{ color: '#3d7a28' }}>RETAIL</span></span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Premium Minimalist Boutique</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em' }}>INVOICE</h1>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#3d7a28', marginTop: '0.5rem' }}>#{order._id.toUpperCase().slice(-8)}</p>
        </div>
      </div>

      {/* Addresses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
        <div>
          <h3 style={{ fontSize: '0.625rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.25rem' }}>Billed To</h3>
          <p style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{order.shippingAddress.fullName}</p>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.6 }}>
            {order.shippingAddress.street || order.shippingAddress.address}<br />
            {order.shippingAddress.city}, Ethiopia<br />
            {order.shippingAddress.phone}
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: '0.625rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.25rem' }}>Order Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: '#6b7280' }}>Date</span>
              <span style={{ fontWeight: 800 }}>{formatDate(order.createdAt || new Date())}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: '#6b7280' }}>Payment</span>
              <span style={{ fontWeight: 800, textTransform: 'uppercase' }}>{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: '#6b7280' }}>Status</span>
              <span style={{ fontWeight: 800, color: order.isPaid ? '#3d7a28' : '#6b7280' }}>{order.isPaid ? 'PAID' : 'PENDING'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111' }}>
            <th style={{ textAlign: 'left', padding: '1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Item Description</th>
            <th style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '1rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.orderItems || order.items || []).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '1.5rem 0' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>{item.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0' }}>{item.category || 'Premium Collection'}</p>
              </td>
              <td style={{ textAlign: 'center', padding: '1.5rem 0', fontSize: '0.9rem', fontWeight: 700 }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '1.5rem 0', fontSize: '0.9rem', fontWeight: 700 }}>{formatPrice(item.price)}</td>
              <td style={{ textAlign: 'right', padding: '1.5rem 0', fontSize: '0.9rem', fontWeight: 800 }}>{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600, color: '#6b7280' }}>Subtotal</span>
            <span style={{ fontWeight: 800 }}>{formatPrice(order.itemsPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600, color: '#6b7280' }}>Shipping</span>
            <span style={{ fontWeight: 800 }}>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', borderTop: '2px solid #111', marginTop: '1rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 900 }}>Total Amount</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3d7a28' }}>{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Thank you for choosing Alex Retail</p>
        <p style={{ fontSize: '0.7rem', color: '#d1d5db', marginTop: '0.5rem' }}>This is a computer generated document. No signature required.</p>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-container, .invoice-container * { visibility: visible; }
          .invoice-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 2rem !important;
          }
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
