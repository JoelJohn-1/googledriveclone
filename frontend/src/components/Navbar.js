import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function Navbar({ isAuthenticated, handleIsAuthenticated }) {
  const navigate = useNavigate();

  Navbar.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    handleIsAuthenticated: PropTypes.string.isRequired
  }


  const handleLogout = () => {
    localStorage.removeItem('token');
    handleIsAuthenticated();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div>
        <Link to="/home" style={styles.link}>Dashboard</Link>
        {!isAuthenticated && (
          <>
            <Link to="/signup" style={styles.link}>Signup</Link>
            <Link to="/login" style={styles.link}>Login</Link>
          </>
        )}
      </div>
      {isAuthenticated && (
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    padding: '1rem',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
  },
  link: {
    marginRight: '1rem',
    textDecoration: 'none',
    color: 'black',
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    borderRadius: '4px',
  },
};

export default Navbar;
