import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiArrowRight, FiX, FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/api';

const DISMISSED_KEY = (id) => `promo_dismissed_${id}`;

const PromotionBanner = () => {
  const [promotion, setPromotion] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // controlled by localStorage check

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const { data } = await axiosInstance.get('/notifications/latest-promotion');
        if (data && data.type === 'promotion') {
          const isRecent = (new Date() - new Date(data.createdAt)) < 7 * 24 * 60 * 60 * 1000;
          if (isRecent) {
            setPromotion(data);
            // Only show if user hasn't dismissed this specific promotion
            const wasDismissed = localStorage.getItem(DISMISSED_KEY(data._id));
            setIsVisible(!wasDismissed);
          }
        }
      } catch (error) {
        console.error('Failed to fetch promotion:', error);
      }
    };

    fetchPromotion();
  }, []);

  useEffect(() => {
    if (promotion && isVisible) {
      document.documentElement.style.setProperty('--banner-height', '44px');
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
    return () => document.documentElement.style.setProperty('--banner-height', '0px');
  }, [promotion, isVisible]);

  if (!promotion || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: '44px', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        style={{
          background: '#a3e635',
          color: '#111',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          height: '44px'
        }}
      >
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0.75rem 6%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              background: 'rgba(0,0,0,0.1)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <FiBell size={12} /> News Release
            </span>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              {promotion.title}
            </p>
          </div>

          <Link
            to={promotion.link || '/shop'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#111',
              color: '#fff',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textDecoration: 'none',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Claim Offer <FiArrowRight size={14} />
          </Link>

          <button
            onClick={() => {
              setIsVisible(false);
              if (promotion?._id) {
                localStorage.setItem(DISMISSED_KEY(promotion._id), 'true');
              }
            }}
            style={{
              position: 'absolute',
              right: '6%',
              background: 'transparent',
              border: 'none',
              color: '#111',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              opacity: 0.6,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
          >
            <FiX size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromotionBanner;
