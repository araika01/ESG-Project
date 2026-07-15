import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reviewee: '', rating: 5, comment: '' });
  const [users, setUsers] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { 
    fetchReviews(); 
    fetchUsers();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/');
      setReviews(response.data.results || response.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users/');
      setUsers(response.data.results || response.data);
    } catch (error) { console.error('Error:', error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews/', form);
      setShowForm(false);
      setForm({ reviewee: '', rating: 5, comment: '' });
      fetchReviews();
    } catch (error) { alert('Error creating review'); }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#667eea', cursor: 'pointer', margin: 0 }} onClick={() => navigate('/vacancies')}>TempWork</h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <span onClick={() => navigate('/vacancies')} style={{ color: '#666', cursor: 'pointer' }}>Vacancies</span>
              <span onClick={() => navigate('/applications')} style={{ color: '#666', cursor: 'pointer' }}>My Applications</span>
              <span onClick={() => navigate('/favorites')} style={{ color: '#666', cursor: 'pointer' }}>Favorites</span>
              <span onClick={() => navigate('/reviews')} style={{ color: '#667eea', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>Reviews</span>
              <span onClick={() => navigate('/resumes')} style={{ color: '#666', cursor: 'pointer' }}>Resumes</span>
              <span onClick={() => navigate('/messages')} style={{ color: '#666', cursor: 'pointer' }}>Messages</span>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.5rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              + Write Review
            </button>
            <span onClick={() => navigate('/notifications')} style={{ color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>🔔</span>
            <span onClick={() => navigate('/profile')} style={{ color: '#666', cursor: 'pointer' }}>👤 Profile</span>
            <span style={{ color: '#666' }}>{user?.first_name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        {showForm && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <select value={form.reviewee} onChange={e => setForm({...form, reviewee: e.target.value})} required style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
                <option value="">Select user...</option>
                {users.filter(u => u.id !== user?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1,2,3,4,5].map(r => (
                  <button key={r} type="button" onClick={() => setForm({...form, rating: r})}
                    style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer', opacity: form.rating >= r ? 1 : 0.3 }}>
                    ⭐
                  </button>
                ))}
              </div>
              <textarea placeholder="Comment..." value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} rows="3" required style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              <button type="submit" style={{ padding: '0.8rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Submit Review</button>
            </form>
          </div>
        )}

        <h2 style={{ marginBottom: '1rem' }}>⭐ Reviews & Ratings</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem' }}>No reviews yet</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>{r.reviewer_name}</p>
                    <p style={{ fontSize: '1.2rem', margin: 0 }}>{renderStars(r.rating)}</p>
                  </div>
                  <span style={{ color: '#999', fontSize: '0.85rem' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#444', marginTop: '0.75rem' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ReviewsPage;