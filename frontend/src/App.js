import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VacanciesPage from './pages/VacanciesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/Notifications';
import ReviewsPage from './pages/ReviewsPage';
import ResumesPage from './pages/ResumesPage';
import CreateResumePage from './pages/CreateResumePage';
import MessagesPage from './pages/MessagesPage';
import MatchWidget from './components/MatchWidget';

// Компонент, который рендерит виджет только если пользователь авторизован
function AppContent() {
  const { user } = useAuth();
  return (
    <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/resumes" element={<ResumesPage />} />
          <Route path="/resumes/create" element={<CreateResumePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    
      {user && <MatchWidget />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;