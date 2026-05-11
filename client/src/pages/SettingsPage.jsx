import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiBell, FiEye, FiEyeOff, FiShield, FiSave, FiSmartphone, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    orders: true,
    promo: false,
    security: true
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock functionality for now
    setTimeout(() => {
       toast.success('Password updated successfully', {
        style: { background: 'var(--text-main)', color: 'var(--bg-main)', borderRadius: '12px', fontWeight: 700 }
      });
      setLoading(false);
    }, 1500);
  };

   const sectionStyle = {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    padding: '2.5rem',
    border: '1px solid var(--border-color)',
    marginBottom: '2rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
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

   const toggleStyle = (active) => ({
    width: '44px',
    height: '24px',
    borderRadius: '20px',
    background: active ? 'var(--primary-color)' : 'var(--border-color)',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px'
  });

  return (
    <div style={{ maxWidth: '800px', margin: '120px auto 60px', padding: '0 2rem' }}>
       <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Account Settings</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Manage your security preferences and notification settings.</p>
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={sectionStyle}
      >
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--bg-sub)', color: 'var(--primary-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <FiLock size={20} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>Security</h2>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Current Password</label>
               <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input 
                  type={showCurrentPass ? 'text' : 'password'}
                  style={inputStyle} 
                  placeholder="••••••••" 
                />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showCurrentPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
               <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input 
                  type={showNewPass ? 'text' : 'password'}
                  style={inputStyle} 
                  placeholder="••••••••" 
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showNewPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          </div>
           <button
            type="submit"
            disabled={loading}
            style={{ 
              alignSelf: 'flex-start',
              padding: '0.875rem 2rem',
              background: 'var(--text-main)', 
              color: 'var(--bg-main)', 
              borderRadius: '12px', 
              border: 'none', 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              cursor: 'pointer',
              marginTop: '1rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-color)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--text-main)'}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={sectionStyle}
      >
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--bg-sub)', color: 'var(--primary-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <FiBell size={20} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>Notifications</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {[
            { id: 'orders', title: 'Order Updates', desc: 'Receive emails about your order status and shipping.', icon: FiSmartphone },
            { id: 'promo', title: 'Promotions', desc: 'Hear about new arrivals, sales, and exclusive drops.', icon: FiGlobe },
            { id: 'security', title: 'Security Alerts', desc: 'Get notified about logins from new devices.', icon: FiShield }
          ].map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                 <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sub)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <item.icon size={16} />
                 </div>
                 <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.desc}</p>
                 </div>
              </div>
               <button 
                onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id] })}
                style={toggleStyle(notifications[item.id])}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-main)', transform: notifications[item.id] ? 'translateX(20px)' : 'translateX(0)', transition: 'all 0.3s' }} />
              </button>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default SettingsPage;
