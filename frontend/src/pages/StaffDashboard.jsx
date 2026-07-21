import React, { useEffect, useState } from 'react';
import api from '../api';

export default function StaffDashboard() {
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  const loadPayments = async () => {
    const res = await api.get('/staff/payments');
    setPayments(res.data.payments);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.post(`/staff/payments/${id}/verify`);
      loadPayments();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Verify failed');
    }
  };

  const handleSubmit = async (id) => {
    try {
      await api.post(`/staff/payments/${id}/submit`);
      setMessage('Payment forwarded to SWIFT.');
      loadPayments();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Submit failed');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Staff: pending international payments</h1>
      {message && <p>{message}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Customer</th><th>Amount</th><th>Payee account</th><th>SWIFT code</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td>{p.customer?.fullName}</td>
              <td>{p.currency} {p.amount}</td>
              <td>{p.payeeAccountNumber}</td>
              <td>{p.swiftCode}</td>
              <td>{p.status}</td>
              <td>
                {p.status === 'pending' && (
                  <button onClick={() => handleVerify(p._id)}>Verify</button>
                )}
                {p.status === 'verified' && (
                  <button onClick={() => handleSubmit(p._id)}>Submit to SWIFT</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' },
  table: { width: '100%', borderCollapse: 'collapse' },
};
