// src/components/dashboards/LabtechDashboard.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'

const LabtechDashboard = () => {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [assignedTests, setAssignedTests] = useState([])
  const [resultInputs, setResultInputs] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAssignedTests()
  }, [])

  const fetchAssignedTests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/labtech/assigned', { headers })
      setAssignedTests(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (id, value) => {
    setResultInputs({ ...resultInputs, [id]: value })
  }

  const handleSubmit = async (e, resultId) => {
    e.preventDefault()
    const results = resultInputs[resultId]
    try {
      await axios.post('http://localhost:5000/labtech/record', {
        result_id: resultId,
        results
      }, { headers })
      setMessage('✅ Lab result submitted.')
      fetchAssignedTests()
    } catch (err) {
      setMessage(err.response?.data?.msg || '❌ Submission failed')
    }
  }

  return (
    <div className="container">
      <header>Lab Technician Dashboard</header>

      <h3>Assigned Lab Tests</h3>
      <div className="table-container">
        {assignedTests.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test Description</th>
                <th>Existing Results</th>
                <th>Submit New Result</th>
              </tr>
            </thead>
            <tbody>
              {assignedTests.map((test) => (
                <tr key={test.id}>
                  <td>{test.patient_name}</td>
                  <td>{test.test_description || <span style={{ color: 'gray' }}>Not specified</span>}</td>
                  <td>{test.results || <span style={{ color: 'gray' }}>Pending</span>}</td>
                  <td>
                    <form onSubmit={(e) => handleSubmit(e, test.id)}>
                      <input
                        type="text"
                        value={resultInputs[test.id] || ''}
                        onChange={(e) => handleChange(test.id, e.target.value)}
                        placeholder="Enter result"
                        required
                      />
                      <button type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No lab assignments available.</p>
        )}
      </div>

      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}

export default LabtechDashboard
