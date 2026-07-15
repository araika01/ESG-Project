/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function VacanciesPage() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [reason, setReason] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [applied, setApplied] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [newVacancy, setNewVacancy] = useState({
    title: '', description: '', requirements: '', skills_required: '',
    location: '', salary_min: '', salary_max: '',
    duration: '1_month', replacement_reason: 'other',
    department: '', is_remote: false, is_urgent: false
  });

  useEffect(() => { fetchVacancies(); }, []);

  const fetchVacancies = async (params = {}) => {
    try {
      setLoading(true);
      const response = await api.get('/vacancies/', { params });
      setVacancies(response.data.results || response.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (location) params.location = location;
    if (duration) params.duration = duration;
    if (reason) params.replacement_reason = reason;
    fetchVacancies(params);
  };

  const handleClear = () => {
    setSearch(''); setLocation(''); setDuration(''); setReason('');
    fetchVacancies();
  };

  const handleFavorite = async (vacancyId) => {
  try {
    await api.post(`/vacancies/${vacancyId}/favorite/`);
    alert('Added to favorites!');
  } catch (error) {
    console.error('Favorite error:', error);
    alert('Error adding to favorites');
  }
};

const [showApplyForm, setShowApplyForm] = useState(false);

  const handleApply = async (vacancyId) => {
  try {
    console.log('Applying to vacancy:', vacancyId);
    console.log('Token:', localStorage.getItem('access_token'));
    
    const response = await api.post(`/vacancies/${vacancyId}/apply/`);
    console.log('Response:', response.data);
    
    setApplied(true);
    alert('Successfully applied!');
  } catch (error) {
    console.error('Apply error:', error);
    console.error('Response:', error.response);
    
    if (error.response?.status === 401) {
      alert('Please login first');
      navigate('/login');
    } else if (error.response?.status === 400) {
      alert(error.response?.data?.error || 'Already applied or vacancy closed');
    } else {
      alert('Error: ' + (error.response?.data?.detail || 'Try again'));
    }
  }
};

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: newVacancy.title,
        description: newVacancy.description,
        requirements: newVacancy.requirements || '',
        skills_required: newVacancy.skills_required ? newVacancy.skills_required.split(',').map(s => s.trim()) : [],
        location: newVacancy.location || '',
        salary_min: newVacancy.salary_min || null,
        salary_max: newVacancy.salary_max || null,
        duration: newVacancy.duration,
        replacement_reason: newVacancy.replacement_reason,
        department: newVacancy.department || '',
        is_remote: newVacancy.is_remote,
        is_urgent: newVacancy.is_urgent,
      };
      await api.post('/vacancies/', data);
      setShowCreate(false);
      fetchVacancies();
    } catch (error) {
      alert('Error: ' + JSON.stringify(error.response?.data));
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ========== DETAIL VIEW ==========
  if (selectedVacancy) {
    const v = selectedVacancy;
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.3rem', color: '#667eea', cursor: 'pointer', margin: 0 }} onClick={() => { setSelectedVacancy(null); setApplied(false); }}>← Back</h1>
              <nav style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: '#667eea', fontWeight: 'bold' }}>Vacancies</span>
                <span onClick={() => navigate('/applications')} style={{ color: '#666', cursor: 'pointer' }}>My Applications</span>
                <span onClick={() => navigate('/favorites')} style={{ color: '#666', cursor: 'pointer' }}>Favorites</span>
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
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {/* Title & Salary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.25rem 0' }}>{v.title}</h2>
                <p style={{ color: '#667eea', fontSize: '1.1rem', margin: 0 }}>{v.company_name || 'Company'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#667eea', margin: 0 }}>
                  {v.salary_min && v.salary_max ? `${Number(v.salary_min).toLocaleString()} - ${Number(v.salary_max).toLocaleString()} ${v.currency}` : 'Salary not specified'}
                </p>
                <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>Posted: {new Date(v.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
              <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem' }}>⏱️ {v.duration?.replace(/_/g, ' ')}</span>
              <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem' }}>📋 {v.replacement_reason}</span>
              <span style={{ background: '#e8f4fd', color: '#1e40af', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem' }}>📍 {v.location || 'Remote'}</span>
              {v.is_remote && <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem' }}>🏠 Remote</span>}
              {v.is_urgent && <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem' }}>⚡ Urgent</span>}
              {v.department && <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem' }}>🏢 {v.department}</span>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>📝 Description</h3>
              <p style={{ color: '#444', lineHeight: '1.7' }}>{v.description || 'No description'}</p>
            </div>

            {/* Requirements */}
            {v.requirements && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3>✅ Requirements</h3>
                <p style={{ color: '#444', lineHeight: '1.7' }}>{v.requirements}</p>
              </div>
            )}

            {/* Skills */}
            {v.skills_required?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3>🛠️ Skills</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {v.skills_required.map(skill => (
                    <span key={skill} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
              <div><p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Status</p><p style={{ fontWeight: '600', color: v.status === 'open' ? '#10b981' : '#f59e0b', margin: 0 }}>{v.status}</p></div>
              <div><p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Duration</p><p style={{ fontWeight: '600', margin: 0 }}>{v.duration?.replace(/_/g, ' ')}</p></div>
              <div><p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Work Type</p><p style={{ fontWeight: '600', margin: 0 }}>{v.is_remote ? 'Remote' : 'On-site'}</p></div>
              <div><p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Department</p><p style={{ fontWeight: '600', margin: 0 }}>{v.department || 'Not specified'}</p></div>
            </div>

            {/* Apply Button - only for employee */}
            {user?.role === 'employee' && (
                <div>
                    {!showApplyForm ? (
                        <button onClick={() => setShowApplyForm(true)} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }}>
                            {applied ? '✓ Applied' : 'Apply for this position'}
                            </button>
                            ) : (
                            <ApplyForm vacancyId={v.id} onCancel={() => setShowApplyForm(false)} onSuccess={() => { setApplied(true); setShowApplyForm(false); }} />
                            )}
                            </div>
                        )}

            <button 
            onClick={() => handleFavorite(v.id)} 
            style={{ 
                width: '100%',
                flex: 1, 
                padding: '0.8rem', 
                background: '#fef3c7', 
                color: '#92400e', 
                border: '1px solid #f59e0b', 
                borderRadius: '0.75rem', 
                fontSize: '1rem', 
                fontWeight: '600', 
                cursor: 'pointer',
                marginTop: '0.8rem'
            }}
         >
            ❤️ Save to Favorites
        </button>
            
          </div>
        </main>
      </div>
    );
  }

  // ========== CREATE VIEW ==========
  if (showCreate) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#667eea', cursor: 'pointer' }} onClick={() => setShowCreate(false)}>← Back</h1>
          </div>
        </header>
        <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create Vacancy</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem' }}>
              <input required placeholder="Title *" value={newVacancy.title} onChange={e => setNewVacancy({...newVacancy, title: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              <textarea required placeholder="Description *" value={newVacancy.description} onChange={e => setNewVacancy({...newVacancy, description: e.target.value})} rows="4" style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              <input placeholder="Requirements" value={newVacancy.requirements} onChange={e => setNewVacancy({...newVacancy, requirements: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              <input placeholder="Skills (comma separated)" value={newVacancy.skills_required} onChange={e => setNewVacancy({...newVacancy, skills_required: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input placeholder="Location" value={newVacancy.location} onChange={e => setNewVacancy({...newVacancy, location: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
                <input placeholder="Department" value={newVacancy.department} onChange={e => setNewVacancy({...newVacancy, department: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="number" placeholder="Min salary" value={newVacancy.salary_min} onChange={e => setNewVacancy({...newVacancy, salary_min: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
                <input type="number" placeholder="Max salary" value={newVacancy.salary_max} onChange={e => setNewVacancy({...newVacancy, salary_max: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <select value={newVacancy.duration} onChange={e => setNewVacancy({...newVacancy, duration: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
                  <option value="1_week">Up to 1 week</option>
                  <option value="1_month">1 week - 1 month</option>
                  <option value="1_3_months">1-3 months</option>
                  <option value="3_6_months">3-6 months</option>
                  <option value="6_12_months">6-12 months</option>
                  <option value="1_year_plus">More than 1 year</option>
                </select>
                <select value={newVacancy.replacement_reason} onChange={e => setNewVacancy({...newVacancy, replacement_reason: e.target.value})} style={{ padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
                  <option value="maternity">Maternity Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label><input type="checkbox" checked={newVacancy.is_remote} onChange={e => setNewVacancy({...newVacancy, is_remote: e.target.checked})} /> Remote work</label>
                <label><input type="checkbox" checked={newVacancy.is_urgent} onChange={e => setNewVacancy({...newVacancy, is_urgent: e.target.checked})} /> Urgent</label>
              </div>
              <button type="submit" style={{ padding: '0.8rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>Create Vacancy</button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ========== MAIN LIST VIEW ==========
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', margin: 0 }}>TempWork</h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#667eea', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>Vacancies</span>
              <span onClick={() => navigate('/applications')} style={{ color: '#666', cursor: 'pointer' }}>My Applications</span>
              <span onClick={() => navigate('/favorites')} style={{ color: '#666', cursor: 'pointer' }}>Favorites</span>
              <span onClick={() => navigate('/reviews')} style={{ color: '#666', cursor: 'pointer' }}>Reviews</span>
              <span onClick={() => navigate('/resumes')} style={{ color: '#666', cursor: 'pointer' }}>Resumes</span>
              <span onClick={() => navigate('/messages')} style={{ color: '#666', cursor: 'pointer' }}>Messages</span>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Create button - only for employer/hr */}
            {(user?.role === 'employer' || user?.role === 'hr_manager') && (
              <button onClick={() => setShowCreate(true)} style={{ padding: '0.5rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>+ Create Vacancy</button>
            )}
            <span onClick={() => navigate('/notifications')} style={{ color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>🔔</span>
            <span onClick={() => navigate('/profile')} style={{ color: '#666', cursor: 'pointer' }}>👤 Profile</span>
            <span style={{ color: '#666' }}>{user?.first_name}</span>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Search & Filters */}
        <form onSubmit={handleSearch} style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
            <div><label style={{ fontSize: '0.8rem', color: '#666' }}>Search</label><input placeholder="Job title..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} /></div>
            <div><label style={{ fontSize: '0.8rem', color: '#666' }}>Location</label><input placeholder="City..." value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} /></div>
            <div><label style={{ fontSize: '0.8rem', color: '#666' }}>Duration</label><select value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem', background: 'white' }}><option value="">All</option><option value="1_week">Up to 1 week</option><option value="1_month">1 week - 1 month</option><option value="1_3_months">1-3 months</option><option value="3_6_months">3-6 months</option><option value="6_12_months">6-12 months</option><option value="1_year_plus">More than 1 year</option></select></div>
            <div><label style={{ fontSize: '0.8rem', color: '#666' }}>Reason</label><select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem', background: 'white' }}><option value="">All</option><option value="maternity">Maternity</option><option value="sick">Sick Leave</option><option value="personal">Personal</option><option value="training">Training</option><option value="other">Other</option></select></div>
            <button type="submit" style={{ padding: '0.6rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>🔍 Search</button>
            <button type="button" onClick={handleClear} style={{ padding: '0.6rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Clear</button>
          </div>
        </form>

        <p style={{ color: '#666' }}>Found: {vacancies.length} vacancies</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : vacancies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem' }}>No vacancies found</div>
                ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {vacancies.map(v => (
              <div key={v.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative' }}>
                {/* ❤️ Heart button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleFavorite(v.id); }}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: v.is_favorited ? '#ef4444' : '#d1d5db' }}
                >
                  {v.is_favorited ? '❤️' : '🤍'}
                </button>

                <div onClick={() => setSelectedVacancy(v)} style={{ cursor: 'pointer', paddingRight: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{v.title}</h2>
                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>{v.salary_min && v.salary_max ? `${Number(v.salary_min).toLocaleString()} - ${Number(v.salary_max).toLocaleString()} ${v.currency}` : ''}</span>
                  </div>
                  <p style={{ color: '#666', margin: '0.5rem 0' }}>📍 {v.location || 'Remote'}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.7rem', borderRadius: '1rem', fontSize: '0.85rem' }}>{v.duration?.replace(/_/g, ' ')}</span>
                    <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.7rem', borderRadius: '1rem', fontSize: '0.85rem' }}>{v.replacement_reason}</span>
                    {v.is_remote && <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.7rem', borderRadius: '1rem', fontSize: '0.85rem' }}>Remote</span>}
                    {v.is_urgent && <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.7rem', borderRadius: '1rem', fontSize: '0.85rem' }}>Urgent</span>}
                  </div>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>Posted: {new Date(v.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ApplyForm({ vacancyId, onCancel, onSuccess }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes/');
      setResumes(response.data.results || response.data);
    } catch (error) { console.error('Error:', error); }
  };

  const handleSubmit = async () => {
    if (!selectedResume) {
      alert('Please select a resume');
      return;
    }
    try {
      setLoading(true);
      await api.post(`/vacancies/${vacancyId}/apply/`, {
        resume_id: selectedResume,
        cover_letter: coverLetter
      });
      onSuccess();
    } catch (error) {
      alert('Error: ' + JSON.stringify(error.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.75rem', marginTop: '0.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Apply for this position</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Select Resume *</label>
        <select 
          value={selectedResume} 
          onChange={(e) => setSelectedResume(e.target.value)}
          style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem', background: 'white' }}
        >
          <option value="">Choose a resume...</option>
          {resumes.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Cover Letter (optional)</label>
        <textarea 
          value={coverLetter} 
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Why are you interested in this position?"
          rows="3"
          style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          style={{ flex: 1, padding: '0.8rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
        >
          {loading ? 'Submitting...' : '✓ Submit Application'}
        </button>
        <button 
          onClick={onCancel}
          style={{ padding: '0.8rem 1.5rem', background: '#e5e7eb', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default VacanciesPage;