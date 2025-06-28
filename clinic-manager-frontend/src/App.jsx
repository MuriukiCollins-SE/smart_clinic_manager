// src/App.jsx

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import PatientDashboard from './components/dashboards/PatientDashboard'
import DoctorDashboard from './components/dashboards/DoctorDashboard'
import LabtechDashboard from './components/dashboards/LabtechDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/labtech-dashboard" element={<LabtechDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
