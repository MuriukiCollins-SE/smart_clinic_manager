// src/components/Register.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'patient'
  })

  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:5000/auth/register', formData)
      setMessage(res.data.msg)

      // Redirect based on role
      setTimeout(() => {
        switch (formData.role) {
          case 'patient':
            navigate('/patient-dashboard')
            break
          case 'doctor':
            navigate('/doctor-dashboard')
            break
          case 'labtech':
            navigate('/labtech-dashboard')
            break
          case 'admin':
            navigate('/admin-dashboard')
            break
          default:
            break
        }
      }, 1000)

    } catch (err) {
      setMessage(err.response?.data?.msg || 'Registration failed')
    }
  }

  return (
    <div className="container">
      <h2>Clinic Manager Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input type="text" name="full_name" required onChange={handleChange} />

        <label>Username</label>
        <input type="text" name="username" required onChange={handleChange} />

        <label>Password</label>
        <input type="password" name="password" required onChange={handleChange} />

        <label>Role</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="labtech">Lab Technician</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Register</button>
      </form>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already registered? <a href="/login">Login</a>
      </p>
    </div>
  )
}

export default Register
