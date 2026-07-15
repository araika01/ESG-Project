import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/');
      setApplications(response.data.results || response.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleAccept = async (appId) => {
    try { await api.post(`/applications/${appId}/accept/`); fetchApplications(); } 
    catch (error) { console.error('Error:', error); }
  };

  const handleReject = async (appId) => {
    try { await api.post(`/applications/${appId}/reject/`); fetchApplications(); } 
    catch (error) { console.error('Error:', error); }
  };

  const handleMessage = async (app) => {
  try {
    const existingRes = await api.get('/conversations/');
    const conversations = existingRes.data.results || existingRes.data;
    const existing = conversations.find(c => c.application === app.id);
    
    if (existing) {
      navigate(`/messages?conversation=${existing.id}`);
      return;
    }
    
    const createRes = await api.post('/conversations/', {
      application_id: app.id,
    });
    
    const otherUserId = user?.role === 'employer' ? app.applicant : app.vacancy?.employer;
    if (otherUserId) {
      await api.post(`/conversations/${createRes.data.id}/add_participant/`, {
        user_id: otherUserId
      });
    }
    
    navigate(`/messages?conversation=${createRes.data.id}`);
  } catch (error) {
    console.error('Message error:', error);
    navigate('/messages');
  }
};

  const handleLogout = () => { logout(); navigate('/login'); };

  const getStatusColor = (status) => {
    const colors = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444', withdrawn: '#6b7280' };
    return colors[status] || '#6b7280';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#667eea', cursor: 'pointer', margin: 0 }} onClick={() => navigate('/vacancies')}>TempWork</h1>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <span onClick={() => navigate('/vacancies')} style={{ color: '#666', cursor: 'pointer' }}>Vacancies</span>
              <span style={{ color: '#667eea', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>Applications</span>
              <span onClick={() => navigate('/favorites')} style={{ color: '#666', cursor: 'pointer' }}>Favorites</span>
              <span onClick={() => navigate('/reviews')} style={{ color: '#666', cursor: 'pointer' }}>Reviews</span>
              <span onClick={() => navigate('/resumes')} style={{ color: '#666', cursor: 'pointer' }}>Resumes</span>
              <span onClick={() => navigate('/messages')} style={{ color: '#666', cursor: 'pointer' }}>Messages</span>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span onClick={() => navigate('/notifications')} style={{ cursor: 'pointer', fontSize: '1.2rem' }}>🔔</span>
            <span onClick={() => navigate('/profile')} style={{ color: '#666', cursor: 'pointer' }}>👤 {user?.first_name}</span>
            <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>📋 Applications</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>No applications yet</p>
            <button onClick={() => navigate('/vacancies')} style={{ padding: '0.7rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Browse Vacancies</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {applications.map(app => (
  <div key={app.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <div>
        <h3 style={{ margin: '0 0 0.25rem 0' }}>{app.vacancy_title || 'Vacancy'}</h3>
        <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>👤 {app.applicant_name || 'Applicant'}</p>
      </div>
      <span style={{
        padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: '600',
        background: `${getStatusColor(app.status)}20`, color: getStatusColor(app.status),
        height: 'fit-content'
      }}>
        {app.status?.toUpperCase()}
      </span>
    </div>

    <p style={{ color: '#999', fontSize: '0.8rem', margin: '0 0 0.75rem 0' }}>
      {new Date(app.created_at).toLocaleString()}
    </p>

    {/* Accept/Reject кнопки */}
    {user?.role === 'employer' && app.status === 'pending' && (
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button onClick={() => handleAccept(app.id)} style={{ padding: '0.5rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          ✓ Accept
        </button>
        <button onClick={() => handleReject(app.id)} style={{ padding: '0.5rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          ✕ Reject
        </button>
      </div>
    )}

    {/* Message кнопка */}
    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
      <button onClick={() => handleMessage(app)} style={{ padding: '0.5rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
        Message
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

export default ApplicationsPage;