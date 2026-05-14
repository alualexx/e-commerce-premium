import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiTruck, FiCreditCard, FiCheckCircle, FiChevronRight, FiChevronLeft, FiMapPin, FiShield, FiShoppingBag } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import axiosInstance from '../utils/axios';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { t } = useTranslation();

  const checkoutSchema = z.object({
    fullName: z.string().min(3, t('checkout.validation.name_required')),
    address: z.string().min(5, t('checkout.validation.address_required')),
    city: z.string().min(2, t('checkout.validation.city_required')),
    phone: z.string().regex(/^\+?251\d{9}$/, t('checkout.validation.phone_invalid')),
    paymentMethod: z.enum(['telebirr', 'cbe_birr', 'abyssinia', 'chapa', 'cash_on_delivery']),
  });

  const steps = [
    { id: 'shipping', label: t('checkout.steps.shipping'), icon: <FiMapPin /> },
    { id: 'payment', label: t('checkout.steps.payment'), icon: <FiCreditCard /> },
    { id: 'review', label: t('checkout.steps.review'), icon: <FiCheckCircle /> },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const { items, totalPrice, shippingPrice, taxPrice, grandTotal, clearCart } = useCartStore();
  
  const itemsPriceValue = totalPrice();
  const shippingPriceValue = shippingPrice();
  const taxPriceValue = taxPrice();
  const grandTotalValue = grandTotal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
      paymentMethod: 'telebirr', 
      city: 'Addis Ababa',
      fullName: user?.name || '',
    }
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (paymentMethod === 'cash_on_delivery' && grandTotalValue > 5000) {
      setValue('paymentMethod', 'telebirr');
      toast.error(t('checkout.validation.cod_limit'));
    }
  }, [grandTotalValue, paymentMethod, setValue]);

  const onSubmit = async (data) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    try {
      const { paymentMethod, ...shippingAddress } = data;
      const orderData = {
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: itemsPriceValue,
        shippingPrice: shippingPriceValue,
        taxPrice: taxPriceValue,
        totalPrice: grandTotalValue
      };

      const response = await axiosInstance.post('/orders', orderData);
      const order = response.data;
      
      if (order && order._id) {
        clearCart();
        if (data.paymentMethod === 'cash_on_delivery') {
          navigate(`/payment/success?orderId=${order._id}`);
        } else {
          navigate(`/payment/process?orderId=${order._id}&method=${data.paymentMethod}`);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || t('checkout.validation.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = (id) => {
    const providers = {
      telebirr: t('checkout.payment.providers.telebirr'),
      cbe_birr: t('checkout.payment.providers.cbe_birr'),
      abyssinia: t('checkout.payment.providers.abyssinia'),
      chapa: t('checkout.payment.providers.chapa'),
      cash_on_delivery: t('checkout.payment.providers.cash_on_delivery')
    };
    return providers[id] || id;
  };

    if (!items || items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', margin: '0 auto 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <FiShoppingBag size={32} />
          </div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem' }}>{t('checkout.no_items.title')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>{t('checkout.no_items.description')}</p>
          <Link to="/shop" style={{ background: 'var(--text-main)', color: 'var(--bg-main)', padding: '1rem 2rem', borderRadius: '999px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.3s' }} onMouseEnter={e => e.target.style.background = 'var(--primary-color)'} onMouseLeave={e => e.target.style.background = 'var(--text-main)'}>{t('checkout.no_items.button')}</Link>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '1.25rem 1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'all 0.3s'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.75rem',
    display: 'block'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 6%' }}>
        
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem', position: 'relative' }}>
             <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'var(--border-color)', zIndex: 0 }}>
                <div style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, height: '100%', background: 'var(--primary-color)' }} />
             </div>

             {steps.map((s, i) => (
                <div key={s.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ 
                     width: '48px', 
                     height: '48px', 
                     borderRadius: '16px', 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center', 
                     background: i <= currentStep ? 'var(--text-main)' : 'var(--bg-card)',
                     color: i <= currentStep ? 'var(--bg-main)' : 'var(--text-muted)',
                     border: '1px solid',
                     borderColor: i <= currentStep ? 'var(--text-main)' : 'var(--border-color)',
                     transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                   }}>
                     {i < currentStep ? <FiCheckCircle size={20} /> : s.icon}
                   </div>
                   <span style={{ fontSize: '0.7rem', fontWeight: 800, color: i <= currentStep ? 'var(--text-main)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
                </div>
             ))}
          </div>
        </div>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'start' }}
        >
          
          <div style={{ flex: 2 }}>
            {currentStep === 0 && (
                <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--text-main)' }}>{t('checkout.shipping.title')}</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                      <label style={labelStyle}>{t('checkout.shipping.full_name.label')}</label>
                      <input {...register('fullName')} style={inputStyle} placeholder={t('checkout.shipping.full_name.placeholder')} />
                      {errors.fullName && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>{errors.fullName.message}</p>}
                    </div>

                    <div>
                      <label style={labelStyle}>{t('checkout.shipping.address.label')}</label>
                      <input {...register('address')} style={inputStyle} placeholder={t('checkout.shipping.address.placeholder')} />
                      {errors.address && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>{errors.address.message}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={labelStyle}>{t('checkout.shipping.city.label')}</label>
                        <input {...register('city')} style={inputStyle} placeholder={t('checkout.shipping.city.placeholder')} />
                        {errors.city && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>{errors.city.message}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>{t('checkout.shipping.phone.label')}</label>
                        <input {...register('phone')} style={inputStyle} placeholder={t('checkout.shipping.phone.placeholder')} />
                        {errors.phone && <p style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>{errors.phone.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--text-main)' }}>Payment Method</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {[
                       { id: 'telebirr', name: t('checkout.payment.providers.telebirr'), desc: t('checkout.payment.providers.telebirr_desc') },
                       { id: 'cbe_birr', name: t('checkout.payment.providers.cbe_birr'), desc: t('checkout.payment.providers.cbe_birr_desc') },
                       { id: 'abyssinia', name: t('checkout.payment.providers.abyssinia'), desc: t('checkout.payment.providers.abyssinia_desc') },
                       { id: 'chapa', name: t('checkout.payment.providers.chapa'), desc: t('checkout.payment.providers.chapa_desc') },
                       { id: 'cash_on_delivery', name: t('checkout.payment.providers.cash_on_delivery'), desc: t('checkout.payment.providers.cash_on_delivery_desc'), limit: 5000 }
                    ].filter(m => !m.limit || grandTotalValue <= m.limit).map(m => (
                       <label key={m.id} style={{ 
                        position: 'relative', 
                        padding: '1.75rem', 
                        borderRadius: '24px', 
                        border: '2px solid', 
                        borderColor: paymentMethod === m.id ? 'var(--primary-color)' : 'var(--border-color)',
                        background: paymentMethod === m.id ? 'var(--bg-sub)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}>
                        <input {...register('paymentMethod')} type="radio" value={m.id} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', background: paymentMethod === m.id ? 'var(--primary-color)' : 'var(--bg-sub)', color: paymentMethod === m.id ? 'var(--bg-main)' : 'var(--text-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {m.id === 'telebirr' && <FiShield size={20} />}
                            {m.id === 'cbe_birr' && <FiShield size={20} />}
                            {m.id === 'abyssinia' && <FiCreditCard size={20} />}
                            {m.id === 'chapa' && <FiShield size={20} />}
                            {m.id === 'cash_on_delivery' && <FiTruck size={20} />}
                          </div>
                          {paymentMethod === m.id && <FiCheckCircle size={20} color="var(--primary-color)" />}
                        </div>
                        <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem' }}>{m.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.desc}</p>
                      </label>
                    ))}
                  </div>

                  {grandTotalValue > 5000 && (
                    <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiShield size={14} /> {t('checkout.payment.note')}
                    </p>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                   <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--text-main)' }}>Review Order</h2>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div style={{ padding: '2rem', background: 'var(--text-main)', borderRadius: '24px', color: 'var(--bg-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                          <FiMapPin size={18} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('checkout.review.shipping_to')}</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{watch('fullName')}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', opacity: 0.8, lineHeight: 1.6 }}>{watch('address')}<br />{watch('city')}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', opacity: 0.8, marginTop: '1rem' }}>{watch('phone')}</p>
                      </div>

                       <div style={{ padding: '2rem', background: 'var(--bg-sub)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                          <FiCreditCard size={18} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('checkout.review.payment_method')}</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{getProviderName(paymentMethod)}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('checkout.review.safe_secure')}</p>
                        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)' }} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success-color)', textTransform: 'uppercase' }}>{t('checkout.review.verified')}</span>
                        </div>
                      </div>
                   </div>
                </div>
              )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', padding: '1.5rem 2.5rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  background: 'none', 
                  border: 'none', 
                  color: currentStep === 0 ? 'var(--border-color)' : 'var(--text-muted)', 
                  fontWeight: 800, 
                  fontSize: '0.875rem', 
                  cursor: currentStep === 0 ? 'default' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <FiChevronLeft /> {t('checkout.actions.back')}
              </button>
              
              <button
                type="submit"
                disabled={loading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  background: 'var(--text-main)', 
                  color: 'var(--bg-main)', 
                  padding: '1rem 2.5rem', 
                  borderRadius: '16px', 
                  border: 'none',
                  fontWeight: 800, 
                  fontSize: '0.875rem', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--primary-color)'}
                onMouseLeave={e => e.target.style.background = 'var(--text-main)'}
              >
                {loading ? t('checkout.actions.processing') : (currentStep === steps.length - 1 ? t('checkout.actions.complete') : t('checkout.actions.continue'))}
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '320px' }}>
            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '2.5rem', 
              borderRadius: '32px', 
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
              position: 'sticky',
              top: '120px'
            }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '2rem' }}>{t('checkout.summary.title')}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '1rem' }}>
                 {items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-sub)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <img src={item.images?.[0] || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('checkout.summary.selection')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {items.map((item) => (
                    <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-sub)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>{t('checkout.summary.subtotal')}</span>
                  <span>{formatPrice(itemsPriceValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>{t('checkout.summary.shipping')}</span>
                  <span>{shippingPriceValue === 0 ? t('cart.summary.free') : formatPrice(shippingPriceValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>{t('checkout.summary.tax')}</span>
                  <span>{formatPrice(taxPriceValue)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '1.5rem', 
                  paddingTop: '1.5rem', 
                  borderTop: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  <span>Total</span>
                  <span>{formatPrice(grandTotalValue)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                 <FiShield style={{ color: 'var(--primary-color)' }} size={20} />
                 <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('checkout.summary.security')}
                 </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
