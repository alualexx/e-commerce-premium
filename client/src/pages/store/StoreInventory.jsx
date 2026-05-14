import { useState, useEffect } from 'react';
import { FiPackage, FiSearch, FiEdit2, FiCheck, FiX, FiAlertCircle, FiArrowUp, FiArrowDown, FiPlus, FiTruck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatPrice } from '../../utils/formatters';
import LoadingScreen from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const StoreInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Electronics', stock: 0, brand: '',
    supplier: { name: '', contact: '', costPrice: 0 },
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500']
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (id) => {
    try {
      await api.put(`/products/${id}/stock`, { stock: Number(editStock) });
      toast.success('Stock updated successfully');
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleSubmitForReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/review', newProduct);
      toast.success('Product submitted for admin review');
      setShowAddModal(false);
      setNewProduct({
        name: '', category: 'Electronics', stock: 0, brand: '',
        supplier: { name: '', contact: '', costPrice: 0 },
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500']
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit product');
    }
  };

  const startEditing = (product) => {
    setEditingId(product._id);
    setEditStock(product.stock);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>Inventory Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Monitor stock levels and add products from suppliers.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px',
            borderRadius: '16px', background: 'var(--primary-color)', color: 'white', border: 'none',
            fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FiPlus size={20} /> Add from Supplier
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ position: 'relative', width: '360px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px',
              border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
              color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: 'var(--bg-danger-light)', color: 'var(--danger-color)', fontSize: '0.8rem', fontWeight: 800, border: '1px solid var(--border-color)' }}>
            <FiAlertCircle size={16} />
            {products.filter(p => p.stock === 0).length} Out of Stock
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: 'var(--bg-sub)', color: 'var(--warning-color)', fontSize: '0.8rem', fontWeight: 800, border: '1px solid var(--border-color)' }}>
            <FiAlertCircle size={16} />
            {products.filter(p => p.stock > 0 && p.stock <= 10).length} Low Stock
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Stock</th>
                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={product.images[0]} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', background: 'var(--bg-sub)' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{product.name}</p>
                          {product.status === 'pending_review' && (
                            <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--warning-color)', color: 'var(--bg-main)', fontWeight: 900, textTransform: 'uppercase' }}>In Review</span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {product._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-sub)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--border-color)' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {product.status === 'pending_review' ? (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Pending Admin</span>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    {editingId === product._id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          style={{ 
                            width: '80px', padding: '10px 14px', borderRadius: '10px', 
                            border: '1px solid var(--primary-color)', background: 'var(--bg-secondary)',
                            color: 'var(--text-main)', outline: 'none', fontWeight: 700, fontSize: '0.9rem'
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          fontSize: '1rem', fontWeight: 800,
                          color: product.stock === 0 ? 'var(--danger-color)' : product.stock <= 10 ? 'var(--warning-color)' : 'var(--text-main)'
                        }}>
                          {product.stock}
                        </span>
                        {product.stock <= 10 && (
                          <FiAlertCircle size={16} color={product.stock === 0 ? 'var(--danger-color)' : 'var(--warning-color)'} />
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    {editingId === product._id ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button 
                          onClick={() => handleUpdateStock(product._id)}
                          style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                          <FiCheck size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-sub)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEditing(product)}
                        style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.background = 'var(--bg-sub)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <FiEdit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                background: 'var(--bg-secondary)', borderRadius: '32px', width: '100%', maxWidth: '640px',
                padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.25)', border: '1px solid var(--border-color)',
                position: 'relative', overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>New Product Submission</h2>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-sub)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitForReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Name</label>
                    <input 
                      required
                      type="text" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="e.g. Wireless Headphones"
                      style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {['Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initial Stock</label>
                    <input 
                      required
                      type="number" 
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                      style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand</label>
                    <input 
                      type="text" 
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      placeholder="e.g. Sony"
                      style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div style={{ padding: '24px', background: 'var(--bg-sub)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiTruck size={16} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Supplier Information</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplier Name</label>
                      <input 
                        required
                        type="text" 
                        value={newProduct.supplier.name}
                        onChange={(e) => setNewProduct({...newProduct, supplier: {...newProduct.supplier, name: e.target.value}})}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</label>
                        <input 
                          type="text" 
                          value={newProduct.supplier.contact}
                          onChange={(e) => setNewProduct({...newProduct, supplier: {...newProduct.supplier, contact: e.target.value}})}
                          style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Price (each)</label>
                        <input 
                          required
                          type="number" 
                          value={newProduct.supplier.costPrice}
                          onChange={(e) => setNewProduct({...newProduct, supplier: {...newProduct.supplier, costPrice: Number(e.target.value)}})}
                          style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  style={{
                    width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                    background: 'var(--primary-color)', color: 'white', fontWeight: 800, cursor: 'pointer',
                    marginTop: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Submit for Admin Review
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoreInventory;
