// src/App.jsx - REPLACE YOUR ENTIRE FILE WITH THIS
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner'; // Using sonner instead of toast

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TeachPage from './pages/teach/TeachPage';
import TopicsPage from './pages/topics/TopicDetailPage';
import TopicDetailPage from './pages/topics/TopicDetailPage';
import NotesPage from './pages/notes/NotesPage';
import ProgressPage from './pages/progress/ProgressPage';
import RoomsPage from './pages/rooms/RoomDetailPage';
import RoomDetailPage from './pages/rooms/RoomDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import SessionDetailPage from './pages/sessions/SessionDetailPage';
import SessionHistoryPage from './pages/sessions/SessionHistoryPage';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes - Dashboard Layout */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Topics */}
              <Route path="/topics" element={<TopicsPage />} />
              <Route path="/topics/:id" element={<TopicDetailPage />} />
              
              {/* Teaching */}
              <Route path="/teach/:topicId" element={<TeachPage />} />
              
              {/* Sessions */}
              <Route path="/sessions" element={<SessionHistoryPage />} />
              <Route path="/sessions/:id" element={<SessionDetailPage />} />
              
              {/* Notes */}
              <Route path="/notes" element={<NotesPage />} />
              
              {/* Study Rooms */}
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              
              {/* Progress */}
              <Route path="/progress" element={<ProgressPage />} />
              
              {/* Profile & Settings */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications - Using Sonner */}
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;