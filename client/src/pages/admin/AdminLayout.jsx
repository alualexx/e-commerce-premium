import { useState, useEffect, Suspense } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLayout, FiBox, FiShoppingBag, FiUsers, FiSettings, 
  FiLogOut, FiMenu, FiX, FiBell, FiSearch, FiActivity, FiChevronRight, FiMoon, FiSun, FiDollarSign, FiMapPin 
} from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import api from '../../utils/api';


const AdminLayout = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading, isHydrated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all read');
    }
  };

  // Redirect if not admin or cashier, but wait for hydration
  useEffect(() => {
    if (isHydrated && (!user || (user.role !== 'admin' && user.role !== 'cashier'))) {
      navigate('/login');
    }
  }, [user, navigate, isHydrated]);

  if (!isHydrated || (loading && !user)) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <FiActivity className="animate-spin" size={48} color="var(--primary-color)" />
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', icon: FiLayout, label: t('admin.nav.overview'), roles: ['admin', 'cashier'] },
    { path: '/admin/pos', icon: FiShoppingBag, label: 'POS Portal', roles: ['admin', 'cashier'] },
    { path: '/admin/products', icon: FiBox, label: t('admin.nav.inventory'), roles: ['admin'] },
    { path: '/admin/orders', icon: FiShoppingBag, label: t('admin.nav.orders'), roles: ['admin'] },
    { path: '/admin/users', icon: FiUsers, label: t('admin.nav.customers'), roles: ['admin'] },
    { path: '/admin/tracking', icon: FiMapPin, label: t('admin.nav.tracking'), roles: ['admin'] },
    { path: '/admin/finance', icon: FiDollarSign, label: t('admin.nav.finance'), roles: ['admin', 'cashier'] },
    { path: '/admin/settings', icon: FiSettings, label: t('admin.nav.settings'), roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--border-color)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '10px 0 30px rgba(0,0,0,0.01)'
        }}
      >
        {/* Brand */}
        <div style={{ height: '90px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--text-main)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', fontSize: '1.25rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>A</div>
            {isSidebarOpen && (
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Alex <span style={{ color: 'var(--primary-color)' }}>Retail</span></span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '2rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  height: '52px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--bg-main)' : 'var(--text-muted)',
                  background: isActive ? 'var(--text-main)' : 'transparent',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '52px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={18} />
                </div>
                {isSidebarOpen && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                )}
                {isActive && isSidebarOpen && (
                  <motion.div layoutId="active" style={{ position: 'absolute', right: '1rem', width: '6px', height: '6px', background: 'var(--primary-color)', borderRadius: '50%' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
           <button
             onClick={logout}
             style={{
               width: '100%',
               height: '52px',
               borderRadius: '12px',
               display: 'flex',
               alignItems: 'center',
               gap: '1rem',
               background: 'transparent',
               border: 'none',
               color: 'var(--danger-color)',
               cursor: 'pointer',
               transition: 'all 0.2s'
             }}
           >
              <div style={{ width: '52px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <FiLogOut size={18} />
              </div>
              {isSidebarOpen && <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.nav.logout')}</span>}
           </button>
           
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)}
             style={{
               width: '100%',
               height: '40px',
               borderRadius: '10px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               background: 'var(--bg-sub)',
               border: 'none',
               color: 'var(--text-muted)',
               cursor: 'pointer',
               marginTop: '0.5rem'
             }}
           >
              {isSidebarOpen ? <FiX size={14} /> : <FiMenu size={14} />}
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        style={{ 
          flex: 1, 
          marginLeft: isSidebarOpen ? '280px' : '88px', 
          transition: 'margin 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <header style={{ 
          height: '90px', 
          background: 'var(--nav-bg)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid var(--border-color)', 
          padding: '0 3rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
           <div style={{ flex: 1, maxWidth: '400px' }}>
              <div style={{ position: 'relative' }}>
                 <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                 <input 
                   placeholder="Search..." 
                   style={{ 
                     width: '100%', 
                     padding: '0.75rem 1.25rem 0.75rem 3rem', 
                     borderRadius: '12px', 
                     border: 'none', 
                     background: 'var(--bg-sub)',
                     color: 'var(--text-main)',
                     fontSize: '0.85rem',
                     fontWeight: 700,
                     outline: 'none'
                   }}
                 />
              </div>
           </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginLeft: 'auto' }}>
               <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserMenuOpen(false);
                    }}
                    style={{ width: '44px', height: '44px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)', position: 'relative', cursor: 'pointer' }}
                  >
                     <FiBell size={18} />
                     {unreadCount > 0 && (
                       <span style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', background: 'var(--danger-color)', borderRadius: '50%', border: '2px solid var(--bg-card)', fontSize: '8px', color: 'var(--text-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                         {unreadCount}
                       </span>
                     )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 'calc(100% + 15px)',
                          width: '320px',
                          background: 'var(--bg-card)',
                          borderRadius: '20px',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                          border: '1px solid var(--border-color)',
                          zIndex: 100,
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Mark all read</button>
                          )}
                        </div>
                        
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                              <FiBell size={24} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div 
                                key={n._id} 
                                onClick={() => {
                                  markRead(n._id);
                                  if (n.link) {
                                    navigate(n.link);
                                  } else if (n.title.includes('New Product')) {
                                    navigate('/admin/products');
                                  } else if (n.title.includes('Order')) {
                                    navigate('/admin/orders');
                                  }
                                  setNotificationsOpen(false);

                                }}
                                style={{ 
                                  padding: '1.25rem 1.5rem', 
                                  borderBottom: '1px solid var(--border-color)', 
                                  background: n.isRead ? 'transparent' : 'var(--bg-sub)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? 'transparent' : 'var(--primary-color)', marginTop: '4px', flexShrink: 0 }} />
                                  <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{n.title}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{n.message}</p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-sub)' }}>
                            <button onClick={() => setNotificationsOpen(false)} style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Close Panel</button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
              
              <button 
                onClick={toggleTheme}
                style={{ width: '44px', height: '44px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', marginLeft: '1rem' }}
              >
                 {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              
              <div style={{ height: '30px', width: '1px', background: 'var(--border-color)', marginLeft: '1rem' }} />

              {/* User Menu Trigger */}
              <div style={{ position: 'relative' }}>
                 <button 
                   onClick={() => setUserMenuOpen(!userMenuOpen)}
                   style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '1rem',
                     background: 'none',
                     border: 'none',
                     cursor: 'pointer',
                     padding: 0
                   }}
                 >
                    <div style={{ textAlign: 'right', display: 'none' }} className="admin-info">
                       <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{user?.name}</p>
                       <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Admin</p>
                    </div>
                    <div style={{ width: '44px', height: '44px', background: 'var(--text-main)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-main)', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', transition: 'all 0.3s' }}>
                       {user?.name?.[0].toUpperCase()}
                    </div>
                 </button>

                 {/* Dropdown Menu */}
                 <AnimatePresence>
                   {userMenuOpen && (
                     <motion.div
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       style={{
                         position: 'absolute',
                         right: 0,
                         top: 'calc(100% + 15px)',
                         width: '220px',
                         background: 'var(--bg-card)',
                         borderRadius: '16px',
                         padding: '0.5rem',
                         boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                         border: '1px solid var(--border-color)',
                         zIndex: 100
                       }}
                     >
                       <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                         <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.name}</p>
                         <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.email}</p>
                       </div>
                       
                       <Link to="/admin/profile" className="admin-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                         <FiUsers size={14} /> Profile Settings
                       </Link>
                       <Link to="/admin/settings" className="admin-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                         <FiSettings size={14} /> Portal Settings
                       </Link>
                       <Link to="/" className="admin-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                         <FiLayout size={14} /> Switch to Store
                       </Link>
                       
                       <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.4rem 0' }} />
                       
                       <button 
                         onClick={() => { logout(); navigate('/login'); }}
                         className="admin-dropdown-item"
                         style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger-color)' }}
                       >
                         <FiLogOut size={14} /> Sign Out
                       </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '3rem 4rem' }}>
           <Suspense fallback={<div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiActivity className="animate-spin" size={32} color="var(--primary-color)" /></div>}>
              <Outlet />
           </Suspense>
        </div>
      </main>

      <style>{`
        @media (min-width: 640px) {
          .admin-info { display: block !important; }
        }
        .admin-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          text-decoration: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.2s;
        }
        .admin-dropdown-item:hover {
          background: var(--bg-sub);
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
