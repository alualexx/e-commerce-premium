import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiGrid, FiList, FiX, FiImage, FiLoader, FiPackage, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
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
  shippingPrice: z.preprocess((val) => Number(val), z.number().min(0, 'Shipping price cannot be negative')).default(0),
  compareAtPrice: z.preprocess((val) => Number(val || 0), z.number().min(0, 'Original price cannot be negative')).optional(),
  composition: z.string().optional(),
  returnPolicy: z.string().optional(),
  broadcastPromotion: z.boolean().default(false)
});

const ManageProductsPage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [pendingProducts, setPendingProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
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

  const fetchPendingSubmissions = async () => {
    try {
      const { data } = await api.get('/products', { params: { status: 'pending_review' } });
      setPendingProducts(data.products || data);
    } catch (error) {
      console.error('Failed to fetch pending products');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPendingSubmissions();
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
        brand: product.brand || '',
        shippingPrice: product.shippingPrice || 0,
        compareAtPrice: product.compareAtPrice || 0,
        composition: product.composition || '',
        returnPolicy: product.returnPolicy || '',
        broadcastPromotion: false
      });
      setIsModalOpen(true);
    } else {
      if (pendingProducts.length > 0) {
        setIsSourceSelectorOpen(true);
      } else {
        startFresh();
      }
    }
  };

  const startFresh = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: [],
      brand: '',
      shippingPrice: 0,
      compareAtPrice: 0,
      composition: '',
      returnPolicy: '',
      broadcastPromotion: false
    });
    setIsSourceSelectorOpen(false);
    setIsModalOpen(true);
  };

  const handleSelectSubmission = (product) => {
    const submissionProduct = { ...product, status: 'pending_review' };
    setEditingProduct(submissionProduct);
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price || '',
      category: product.category,
      stock: product.stock,
      images: product.images || [],
      brand: product.brand || ''
    });
    setIsSubmissionModalOpen(false);
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
      toast.success(t('admin.products.toasts.upload_success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.products.toasts.upload_error'));
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
    if (window.confirm(t('admin.products.toasts.delete_confirm'))) {
      try {
        await api.delete(`/products/${id}`);
        toast.success(t('admin.products.toasts.delete_success'));
        fetchProducts();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(t('admin.products.toasts.delete_error'));
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const actualPrice = (data.compareAtPrice && data.compareAtPrice > 0) ? data.compareAtPrice : data.price;
      const strikethroughPrice = (data.compareAtPrice && data.compareAtPrice > 0) ? data.price : 0;

      const payload = { 
        ...data, 
        price: Number(actualPrice),
        compareAtPrice: Number(strikethroughPrice),
        status: 'published' 
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      toast.success(editingProduct ? t('admin.products.toasts.update_success') : t('admin.products.toasts.publish_success'));
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.products.toasts.save_error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'all' || p.category.toLowerCase() === filterCategory.toLowerCase())
  ) : [];

  if (loading && products.length === 0) return <LoadingScreen />;

  const inputStyle = { width: '100%', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700, outline: 'none', transition: 'all 0.3s' };
  const labelStyle = { fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>{t('admin.products.subtitle')}</p>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{t('admin.products.title')}</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            background: 'var(--text-main)',
            color: 'var(--bg-main)',
            padding: '1rem 2.5rem',
            borderRadius: '16px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s',
            position: 'relative'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FiPlus size={18} /> {t('admin.products.add_new')}
          {pendingProducts.length > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px',
              background: 'var(--primary-color)', color: '#fff',
              padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem',
              border: '2px solid var(--bg-main)'
            }}>
              {pendingProducts.length}
            </span>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ display: 'flex', background: 'var(--bg-sub)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          {['all', 'published', 'pending_review'].map(tab => (
            <button key={tab} onClick={() => setFilterStatus(tab)} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, background: filterStatus === tab ? 'var(--text-main)' : 'transparent', color: filterStatus === tab ? 'var(--bg-main)' : 'var(--text-muted)' }}>
              {t(`admin.products.tabs.${tab}`)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input type="text" placeholder={t('common.search')} style={{ ...inputStyle, paddingLeft: '3rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setViewMode('grid')} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? 'var(--text-main)' : 'transparent', color: viewMode === 'grid' ? 'var(--bg-main)' : 'var(--text-muted)', cursor: 'pointer' }}><FiGrid size={18} /></button>
            <button onClick={() => setViewMode('list')} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'var(--text-main)' : 'transparent', color: viewMode === 'list' ? 'var(--bg-main)' : 'var(--text-muted)', cursor: 'pointer' }}><FiList size={18} /></button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {filteredProducts.map((product) => (
              <motion.div key={product._id} layout style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-sub)' }}>
                  <img src={product.images?.[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>{t(`shop.categories.${product.category}`, { defaultValue: product.category })}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{formatPrice(product.price)}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(product)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sub)', border: '1px solid var(--border-color)', cursor: 'pointer' }}><FiEdit size={14} /></button>
                    <button onClick={() => handleDelete(product._id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sub)', border: '1px solid var(--border-color)', color: 'var(--danger-color)', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-sub)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stock</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
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

      {/* Product Form Modal */}
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
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {editingProduct?.status === 'published' ? t('admin.products.modal.edit') : (editingProduct ? t('admin.products.modal.review') : t('admin.products.modal.new'))}
                </h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-sub)', border: 'none', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <FiX size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={labelStyle}>{t('admin.products.modal.labels.name')}</label>
                      <input {...register('name')} style={inputStyle} placeholder={t('admin.products.modal.placeholders.name')} />
                      {errors.name && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.name.message}</p>}
                    </div>

                    <div>
                      <label style={labelStyle}>{t('admin.products.modal.labels.description')}</label>
                      <textarea {...register('description')} rows="4" style={{ ...inputStyle, resize: 'none' }} placeholder={t('admin.products.modal.placeholders.description')} />
                      {errors.description && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.description.message}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.price')}</label>
                        <input {...register('price')} type="number" step="0.01" style={inputStyle} placeholder={t('admin.products.modal.placeholders.price')} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.stock')}</label>
                        <input {...register('stock')} type="number" style={inputStyle} placeholder={t('admin.products.modal.placeholders.stock')} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.category')}</label>
                        <input {...register('category')} style={inputStyle} placeholder={t('admin.products.modal.placeholders.category')} />
                        {errors.category && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.category.message}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.discount_price')}</label>
                        <input type="number" {...register('compareAtPrice')} style={inputStyle} placeholder={t('admin.products.modal.placeholders.discount_price')} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(163,230,53,0.05)', borderRadius: '12px', border: '1px solid rgba(163,230,53,0.2)' }}>
                      <input type="checkbox" {...register('broadcastPromotion')} id="broadcastPromotion" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      <label htmlFor="broadcastPromotion" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                        {t('admin.products.modal.labels.broadcast')}
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.brand')}</label>
                        <input {...register('brand')} style={inputStyle} placeholder={t('admin.products.modal.placeholders.brand')} />
                        {errors.brand && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.brand.message}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.shipping')}</label>
                        <input type="number" {...register('shippingPrice')} style={inputStyle} placeholder={t('admin.products.modal.placeholders.shipping')} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.composition')}</label>
                        <textarea {...register('composition')} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder={t('admin.products.modal.placeholders.composition')} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t('admin.products.modal.labels.returns')}</label>
                        <textarea {...register('returnPolicy')} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder={t('admin.products.modal.placeholders.returns')} />
                      </div>
                    </div>

                    {editingProduct?.supplier && (
                      <div style={{ padding: '1.5rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>{t('admin.products.modal.labels.supplier')}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('admin.products.modal.labels.supplier_name')}</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{editingProduct.supplier.name}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('admin.products.modal.labels.supplier_cost')}</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatPrice(editingProduct.supplier.costPrice)}</p>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('admin.products.modal.labels.supplier_contact')}</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{editingProduct.supplier.contact || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={labelStyle}>{t('admin.products.modal.labels.images')} {errors.images && <span style={{ color: 'var(--danger-color)', fontSize: '0.65rem', marginLeft: '0.5rem' }}>({errors.images.message})</span>}</label>
                        <button type="button" onClick={() => fileInputRef.current.click()} style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>{t('common.view_all')}</button>
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
                <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, height: '56px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>{t('common.cancel')}</button>
                <button 
                  onClick={handleSubmit(onSubmit, (err) => {
                    console.error(err);
                    toast.error('Please fill all required fields and upload at least one image');
                  })} 
                  style={{ flex: 2, height: '56px', borderRadius: '16px', background: 'var(--text-main)', border: 'none', color: 'var(--bg-main)', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  {editingProduct?.status === 'published' ? t('common.save') : t('common.publish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Source Selector Modal */}
      <AnimatePresence>
        {isSourceSelectorOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSourceSelectorOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'var(--bg-main)', opacity: 0.8, backdropFilter: 'blur(20px)' }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: 'var(--bg-card)',
                maxWidth: '500px',
                width: '100%',
                borderRadius: '32px',
                border: '1px solid var(--border-color)',
                position: 'relative',
                zIndex: 10,
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{t('admin.products.source_selector.title')}</h2>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('admin.products.source_selector.subtitle')}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setIsSourceSelectorOpen(false);
                    setIsSubmissionModalOpen(true);
                  }}
                  style={{
                    padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)',
                    background: 'var(--bg-sub)', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                    <FiList size={24} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '1rem' }}>{t('admin.products.source_selector.submissions.title')}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('admin.products.source_selector.submissions.desc')} ({pendingProducts.length})</p>
                  </div>
                </button>

                <button
                  onClick={startFresh}
                  style={{
                    padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)',
                    background: 'var(--bg-sub)', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                    <FiPlus size={24} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '1rem' }}>{t('admin.products.source_selector.scratch.title')}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('admin.products.source_selector.scratch.desc')}</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setIsSourceSelectorOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {t('common.cancel')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submission Selector Modal */}
      <AnimatePresence>
        {isSubmissionModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSubmissionModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'var(--bg-main)', opacity: 0.8, backdropFilter: 'blur(20px)' }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: 'var(--bg-card)',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '80vh',
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
              <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>Storekeeper Submissions</h2>
                <button onClick={() => setIsSubmissionModalOpen(false)} style={{ background: 'var(--bg-sub)', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <FiX size={18} />
                </button>
              </div>
              <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                {pendingProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <FiPackage size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>No pending submissions</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingProducts.map(product => (
                      <div
                        key={product._id}
                        onClick={() => handleSelectSubmission(product)}
                        style={{
                          padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border-color)',
                          background: 'var(--bg-sub)', cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', gap: '1.25rem', alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      >
                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
                          <img src={product.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{product.name}</p>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            <span>Stock: {product.stock}</span>
                            <span>Cost: {formatPrice(product.supplier?.costPrice || 0)}</span>
                          </div>
                        </div>
                        <FiChevronRight size={20} color="var(--primary-color)" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageProductsPage;
