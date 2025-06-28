import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { parseJwt } from '../route';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login request to Flask backend
      const res = await axios.post('http://localhost:5000/auth/login', formData);
      const { access_token } = res.data;

      if (!access_token) {
        setMessage('Login failed: No token received.');
        return;
      }

      // Store JWT in localStorage
      localStorage.setItem('token', access_token);

      // Decode JWT to extract user role and id
      const decoded = parseJwt(access_token);
      const role = decoded?.sub?.role;
      const userId = decoded?.sub?.id;

      // Store role and id locally for later use
      localStorage.setItem('role', role);
      localStorage.setItem('id', userId);

      // Redirect user based on role
      switch (role) {
        case 'patient':
          navigate('/patient-dashboard');
          break;
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'labtech':
          navigate('/labtech-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          setMessage('Login succeeded but role is unknown.');
      }

    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="container">
      <h2>Clinic Manager Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input type="text" name="username" required onChange={handleChange} />

        <label>Password</label>
        <input type="password" name="password" required onChange={handleChange} />

        <button type="submit">Login</button>
      </form>

      {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account? <a href="/">Register</a>
      </p>
    </div>
  );
};

export default Login;
