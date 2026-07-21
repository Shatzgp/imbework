import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('customer'); // 'customer' | 'staff'
  const [form, setForm] = useState({ username: '', accountNumber: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = mode === 'customer' ? '/auth/login' : '/auth/employee-login';
      const payload =
        mode === 'customer'
          ? { username: form.username, accountNumber: form.accountNumber, password: form.password }
          : { username: form.username, password: form.password };

      const res = await api.post(endpoint, payload);
      setUser({ ...res.data.user, role: mode === 'customer' ? 'customer' : res.data.user.role });
      navigate(mode === 'customer' ? '/customer' : '/staff');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <h1>International Payments Portal</h1>
      <div style={styles.toggle}>
        <button onClick={() => setMode('customer')} style={mode === 'customer' ? styles.active : styles.inactive}>
          Customer login
        </button>
        <button onClick={() => setMode('staff')} style={mode === 'staff' ? styles.active : styles.inactive}>
          Staff login
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        {mode === 'customer' && (
          <input
            name="accountNumber"
            placeholder="Account number"
            value={form.accountNumber}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.submit}>Log in</button>
      </form>

      {mode === 'customer' && (
        <p>
          No account yet? <Link to="/register">Register here</Link>
        </p>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif' },
  toggle: { display: 'flex', gap: 8, marginBottom: 16 },
  active: { flex: 1, padding: 8, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 4 },
  inactive: { flex: 1, padding: 8, background: '#eee', border: 'none', borderRadius: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  submit: { padding: 10, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  error: { color: '#A32D2D' },
};
