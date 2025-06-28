// src/components/dashboards/DoctorDashboard.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'

const DoctorDashboard = () => {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [prescriptionText, setPrescriptionText] = useState('')
  const [labtechId, setLabtechId] = useState('')
  const [labtestDescription, setLabtestDescription] = useState('')
  const [labtechs, setLabtechs] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchPatients()
    fetchLabTechs()
  }, [])

  const fetchPatients = async () => {
    const res = await axios.get('http://localhost:5000/doctor/patients', { headers })
    setPatients(res.data)
  }

  const fetchLabTechs = async () => {
    const res = await axios.get('http://localhost:5000/admin/users', { headers })
    const labTechOnly = res.data.filter(user => user.role === 'labtech')
    setLabtechs(labTechOnly)
  }

  const handlePrescribe = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/doctor/prescribe', {
        patient_id: selectedPatientId,
        content: prescriptionText
      }, { headers })
      setMessage('Prescription submitted.')
      setPrescriptionText('')
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Prescription failed.')
    }
  }

  const handleRecommendLab = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/doctor/recommend-lab', {
        patient_id: selectedPatientId,
        labtech_id: labtechId,
        description: labtestDescription
      }, { headers })
      setMessage('Lab test recommended to lab technician.')
      setLabtechId('')
      setLabtestDescription('')
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Lab assignment failed.')
    }
  }

  return (
    <div className="container">
      <h2>Doctor Dashboard</h2>

      <h3>Assigned Patients</h3>
      <div className="table-container">
        {patients.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Lab Results</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.appointment_id}>
                  <td>{p.patient_name}</td>
                  <td>
                    {p.lab_results.length > 0 ? (
                      <ul>
                        {p.lab_results.map((res) => (
                          <li key={res.id}>{res.results || 'Pending'} ({res.created_at})</li>
                        ))}
                      </ul>
                    ) : 'None'}
                  </td>
                  <td>
                    <button onClick={() => setSelectedPatientId(p.patient_id)}>Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No assigned patients yet.</p>}
      </div>

      {selectedPatientId && (
        <>
          <hr />
          <h3>Assign Prescription</h3>
          <form onSubmit={handlePrescribe}>
            <textarea
              placeholder="Write prescription..."
              required
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
            />
            <button type="submit">Submit Prescription</button>
          </form>

          <hr />
          <h3>Recommend Lab Test</h3>
          <form onSubmit={handleRecommendLab}>
            <label>Select Lab Technician</label>
            <select value={labtechId} onChange={(e) => setLabtechId(e.target.value)} required>
              <option value="">-- Select --</option>
              {labtechs.map((tech) => (
                <option key={tech.id} value={tech.id}>{tech.full_name}</option>
              ))}
            </select>
            <textarea
              placeholder="Describe lab test..."
              value={labtestDescription}
              onChange={(e) => setLabtestDescription(e.target.value)}
              required
            />
            <button type="submit">Assign Lab Test</button>
          </form>
        </>
      )}

      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  )
}

export default DoctorDashboard
