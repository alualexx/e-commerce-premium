import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiShoppingCart, FiCreditCard, FiTrash2, FiPlus, FiMinus, FiCheck, FiUser, FiPrinter, FiTag } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const POSPage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      const prodList = data.products || data;
      setProducts(prodList);
      
      const cats = ['All', ...new Set(prodList.map(p => p.category).filter(Boolean))];
      setCategories(cats);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/users');
      // Filter out only normal users/customers
      const customerList = data.filter(u => u.role === 'user');
      setCustomers(customerList);
    } catch (error) {
      console.error('Failed to fetch customers', error);
      // Non-blocking error
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock');
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product === product._id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.error('Cannot add more than available stock');
          return prevCart;
        }
        return prevCart.map(item =>
          item.product === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { 
        product: product._id, 
        name: product.name, 
        price: product.price, 
        image: product.images?.[0] || '',
        quantity: 1,
        maxStock: product.stock
      }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product === productId) {
          if (newQuantity > item.maxStock) {
            toast.error('Cannot add more than available stock');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setProcessing(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        customerId: selectedCustomer || null,
        discount: Number(discount) || 0
      };

      const { data } = await api.post('/orders/pos', orderData);
      
      setLastOrder(data);
      setShowReceipt(true);
      
      setCart([]);
      setDiscount(0);
      setSelectedCustomer('');
      fetchProducts(); // Refresh stock
    } catch (error) {
      console.error('Checkout failed', error);
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const validDiscount = Math.min(Number(discount) || 0, cartSubtotal);
  const discountedSubtotal = cartSubtotal - validDiscount;
  const taxAmount = discountedSubtotal * 0.15;
  const grandTotal = discountedSubtotal + taxAmount;

  if (loading) {
    return <div className="pos-loading">Loading POS System...</div>;
  }

  return (
    <div className="pos-container">
      {/* Hide main UI when printing receipt */}
      <div className="pos-main-content">
        <div className="pos-header">
          <h1>POS Terminal</h1>
          <p>In-Store Sales Management</p>
        </div>

        <div className="pos-layout">
          {/* Left Side: Product Selection */}
          <div className="pos-products-section">
            <div className="pos-search-bar">
              <FiSearch size={20} className="pos-search-icon" />
              <input 
                type="text" 
                placeholder="Search products by name or barcode..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pos-search-input"
              />
            </div>
            
            {/* Category Filter */}
            <div className="pos-categories">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`pos-category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pos-product-grid">
              {filteredProducts.map(product => (
                <div 
                  key={product._id} 
                  className={`pos-product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="pos-product-image">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="pos-product-placeholder">No Image</div>
                    )}
                    {product.stock <= 0 && <div className="pos-out-stock-badge">Out of Stock</div>}
                    {product.stock > 0 && product.stock <= 5 && <div className="pos-low-stock-badge">Low Stock: {product.stock}</div>}
                  </div>
                  <div className="pos-product-info">
                    <h3 className="pos-product-name" title={product.name}>{product.name}</h3>
                    <div className="pos-product-price-row">
                      <span className="pos-product-price">{product.price} ETB</span>
                      <span className="pos-product-stock">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="pos-no-results">No products found.</div>
              )}
            </div>
          </div>

          {/* Right Side: Cart / Current Ticket */}
          <div className="pos-cart-section">
            <div className="pos-cart-header">
              <h2>Current Ticket</h2>
              <div className="pos-cart-count">{cart.length} Items</div>
            </div>

            <div className="pos-customer-select">
              <FiUser className="pos-input-icon" />
              <select 
                value={selectedCustomer} 
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="pos-select"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="pos-cart-items">
              {cart.length === 0 ? (
                <div className="pos-cart-empty">
                  <FiShoppingCart size={48} />
                  <p>Cart is empty</p>
                  <span>Select products to add to the ticket</span>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product} className="pos-cart-item">
                    <div className="pos-cart-item-info">
                      <h4>{item.name}</h4>
                      <span>{item.price} ETB</span>
                    </div>
                    
                    <div className="pos-cart-item-actions">
                      <div className="pos-quantity-control">
                        <button onClick={() => updateQuantity(item.product, item.quantity - 1)} className="pos-qty-btn">
                          <FiMinus size={14} />
                        </button>
                        <span className="pos-qty-value">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product, item.quantity + 1)} className="pos-qty-btn">
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <div className="pos-item-total">
                        {(item.price * item.quantity).toFixed(2)} ETB
                      </div>
                      <button onClick={() => removeFromCart(item.product)} className="pos-remove-btn">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pos-cart-summary">
                
                <div className="pos-summary-options">
                  <div className="pos-option-group">
                    <label><FiTag size={14}/> Discount (ETB)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max={cartSubtotal}
                      value={discount} 
                      onChange={(e) => setDiscount(e.target.value)}
                      className="pos-option-input"
                    />
                  </div>
                  <div className="pos-option-group">
                    <label><FiCreditCard size={14}/> Payment</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="pos-option-select"
                    >
                      <option value="cash">Cash</option>
                      <option value="cbe_birr">CBE Birr</option>
                      <option value="telebirr">Telebirr</option>
                      <option value="abyssinia">Abyssinia</option>
                      <option value="chapa">Card (Chapa)</option>
                    </select>
                  </div>
                </div>

                <div className="pos-summary-row mt-3">
                  <span>Subtotal</span>
                  <span>{cartSubtotal.toFixed(2)} ETB</span>
                </div>
                {validDiscount > 0 && (
                  <div className="pos-summary-row text-danger">
                    <span>Discount</span>
                    <span>-{validDiscount.toFixed(2)} ETB</span>
                  </div>
                )}
                <div className="pos-summary-row">
                  <span>VAT (15%)</span>
                  <span>{taxAmount.toFixed(2)} ETB</span>
                </div>
                <div className="pos-summary-row pos-grand-total">
                  <span>Total</span>
                  <span>{grandTotal.toFixed(2)} ETB</span>
                </div>

                <button 
                  className="pos-checkout-btn"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : (
                    <>
                      <FiCheck size={20} />
                      Complete Sale
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal Layer */}
      {showReceipt && lastOrder && (
        <div className="pos-receipt-modal">
          <div className="pos-receipt-container" id="printable-receipt">
            <div className="receipt-header">
              <h2>AlexRetail POS</h2>
              <p>123 Commerce Blvd, Addis Ababa</p>
              <p>Tel: +251 900 123 456</p>
              <div className="receipt-divider"></div>
            </div>
            
            <div className="receipt-details">
              <p><strong>Order ID:</strong> {lastOrder.trackingNumber || lastOrder._id.slice(-8).toUpperCase()}</p>
              <p><strong>Date:</strong> {new Date(lastOrder.createdAt).toLocaleString()}</p>
              <p><strong>Cashier:</strong> {lastOrder.cashier ? "Admin/Cashier" : "Staff"}</p>
              <p><strong>Payment:</strong> {lastOrder.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              <div className="receipt-divider"></div>
            </div>

            <table className="receipt-items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {lastOrder.items.map(item => (
                  <tr key={item._id || item.product}>
                    <td>{item.name}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-divider"></div>

            <div className="receipt-totals">
              <div className="receipt-row">
                <span>Subtotal:</span>
                <span>{lastOrder.itemsPrice.toFixed(2)} ETB</span>
              </div>
              {lastOrder.discountPrice > 0 && (
                <div className="receipt-row">
                  <span>Discount:</span>
                  <span>-{lastOrder.discountPrice.toFixed(2)} ETB</span>
                </div>
              )}
              <div className="receipt-row">
                <span>VAT (15%):</span>
                <span>{lastOrder.taxPrice.toFixed(2)} ETB</span>
              </div>
              <div className="receipt-row receipt-grand-total">
                <span>Total:</span>
                <span>{lastOrder.totalPrice.toFixed(2)} ETB</span>
              </div>
            </div>

            <div className="receipt-footer">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', marginTop: '16px' }}>
                <QRCodeSVG 
                  value={`${window.location.origin}/track?number=${lastOrder.trackingNumber}`} 
                  size={120} 
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p>Thank you for shopping with us!</p>
              <p>Please keep this receipt for your records.</p>
            </div>
          </div>
          
          <div className="receipt-actions no-print">
            <button className="btn-print" onClick={handlePrintReceipt}>
              <FiPrinter /> Print Receipt
            </button>
            <button className="btn-close" onClick={() => setShowReceipt(false)}>
              New Sale
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* Hide main UI when printing */
        @media print {
          body * {
            visibility: hidden;
          }
          .pos-main-content, .no-print {
            display: none !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm; /* Standard thermal receipt width */
            padding: 10px;
            box-shadow: none;
            background: white;
            color: black;
          }
        }

        .pos-container {
          height: calc(100vh - 90px - 6rem);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .pos-main-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .pos-header {
          margin-bottom: 2rem;
        }
        .pos-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.5rem;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }
        .pos-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 500;
        }
        .pos-layout {
          display: flex;
          gap: 2rem;
          flex: 1;
          min-height: 0;
        }
        .pos-products-section {
          flex: 2;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }
        .pos-search-bar {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          position: relative;
        }
        .pos-search-icon {
          position: absolute;
          left: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .pos-search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-sub);
          color: var(--text-main);
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .pos-search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          background: var(--bg-card);
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
        }
        
        .pos-categories {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pos-categories::-webkit-scrollbar {
          display: none;
        }
        .pos-category-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-sub);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .pos-category-btn:hover {
          background: var(--border-color);
        }
        .pos-category-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .pos-product-grid {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        .pos-product-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }
        .pos-product-card:hover:not(.out-of-stock) {
          transform: translateY(-4px);
          border-color: var(--primary-color);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
        }
        .pos-product-card.out-of-stock {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .pos-product-image {
          height: 160px;
          background: var(--bg-sub);
          position: relative;
          padding: 1rem;
        }
        .pos-product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .pos-product-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .pos-out-stock-badge, .pos-low-stock-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pos-out-stock-badge { background: var(--danger-color); }
        .pos-low-stock-badge { background: var(--warning-color); color: #000; }
        
        .pos-product-info {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pos-product-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
        .pos-product-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .pos-product-price {
          font-weight: 800;
          color: var(--primary-color);
          font-size: 1rem;
        }
        .pos-product-stock {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .pos-no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .pos-cart-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
          max-width: 450px;
        }
        .pos-cart-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pos-cart-header h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
          font-family: 'Outfit', sans-serif;
        }
        .pos-cart-count {
          background: var(--primary-color);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
        }
        
        .pos-customer-select {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          position: relative;
          display: flex;
          align-items: center;
        }
        .pos-input-icon {
          position: absolute;
          left: 2.2rem;
          color: var(--text-muted);
        }
        .pos-select {
          width: 100%;
          padding: 0.8rem 0.8rem 0.8rem 2.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-sub);
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .pos-select:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .pos-cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pos-cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          gap: 1rem;
          opacity: 0.5;
        }
        .pos-cart-empty p {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }
        .pos-cart-item {
          background: var(--bg-sub);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pos-cart-item-info h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 0.25rem 0;
        }
        .pos-cart-item-info span {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .pos-cart-item-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pos-quantity-control {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          padding: 0.4rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .pos-qty-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-sub);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-main);
          transition: all 0.2s;
        }
        .pos-qty-btn:hover { background: var(--border-color); }
        .pos-qty-value {
          font-size: 0.85rem;
          font-weight: 800;
          min-width: 20px;
          text-align: center;
        }
        .pos-item-total {
          font-weight: 800;
          color: var(--text-main);
          font-size: 0.95rem;
        }
        .pos-remove-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--danger-rgb), 0.1);
          color: var(--danger-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pos-remove-btn:hover {
          background: var(--danger-color);
          color: white;
        }

        .pos-cart-summary {
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-sub);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .pos-summary-options {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .pos-option-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .pos-option-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pos-option-input, .pos-option-select {
          width: 100%;
          padding: 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-main);
          font-weight: 600;
          font-size: 0.85rem;
        }
        .pos-option-input:focus, .pos-option-select:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .pos-summary-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
        }
        .text-danger { color: var(--danger-color) !important; }
        .mt-3 { margin-top: 0.75rem; }
        
        .pos-grand-total {
          color: var(--text-main);
          font-size: 1.25rem;
          font-weight: 800;
          padding-top: 1rem;
          border-top: 1px dashed var(--border-color);
        }
        .pos-checkout-btn {
          width: 100%;
          padding: 1.25rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 0.5rem;
        }
        .pos-checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3);
        }
        .pos-checkout-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        /* Receipt Modal */
        .pos-receipt-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .pos-receipt-container {
          background: white;
          color: black;
          width: 100%;
          max-width: 350px;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          font-family: 'Courier New', Courier, monospace;
          max-height: 70vh;
          overflow-y: auto;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .receipt-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .receipt-header p {
          margin: 0;
          font-size: 0.85rem;
          color: #444;
        }
        .receipt-divider {
          border-top: 1px dashed #ccc;
          margin: 1rem 0;
        }
        .receipt-details p {
          margin: 0.25rem 0;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
        }
        .receipt-items {
          width: 100%;
          font-size: 0.85rem;
          border-collapse: collapse;
        }
        .receipt-items th {
          text-align: left;
          border-bottom: 1px dashed #ccc;
          padding-bottom: 0.5rem;
          font-weight: bold;
        }
        .receipt-items td {
          padding: 0.5rem 0;
        }
        .text-right { text-align: right !important; }
        
        .receipt-totals {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }
        .receipt-grand-total {
          font-weight: bold;
          font-size: 1.1rem;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px dashed #ccc;
        }
        .receipt-footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.85rem;
          color: #444;
        }
        .receipt-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .btn-print, .btn-close {
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }
        .btn-print {
          background: var(--primary-color);
          color: white;
        }
        .btn-close {
          background: white;
          color: black;
        }
        
        .pos-loading {
          height: calc(100vh - 90px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default POSPage;
