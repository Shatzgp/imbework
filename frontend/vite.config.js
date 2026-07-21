import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

// mkcert auto-generates a locally-trusted HTTPS cert so the frontend also
// serves over SSL during development, matching the API's HTTPS requirement.
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true,
    port: 5173,
  },
});
