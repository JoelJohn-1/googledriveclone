import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleIsAuthenticated = () => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  };
  
  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} handleIsAuthenticated={handleIsAuthenticated} />
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup handleIsAuthenticated={handleIsAuthenticated} />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login handleIsAuthenticated={handleIsAuthenticated} />}
        />
        <Route
          path="*"
          element={<h2 style={{ padding: '2rem' }}>404 - Page not found</h2>}
        />
      </Routes>
    </Router>
  );
}

export default App;
