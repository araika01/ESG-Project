import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function MatchWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat');   // 'chat', 'vacancies', 'candidates'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myVacancies, setMyVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState('');

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (open && user?.role === 'employer') {
      fetchMyVacancies();
    }
  }, [open, user]);

  const fetchMyVacancies = async () => {
    try {
      const res = await api.get('/vacancies/my/');
      setMyVacancies(res.data.results || res.data);
    } catch (e) { console.error(e); }
  };

  // Matching handlers
  const handleMatchVacancies = async () => {
    setLoading(true);
    try {
      const res = await api.post('/match/vacancies/');
      setResults(res.data.results || []);
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchCandidates = async () => {
    if (!selectedVacancy) return alert('Select a vacancy');
    setLoading(true);
    try {
      const res = await api.post('/match/candidates/', { vacancy_id: selectedVacancy });
      setResults(res.data.results || []);
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Chat handler
  const sendChat = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await api.post('/bot/chat/', { message: input });
      const botMsg = { sender: 'bot', text: res.data.reply };
      setChatHistory(prev => [...prev, botMsg]);
    } catch {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Bot is unavailable right now.' }]);
    }
  };

  const reset = () => {
    setResults([]);
    setTab('chat');
  };

  const tabButtonStyle = (name) => ({
    flex: 1,
    padding: '0.5rem',
    background: tab === name ? '#667eea' : '#f0f0f0',
    color: tab === name ? 'white' : '#333',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    borderRadius: name === 'chat' ? '0.5rem 0 0 0.5rem' : name === 'candidates' ? '0 0.5rem 0.5rem 0' : '0',
  });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        🤖
      </button>

      {/* Popup window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '5rem',
          right: '2rem',
          width: '380px',
          maxHeight: '500px',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: '600' }}>🤖 AI Assistant</span>
            <button
              onClick={() => { setOpen(false); reset(); }}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <button onClick={() => setTab('chat')} style={tabButtonStyle('chat')}>Chat</button>
            <button onClick={() => setTab('vacancies')} style={tabButtonStyle('vacancies')}>Find Jobs</button>
            <button onClick={() => setTab('candidates')} style={tabButtonStyle('candidates')}>Find Talent</button>
          </div>

          {/* Content */}
          <div style={{ padding: '0 1rem 1rem', overflowY: 'auto', flex: 1 }}>
            {results.length > 0 && tab !== 'chat' && (
              <div>
                <button
                  onClick={reset}
                  style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', padding: 0 }}
                >
                  ← Back
                </button>
                {results.map(item => (
                  <div
                    key={item.vacancy?.id || item.candidate?.id}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.5rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{item.vacancy?.title || item.candidate?.name}</strong>
                      <span style={{
                        background: '#e0e7ff', color: '#4338ca', padding: '0.15rem 0.6rem',
                        borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600',
                      }}>
                        {item.match_percent}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      {item.vacancy?.company_name} {item.vacancy?.location || item.candidate?.resume_title}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.25rem' }}>
                      {item.common_skills?.map(skill => (
                        <span key={skill} style={{
                          background: '#f0fdf4', color: '#166534', padding: '0.15rem 0.5rem',
                          borderRadius: '1rem', fontSize: '0.75rem',
                        }}>
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat tab */}
            {tab === 'chat' && (
              <div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                  {chatHistory.map((m, i) => (
                    <div key={i} style={{ textAlign: m.sender === 'user' ? 'right' : 'left', marginBottom: '0.25rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '1rem',
                        background: m.sender === 'user' ? '#667eea' : '#f0f0f0',
                        color: m.sender === 'user' ? 'white' : '#333',
                        maxWidth: '80%',
                      }}>
                        {m.text}
                      </span>
                    </div>
                  ))}
                  {chatHistory.length === 0 && (
                    <p style={{ color: '#999', textAlign: 'center', marginTop: '2rem' }}>
                      Ask me anything about vacancies, resumes, or skills.
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                  />
                  <button
                    onClick={sendChat}
                    style={{
                      padding: '0.5rem 1rem', background: '#667eea', color: 'white',
                      border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                    }}
                  >
                    ➤
                  </button>
                </div>
              </div>
            )}

            {/* Find Jobs tab */}
            {tab === 'vacancies' && !results.length && (
              <div>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  I'll analyze your skills and find the best matching vacancies.
                </p>
                <button
                  onClick={handleMatchVacancies}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.7rem', background: '#667eea', color: 'white',
                    border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem',
                  }}
                >
                  {loading ? 'Searching...' : '🔍 Show matching vacancies'}
                </button>
              </div>
            )}

            {/* Find Talent tab */}
            {tab === 'candidates' && !results.length && (
              <div>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Select one of your vacancies to find matching candidates.
                </p>
                <select
                  value={selectedVacancy}
                  onChange={e => setSelectedVacancy(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem', border: '1px solid #ddd',
                    borderRadius: '0.5rem', marginBottom: '0.75rem', background: 'white',
                  }}
                >
                  <option value="">-- Select a vacancy --</option>
                  {myVacancies.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleMatchCandidates}
                  disabled={loading || !selectedVacancy}
                  style={{
                    width: '100%', padding: '0.7rem', background: '#10b981', color: 'white',
                    border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem',
                  }}
                >
                  {loading ? 'Searching...' : '👥 Find candidates'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MatchWidget;