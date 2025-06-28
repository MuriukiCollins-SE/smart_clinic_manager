import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [formData, setFormData] = useState({ reason: '', date: '' });
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      alert('Session expired or not logged in. Redirecting to login.');
      navigate('/login');
    }
  }, [navigate, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/patient/book',
        formData,
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );
      setMessage(res.data.msg || 'Appointment booked successfully. Awaiting confirmation.');
      setFormData({ reason: '', date: '' });
    } catch (err) {
      console.error("❌ Booking error:", err.response?.data || err.message);
      setMessage(err.response?.data?.msg || 'Booking failed');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/patient/appointments', { headers });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchLabResults = async () => {
    try {
      const res = await axios.get('http://localhost:5000/patient/lab-results', { headers });
      setLabResults(res.data);
    } catch (err) {
      console.error("Error fetching lab results:", err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/patient/prescriptions', { headers });
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    }
  };

  return (
    <div className="container">
      <h2>Welcome to Patient Dashboard</h2>
      <header>Smart Clinic Manager Dashboard</header>


      <h3>Book Appointment</h3>
      <form onSubmit={handleBook}>
        <label>Reason for Appointment</label>
        <textarea name="reason" required value={formData.reason} onChange={handleChange} />

        <label>Preferred Date</label>
        <input type="date" name="date" required value={formData.date} onChange={handleChange} />

        <button type="submit">Book Appointment</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      <hr />

      <h3>Your Appointments</h3>
      <button onClick={fetchAppointments}>Load Appointments</button>
      <div className="table-container">
        {appointments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Doctor</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.date}</td>
                  <td>{appt.reason}</td>
                  <td>
                    {appt.status === 'Approved' && <span style={{ color: 'green' }}>✅ Approved</span>}
                    {appt.status === 'Rejected' && <span style={{ color: 'red' }}>❌ Rejected</span>}
                    {appt.status === 'Pending' && <span style={{ color: 'orange' }}>⏳ Pending</span>}
                  </td>
                  <td>{appt.doctor || 'Not Assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No appointments yet.</p>
        )}
      </div>

      <hr />

      <h3>Lab Results</h3>
      <button onClick={fetchLabResults}>Load Lab Results</button>
      <div className="table-container">
        {labResults.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Results</th>
                <th>Lab Technician</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {labResults.map((res) => (
                <tr key={res.id}>
                  <td>{res.results || 'Pending'}</td>
                  <td>{res.labtech || 'N/A'}</td>
                  <td>{res.created_at || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No lab results found.</p>
        )}
      </div>

      <hr />

      <h3>Prescriptions</h3>
      <button onClick={fetchPrescriptions}>Load Prescriptions</button>
      <div className="table-container">
        {prescriptions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Prescription</th>
                <th>Doctor</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((pres) => (
                <tr key={pres.id}>
                  <td>{pres.content}</td>
                  <td>{pres.doctor}</td>
                  <td>{pres.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No prescriptions available.</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
