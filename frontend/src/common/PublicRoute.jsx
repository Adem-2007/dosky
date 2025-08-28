import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PublicRoute = (props) => {
  const { user, loading } = useAuth();

  if (loading) {
     return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  // If the user is already logged in, redirect them to the homepage.
  // Otherwise, show the public route (e.g., the login page).
  return !user ? <Route {...props} /> : <Redirect to="/" />;
};

export default PublicRoute;