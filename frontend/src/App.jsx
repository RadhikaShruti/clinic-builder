import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import LandingPage from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import BuilderWizard from './pages/builder/BuilderWizard';
import Dashboard from './pages/dashboard/Dashboard';
import ClinicWebsite from './pages/clinic/ClinicWebsite';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page-loader">
      <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="/builder" element={<ProtectedRoute><BuilderWizard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clinic/:slug" element={<ClinicWebsite />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
