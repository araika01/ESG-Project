import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vacancies/favorites/');
      setFavorites(response.data || response.data.results || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (vacancyId) => {
    try {
      await api.post(`/vacancies/${vacancyId}/favorite/`);
      setFavorites(favorites.filter(v => v.id !== vacancyId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#667eea', cursor: 'pointer', margin: 0 }} onClick={() => navigate('/vacancies')}>TempWork</h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <span onClick={() => navigate('/vacancies')} style={{ color: '#666', cursor: 'pointer' }}>Vacancies</span>
              <span onClick={() => navigate('/applications')} style={{ color: '#666', cursor: 'pointer' }}>My Applications</span>
              <span onClick={() => navigate('/favorites')} style={{ color: '#667eea', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>Favorites</span>
              <span onClick={() => navigate('/reviews')} style={{ color: '#666', cursor: 'pointer' }}>Reviews</span>
              <span onClick={() => navigate('/resumes')} style={{ color: '#666', cursor: 'pointer' }}>Resumes</span>
              <span onClick={() => navigate('/messages')} style={{ color: '#666', cursor: 'pointer' }}>Messages</span>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span onClick={() => navigate('/notifications')} style={{ color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>🔔</span>
            <span onClick={() => navigate('/profile')} style={{ color: '#666', cursor: 'pointer' }}>👤 Profile</span>
            <span style={{ color: '#666' }}>{user?.first_name}</span>
            <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>❤️ My Favorites</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>No favorites yet</p>
            <button onClick={() => navigate('/vacancies')} style={{ padding: '0.7rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Browse Vacancies</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {favorites.map(v => (
              <div key={v.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vacancies')}>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#333' }}>{v.title}</h3>
                    <p style={{ color: '#666', margin: 0 }}>
                      {v.company_name || 'Company'} • 📍 {v.location || 'Remote'}
                    </p>
                    <p style={{ color: '#667eea', fontWeight: 'bold', margin: '0.25rem 0' }}>
                      {v.salary_min && v.salary_max ? `${Number(v.salary_min).toLocaleString()} - ${Number(v.salary_max).toLocaleString()} ${v.currency}` : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.7rem', borderRadius: '1rem', fontSize: '0.85rem' }}>{v.duration?.replace(/_/g, ' ')}</span>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.2rem 0.7rem', borderRadius: '1rem', fontSize: '0.85rem' }}>{v.replacement_reason}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(v.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    ❌ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FavoritesPage;