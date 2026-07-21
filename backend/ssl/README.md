# Generating a self-signed SSL certificate for local development

The brief requires all traffic to be served over SSL. For local dev/marking
purposes a self-signed certificate is sufficient (call this out in your video
- in production you'd use a CA-signed cert, e.g. via Let's Encrypt).

Run this from the `backend/` folder:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=International Bank/CN=localhost"
```

This creates `ssl/key.pem` and `ssl/cert.pem`, which `server.js` loads to start
an `https` server instead of plain `http`. Your browser will show an
"unsafe/not private" warning for self-signed certs during marking -
that is expected; click through (Advanced -> Proceed) to reach the app.

Do not commit key.pem or cert.pem - they are already in .gitignore.
