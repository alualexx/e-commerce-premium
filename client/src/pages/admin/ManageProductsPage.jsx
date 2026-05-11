import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiGrid, FiList, FiCheck, FiX, FiImage, FiUploadCloud, FiPackage, FiLoader, FiTag, FiShoppingBag, FiStar, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../utils/api';
import { formatPrice } from '../../utils/formatters';
import LoadingScreen from '../../components/common/LoadingScreen';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is too short'),
  description: z.string().min(10, 'Product description is required'),
  price: z.preprocess((val) => Number(val), z.number().min(0.01, 'Price must be > 0')),
  category: z.string().min(2, 'Category is required'),
  stock: z.preprocess((val) => Number(val), z.number().min(0, 'Stock cannot be negative')),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  brand: z.string().min(1, 'Brand is required'),
});

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'published', 'pending_review'
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { images: [] }
  });

  const watchImages = watch('images') || [];

  const fetchProducts = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const { data } = await api.get('/products', { params });
      setProducts(data.products || data);
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filterStatus]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        images: product.images || [],
        brand: product.brand || ''
      });
    } else {
      setEditingProduct(null);
      reset({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: [],
        brand: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    setUploading(true);
    try {
      const { data } = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValue('images', [...watchImages, ...data.images]);
    } catch (error) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...watchImages];
    newImages.splice(index, 1);
    setValue('images', newImages);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Deletion failed');
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // If it was a pending review, we'll auto-publish it when admin saves with price/desc
      const payload = { ...data, status: 'published' };
      
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading && products.length === 0) return <LoadingScreen />;

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-sub)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontWeight: 700,
    outline: 'none',
    transition: 'all 0.3s'
  };

  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
    display: 'block'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Management</p>
           <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Inventory</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ 
            background: 'var(--text-main)', 
            color: 'var(--bg-main)', 
            padding: '1rem 2rem', 
            borderRadius: '16px', 
            border: 'none',
            fontSize: '0.85rem', 
            fontWeight: 800, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ display: 'flex', background: 'var(--bg-sub)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'all', label: 'All Products' },
            { id: 'published', label: 'Published' },
            { id: 'pending_review', label: 'Review Queue' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 800, transition: 'all 0.2s',
                background: filterStatus === tab.id ? 'var(--text-main)' : 'transparent',
                color: filterStatus === tab.id ? 'var(--bg-main)' : 'var(--text-muted)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
              <input
                type="text"
                placeholder="Search products..."
                style={{ ...inputStyle, paddingLeft: '3rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? 'var(--text-main)' : 'transparent', color: viewMode === 'grid' ? 'var(--bg-main)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <FiGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'var(--text-main)' : 'transparent', color: viewMode === 'list' ? 'var(--bg-main)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <FiList size={18} />
              </button>
            </div>
        </div>
      </div>

      {/* Products */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                style={{ 
                  background: 'var(--bg-card)', 
                  borderRadius: '24px', 
                  border: '1px solid var(--border-color)', 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                  position: 'relative'
                }}
              >
                <div style={{ aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-sub)' }}>
                   <img src={product.images?.[0] || 'https://via.placeholder.com/400'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{product.name}</h3>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-color)' }}>{formatPrice(product.price)}</span>
                   </div>
                   <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</p>
                    {product.status !== 'published' && (
                     <div style={{ 
                       padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, 
                       background: 'var(--bg-sub)',
                       color: product.status === 'pending_review' ? 'var(--warning-color)' : 'var(--text-muted)',
                       border: '1px solid var(--border-color)',
                       marginTop: '8px', display: 'inline-block'
                     }}>
                       {product.status === 'pending_review' ? 'PENDING REVIEW' : 'DRAFT'}
                     </div>
                   )}
                </div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                   <div>
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Stock</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 800, color: product.stock > 0 ? 'var(--text-main)' : 'var(--danger-color)' }}>{product.stock} Units</p>
                   </div>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenModal(product)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sub)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer' }}><FiEdit size={14} /></button>
                      <button onClick={() => handleDelete(product._id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sub)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
                   </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
              <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                       <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                             <th key={h} style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody>
                       {filteredProducts.map(product => (
                          <tr key={product._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                             <td style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                   <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-sub)', flexShrink: 0 }}>
                                      <img src={product.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                   </div>
                                   <div>
                                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{product.name}</p>
                                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{product.brand}</p>
                                   </div>
                                </div>
                             </td>
                             <td style={{ padding: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>{product.category}</td>
                             <td style={{ padding: '1.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatPrice(product.price)}</td>
                             <td style={{ padding: '1.5rem', fontSize: '0.85rem', fontWeight: 800, color: product.stock > 0 ? 'var(--text-main)' : 'var(--danger-color)' }}>{product.stock}</td>
                             <td style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                   <button onClick={() => handleOpenModal(product)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'none', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><FiEdit size={16} /></button>
                                   <button onClick={() => handleDelete(product._id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'none', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'var(--bg-main)', opacity: 0.8, backdropFilter: 'blur(20px)' }} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ 
                background: 'var(--bg-card)', 
                maxWidth: '900px', 
                width: '100%', 
                maxHeight: '90vh', 
                borderRadius: '32px', 
                border: '1px solid var(--border-color)', 
                position: 'relative', 
                zIndex: 10, 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                boxShadow: '0 50px 100px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{editingProduct ? 'Update Product' : 'New Product'}</h2>
                 <button onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-sub)', border: 'none', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}>
                    <FiX size={20} />
                 </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                 <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                       <div>
                          <label style={labelStyle}>Product Name</label>
                          <input {...register('name')} style={inputStyle} placeholder="Product name" />
                          {errors.name && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.name.message}</p>}
                       </div>

                       <div>
                          <label style={labelStyle}>Description</label>
                          <textarea {...register('description')} rows="4" style={{ ...inputStyle, resize: 'none' }} placeholder="Product details..." />
                          {errors.description && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.description.message}</p>}
                       </div>

                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          <div>
                             <label style={labelStyle}>Price (ETB)</label>
                             <input {...register('price')} type="number" step="0.01" style={inputStyle} placeholder="0.00" />
                          </div>
                          <div>
                             <label style={labelStyle}>Stock</label>
                             <input {...register('stock')} type="number" style={inputStyle} placeholder="0" />
                          </div>
                       </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          <div>
                             <label style={labelStyle}>Category</label>
                             <input {...register('category')} style={inputStyle} placeholder="Category" />
                          </div>
                          <div>
                             <label style={labelStyle}>Brand</label>
                             <input {...register('brand')} style={inputStyle} placeholder="Brand" />
                          </div>
                       </div>

                       {editingProduct?.supplier && (
                          <div style={{ padding: '1.5rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Supplier Information</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Name</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{editingProduct.supplier.name}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cost Price</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatPrice(editingProduct.supplier.costPrice)}</p>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Contact</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{editingProduct.supplier.contact || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                       <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                             <label style={labelStyle}>Images</label>
                             <button type="button" onClick={() => fileInputRef.current.click()} style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Upload</button>
                             <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }} onChange={handleUpload} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                             {watchImages.map((img, i) => (
                                <div key={i} style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-sub)', position: 'relative' }}>
                                   <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                   <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--danger-color)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><FiX size={14} /></button>
                                </div>
                             ))}
                             {watchImages.length < 6 && (
                                <button type="button" onClick={() => fileInputRef.current.click()} style={{ aspectRatio: '1/1', borderRadius: '12px', border: '1px dashed var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                   {uploading ? <FiLoader className="animate-spin" /> : <FiImage size={24} />}
                                </button>
                             )}
                          </div>
                       </div>
                    </div>
                 </form>
              </div>

              <div style={{ padding: '2.5rem', background: 'var(--bg-sub)', display: 'flex', gap: '1.5rem' }}>
                 <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, height: '56px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                 <button onClick={handleSubmit(onSubmit)} style={{ flex: 2, height: '56px', borderRadius: '16px', background: 'var(--text-main)', border: 'none', color: 'var(--bg-main)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>
                    {editingProduct?.status === 'pending_review' ? 'Approve & Publish' : editingProduct ? 'Update Product' : 'Add Product'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageProductsPage;
