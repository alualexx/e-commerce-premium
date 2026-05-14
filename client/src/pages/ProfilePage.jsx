import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiAlertCircle, FiSave, FiCheckCircle } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/api';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/users/profile', formData);
      await loadUser();
      toast.success(t('profile.messages.success'), {
        style: { background: 'var(--text-main)', color: 'var(--bg-main)', borderRadius: '12px', fontWeight: 700 }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem 1rem 3.5rem',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
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
    letterSpacing: '0.05em',
    paddingLeft: '0.5rem',
    marginBottom: '0.5rem',
    display: 'block'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '120px auto 60px', padding: '0 2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '3rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>{t('profile.title')}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('profile.description')}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>{t('profile.labels.name')}</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle} 
                  placeholder={t('profile.placeholders.name')} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>{t('profile.labels.email')}</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input 
                  value={formData.email}
                  disabled
                  style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} 
                  placeholder={t('profile.placeholders.email')} 
                />
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '0.5rem' }}>{t('profile.email_note')}</p>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-sub)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: '40px', height: '40px', background: 'var(--bg-card)', color: 'var(--primary-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                <FiShield size={20} />
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>
                {t('profile.privacy_note')}
             </p>
          </div>

           <button
            type="submit"
            disabled={loading}
            style={{ 
              alignSelf: 'flex-start',
              padding: '1rem 2.5rem',
              background: 'var(--text-main)', 
              color: 'var(--bg-main)', 
              borderRadius: '16px', 
              border: 'none', 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem', 
              transition: 'all 0.3s',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-color)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--text-main)'}
          >
            {loading ? <div className="spinner" /> : <><FiSave size={18} /> {t('profile.button.save')}</>}
          </button>
        </form>
      </motion.div>

      <style>{`
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--bg-main);
          border-top-color: transparent;
          borderRadius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ProfilePage;
