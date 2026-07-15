/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data.results || response.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleRead = async (id) => {
    await api.post(`/notifications/${id}/read/`);
    fetchNotifications();
  };

  const handleReadAll = async () => {
    await api.post('/notifications/read_all/');
    fetchNotifications();
  };

  const getIcon = (type) => {
    const icons = {
      application: '📩', status_change: '🔄', message: '💬',
      review: '⭐', approval: '✅'
    };
    return icons[type] || '🔔';
}
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#667eea', cursor: 'pointer', margin: 0 }} onClick={() => navigate('/vacancies')}>TempWork</h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <span onClick={() => navigate('/vacancies')} style={{ color: '#666', cursor: 'pointer' }}>Vacancies</span>
              <span onClick={() => navigate('/applications')} style={{ color: '#666', cursor: 'pointer' }}>Applications</span>
              <span onClick={() => navigate('/favorites')} style={{ color: '#666', cursor: 'pointer' }}>Favorites</span>
              <span style={{ color: '#667eea', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>Notifications</span>
              <span onClick={() => navigate('/reviews')} style={{ color: '#666', cursor: 'pointer' }}>Reviews</span>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={handleReadAll} style={{ padding: '0.4rem 1rem', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              ✓ Read All
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>🔔 Notifications</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem' }}>No notifications</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {notifications.map(n => (
              <div key={n.id} onClick={() => handleRead(n.id)} style={{ 
                background: n.is_read ? 'white' : '#f0f4ff', 
                borderRadius: '1rem', padding: '1rem', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                cursor: 'pointer',
                borderLeft: n.is_read ? '4px solid transparent' : '4px solid #667eea'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getIcon(n.type)}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: n.is_read ? '400' : '600', margin: '0 0 0.25rem 0' }}>{n.title}</p>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>{n.message}</p>
                    <p style={{ color: '#999', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.is_read && <span style={{ width: '8px', height: '8px', background: '#667eea', borderRadius: '50%', marginTop: '0.5rem' }}></span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default NotificationsPage;