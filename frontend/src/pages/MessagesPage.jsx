/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/conversations/');
      setConversations(res.data.results || res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!selected) return;

    const token = localStorage.getItem('access_token');
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    const wsUrl = `${protocol}://${window.location.host}${process.env.REACT_APP_WS_URL}/chat/${selected.id}/?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => {
        // 1. Если пришёл tempId, заменяем временное сообщение подтверждённым
        if (data.tempId) {
          const idx = prev.findIndex(m => m.id === data.tempId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              id: data.msgId || updated[idx].id,
              created_at: data.created_at || updated[idx].created_at,
            };
            return updated;
          }
        }

        // 2. Если уже есть сообщение с таким msgId, не добавляем
        if (data.msgId && prev.some(m => m.id === data.msgId)) return prev;

        // 3. Простейшая защита от дублей по тексту/отправителю в пределах секунды
        const duplicate = prev.find(m =>
          m.sender === data.sender_id &&
          m.text === data.message &&
          Math.abs(new Date(m.created_at) - new Date(data.created_at)) < 1000
        );
        if (duplicate) return prev;

        // 4. Иначе добавляем новое сообщение
        return [...prev, {
          id: data.msgId || Date.now(),
          sender: data.sender_id,
          sender_name: data.sender_name,
          text: data.message,
          created_at: data.created_at || new Date().toISOString(),
        }];
      });
    };

    socket.onerror = (e) => console.error('WebSocket error', e);
    socket.onclose = () => console.log('WebSocket disconnected');

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const loadHistory = async () => {
      try {
        const res = await api.get(`/conversations/${selected.id}/`);
        const history = res.data.messages || [];
        const formatted = history.map(m => ({
          id: m.id,
          sender: typeof m.sender === 'object' ? m.sender.id : m.sender,
          sender_name: m.sender_name || m.sender?.get_full_name?.() || 'User',
          text: m.text,
          created_at: m.created_at,
        }));
        setMessages(formatted);
        await api.post(`/conversations/${selected.id}/read/`);
        fetchConversations();
      } catch (e) { console.error(e); }
    };
    loadHistory();
  }, [selected, fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const socket = socketRef.current;
    if (!socket) return;

    const tempId = Date.now();
    const newMsg = {
      id: tempId,
      sender: user.id,
      sender_name: user.first_name,
      text: text,
      created_at: new Date().toISOString(),
    };

    // Оптимистично добавляем своё сообщение
    setMessages(prev => [...prev, newMsg]);
    setText('');

    if (socket.readyState === WebSocket.OPEN) {
      // Отправляем tempId, чтобы сервер вернул его и мы заменили сообщение
      socket.send(JSON.stringify({ message: text, tempId }));
    }
  };

  const selectConversation = (conv) => setSelected(conv);

  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (convId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === parseInt(convId));
      if (conv) selectConversation(conv);
    }
  }, [conversations, searchParams]);

  const unreadCount = (conv) => {
    return conv.messages?.filter(m => !m.is_read && m.sender !== user?.id).length || 0;
  };

  const getDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    if (msgDay.getTime() === todayDay.getTime()) return 'Today';
    if (msgDay.getTime() === yesterdayDay.getTime()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const renderMessages = () => {
    if (messages.length === 0) return null;
    let lastDate = null;
    return messages.map(m => {
      const msgDate = new Date(m.created_at);
      const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
      let separator = null;
      if (!lastDate || msgDay.getTime() !== lastDate.getTime()) {
        separator = getDateSeparator(m.created_at);
      }
      lastDate = msgDay;
      const isOwn = m.sender === user?.id;
      const timeString = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return (
        <React.Fragment key={m.id}>
          {separator && (
            <div style={{ textAlign: 'center', margin: '1rem 0 0.5rem' }}>
              <span style={{ background: '#e5e7eb', color: '#666', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '500' }}>
                {separator}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', marginBottom: '0.25rem' }}>
            {!isOwn && (
              <span style={{ fontSize: '0.75rem', color: '#999', marginBottom: '2px' }}>
                {m.sender_name || 'User'}
              </span>
            )}
            <div style={{ maxWidth: '70%', padding: '0.7rem 1rem', borderRadius: '1rem', background: isOwn ? '#667eea' : '#f0f0f0', color: isOwn ? 'white' : '#333' }}>
              <p style={{ margin: 0 }}>{m.text}</p>
              <p style={{ fontSize: '0.7rem', margin: '5px 0 0 0', opacity: 0.7 }}>{timeString}</p>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header – без изменений */}
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
        {/* Список бесед */}
        <div style={{ width: '350px', background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ padding: '1rem', borderBottom: '1px solid #eee', margin: 0 }}>Conversations</h3>
          <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
            {conversations.map(c => (
              <div key={c.id} onClick={() => selectConversation(c)} style={{ padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: selected?.id === c.id ? '#f0f4ff' : 'white' }}>
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

        {/* Область чата */}
        <div style={{ flex: 1, background: 'white', borderRadius: '1rem', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {selected ? (
            <>
              <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                <p style={{ fontWeight: '600', margin: 0 }}>{selected.other_user?.name}</p>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {renderMessages()}
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
