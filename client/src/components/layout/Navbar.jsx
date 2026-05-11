import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiHeart, FiActivity, FiSun, FiMoon } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import useThemeStore from '../../store/useThemeStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const totalItems = useCartStore(s => s.totalItems)();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/track', label: 'Track Order' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    background: isScrolled ? 'var(--nav-bg)' : 'transparent',
    backdropFilter: isScrolled ? 'blur(20px)' : 'none',
    borderBottom: isScrolled ? '1px solid var(--border-color)' : '1px solid rgba(255, 255, 255, 0.1)',
    padding: isScrolled ? '0.75rem 0' : '1.5rem 0',
  };

  return (
    <>
      <nav style={navbarStyle}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 6%', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Left: Branding */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#111', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: '#fff', fontSize: '1.25rem', fontStyle: 'italic' }}>A</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: 900, 
                  fontSize: '1.125rem', 
                  color: isScrolled ? '#111' : '#111', // Keeping it dark for visibility
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}>
                  ALEX <span style={{ color: '#3d7a28' }}>RETAIL</span>
                </span>
                <span style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#3d7a28', opacity: 0.6, marginTop: '2px' }}>Premium Boutique</span>
              </div>
            </Link>

            {/* Center: Navigation Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {navLinks.map(link => {
                const isActive = location.pathname === (link.to.split('?')[0]) && (link.to !== '/shop' || location.search === '');
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      color: isActive ? '#111' : '#6b7280',
                      position: 'relative',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.color = '#111';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline" 
                        style={{ 
                          position: 'absolute', 
                          bottom: '-4px', 
                          left: '1.25rem', 
                          right: '1.25rem', 
                          height: '2px', 
                          background: '#3d7a28',
                          borderRadius: '1px'
                        }} 
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Search"
              >
                <FiSearch size={18} />
              </button>

              <Link
                to="/wishlist"
                style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none', color: '#6b7280',
                  textDecoration: 'none', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Favorites"
              >
                <FiHeart size={18} />
              </Link>

              <Link
                to="/orders"
                style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none', color: '#6b7280',
                  textDecoration: 'none', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Track Order"
              >
                <FiPackage size={18} />
              </Link>

              <div style={{ position: 'relative' }}>
                <Link to="/cart" style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none', color: '#6b7280',
                  textDecoration: 'none', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Shopping Bag"
                >
                  <FiShoppingCart size={18} />
                  {totalItems > 0 && (
                    <span style={{
                      position: 'absolute', top: '6px', right: '6px',
                      minWidth: '16px', height: '16px', background: '#3d7a28',
                      color: '#fff', fontSize: '0.625rem', fontWeight: 900,
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', padding: '0 4px', border: '2px solid #fff'
                    }}>
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>

              <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.08)', margin: '0 0.5rem' }} className="hidden sm:block" />

              {/* User Profile */}
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      height: '44px',
                      padding: '0 1rem 0 0.25rem',
                      borderRadius: '999px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      background: 'rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#111',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111' }} className="hidden sm:block">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 'calc(100% + 12px)',
                          width: '240px',
                          background: '#fff',
                          borderRadius: '20px',
                          padding: '0.75rem',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          zIndex: 1000
                        }}
                      >
                        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '0.5rem' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111', marginBottom: '0.25rem' }}>{user.name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <Link to="/profile" className="nav-dropdown-item"><FiUser size={16} /> Edit Profile</Link>
                          <Link to="/settings" className="nav-dropdown-item"><FiActivity size={16} /> Account Settings</Link>
                          
                          {user.role === 'admin' && (
                            <>
                              <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.5rem 0' }} />
                              <Link to="/admin" className="nav-dropdown-item" style={{ color: '#3d7a28', background: '#f0fce8' }}>
                                <FiActivity size={16} /> Admin Portal
                              </Link>
                            </>
                          )}
                          
                          {(user.role === 'store_keeper' || user.role === 'admin') && (
                            <>
                              <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.5rem 0' }} />
                              <Link to="/store" className="nav-dropdown-item" style={{ color: '#0ea5e9', background: '#f0f9ff' }}>
                                <FiPackage size={16} /> Store Portal
                              </Link>
                            </>
                          )}

                          {(user.role === 'delivery' || user.role === 'admin') && (
                            <>
                              <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.5rem 0' }} />
                              <Link to="/delivery" className="nav-dropdown-item" style={{ color: '#8b5cf6', background: '#f5f3ff' }}>
                                <FiPackage size={16} /> Delivery Portal
                              </Link>
                            </>
                          )}
                          
                          <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.5rem 0' }} />
                          <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="nav-dropdown-item"
                            style={{ color: '#ef4444', width: '100%', border: 'none', textAlign: 'left', background: 'none', cursor: 'pointer' }}
                          >
                            <FiLogOut size={16} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  style={{
                    background: '#111',
                    color: '#fff',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#3d7a28'}
                  onMouseLeave={e => e.currentTarget.style.background = '#111'}
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Trigger */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: '#111',
                    cursor: 'pointer'
                  }}
                >
                  {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#fff',
                padding: '2rem 6%',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
              }}
            >
              <form onSubmit={handleSearch} style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections..."
                  style={{
                    width: '100%',
                    padding: '1.25rem 4rem 1.25rem 4rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: '#f9fafb',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  autoFocus
                />
                <button type="submit" style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '400px',
              background: '#fff',
              zIndex: 1100,
              padding: '2rem',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem' }}>Menu</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={28} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: '2rem',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    color: '#111',
                    textDecoration: 'none',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2.5rem' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Quick Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#111', fontWeight: 700 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiHeart /></div>
                  Wishlist
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#111', fontWeight: 700 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage /></div>
                  Track Orders
                </Link>
                {user ? (
                  <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#111', fontWeight: 700 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiUser /></div>
                    My Account
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#3d7a28', fontWeight: 800 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0fce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiUser /></div>
                    Login / Register
                  </Link>
                )}

                {user && (user.role === 'store_keeper' || user.role === 'admin') && (
                  <Link to="/store" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#0ea5e9', fontWeight: 700 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage color="#0ea5e9" /></div>
                    Store Portal
                  </Link>
                )}

                {user && (user.role === 'delivery' || user.role === 'admin') && (
                  <Link to="/delivery" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#8b5cf6', fontWeight: 700 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage color="#8b5cf6" /></div>
                    Delivery Portal
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          text-decoration: none;
          color: #4b5563;
          font-size: 0.8125rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .nav-dropdown-item:hover {
          background: #f9fafb;
          color: #111;
        }
      `}</style>
    </>
  );
};

export default Navbar;
