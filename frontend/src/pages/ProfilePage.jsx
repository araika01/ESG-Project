import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '',
    company_name: '', position: '', department: '',
    experience_years: '', skills: '', bio: '',
    available_for_work: true
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        company_name: user.company_name || '',
        position: user.position || '',
        department: user.department || '',
        experience_years: user.experience_years || '',
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
        available_for_work: user.available_for_work ?? true
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
      };
      
      await api.put('/auth/users/me/', data);
      setMessage('Profile updated!');
      setEditing(false);
      
      window.location.reload();
    } catch (error) {
      console.error('Save error:', error.response?.data);
      setMessage('Error: ' + JSON.stringify(error.response?.data));
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const InfoRow = ({ label, value }) => (
    <div style={{ padding: '1rem 0', borderBottom: '1px solid #f0f0f0' }}>
      <p style={{ color: '#999', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>{label}</p>
      <p style={{ color: '#333', fontWeight: '500', margin: 0 }}>{value || 'Not specified'}</p>
    </div>
  );

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
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span onClick={() => navigate('/profile')} style={{ color: '#666', cursor: 'pointer' }}>👤 Profile</span>
            <span style={{ color: '#666' }}>{user?.first_name}</span>
            <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          
          {/* Avatar & Name */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto', color: 'white', fontSize: '2rem', fontWeight: 'bold'
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <h2 style={{ margin: '0 0 0.25rem 0' }}>{user?.first_name} {user?.last_name}</h2>
            <p style={{ color: '#667eea', margin: 0, fontWeight: '500' }}>{user?.role?.toUpperCase()}</p>
            <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.25rem 0' }}>{user?.email}</p>
            {user?.rating > 0 && (
              <p style={{ color: '#f59e0b' }}>★ {user.rating.toFixed(1)} ({user.total_reviews} reviews)</p>
            )}
          </div>

          {/* Message */}
          {message && (
            <div style={{ 
              background: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
              color: message.includes('Error') ? '#dc2626' : '#166534',
              padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {/* Edit/Save Button */}
          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{ padding: '0.5rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditing(false)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '0.5rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>💾 Save</button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          {editing ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>First Name</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Last Name</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Company</label>
                <input name="company_name" value={formData.company_name} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Position</label>
                  <input name="position" value={formData.position} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Department</label>
                  <input name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Experience (years)</label>
                <input name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Skills (comma separated)</label>
                <input name="skills" value={formData.skills} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={formData.available_for_work} onChange={(e) => setFormData({...formData, available_for_work: e.target.checked})} />
                Available for work
              </label>
            </div>
          ) : (
            <div>
              <InfoRow label="📞 Phone" value={formData.phone} />
              <InfoRow label="🏢 Company" value={formData.company_name} />
              <InfoRow label="💼 Position" value={formData.position} />
              <InfoRow label="🏗️ Department" value={formData.department} />
              <InfoRow label="⏳ Experience" value={formData.experience_years ? `${formData.experience_years} years` : ''} />
              <InfoRow label="🛠️ Skills" value={formData.skills} />
              <InfoRow label="📝 Bio" value={formData.bio} />
              <div style={{ padding: '1rem 0' }}>
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>Status</p>
                <span style={{ 
                  background: formData.available_for_work ? '#dcfce7' : '#fef2f2',
                  color: formData.available_for_work ? '#166534' : '#dc2626',
                  padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.9rem'
                }}>
                  {formData.available_for_work ? '✅ Available' : '❌ Not available'}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;