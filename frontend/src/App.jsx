import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';

// Layouts & Protected Routes
import ProtectedRoute from './components/layout/ProtectedRoute';
import StudentLayout from './components/layout/StudentLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';
import Results from './pages/Results';

/* Toast uses current theme colors */
const ThemedToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#1e2338' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#0f172a',
          borderRadius: '14px',
          border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(99,102,241,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: isDark ? '#1e2338' : '#fff' },
        },
        error: {
          duration: 5000,
          iconTheme: { primary: '#ef4444', secondary: isDark ? '#1e2338' : '#fff' },
        },
      }}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedToaster />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<StudentLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/results" element={<Results />} />
              <Route path="/exam/:chapterId" element={<Exam />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;