import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import MaterialRequestForm from './pages/MaterialRequestForm';
import MyRequests from './pages/MyRequests';
import MaterialImport from './pages/MaterialImport';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/users" element={<ErrorBoundary><UserManagement /></ErrorBoundary>} />
              <Route path="/request/new" element={<ErrorBoundary><MaterialRequestForm /></ErrorBoundary>} />
              <Route path="/requests/my" element={<ErrorBoundary><MyRequests /></ErrorBoundary>} />
              <Route path="/approvals" element={<ErrorBoundary><Approvals /></ErrorBoundary>} />
              <Route path="/import" element={<ErrorBoundary><MaterialImport /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
            </Route>
          </Route>

          <Route path="/unauthorized" element={
            <div className="h-screen flex items-center justify-center font-bold text-red-500">
              403 - Unauthorized Access
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
