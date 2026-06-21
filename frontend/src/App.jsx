import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Lazy load all pages for better performance (Code Splitting)
const LandingPage = React.lazy(() => import('./pages/public/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));

const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const GeneralTest = React.lazy(() => import('./pages/student/GeneralTest'));
const AdaptiveTest = React.lazy(() => import('./pages/student/AdaptiveTest'));
const TestResult = React.lazy(() => import('./pages/student/TestResult'));
const Recommendations = React.lazy(() => import('./pages/student/Recommendations'));
const Profile = React.lazy(() => import('./pages/student/Profile'));

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const QuestionManagement = React.lazy(() => import('./pages/admin/QuestionManagement'));
const StudentList = React.lazy(() => import('./pages/admin/StudentList'));
const ResultsList = React.lazy(() => import('./pages/admin/ResultsList'));

// Fallback loader while lazy components load
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans">
          <Toaster position="top-right" />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Student Routes */}
                  <Route element={<RoleRoute role="student" />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/test/general" element={<GeneralTest />} />
                    <Route path="/student/test/adaptive" element={<AdaptiveTest />} />
                    <Route path="/student/test/result" element={<TestResult />} />
                    <Route path="/student/recommendations" element={<Recommendations />} />
                    <Route path="/student/profile" element={<Profile />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<RoleRoute role="admin" />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/questions" element={<QuestionManagement />} />
                    <Route path="/admin/students" element={<StudentList />} />
                    <Route path="/admin/results" element={<ResultsList />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
