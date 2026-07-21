import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    accountNumber: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange} required />
        <input name="idNumber" placeholder="ID number (13 digits)" value={form.idNumber} onChange={handleChange} required />
        <input name="accountNumber" placeholder="Account number" value={form.accountNumber} onChange={handleChange} required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input
          type="password"
          name="password"
          placeholder="Password (8+ chars, upper/lower/digit/special)"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>Registered! Redirecting to login...</p>}
        <button type="submit" style={styles.submit}>Register</button>
      </form>
      <p><Link to="/">Back to login</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  submit: { padding: 10, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  error: { color: '#A32D2D' },
  success: { color: '#3B6D11' },
};
