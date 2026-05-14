import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { user, isHydrated, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isHydrated && !user && !loading) {
      // Redirect to login with the current path as a redirect parameter
      const redirectPath = location.pathname.startsWith('/') 
        ? location.pathname.substring(1) 
        : location.pathname;
      
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [user, isHydrated, loading, navigate, location]);

  if (!isHydrated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-main)',
        gap: '1.5rem'
      }}>
        <div className="animate-spin" style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid var(--border-color)', 
          borderTopColor: 'var(--primary-color)', 
          borderRadius: '50%' 
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Verifying your session...</p>
      </div>
    );
  }

  return user ? children : null;
};

export default ProtectedRoute;
