import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes/');
      setResumes(response.data.results || response.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              <span onClick={() => navigate('/reviews')} style={{ color: '#666', cursor: 'pointer' }}>Reviews</span>
              <span onClick={() => navigate('/resumes')} style={{ color: '#667eea', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>Resumes</span>
              <span onClick={() => navigate('/messages')} style={{ color: '#666', cursor: 'pointer' }}>Messages</span>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => navigate('/resumes/create')} style={{ padding: '0.5rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              + Create Resume
            </button>
            <span onClick={() => navigate('/notifications')} style={{ color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>🔔</span>
            <span onClick={() => navigate('/profile')} style={{ color: '#666', cursor: 'pointer' }}>👤 Profile</span>
            <span style={{ color: '#666' }}>{user?.first_name}</span>
            <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>📄 Resumes</h2>
        {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div> : resumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>No resumes yet</p>
            <button onClick={() => navigate('/resumes/create')} style={{ padding: '0.7rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Create Resume</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {resumes.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{r.title}</h3>
                <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>{r.user_name}</p>
                <p style={{ color: '#444' }}>{r.summary?.substring(0, 150)}...</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {r.skills?.map(s => (
                    <span key={s} style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.7rem', borderRadius: '1rem', fontSize: '0.85rem' }}>{s}</span>
                  ))}
                </div>
                {r.salary_expectation && (
                  <p style={{ color: '#667eea', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    Expected: {Number(r.salary_expectation).toLocaleString()} KZT
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ResumesPage;