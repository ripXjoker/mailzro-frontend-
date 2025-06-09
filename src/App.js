// client/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- NEW IMPORTS ---
import EmailCleaner from './components/EmailCleaner'; // Import the new EmailCleaner component

// Placeholder for AuthCallback. You might already have this or need to create it.
// This component handles the redirect from Google's OAuth after successful login.
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // This component usually handles parsing the code from the URL and
    // sending it to your backend's /auth/google/callback endpoint.
    // Since the backend already handles the redirect to /dashboard,
    // this component simply acts as a temporary landing spot if needed,
    // or you can configure your backend to redirect directly to dashboard.
    // For now, let's just redirect to dashboard or home.
    console.log("AuthCallback: Redirecting to dashboard...");
    navigate('/dashboard'); // Or navigate('/')
  }, [navigate]);

  return <div>Authenticating...</div>;
}


// --- Home Page Component ---
function HomePage() {
  return (
    <div>
      <h1>Welcome!</h1>
      <p>Please connect your Gmail account to continue.</p>
      <a href="http://localhost:5000/auth/google">
        <button>Connect with Gmail</button>
      </a>
    </div>
  );
}

// --- Dashboard Page Component ---
function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false); // To track if auth check fails
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const verifyUser = async () => {
      try {
        console.log("DashboardPage: useEffect triggered. Attempting to fetch /api/current_user...");
        const response = await axios.get('http://localhost:5000/api/current_user', {
          withCredentials: true
        });
        console.log("DashboardPage: /api/current_user response received:", response.data);

        if (response.data && response.data.isAuthenticated) {
          setUser(response.data.user);
        } else {
          console.log("DashboardPage: Not authenticated by backend or missing user data. Response was:", response.data);
          setAuthError(true); // Mark that authentication check failed
        }
      } catch (error) {
        if (error.response) {
          console.error("DashboardPage: Error fetching current user - Server responded:", error.response.data, error.response.status, error.response.headers);
        } else if (error.request) {
          console.error("DashboardPage: Error fetching current user - No response received from server:", error.request);
        } else {
          console.error('DashboardPage: Error fetching current user - Request setup error:', error.message);
        }
        setAuthError(true); // Mark that authentication check failed due to an error
      } finally {
        console.log("DashboardPage: verifyUser finally block. Setting loading to false.");
        setLoading(false);
      }
    };

    verifyUser();
  }, []); // Empty dependency array: runs once on component mount

  const handleLogout = async () => {
    try {
      console.log("DashboardPage: Attempting to logout via /api/logout...");
      const response = await axios.get('http://localhost:5000/api/logout', { withCredentials: true });
      console.log("DashboardPage: Logout response:", response.data);
      if (response.data && response.data.success) {
        setUser(null); // Clear local user state
        console.log("DashboardPage: Logout successful, navigating to /");
        navigate('/'); // Navigate to home page
      } else {
        console.error("DashboardPage: Logout failed on backend or unexpected response.");
      }
    } catch (error) {
      console.error("DashboardPage: Error during logout API call:", error);
    }
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  // If authError is true OR user is null after loading, redirect to home.
  // This handles both explicit non-authentication and errors during auth check.
  if (authError || !user) {
    console.log(`DashboardPage: Redirecting to home. authError: ${authError}, user: ${user}`);
    return <Navigate to="/" replace />;
  }

  // If loading is false, and no authError, and user is present:
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.displayName || user.email}!</p>
      <p>Your Email: {user.email}</p>
      <button onClick={handleLogout}>Logout</button>
      {/* Placeholder for email list component */}
      <div>
        <h2>Your Emails</h2>
        <p>(Email list will go here in Phase 2)</p>
      </div>
    </div>
  );
}

// --- Error Page for Google OAuth Callback problems ---
function AuthErrorPage() {
    const queryParams = new URLSearchParams(window.location.search);
    const message = queryParams.get('message') || "Unknown authentication error.";
    const details = queryParams.get('details');
    return (
        <div>
            <h1>Authentication Error</h1>
            <p><strong>Message:</strong> {message}</p>
            {details && <p><strong>Details:</strong> {details}</p>}
            <Link to="/">Go to Home</Link>
        </div>
    );
}

// --- Main App Structure ---
function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
          <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
          {/* --- NEW LINK FOR EMAIL CLEANER --- */}
          <Link to="/cleaner" style={{ marginRight: '15px' }}>Email Cleaner</Link>
        </nav>
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* --- NEW ROUTE FOR EMAIL CLEANER --- */}
            <Route path="/cleaner" element={<EmailCleaner />} />
            <Route path="/error" element={<AuthErrorPage />} />
            {/* --- ROUTE FOR GOOGLE AUTH CALLBACK --- */}
            <Route path="/auth/google/callback" element={<AuthCallback />} />
            <Route path="*" element={<div><h2>Page Not Found</h2><Link to="/">Go Home</Link></div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;