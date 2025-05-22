import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import PropTypes from 'prop-types';

function Login({ handleIsAuthenticated }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  Login.propTypes = {
    handleIsAuthenticated: PropTypes.string.isRequired
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.username, form.password);
      handleIsAuthenticated();
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
