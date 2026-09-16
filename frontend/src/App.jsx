import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import UserProtectedRoute from './components/user/UserProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/admin/Dashboard';
import CreateForm from './pages/admin/CreateForm';
import ViewTemplates from './pages/admin/ViewTemplates';
import EditTemplate from './pages/admin/EditTemplate';
import Submissions from './pages/admin/Submissions';
import SubmissionVerification from './pages/admin/SubmissionVerification';
import FormList from './pages/user/FormList';
import StudentServicesPage from './pages/user/StudentServicesPage';
import FillForm from './pages/user/FillForm';
import SubmitSuccess from './pages/user/SubmitSuccess';
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';
import MySubmissions from './pages/user/MySubmissions';
import MyDocuments from './pages/user/MyDocuments';
import MyCertificates from './pages/user/MyCertificates';
import StudentProfile from './pages/user/StudentProfile';
import StudentHelp from './pages/user/StudentHelp';

function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-form"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <CreateForm />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/view-templates"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <ViewTemplates />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/templates/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <EditTemplate />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/submissions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <Submissions />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/submissions/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <SubmissionVerification />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/dashboard"
              element={
                <UserProtectedRoute>
                  <FormList />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/forms"
              element={
                <UserProtectedRoute>
                  <StudentServicesPage />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/forms/:id"
              element={
                <UserProtectedRoute>
                  <FillForm />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/forms/success"
              element={
                <UserProtectedRoute>
                  <SubmitSuccess />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/user/my-submissions"
              element={
                <UserProtectedRoute>
                  <MySubmissions />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/user/documents"
              element={
                <UserProtectedRoute>
                  <MyDocuments />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/user/certificates"
              element={
                <UserProtectedRoute>
                  <MyCertificates />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <UserProtectedRoute>
                  <StudentProfile />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/user/help"
              element={
                <UserProtectedRoute>
                  <StudentHelp />
                </UserProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </UserAuthProvider>
    </AuthProvider>
  );
}

export default App;
