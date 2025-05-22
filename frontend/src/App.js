import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import Document from './pages/Document';
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
          element={<Navigate to="/home"/>}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
         <Route
          path="/documents/:documentId"
          element={isAuthenticated ? <Document /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/home" /> : <Signup/>}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login handleIsAuthenticated={handleIsAuthenticated} />}
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
