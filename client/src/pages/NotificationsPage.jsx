import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2, FiClock, FiShoppingBag, FiTag, FiAlertCircle, FiPackage } from 'react-icons/fi';
import axiosInstance from '../utils/axios';
import { Link } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_status':
      case 'delivery': return <FiShoppingBag style={{ color: '#0ea5e9' }} />;
      case 'system': return <FiAlertCircle style={{ color: '#8b5cf6' }} />;
      case 'product': return <FiPackage style={{ color: '#f59e0b' }} />;
      default: return <FiBell style={{ color: '#6b7280' }} />;
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 6%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Alerts & Updates
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              Stay updated with your orders, delivery status, and account activity.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '14px',
                background: 'rgba(61, 122, 40, 0.1)',
                color: '#3d7a28',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(61, 122, 40, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(61, 122, 40, 0.1)'}
            >
              <FiCheck /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--bg-sub)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-muted)' }}>
              <FiBell size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No notifications yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>When you receive updates, they'll appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    padding: '1.5rem',
                    background: notification.read ? 'var(--bg-card)' : 'rgba(61, 122, 40, 0.03)',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: notification.read ? 'var(--border-color)' : 'rgba(61, 122, 40, 0.2)',
                    display: 'flex',
                    gap: '1.25rem',
                    position: 'relative',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: notification.read ? 'var(--bg-sub)' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                    boxShadow: notification.read ? 'none' : '0 8px 16px rgba(61, 122, 40, 0.1)'
                  }}>
                    {getIcon(notification.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {notification.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FiClock size={12} />
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {notification.message}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          onClick={() => markAsRead(notification._id)}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#3d7a28',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          View Details <FiCheck size={12} />
                        </Link>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <div style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      width: '8px',
                      height: '8px',
                      background: '#3d7a28',
                      borderRadius: '50%'
                    }} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
