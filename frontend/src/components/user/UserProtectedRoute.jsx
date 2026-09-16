import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import StudentLayout from './StudentLayout';

function UserProtectedRoute({ children }) {
  const { isAuthenticated } = useUserAuth();

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  return <StudentLayout>{children}</StudentLayout>;
}

export default UserProtectedRoute;