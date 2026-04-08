import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts & Protected Routes
import ProtectedRoute from './components/layout/ProtectedRoute';
import StudentLayout from './components/layout/StudentLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';
import Results from './pages/Results';

function App() {
  return (
    <AuthProvider>
      {/* Toast notifications configuration */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            style: {
              background: '#059669', // Tailwind emerald-600
            },
          },
          error: {
            style: {
              background: '#dc2626', // Tailwind red-600
            },
            duration: 5000,
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/results" element={<Results />} />
            
            {/* The Exam route is inside the layout but handles its own view dynamically */}
            <Route path="/exam/:chapterId" element={<Exam />} />
          </Route>
        </Route>

        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;