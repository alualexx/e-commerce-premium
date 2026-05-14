import { useState, useEffect } from 'react';
import { 
  FiUsers, FiShield, FiTrash2, FiSearch, FiMail, 
  FiCalendar, FiUnlock, FiLock, FiMoreVertical, 
  FiUserPlus, FiFilter, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import LoadingScreen from '../../components/common/LoadingScreen';

const ManageUsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      // The backend returns { users, page, pages, total }
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.users.table.delete_confirm'))) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user');
      }
    }
  };

  const toggleAdmin = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'customer' : 'admin';
      await api.put(`/users/${user._id}`, { role: newRole });
      fetchUsers();
    } catch (error) {
       console.error('Failed to update role');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  if (loading && users.length === 0) return <LoadingScreen />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>{t('admin.users.header.subtitle')}</p>
           <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{t('admin.users.header.title')}</h1>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', 
          background: 'var(--text-main)', color: 'var(--bg-main)', padding: '1rem 1.5rem', 
          borderRadius: '14px', border: 'none', fontSize: '0.85rem', 
          fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
          cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <FiUserPlus size={18} />
          {t('admin.users.header.add')}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
           <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
           <input
             type="text"
             placeholder={t('admin.users.filters.search')}
             style={{ 
               width: '100%', 
               padding: '1.1rem 1.25rem 1.1rem 3.75rem', 
               borderRadius: '18px', 
               border: '1px solid var(--border-color)', 
               background: 'var(--bg-card)', 
               color: 'var(--text-main)',
               fontSize: '0.95rem', 
               fontWeight: 600, 
               outline: 'none',
               transition: 'all 0.2s'
             }}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          {['all', 'customer', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: filterRole === role ? 'var(--bg-sub)' : 'transparent',
                color: filterRole === role ? 'var(--text-main)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t(`admin.users.filters.${role}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / List */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '28px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-sub)', borderBottom: '1px solid var(--border-color)' }}>
              {['user', 'status', 'role', 'joined', 'actions'].map((h) => (
                <th key={h} style={{ 
                  textAlign: 'left', 
                  padding: '1.5rem 2rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  color: 'var(--text-muted)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em' 
                }}>{t(`admin.users.table.${h}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.tr 
                  key={user._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '14px', 
                        background: user.role === 'admin' ? 'var(--text-main)' : 'var(--bg-sub)',
                        color: user.role === 'admin' ? 'var(--bg-main)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', fontWeight: 900
                      }}>
                        {user.name?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.15rem' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    {user.isActive ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
                         <FiCheckCircle size={14} /> {t('admin.users.table.active')}
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
                         <FiXCircle size={14} /> {t('admin.users.table.suspended')}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <span style={{ 
                      fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', 
                      letterSpacing: '0.05em', color: user.role === 'admin' ? 'var(--primary-color)' : 'var(--text-muted)',
                      background: 'var(--bg-sub)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)'
                    }}>
                      {t(`admin.users.filters.${user.role}`)}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                       <button 
                        onClick={() => toggleAdmin(user)}
                        title={user.role === 'admin' ? t('admin.users.table.demote') : t('admin.users.table.promote')}
                        style={{ 
                          width: '40px', height: '40px', borderRadius: '10px', 
                          border: '1px solid var(--border-color)', background: 'var(--bg-card)', 
                          color: 'var(--text-main)', cursor: 'pointer', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                      >
                        {user.role === 'admin' ? <FiUnlock size={16} /> : <FiLock size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        title={t('admin.users.table.delete')}
                        style={{ 
                          width: '40px', height: '40px', borderRadius: '10px', 
                          border: 'none', background: 'var(--bg-danger-light)', 
                          color: 'var(--danger-color)', cursor: 'pointer', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredUsers.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
             <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t('admin.users.table.empty')}</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', background: 'var(--bg-sub)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
               <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('admin.users.footer.active_customers')}</p>
               <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{users.filter(u => u.role === 'customer' && u.isActive).length}</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div>
               <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('admin.users.footer.staff_accounts')}</p>
               <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{users.filter(u => u.role === 'admin').length}</p>
            </div>
         </div>
         <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <FiShield /> {t('admin.users.footer.security_note')}
         </p>
      </div>
    </div>
  );
};

export default ManageUsersPage;
