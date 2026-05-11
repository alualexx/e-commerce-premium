import { motion } from 'framer-motion';
import { FiTarget, FiHeart, FiShield, FiStar } from 'react-icons/fi';

const AboutPage = () => {
  const stats = [
    { label: 'Founded', value: '2024' },
    { label: 'Artisans', value: '250+' },
    { label: 'Sustainability', value: '100%' },
    { label: 'Countries', value: '45' },
  ];

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>
      {/* Hero Section */}
      <section style={{ 
        height: '60vh', 
        background: 'var(--bg-card)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 6%'
      }}>
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--primary-color)', marginBottom: '1.5rem' }}
        >
          Our Story
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '2rem' }}
        >
          Elevating the <br /> <span style={{ color: 'var(--primary-color)' }}>Everyday.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ maxWidth: '600px', fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}
        >
          Alex Retail was founded on a simple principle: high-fidelity design should be accessible, sustainable, and soulful. We curate collections that speak to the modern minimalist.
        </motion.p>
      </section>

      {/* Philosophy Section */}
      <section style={{ padding: '8rem 6%', maxWidth: '1400px', margin: '0 auto' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
          <div>
            <FiTarget size={32} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>To redefine the digital shopping experience through artisanal craftsmanship and eco-conscious sourcing.</p>
          </div>
          <div>
            <FiShield size={32} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Ethics First</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>Every partner in our supply chain is vetted for fair wages and environmental impact standards.</p>
          </div>
          <div>
            <FiHeart size={32} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Community</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>We reinvest 5% of all profits into local artisan workshops to preserve traditional techniques.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: 'var(--bg-sub)', padding: '6rem 6%', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '3rem' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing Section */}
      <section style={{ padding: '10rem 6%', textAlign: 'center' }}>
        <FiStar size={40} color="var(--primary-color)" style={{ marginBottom: '2rem' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>The Future of Retail is Conscious.</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem' }}>Join us on our journey to create a more beautiful world.</p>
      </section>
    </div>
  );
};

export default AboutPage;
