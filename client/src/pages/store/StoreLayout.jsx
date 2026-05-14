import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiBox, FiHome, FiLogOut, FiPackage, FiSettings, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import { useEffect } from 'react';

const StoreLayout = () => {
  const { user, logout, isHydrated, loading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    const allowedRoles = ['store_keeper', 'admin'];
    if (isHydrated && (!user || !allowedRoles.includes(user.role))) {
      navigate('/login');
    }
  }, [user, navigate, isHydrated]);

  if (!isHydrated || (loading && !user)) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <FiBox className="animate-spin" size={48} color="var(--primary-color)" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 20px', borderRadius: '12px', textDecoration: 'none',
    fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s ease',
    background: isActive ? 'var(--primary-color)' : 'transparent',
    color: isActive ? '#fff' : 'var(--text-secondary)',
    opacity: isActive ? 1 : 0.7,
    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'background 0.3s ease' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', flexShrink: 0,
        transition: 'background 0.3s ease'
      }}>
        {/* Brand */}
        <div style={{ padding: '8px 16px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <FiBox size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>ALEX STORE</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Keeper Portal</p>
            </div>
          </div>

          <button 
            onClick={toggleTheme}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: '1px solid var(--border-color)', background: 'var(--bg-sub)',
              color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <NavLink to="/store" end style={({ isActive }) => linkStyle(isActive)}>
            <FiHome size={18} /> Dashboard
          </NavLink>
          <NavLink to="/store/inventory" style={({ isActive }) => linkStyle(isActive)}>
            <FiPackage size={18} /> Inventory
          </NavLink>
          <NavLink to="/store/settings" style={({ isActive }) => linkStyle(isActive)}>
            <FiSettings size={18} /> Settings
          </NavLink>
        </nav>

        {/* User Card */}
        <div style={{
          padding: '16px', borderRadius: '16px', background: 'var(--bg-sub)',
          border: '1px solid var(--border-color)', marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '0.9rem'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: '700', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name || 'Store Keeper'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)',
            background: 'var(--bg-danger-light)', color: 'var(--danger-color)', cursor: 'pointer',
            fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s ease'
          }}>
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StoreLayout;
