import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navigation from './components/Navigation';
import DoctorNavigation from './components/DoctorNavigation';
import AdminNavigation from './components/AdminNavigation';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Upload = lazy(() => import('./pages/Upload'));
const Consult = lazy(() => import('./pages/Consult'));
const LLMAnalysis = lazy(() => import('./pages/LLMAnalysis'));
const History = lazy(() => import('./pages/History'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Doctors = lazy(() => import('./pages/Doctors'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const PatientRequests = lazy(() => import('./pages/doctor/PatientRequests'));
const ActiveConsultations = lazy(() => import('./pages/doctor/ActiveConsultations'));
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'));
const DoctorReports = lazy(() => import('./pages/doctor/DoctorReports'));
const DoctorSettings = lazy(() => import('./pages/doctor/DoctorSettings'));
const DoctorNotifications = lazy(() => import('./pages/doctor/DoctorNotifications'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDoctors = lazy(() => import('./pages/admin/AdminDoctors'));
const AdminPatients = lazy(() => import('./pages/admin/AdminPatients'));
const AdminPasswordResets = lazy(() => import('./pages/admin/AdminPasswordResets'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, loading, isDoctor, isAdmin, role } = useAuth();
  const { theme } = useTheme();

  // Update document title based on role
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        document.title = 'Medicare Admin Portal';
      } else if (isDoctor) {
        document.title = 'Medicare Doctor Portal';
      } else {
        document.title = 'Medicare Patient Portal';
      }
    } else {
      document.title = 'Medicare Portal - Login';
    }
  }, [isAuthenticated, isAdmin, isDoctor, role]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthenticated ? (
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Suspense>
      ) : isAdmin ? (
        <AdminNavigation>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/doctors" element={<ProtectedRoute requiredRole="admin"><AdminDoctors /></ProtectedRoute>} />
              <Route path="/admin/patients" element={<ProtectedRoute requiredRole="admin"><AdminPatients /></ProtectedRoute>} />
              <Route path="/admin/password-resets" element={<ProtectedRoute requiredRole="admin"><AdminPasswordResets /></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="admin"><AdminAuditLogs /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AdminNavigation>
      ) : isDoctor ? (
        <DoctorNavigation>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/requests" element={<ProtectedRoute requiredRole="doctor"><PatientRequests /></ProtectedRoute>} />
              <Route path="/doctor/consultations" element={<ProtectedRoute requiredRole="doctor"><ActiveConsultations /></ProtectedRoute>} />
              <Route path="/doctor/patients" element={<ProtectedRoute requiredRole="doctor"><DoctorPatients /></ProtectedRoute>} />
              <Route path="/doctor/reports" element={<ProtectedRoute requiredRole="doctor"><DoctorReports /></ProtectedRoute>} />
              <Route path="/doctor/notifications" element={<ProtectedRoute requiredRole="doctor"><DoctorNotifications /></ProtectedRoute>} />
              <Route path="/doctor/settings" element={<ProtectedRoute requiredRole="doctor"><DoctorSettings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
            </Routes>
          </Suspense>
        </DoctorNavigation>
      ) : (
        <Navigation>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="patient"><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute requiredRole="patient"><Upload /></ProtectedRoute>} />
              <Route path="/consult" element={<ProtectedRoute requiredRole="patient"><Consult /></ProtectedRoute>} />
              <Route path="/doctors" element={<ProtectedRoute requiredRole="patient"><Doctors /></ProtectedRoute>} />
              <Route path="/llm-analysis" element={<ProtectedRoute requiredRole="patient"><LLMAnalysis /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute requiredRole="patient"><History /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute requiredRole="patient"><Notifications /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute requiredRole="patient"><Settings /></ProtectedRoute>} />
              <Route path="/doctor-profile/:doctorId" element={<ProtectedRoute requiredRole="patient"><DoctorProfile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Navigation>
      )}
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
