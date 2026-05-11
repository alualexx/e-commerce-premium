import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sectionHeaderStyle = {
    fontSize: '0.625rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: 'var(--text-muted)',
    marginBottom: '2rem'
  };

  const navLinkStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'opacity 0.3s ease'
  };

  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <footer style={{ 
        background: 'var(--bg-main)', 
        padding: '8rem 6% 4rem',
        borderTop: '1px solid var(--border-color)',
        transition: 'background 0.3s ease'
      }}>
        {/* ... existing footer content ... */}
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Main Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr', 
            gap: '4rem',
            marginBottom: '8rem'
          }}>
            
            {/* Brand & Mission */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: 900, 
                  fontSize: '1.8rem', 
                  color: 'var(--text-main)',
                  letterSpacing: '-0.04em'
                }}>
                  ALEX<span style={{ color: 'var(--primary-color)' }}>.</span>
                </span>
              </Link>
              <p style={{ 
                fontSize: '1.125rem', 
                lineHeight: 1.6, 
                color: 'var(--text-main)', 
                fontWeight: 500,
                maxWidth: '320px'
              }}>
                Curating high-performance minimalist essentials for the modern architectural lifestyle.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                  <motion.a 
                    key={i} 
                    href="#" 
                    whileHover={{ opacity: 0.6 }}
                    style={{ color: 'var(--text-main)', transition: 'opacity 0.3s ease' }}
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Nav Sections */}
            <div>
              <h4 style={sectionHeaderStyle}>Boutique</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {['New Arrivals', 'Best Sellers', 'Collections', 'Limited Edition'].map(item => (
                  <Link key={item} to="/shop" style={navLinkStyle} className="footer-nav-link">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 style={sectionHeaderStyle}>Concierge</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {['Track Order', 'Shipping', 'Returns', 'Size Guide'].map(item => (
                  <Link key={item} to={item === 'Track Order' ? '/track' : '#'} style={navLinkStyle} className="footer-nav-link">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 style={sectionHeaderStyle}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {['Privacy Policy', 'Terms of Service', 'Cookies', 'Accessibility'].map(item => (
                  <Link key={item} to="#" style={navLinkStyle} className="footer-nav-link">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ 
            paddingTop: '3rem', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                HEADQUARTERS
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Addis Ababa, Ethiopia. Global Distribution.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                © {currentYear} ALEX RETAIL GROUP. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Concierge Live Chat Widget */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, originY: 'bottom', originX: 'right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={{
                position: 'absolute', bottom: '80px', right: 0,
                width: '360px', height: '500px',
                background: 'var(--bg-card)', borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}
            >
              {/* Chat Header */}
              <div style={{ padding: '1.5rem', background: 'var(--text-main)', color: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Concierge Live</h4>
                  <p style={{ fontSize: '0.7rem', opacity: 0.7, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Available · Typically replies in 5m</p>
                </div>
                <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                  <FiX size={18} />
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-sub)' }}>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '16px 16px 16px 4px', border: '1px solid #e5e7eb', maxWidth: '85%', alignSelf: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.875rem', color: '#111', margin: 0, lineHeight: 1.5 }}>
                    Greetings from Alex Concierge. How may we assist you with your order or fulfillment inquiry today?
                  </p>
                </div>
              </div>

              {/* Chat Input */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                <input 
                  placeholder="Type your message..." 
                  style={{ flex: 1, background: 'var(--bg-sub)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} 
                />
                <button style={{ width: '44px', height: '44px', background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiSend size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--text-main)', color: 'var(--bg-main)',
            border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {chatOpen ? <FiX size={28} /> : <FiMessageCircle size={28} />}
        </motion.button>
      </div>

      <style>{`
        .footer-nav-link:hover { opacity: 0.5; }
      `}</style>
    </>
  );
};

export default Footer;
