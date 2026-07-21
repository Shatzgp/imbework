import React, { useEffect, useState } from 'react';
import api from '../api';

export default function CustomerDashboard() {
  const [form, setForm] = useState({
    amount: '',
    currency: 'ZAR',
    provider: 'SWIFT',
    payeeAccountNumber: '',
    swiftCode: '',
  });
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  const loadPayments = async () => {
    const res = await api.get('/payments');
    setPayments(res.data.payments);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/payments', form);
      setMessage('Payment submitted successfully.');
      setForm({ amount: '', currency: 'ZAR', provider: 'SWIFT', payeeAccountNumber: '', swiftCode: '' });
      loadPayments();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Payment failed');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Make an international payment</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required />
        <select name="currency" value={form.currency} onChange={handleChange}>
          <option>ZAR</option>
          <option>USD</option>
          <option>EUR</option>
          <option>GBP</option>
        </select>
        <input name="provider" placeholder="Provider (e.g. SWIFT)" value={form.provider} onChange={handleChange} required />
        <input name="payeeAccountNumber" placeholder="Payee account number" value={form.payeeAccountNumber} onChange={handleChange} required />
        <input name="swiftCode" placeholder="SWIFT code" value={form.swiftCode} onChange={handleChange} required />
        {message && <p>{message}</p>}
        <button type="submit" style={styles.submit}>Pay now</button>
      </form>

      <h2>Your payments</h2>
      <table style={styles.table}>
        <thead>
          <tr><th>Amount</th><th>Currency</th><th>Payee</th><th>SWIFT</th><th>Status</th></tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td>{p.amount}</td>
              <td>{p.currency}</td>
              <td>{p.payeeAccountNumber}</td>
              <td>{p.swiftCode}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 },
  submit: { padding: 10, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
};
