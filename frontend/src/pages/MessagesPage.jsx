/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const conversationId = params.get('conversation');
  if (conversationId && conversations.length > 0) {
    const conv = conversations.find(c => c.id === parseInt(conversationId));
    if (conv) selectConversation(conv);
  }
}, [conversations]);
  

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations/');
      setConversations(res.data.results || res.data);
    } catch (e) { console.error(e); }
  };

  const selectConversation = async (conv) => {
    setSelected(conv);
    setMessages(conv.messages || []);
    await api.post(`/conversations/${conv.id}/read/`);
    fetchConversations();
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post(`/conversations/${selected.id}/send/`, { text });
      setMessages([...messages, res.data]);
      setText('');
      fetchConversations();
    } catch (e) { console.error(e); }
  };

  

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const unreadCount = (conv) => {
    return conv.messages?.filter(m => !m.is_read && m.sender !== user?.id).length || 0;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#667eea', cursor: 'pointer', margin: 0 }} onClick={() => navigate('/vacancies')}>TempWork</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span onClick={() => navigate('/vacancies')} style={{ color: '#666', cursor: 'pointer' }}>Vacancies</span>
              <span onClick={() => navigate('/applications')} style={{ color: '#666', cursor: 'pointer' }}>My Applications</span>
              <span onClick={() => navigate('/favorites')} style={{ color: '#666', cursor: 'pointer' }}>Favorites</span>
              <span onClick={() => navigate('/reviews')} style={{ color: '#666', cursor: 'pointer' }}>Reviews</span>
              <span onClick={() => navigate('/resumes')} style={{ color: '#666', cursor: 'pointer' }}>Resumes</span>
              <span onClick={() => navigate('/messages')} style={{ color: '#667eea', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>Messages</span>
          </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span onClick={() => navigate('/notifications')} style={{ color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>🔔</span>
            <span onClick={() => navigate('/profile')} style={{ color: '#666', cursor: 'pointer' }}>👤 Profile</span>
            <span style={{ color: '#666' }}>{user?.first_name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '1rem auto', padding: '0 1rem', display: 'flex', gap: '1rem', height: 'calc(100vh - 140px)' }}>
        {/* Conversations List */}
        <div style={{ width: '350px', background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ padding: '1rem', borderBottom: '1px solid #eee', margin: 0 }}>Conversations</h3>
          <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
            {conversations.map(c => (
              <div key={c.id} onClick={() => selectConversation(c)} style={{ 
                padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                background: selected?.id === c.id ? '#f0f4ff' : 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: '600', margin: 0 }}>{c.other_user?.name || 'User'}</p>
                  {unreadCount(c) > 0 && (
                    <span style={{ background: '#667eea', color: 'white', padding: '2px 8px', borderRadius: '50%', fontSize: '0.8rem' }}>{unreadCount(c)}</span>
                  )}
                </div>
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  {c.last_message?.text?.substring(0, 40)}...
                </p>
              </div>
            ))}
            {conversations.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No conversations</p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, background: 'white', borderRadius: '1rem', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {selected ? (
            <>
              <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                <p style={{ fontWeight: '600', margin: 0 }}>{selected.other_user?.name}</p>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === user?.id ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ 
                      maxWidth: '70%', padding: '0.7rem 1rem', borderRadius: '1rem',
                      background: m.sender === user?.id ? '#667eea' : '#f0f0f0',
                      color: m.sender === user?.id ? 'white' : '#333'
                    }}>
                      <p style={{ margin: 0 }}>{m.text}</p>
                      <p style={{ fontSize: '0.7rem', margin: '5px 0 0 0', opacity: 0.7 }}>{new Date(m.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." style={{ flex: 1, padding: '0.7rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
                <button onClick={sendMessage} style={{ padding: '0.7rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Send</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              Select a conversation
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MessagesPage;