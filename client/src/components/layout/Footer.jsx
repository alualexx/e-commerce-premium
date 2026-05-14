import { Link } from 'react-router-dom';
import { 
  FiInstagram, FiTwitter, FiFacebook, FiMessageCircle, 
  FiX, FiSend, FiArrowRight, FiShield, FiTruck, FiRefreshCw 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [chatOpen, setChatOpen] = useState(false);
  const [email, setEmail] = useState('');

  const sectionHeaderStyle = {
    fontSize: '0.65rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
    color: 'var(--text-muted)',
    marginBottom: '2rem'
  };

  const navLinkStyle = {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-main)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    opacity: 0.8,
    display: 'inline-block'
  };

  const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: 'var(--bg-sub)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
  };

  return (
    <>
      <footer style={{ 
        background: 'var(--bg-main)', 
        padding: '6rem 6% 3rem',
        borderTop: '1px solid var(--border-color)',
        transition: 'background 0.3s ease',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* ════════════════════════════════════════
              NEWSLETTER SECTION
          ════════════════════════════════════════ */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingBottom: '5rem',
            flexWrap: 'wrap',
            gap: '3rem'
          }}>
            <div style={{ maxWidth: '450px' }}>
              <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                letterSpacing: '-0.04em', 
                lineHeight: 1,
                marginBottom: '1rem',
                color: 'var(--text-main)'
              }}>
                {t('footer.newsletter.title')}<span style={{ color: 'var(--primary-color)' }}>.</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
                {t('footer.newsletter.description')}
              </p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert(t('footer.newsletter.success') || 'Thank you for subscribing!');
                setEmail('');
              }}
              style={{ position: 'relative', width: '100%', maxWidth: '400px' }}
            >
              <input 
                type="email" 
                placeholder={t('footer.newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid var(--border-color)',
                  padding: '1rem 0',
                  fontSize: '1.1rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-main)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              <button 
                type="submit"
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '0.5rem'
                }}
              >
                {t('footer.newsletter.button')} <FiArrowRight />
              </button>
            </form>
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '5rem' }} />

          {/* ════════════════════════════════════════
              MAIN FOOTER CONTENT
          ════════════════════════════════════════ */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '4rem',
            marginBottom: '6rem'
          }}>
            
            {/* Brand Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', gridColumn: 'span 1.5' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: 900, 
                  fontSize: '2rem', 
                  color: 'var(--text-main)',
                  letterSpacing: '-0.04em'
                }}>
                  ALEX<span style={{ color: 'var(--primary-color)' }}>.</span>
                </span>
              </Link>
              <p style={{ 
                fontSize: '1rem', 
                lineHeight: 1.6, 
                color: 'var(--text-muted)', 
                fontWeight: 500,
                maxWidth: '300px'
              }}>
                {t('footer.brand_description')}
              </p>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                  <motion.a 
                    key={i} 
                    href="#" 
                    whileHover={{ scale: 1.1, color: 'var(--primary-color)' }}
                    style={{ 
                      color: 'var(--text-main)', 
                      background: 'var(--bg-sub)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Nav Columns */}
            <div>
              <h4 style={sectionHeaderStyle}>{t('footer.sections.collections.title')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: t('footer.sections.collections.items.all'), path: '/shop' },
                  { name: t('footer.sections.collections.items.new'), path: '/shop?sort=newest' },
                  { name: t('footer.sections.collections.items.best'), path: '/shop?sort=rating' },
                  { name: t('footer.sections.collections.items.archive'), path: '/shop' }
                ].map(item => (
                  <Link key={item.name} to={item.path} className="footer-link" style={navLinkStyle}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 style={sectionHeaderStyle}>{t('footer.sections.support.title')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: t('footer.sections.support.items.track'), path: '/track' },
                  { name: t('footer.sections.support.items.shipping'), path: '/about' },
                  { name: t('footer.sections.support.items.returns'), path: '/about' },
                  { name: t('footer.sections.support.items.help'), path: '/contact' }
                ].map(item => (
                  <Link key={item.name} to={item.path} className="footer-link" style={navLinkStyle}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 style={sectionHeaderStyle}>{t('footer.sections.legal.title')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: t('footer.sections.legal.items.terms'), path: '/about' },
                  { name: t('footer.sections.legal.items.privacy'), path: '/about' },
                  { name: t('footer.sections.legal.items.cookies'), path: '/about' },
                  { name: t('footer.sections.legal.items.imprint'), path: '/about' }
                ].map(item => (
                  <Link key={item.name} to={item.path} className="footer-link" style={navLinkStyle}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              TRUST BADGES
          ════════════════════════════════════════ */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '6rem'
          }}>
            <div style={featureItemStyle}>
              <div style={{ color: 'var(--primary-color)' }}><FiTruck size={24} /></div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0 }}>{t('footer.trust.shipping.title')}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t('footer.trust.shipping.desc')}</p>
              </div>
            </div>
            <div style={featureItemStyle}>
              <div style={{ color: 'var(--primary-color)' }}><FiShield size={24} /></div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0 }}>{t('footer.trust.payment.title')}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t('footer.trust.payment.desc')}</p>
              </div>
            </div>
            <div style={featureItemStyle}>
              <div style={{ color: 'var(--primary-color)' }}><FiRefreshCw size={24} /></div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0 }}>{t('footer.trust.returns.title')}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t('footer.trust.returns.desc')}</p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              BOTTOM BAR
          ════════════════════════════════════════ */}
          <div style={{ 
            paddingTop: '2.5rem', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>
                © {currentYear} {t('footer.copyright')}
              </p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                {t('footer.location')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#2563eb', background: 'rgba(37, 99, 235, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', letterSpacing: '0.02em' }}>telebirr</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#4f46e5', background: 'rgba(79, 70, 229, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', letterSpacing: '0.02em' }}>CBE Birr</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', letterSpacing: '0.02em' }}>CHAPA</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#dc2626', background: 'rgba(220, 38, 38, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', letterSpacing: '0.02em' }}>Abyssinia</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════
          CONCIERGE LIVE CHAT
      ════════════════════════════════════════ */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={{
                position: 'absolute', bottom: '80px', right: 0,
                width: '380px', height: '550px',
                background: 'var(--bg-card)', borderRadius: '32px',
                boxShadow: '0 30px 90px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}
            >
              {/* Chat Header */}
              <div style={{ padding: '2rem', background: 'var(--text-main)', color: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{t('footer.chat.title')}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }} />
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0, fontWeight: 600 }}>{t('footer.chat.status')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', border: 'none', 
                    borderRadius: '50%', width: '40px', height: '40px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'white', cursor: 'pointer', transition: 'background 0.2s' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-sub)' }}>
                <div style={{ 
                  background: 'var(--bg-card)', padding: '1.25rem', 
                  borderRadius: '20px 20px 20px 4px', border: '1px solid var(--border-color)', 
                  maxWidth: '85%', alignSelf: 'flex-start', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
                }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6 }}>
                    {t('footer.chat.welcome')}
                  </p>
                </div>
              </div>

              {/* Chat Input */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                <input 
                  placeholder={t('footer.chat.placeholder')}
                  style={{ 
                    flex: 1, background: 'var(--bg-sub)', border: '1px solid var(--border-color)', 
                    borderRadius: '16px', padding: '0.875rem 1.25rem', color: 'var(--text-main)', 
                    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' 
                  }} 
                  onFocus={e => e.target.style.borderColor = 'var(--text-main)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button 
                  onClick={() => alert('Support message sent! Our team will respond shortly.')}
                  style={{ 
                    width: '50px', height: '50px', background: 'var(--text-main)', 
                    color: 'var(--bg-main)', border: 'none', borderRadius: '16px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: 'pointer', transition: 'transform 0.2s' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--text-main)', color: 'var(--bg-main)',
            border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
          }}
        >
          {chatOpen ? <FiX size={32} /> : <FiMessageCircle size={32} />}
          {!chatOpen && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute', top: 0, right: 0,
                width: '18px', height: '18px', background: 'var(--primary-color)',
                borderRadius: '50%', border: '3px solid var(--bg-main)'
              }}
            />
          )}
        </motion.button>
      </div>

      <style>{`
        .footer-link:hover { 
          opacity: 1 !important; 
          color: var(--primary-color) !important;
          transform: translateX(4px);
        }
      `}</style>
    </>
  );
};

export default Footer;
