import axios from 'axios';

// withCredentials lets the browser send/receive the HttpOnly JWT cookie set
// by the backend, so tokens never touch localStorage/sessionStorage (which
// would be readable by any injected script in an XSS attack).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:5000/api',
  withCredentials: true,
});

export default api;
