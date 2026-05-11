import { motion } from 'framer-motion';
import { FiActivity } from 'react-icons/fi';

const LoadingScreen = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-main)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ position: 'relative' }}>
         {/* Elegant pulse shells */}
         <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ position: 'absolute', inset: 0, background: 'var(--primary-color)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.1 }}
         />
         <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{ position: 'absolute', inset: 0, background: 'var(--accent-color)', borderRadius: '50%', filter: 'blur(30px)', opacity: 0.1 }}
         />
         
         <div style={{ position: 'relative', width: '96px', height: '96px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
            <motion.div
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
               style={{ position: 'relative', zIndex: 10 }}
            >
               <FiActivity size={32} strokeWidth={2} />
            </motion.div>
         </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
         <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--text-main)' }}
         >
            Initializing Experience
         </motion.h2>
         <div style={{ width: '128px', height: '2px', background: 'var(--bg-sub)', borderRadius: '999px', margin: '1rem auto', position: 'relative', overflow: 'hidden' }}>
            <motion.div 
               animate={{ left: ['-100%', '100%'] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               style={{ position: 'absolute', top: 0, bottom: 0, width: '66%', background: 'var(--primary-color)', borderRadius: '999px', boxShadow: '0 0 10px var(--primary-color)' }}
            />
         </div>
      </div>

      <div style={{ position: 'fixed', bottom: '3rem', textAlign: 'center' }}>
         <p style={{ fontSize: '0.5rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Aesthetic Integrity Verified</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
