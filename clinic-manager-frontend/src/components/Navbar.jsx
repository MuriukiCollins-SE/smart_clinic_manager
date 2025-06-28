// src/components/Navbar.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav style={{
      padding: '1rem',
      background: '#007bff',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <span><strong>Clinic Manager</strong></span>
      <button onClick={handleLogout} style={{
        background: '#fff',
        color: '#007bff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>Logout</button>
    </nav>
  )
}

export default Navbar
