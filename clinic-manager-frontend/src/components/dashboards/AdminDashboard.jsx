import React, { useEffect, useState } from 'react'
import axios from 'axios'

const AdminDashboard = () => {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [users, setUsers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [message, setMessage] = useState('')
  const [actions, setActions] = useState({}) // appointmentId -> { status, doctorId }

  useEffect(() => {
    fetchUsers()
    fetchAppointments()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/users', { headers })
      setUsers(res.data)
      const doctorList = res.data.filter(user => user.role === 'doctor')
      setDoctors(doctorList)
    } catch (err) {
      console.error('User fetch failed', err)
    }
  }

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/appointments', { headers })
      setAppointments(res.data)
    } catch (err) {
      console.error('Appointment fetch failed', err)
    }
  }

  const handleChange = (appointmentId, key, value) => {
    setActions(prev => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [key]: value
      }
    }))
  }

  const handleSubmit = async (appointmentId) => {
    const action = actions[appointmentId]

    if (!action || !action.status) {
      setMessage('Please choose to approve or reject.')
      return
    }

    if (action.status === 'Approved' && !action.doctorId) {
      setMessage('Please select a doctor for approval.')
      return
    }

    try {
      await axios.post('http://localhost:5000/admin/approve', {
        appointment_id: appointmentId,
        status: action.status,
        doctor_id: action.status === 'Approved' ? action.doctorId : null
      }, { headers })

      setMessage(`Appointment ${action.status.toLowerCase()} successfully.`)
      fetchAppointments()
      setActions(prev => ({ ...prev, [appointmentId]: {} }))
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Action failed')
    }
  }

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      <h3>Registered Users</h3>
      <div className="table-container">
        {users.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No users found.</p>}
      </div>

      <hr />

      <h3>Appointments</h3>
      <div className="table-container">
        {appointments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Assigned Doctor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.patient_name}</td>
                  <td>{a.reason}</td>
                  <td>{a.status}</td>
                  <td>{a.doctor_name || 'None'}</td>
                  <td>
                    {a.status === 'Pending' ? (
                      <>
                        <select
                          value={actions[a.id]?.doctorId || ''}
                          onChange={(e) => handleChange(a.id, 'doctorId', e.target.value)}
                          disabled={actions[a.id]?.status === 'Rejected'}
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                          ))}
                        </select>

                        <div style={{ marginTop: '0.5rem' }}>
                          <button
                            onClick={() => handleChange(a.id, 'status', 'Approved')}
                            style={{ marginRight: '0.5rem' }}
                          >
                            Approve
                          </button>
                          <button onClick={() => handleChange(a.id, 'status', 'Rejected')}>
                            Reject
                          </button>
                        </div>

                        <button onClick={() => handleSubmit(a.id)} style={{ marginTop: '0.5rem' }}>
                          Make Changes
                        </button>
                      </>
                    ) : (
                      <span>{a.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No appointments found.</p>}
      </div>

      {message && <p style={{ color: 'green', marginTop: '1rem', textAlign: 'center' }}>{message}</p>}
    </div>
  )
}

export default AdminDashboard
