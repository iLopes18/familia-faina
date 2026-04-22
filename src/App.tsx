import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
      </div>
    );
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
      </div>
    );
  return !currentUser ? <>{children}</> : <Navigate to="/" />;
};

import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
