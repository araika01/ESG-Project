import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function CreateResumePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    salary_expectation: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: form.title,
        summary: form.summary,
        skills: form.skills.split(',').map(s => s.trim()),
        experience: form.experience,
        education: form.education,
        salary_expectation: form.salary_expectation || null,
      };
      await api.post('/resumes/', data);
      setMessage('Resume created!');
      setTimeout(() => navigate('/resumes'), 1000);
    } catch (error) {
      setMessage('Error: ' + JSON.stringify(error.response?.data));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.3rem', color: '#667eea', cursor: 'pointer', margin: 0 }} onClick={() => navigate('/vacancies')}>← TempWork</h1>
          <span style={{ color: '#666' }}>{user?.first_name}</span>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>📄 Create Resume</h2>
          
          {message && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#dc2626' : '#166534' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Title *</label>
              <input name="title" placeholder="e.g. Senior Python Developer" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Summary *</label>
              <textarea name="summary" placeholder="Brief professional summary..." value={form.summary} onChange={handleChange} required rows="3" style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Skills (comma separated)</label>
              <input name="skills" placeholder="Python, Django, React, PostgreSQL" value={form.skills} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Experience</label>
              <textarea name="experience" placeholder="Work experience..." value={form.experience} onChange={handleChange} rows="3" style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Education</label>
              <textarea name="education" placeholder="Education..." value={form.education} onChange={handleChange} rows="2" style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>Salary Expectation (KZT)</label>
              <input name="salary_expectation" type="number" placeholder="500000" value={form.salary_expectation} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
            </div>
            <button type="submit" style={{ padding: '0.8rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              💾 Save Resume
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateResumePage;