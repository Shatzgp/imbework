# International Payments Portal (Customer + Staff)

Full-stack implementation for the POE brief: customers register, log in, and
submit international (SWIFT) payments; pre-registered bank staff log in,
verify, and forward those payments to SWIFT.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Frontend: React (Vite), react-router-dom, axios
- CI/CD: CircleCI + SonarCloud (SAST), npm audit (SCA), Jest/Supertest (API tests)

## Quick start

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # then edit .env with real values
```
Generate a local SSL cert (see `backend/ssl/README.md`):
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=International Bank/CN=localhost"
```
Start MongoDB locally (or point MONGO_URI at Atlas), then:
```bash
npm run seed     # creates pre-registered staff accounts (staff1 / admin1)
npm run dev      # starts HTTPS server on https://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev      # starts HTTPS dev server on https://localhost:5173
```
`vite-plugin-mkcert` auto-generates a locally-trusted cert so the frontend is
also served over SSL - click through any one-time OS/browser trust prompt.

### 3. Tests
```bash
cd backend
npm test
```

## Rubric coverage map

**Task 2 - Customer portal**
| Requirement | Where |
|---|---|
| Password hashing + salting | `models/Customer.js` (bcrypt, 12 salt rounds) |
| Input whitelisting via RegEx | `utils/validators.js`, used in `routes/auth.js` / `routes/payments.js` |
| SSL for all traffic | `server.js` (https.createServer), `ssl/README.md`, frontend mkcert |
| Attack protection | `server.js`: helmet, cors, mongo-sanitize, xss-clean, hpp, rate-limit; `middleware/security.js`: login brute-force limiter |
| DevSecOps pipeline | `.circleci/config.yml` |

**Task 3 - Staff/employee portal**
| Requirement | Where |
|---|---|
| No registration, pre-provisioned staff | `seed/seedEmployees.js`, `models/Employee.js` |
| Password hashing + salting | `models/Employee.js` |
| SAST | `.circleci/config.yml` (SonarCloud scan) |
| SCA | `.circleci/config.yml` (npm audit) |
| API testing | `test/api.test.js`, run in CI |
| End-to-end flow | Customer creates payment -> appears in staff dashboard -> verify -> submit to SWIFT (`routes/staff.js`, `StaffDashboard.jsx`) |

**Task 1 - Architecture**
See the data-flow diagram provided earlier in this conversation. It maps the
customer login -> payment -> secured DB -> staff verification -> SWIFT flow,
plus the specific mitigation for each attack listed in the brief (session
jacking, clickjacking, SQL/NoSQL injection, XSS, MITM, DDoS).

## Still to do yourself
- Set up MobSF against your Semester 1 mobile app and write the short report.
- Run ScoutSuite against the provided AWS account and write up findings.
- Set up an actual GitHub repo and connect CircleCI + SonarCloud (needs your
  own SonarCloud org/token - `sonar-project.properties` has a placeholder).
- Record the OBS demo video showing registration, login, payment, staff
  verification, and SWIFT submission end-to-end.
- Change the seeded staff passwords before treating this as anything beyond
  a local demo.
