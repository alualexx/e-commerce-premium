import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiGlobe, FiDollarSign, FiShare2, FiSave, 
  FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  
  // Mock settings state
  const [settings, setSettings] = useState({
    storeName: 'Alex Retail',
    supportEmail: 'support@alexretail.com',
    phone: '+251 911 223 344',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    taxRate: 15,
    deliveryFee: 150,
    freeShippingThreshold: 5000,
    facebook: 'https://facebook.com/alexretail',
    instagram: 'https://instagram.com/alexretail',
    twitter: 'https://twitter.com/alexretail'
  });

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success(t('admin.settings.save_success') || 'Settings updated successfully', {
        style: {
          background: 'var(--text-main)',
          color: 'var(--bg-main)',
          borderRadius: '12px',
          fontWeight: 700,
          fontFamily: 'Outfit, sans-serif'
        }
      });
    }, 1500);
  };

  const sectionStyle = {
    background: 'var(--card-bg)',
    borderRadius: '24px',
    padding: '2.5rem',
    border: '1px solid var(--border-color)',
    marginBottom: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    paddingLeft: '0.25rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-sub)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontWeight: 700,
    outline: 'none',
    transition: 'all 0.3s'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
            {t('admin.settings.title')}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {t('admin.settings.subtitle')}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '1rem 2.5rem',
            background: 'var(--text-main)',
            color: 'var(--bg-main)',
            borderRadius: '14px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {saving ? (
            <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid var(--bg-main)', borderTopColor: 'transparent', borderRadius: '50%' }} />
          ) : <FiSave size={18} />}
          {saving ? t('admin.settings.saving') : t('admin.settings.save')}
        </button>
      </div>

      <div style={gridStyle}>
        {/* General Identity */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-sub)', color: 'var(--primary-color)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
              <FiGlobe size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
              {t('admin.settings.sections.general.title')}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.general.store_name')}</label>
              <input 
                value={settings.storeName} 
                onChange={e => setSettings({...settings, storeName: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.general.support_email')}</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  value={settings.supportEmail} 
                  onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                  style={{ ...inputStyle, paddingLeft: '3.5rem' }} 
                />
              </div>
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.general.phone')}</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  value={settings.phone} 
                  onChange={e => setSettings({...settings, phone: e.target.value})}
                  style={{ ...inputStyle, paddingLeft: '3.5rem' }} 
                />
              </div>
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.general.address')}</label>
              <div style={{ position: 'relative' }}>
                <FiMapPin style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  value={settings.address} 
                  onChange={e => setSettings({...settings, address: e.target.value})}
                  style={{ ...inputStyle, paddingLeft: '3.5rem' }} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Operational Params */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-sub)', color: 'var(--primary-color)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
              <FiDollarSign size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
              {t('admin.settings.sections.financial.title')}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.financial.tax')}</label>
              <input 
                type="number"
                value={settings.taxRate} 
                onChange={e => setSettings({...settings, taxRate: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.financial.delivery')}</label>
              <input 
                type="number"
                value={settings.deliveryFee} 
                onChange={e => setSettings({...settings, deliveryFee: e.target.value})}
                style={inputStyle} 
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.financial.threshold')}</label>
              <input 
                type="number"
                value={settings.freeShippingThreshold} 
                onChange={e => setSettings({...settings, freeShippingThreshold: e.target.value})}
                style={inputStyle} 
              />
            </div>
          </div>
        </section>

        {/* Social Presence */}
        <section style={{ ...sectionStyle, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-sub)', color: 'var(--primary-color)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
              <FiShare2 size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
              {t('admin.settings.sections.social.title')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.social.facebook')}</label>
              <div style={{ position: 'relative' }}>
                <FiFacebook style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  value={settings.facebook} 
                  onChange={e => setSettings({...settings, facebook: e.target.value})}
                  style={{ ...inputStyle, paddingLeft: '3.5rem' }} 
                />
              </div>
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.social.instagram')}</label>
              <div style={{ position: 'relative' }}>
                <FiInstagram style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  value={settings.instagram} 
                  onChange={e => setSettings({...settings, instagram: e.target.value})}
                  style={{ ...inputStyle, paddingLeft: '3.5rem' }} 
                />
              </div>
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t('admin.settings.sections.social.twitter')}</label>
              <div style={{ position: 'relative' }}>
                <FiTwitter style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  value={settings.twitter} 
                  onChange={e => setSettings({...settings, twitter: e.target.value})}
                  style={{ ...inputStyle, paddingLeft: '3.5rem' }} 
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AdminSettingsPage;
