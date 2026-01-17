import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Dashboard from './views/Dashboard';
import SetupSession from './views/SetupSession';
import LiveMeeting from './views/LiveMeeting';
import CommentTracker from './views/CommentTracker';
import AttendanceCounter from './views/AttendanceCounter';
import MeetingReport from './views/MeetingReport';
import DisplayMode from './views/DisplayMode';
import Statistics from './views/Statistics';
import Settings from './views/Settings';
import Login from './views/Login';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/setup" element={<ProtectedRoute><SetupSession /></ProtectedRoute>} />
      <Route path="/live" element={<ProtectedRoute><LiveMeeting /></ProtectedRoute>} />
      <Route path="/display" element={<ProtectedRoute><DisplayMode /></ProtectedRoute>} />
      <Route path="/comment" element={<ProtectedRoute><CommentTracker /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendanceCounter /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><MeetingReport /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;