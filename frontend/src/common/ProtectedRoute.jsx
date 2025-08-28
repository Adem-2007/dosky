import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = (props) => {
  const { user, loading } = useAuth();

  // Show a loading state while authentication status is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  // If loading is finished and user is authenticated, render the component.
  // Otherwise, redirect them to the authentication page.
  return user ? <Route {...props} /> : <Redirect to="/auth" />;
};

export default ProtectedRoute;