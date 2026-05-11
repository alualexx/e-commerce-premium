import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCompass, FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#fdfdfc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          maxWidth: '540px',
          width: '100%',
          background: '#fff',
          borderRadius: '48px',
          border: '1px solid #f0f0ec',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
          padding: '4rem',
          textAlign: 'center'
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: '80px',
            height: '80px',
            background: '#fdfdfc',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2.5rem',
            color: '#111',
            border: '1px solid #f0f0ec'
          }}
        >
          <FiCompass size={36} />
        </motion.div>

        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '6rem', fontWeight: 900, color: '#111', letterSpacing: '-0.05em', lineHeight: 1 }}>404</h1>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Page Not Found</h2>
          <p style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: 500, lineHeight: 1.6, maxWidth: '320px', margin: '0 auto' }}>
            The destination you're looking for doesn't exist or has been moved to a new collection.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link 
            to="/" 
            style={{
              height: '64px',
              background: '#111',
              color: '#fff',
              borderRadius: '16px',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
          >
            <FiHome size={18} /> Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            style={{
              height: '64px',
              background: '#f3f4f6',
              color: '#111',
              borderRadius: '16px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FiArrowLeft size={18} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
