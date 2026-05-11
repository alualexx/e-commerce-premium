import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out. Our concierge will contact you shortly.');
  };

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
      {/* Hero */}
      <section style={{ padding: '8rem 6% 4rem', textAlign: 'center', background: 'var(--bg-card)' }}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}
        >
          Connect with <span style={{ color: 'var(--primary-color)' }}>Us.</span>
        </motion.h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Our concierge team is available 24/7 for your premium retail needs.</p>
      </section>

      <section style={{ padding: '6rem 6%', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem' }}>
          {/* Info Side */}
          <div>
            <div style={{ marginBottom: '4rem' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>Contact Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--bg-sub)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '1px solid var(--border-color)' }}>
                    <FiMail size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '4px' }}>Email Us</div>
                    <div style={{ fontWeight: 700 }}>concierge@alexretail.com</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--bg-sub)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '1px solid var(--border-color)' }}>
                    <FiPhone size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '4px' }}>Call Us</div>
                    <div style={{ fontWeight: 700 }}>+1 (888) ALEX-PREMIUM</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--bg-sub)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '1px solid var(--border-color)' }}>
                    <FiMapPin size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '4px' }}>Visit Us</div>
                    <div style={{ fontWeight: 700 }}>452 Luxury Way, New York, NY</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '2rem', background: 'var(--text-main)', borderRadius: '24px', color: 'var(--bg-main)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <FiClock color="var(--primary-color)" size={20} />
                <span style={{ fontWeight: 700 }}>Boutique Hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                <span>Mon — Fri</span>
                <span>09:00 — 21:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', opacity: 0.8 }}>
                <span>Sat — Sun</span>
                <span>10:00 — 18:00</span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div style={{ background: 'var(--bg-card)', padding: '3.5rem', borderRadius: '32px', border: '1px solid var(--border-color)', boxShadow: '0 30px 60px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2.5rem' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Full Name</label>
                  <input type="text" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email Address</label>
                  <input type="email" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Message</label>
                <textarea rows="5" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', outline: 'none', resize: 'none' }}></textarea>
              </div>
              <button type="submit" style={{ 
                background: 'var(--text-main)', color: 'var(--bg-main)', padding: '1.25rem', borderRadius: '16px', 
                border: 'none', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-color)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--text-main)'}
              >
                Send Inquiry <FiSend />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
