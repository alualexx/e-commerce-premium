import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTruck, FiClock, FiRefreshCw, FiSearch,
  FiPackage, FiCheckCircle, FiPhone, FiMail,
  FiNavigation, FiActivity, FiAlertCircle, FiMapPin,
  FiUser, FiDollarSign, FiHome, FiShoppingBag
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const deliveryIcon = (isSelected) => new L.divIcon({
  className: '',
  html: `<div style="
    width:44px;height:44px;border-radius:50%;
    background:${isSelected ? '#6366f1' : '#10b981'};
    border:3px solid white;
    box-shadow:0 4px 14px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
    transition:all 0.3s;
  ">
    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -48],
});

// Smoothly flies the map to new center/zoom whenever props change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom]); // eslint-disable-line
  return null;
};

const getTimeAgo = (date, t) => {
  if (!date) return 'N/A';
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return t('admin.delivery_tracking.time.seconds_ago', { count: s });
  const m = Math.floor(s / 60);
  if (m < 60) return t('admin.delivery_tracking.time.minutes_ago', { count: m });
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isOnline = (date) => {
  if (!date) return false;
  return (new Date() - new Date(date)) < 10 * 60 * 1000; // within 10 min
};

export default function DeliveryTrackingPage() {
  const { t } = useTranslation();
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [mapCenter, setMapCenter] = useState([9.03, 38.74]);
  const [mapZoom, setMapZoom] = useState(13);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    try {
      const { data } = await api.get('/users/delivery/locations');
      setPersonnel(data);
      setLastRefresh(new Date());
      if (data.length > 0 && !selected) {
        const first = data[0].currentLocation;
        if (first?.lat) setMapCenter([first.lat, first.lng]);
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, []);

  const handleSelect = (person) => {
    setSelected(person);
    if (person.currentLocation?.lat) {
      setMapCenter([person.currentLocation.lat, person.currentLocation.lng]);
      setMapZoom(16);
    }
  };

  const filtered = personnel.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = personnel.filter(p => isOnline(p.currentLocation?.updatedAt)).length;
  const totalActive = personnel.reduce((s, p) => s + (p.activeOrdersCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', padding: '24px 32px', gap: 20, background: 'var(--bg-main)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif', margin: 0, letterSpacing: '-0.02em' }}>
            {t('admin.delivery_tracking.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
            {t('admin.delivery_tracking.subtitle')}
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'1px solid var(--border-color)', background:'var(--card-bg)', color:'var(--text-main)', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}
        >
          <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {t('common.refresh')} · {lastRefresh.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
        </button>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, flex: 1, overflow: 'hidden' }}>
        
        {/* ===== SIDEBAR ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flexShrink: 0 }}>
            {[
              { icon: FiActivity, label: t('admin.delivery_tracking.stats.online'), value: onlineCount, color: '#10b981', bg: '#10b98115' },
              { icon: FiPackage, label: t('admin.delivery_tracking.stats.active_orders'), value: totalActive, color: '#6366f1', bg: '#6366f115' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.delivery_tracking.search_placeholder')}
              style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 14, border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            />
          </div>

          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 4px', flexShrink: 0 }}>
            {t('admin.delivery_tracking.active_label')} · {filtered.length}
          </div>

          {/* Personnel List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-muted)', padding: 32 }}>
                  <FiAlertCircle size={36} opacity={0.3} />
                  <p style={{ fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.6 }}>
                    {search ? t('admin.delivery_tracking.no_results') : t('admin.delivery_tracking.no_active')}
                  </p>
                </div>
              ) : (
                filtered.map((person, i) => {
                  const online = isOnline(person.currentLocation?.updatedAt);
                  const isActive = selected?._id === person._id;
                  return (
                    <motion.div
                      key={person._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelect(person)}
                      style={{
                        background: isActive ? 'var(--text-main)' : 'var(--card-bg)',
                        border: `1px solid ${isActive ? 'var(--text-main)' : 'var(--border-color)'}`,
                        borderRadius: 16,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: isActive ? 'white' : 'var(--text-main)', fontFamily: 'Outfit,sans-serif' }}>
                            {person.name?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: online ? '#10b981' : '#f59e0b', border: '2px solid var(--card-bg)' }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isActive ? 'white' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.name}</div>
                          <div style={{ fontSize: '0.7rem', color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginTop: 2 }}>{person.email}</div>
                        </div>

                        {/* Badge */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: online ? '#10b98120' : '#f59e0b20', color: online ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {online ? t('admin.delivery_tracking.status.online') : t('admin.delivery_tracking.status.idle')}
                          </span>
                          {(person.activeOrdersCount > 0) && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: isActive ? 'rgba(255,255,255,0.15)' : '#6366f115', color: isActive ? 'white' : '#6366f1' }}>
                              {t('admin.delivery_tracking.orders_count', { count: person.activeOrdersCount })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${isActive ? 'rgba(255,255,255,0.15)' : 'var(--border-color)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                          <FiClock size={11} />
                          {getTimeAgo(person.currentLocation?.updatedAt, t)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                          <FiCheckCircle size={11} />
                          {t('admin.delivery_tracking.completed_count', { count: person.completedOrders || 0 })}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelect(person); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', fontWeight: 800, color: isActive ? 'white' : 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                        >
                          <FiNavigation size={11} /> {t('admin.delivery_tracking.focus')}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Selected Person Detail Panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{ flexShrink: 0, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 18, borderLeft: '4px solid #6366f1', overflow: 'hidden', maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}
              >
                {/* Panel Header */}
                <div style={{ padding: '14px 16px 10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>📍 ACTIVE DELIVERY — PERSONNEL DETAILS</div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', fontFamily: 'Outfit,sans-serif' }}>{selected.name}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: 2 }}>{selected.email}</div>
                </div>

                {/* Scrollable Body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Delivery Person Quick Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: 'var(--bg-sub)', padding: '10px 12px', borderRadius: 12 }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PHONE</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FiPhone size={11} color="#6366f1" />
                        <a href={`tel:${selected.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{selected.phone || 'N/A'}</a>
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-sub)', padding: '10px 12px', borderRadius: 12 }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>LOCATION</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FiMapPin size={11} color="#10b981" />
                        {selected.currentLocation?.lat?.toFixed(4)}, {selected.currentLocation?.lng?.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Orders */}
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between', padding: '4px 2px 0' }}>
                    <span>ACTIVE DELIVERIES</span>
                    <span style={{ color: '#6366f1' }}>{selected.activeOrdersCount || 0} ORDER{selected.activeOrdersCount !== 1 ? 'S' : ''}</span>
                  </div>

                  {selected.activeOrders?.length > 0 ? selected.activeOrders.map((order, oi) => {
                    const customer = order.user || {};
                    const addr = order.shippingAddress || {};
                    const statusColors = { out_for_delivery: '#10b981', shipped: '#6366f1', processing: '#f59e0b', confirmed: '#3b82f6' };
                    const sc = statusColors[order.status] || '#6366f1';
                    return (
                      <div key={order._id} style={{ border: `1px solid ${sc}30`, borderRadius: 14, overflow: 'hidden', background: 'var(--bg-sub)' }}>
                        {/* Order Header */}
                        <div style={{ background: `${sc}15`, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${sc}20` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <FiPackage size={13} color={sc} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>#{order.trackingNumber}</span>
                          </div>
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: `${sc}20`, color: sc, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {/* Customer Info */}
                          <div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>CUSTOMER</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', fontWeight: 700 }}>
                                <FiUser size={11} color="#6366f1" /> {addr.fullName || customer.name || 'N/A'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                <FiPhone size={10} color="var(--text-muted)" /> {addr.phone || customer.phone || 'N/A'}
                              </div>
                              {customer.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                  <FiMail size={10} color="var(--text-muted)" /> {customer.email}
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                <FiHome size={10} color="var(--text-muted)" /> {[addr.street, addr.city, addr.country].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </div>

                          {/* Products */}
                          {order.items?.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                                PRODUCTS ({order.items.length})
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {order.items.map((item, ii) => (
                                  <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                                    ) : (
                                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FiShoppingBag size={14} color="var(--text-muted)" />
                                      </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>Qty: {item.quantity}</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', flexShrink: 0 }}>
                                      ETB {(item.price * item.quantity).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Total + Payment */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              <FiDollarSign size={11} /> {order.paymentMethod?.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif' }}>
                              ETB {order.totalPrice?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>No active orders</div>
                  )}

                  {/* Directions Button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.currentLocation?.lat},${selected.currentLocation?.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--text-main)', color: 'var(--bg-main)', padding: '11px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    <FiNavigation size={13} /> GET DIRECTIONS
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== MAP ===== */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {personnel.map(person => (
              person.currentLocation?.lat && (
                <Marker
                  key={person._id}
                  position={[person.currentLocation.lat, person.currentLocation.lng]}
                  icon={deliveryIcon(selected?._id === person._id)}
                  eventHandlers={{ click: () => handleSelect(person) }}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>{person.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: 8 }}>{person.email}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem' }}>
                          <FiTruck size={12} color="#6366f1" /> {t('admin.delivery_tracking.orders_count', { count: person.activeOrdersCount || 0 })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem' }}>
                          <FiClock size={12} color="#f59e0b" /> {getTimeAgo(person.currentLocation?.updatedAt, t)}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>

          <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '8px 14px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>{onlineCount} {t('admin.delivery_tracking.active_label')}</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
