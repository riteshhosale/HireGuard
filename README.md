# 🛡️ HireGuard AI

> AI-assisted job-scam and suspicious-website detection platform with automated scanning, evidence collection, risk analysis, and a community for sharing job-scam experiences.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Browser Automation](https://img.shields.io/badge/Automation-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

---

## 📌 Overview

HireGuard AI is a full-stack security platform focused on helping job seekers investigate suspicious recruitment websites and job offers.

The platform combines:

- 🔐 User authentication and authorization
- 🔍 Website scan orchestration
- 🧪 Automated evidence collection
- 🚨 Risk analysis and security findings
- 🤖 AI-assisted suspicious-pattern insights
- 📊 Security reporting
- 👥 Community job-scam reporting
- 💬 Community comments
- 👍 Likes
- 🔖 Bookmarks
- 🚩 Community post reports
- 📱 Responsive web experience
- 🔎 SEO and production hardening

The core product flow is:

```text
Suspicious Job Offer
        ↓
Suspicious Website / URL
        ↓
HireGuard AI Scan
        ↓
Evidence Collection
        ↓
Risk Analysis
        ↓
AI-Assisted Insights
        ↓
Security Report
        ↓
Optional Community Scam Report
```

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- Authorization
- JWT access tokens
- JWT refresh tokens
- Secure password hashing
- Protected API routes
- Refresh-token handling

## 🔍 Website Scanner

Users can submit suspicious websites for analysis. The scanner is designed to orchestrate security analysis and generate useful findings.

```text
URL
 ↓
Validation / Safety Checks
 ↓
Scanner Orchestration
 ↓
Browser Automation
 ↓
Evidence Collection
 ↓
Security Findings
 ↓
Risk Analysis
 ↓
Report
```

## 🧪 Evidence Collection

The scanner can collect evidence associated with website analysis. Evidence supports security findings and makes reports easier to understand.

## 🚨 Risk Analysis

Scan results can contain security findings, suspicious indicators, risk information, evidence, and reports.

## 🤖 AI-Assisted Insights

HireGuard integrates Google Gemini for AI-assisted analysis of suspicious patterns and security information. AI output is an additional analysis layer, not an absolute guarantee that a website is safe or malicious.

---

# 👥 HireGuard Community

Authenticated users can share factual job-scam experiences.

Users can:

- Create community posts
- Describe suspicious job experiences
- Attach suspicious URLs
- Attach their own HireGuard AI scan results
- Comment on posts
- Like posts
- Bookmark posts
- Report community posts
- Browse and search community content
- Filter posts by scam category

Community API base:

```text
/api/v1/community
```

## 📝 Community Post Flow

```text
User experiences suspicious job offer
              ↓
Creates community post
              ↓
Adds category + experience
              ↓
Optionally adds suspicious URL
              ↓
Optionally attaches HireGuard scan
              ↓
Community members view post
              ↓
Like / comment / bookmark / report
```

## 🏷️ Community Categories

```text
FAKE_JOB
FAKE_RECRUITER
REGISTRATION_FEE
WORK_FROM_HOME
PAYMENT_SCAM
PHISHING
FAKE_WEBSITE
IDENTITY_SCAM
OTHER
```

## 🚩 Community Report Reasons

```text
SPAM
HARASSMENT
PERSONAL_INFORMATION
MISLEADING
MALICIOUS
OTHER
```

## 🔒 Community Safety

Community posts are user-reported experiences. A report should not automatically be treated as independently verified proof that a person or organization committed a crime.

Users should remove personal information from screenshots and evidence, including phone numbers, private email addresses, IDs, private documents, passwords, OTPs, access tokens, and cookies.

---

# 🧱 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│                                                             │
│  Authentication │ Scanner │ Reports │ Community │ Profile   │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Node.js + Express + TypeScript               │
│                                                             │
│ Auth │ Scan │ Evidence │ Reports │ Community │ AI Services  │
└───────────────┬──────────────────────┬──────────────────────┘
                │                      │
                ▼                      ▼
┌────────────────────────┐   ┌───────────────────────────────┐
│        MongoDB         │   │ Scanner / AI Infrastructure   │
│ Users / Scans / etc.  │   │ Playwright / Gemini / Evidence│
└────────────────────────┘   └───────────────────────────────┘
```

---

# 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Lucide icons

### Backend
- Node.js
- Express
- TypeScript
- Mongoose
- MongoDB
- JWT
- bcrypt
- Zod
- Helmet
- CORS
- Pino HTTP logging

### Scanner
- Playwright
- Browser automation
- URL safety checks
- Evidence collection
- Security finding generation

### AI
- Google Gemini / Google GenAI

### Infrastructure
- Docker
- Docker Compose
- Vercel-compatible frontend deployment
- Render-compatible backend deployment
- Postman API collection

---

# 📂 Repository Structure

```text
HireGuard/
│
├── .github/
│   └── workflows/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── security/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── postman/
├── COMMUNITY_MVP.md
├── docker-compose.yml
├── render.yaml
├── vercel.json
├── .gitignore
└── README.md
```

---

# 💻 Prerequisites

- Node.js 18+
- npm
- MongoDB locally or hosted
- Docker Desktop if using Docker
- Google Gemini API key

Node.js 22+ is recommended for current backend development.

---

# 🚀 Installation

```bash
git clone https://github.com/riteshhosale/HireGuard.git
cd HireGuard
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

## Backend

Open a second terminal:

```bash
cd HireGuard/backend
npm install
```

Clean lockfile installation:

```bash
npm ci
```

Development:

```bash
npm run dev
```

Type check:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

API tests:

```bash
npm run test:api
```

---

# 🔐 Environment Variables

Create:

```text
backend/.env
```

Use the repository's `backend/.env.example` as the authoritative list of variables. The backend documentation requires a valid MongoDB URI and JWT secrets and uses Gemini configuration for AI functionality.

Typical configuration includes:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
GOOGLE_API_KEY=your-gemini-api-key
```

Never commit real secrets. Do not commit `.env` files or expose backend secrets in the frontend.

---

# 🗄️ MongoDB

HireGuard uses MongoDB through Mongoose.

Local example:

```env
MONGODB_URI=mongodb://localhost:27017/hireguard
```

Hosted example:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE
```

Ensure the backend can reach the configured MongoDB server.

---

# 🐳 Docker

The repository includes `docker-compose.yml`.

```bash
docker compose up --build
```

Detached mode:

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

Logs:

```bash
docker compose logs
```

---

# 🔌 API Overview

The backend provides REST APIs for:

- Authentication
- Scanning
- Evidence
- Reports
- Health
- AI-assisted analysis
- Community

Check `backend/src/routes/` and `backend/src/app.ts` for the exact mounted route prefixes.

## 👥 Community API

Base:

```text
/api/v1/community
```

Core operations:

```text
GET    /posts
POST   /posts
GET    /posts/:postId
POST   /posts/:postId/like
POST   /posts/:postId/bookmark
GET    /posts/:postId/comments
POST   /posts/:postId/comments
POST   /posts/:postId/report
```

Use the Postman collection under `postman/` for request examples.

---

# 🧪 Testing & Validation

Backend:

```bash
cd backend
npm run typecheck
npm run build
npm run test:api
```

Frontend:

```bash
cd frontend
npm run build
```

Recommended validation order:

```text
Backend typecheck
      ↓
Backend build
      ↓
API tests
      ↓
Frontend build
      ↓
Manual smoke test
```

---

# 🧹 Windows Troubleshooting

If `npm ci` reports:

```text
EBUSY: resource busy or locked
```

stop Node.js processes:

```powershell
taskkill /F /IM node.exe
```

Close VS Code and terminals using the project, then:

```powershell
cd D:\JobGuardAI_MUSA\backend
Remove-Item -Recurse -Force .\node_modules
npm cache verify
npm ci
npm run typecheck
npm run build
```

Do not delete `package-lock.json` just to fix an `EBUSY` installation problem.

If TypeScript reports missing modules such as `express`, `mongoose`, `zod`, `jsonwebtoken`, or missing Node globals, first verify that dependencies were installed successfully.

---

# 🛡️ Security & Production Hardening

The current repository documents security and launch-readiness work including:

- Request body limits
- Configured CORS
- Helmet security headers
- Authentication rate limiting
- Scan rate limiting
- Honeypot-based basic bot/spam protection
- Server-side production secrets
- Client-side validation
- Error/success feedback
- Responsive/mobile navigation
- Custom 404 handling
- Accessible focus states

The frontend also includes:

- Page titles
- Meta descriptions
- Canonical URLs
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- Open Graph metadata
- Twitter metadata
- Branded share image
- Structured data
- Breadcrumb markup
- Route-based code splitting
- Disabled production source maps
- Security response headers

Set `VITE_SITE_URL` to the final production domain when the custom domain is connected.

---

# 🚀 Deployment

The repository includes deployment configuration for Render, Vercel, and Docker:

```text
render.yaml
vercel.json
docker-compose.yml
```

## Frontend

Build:

```bash
npm run build
```

Configure the required frontend `VITE_*` variables in the hosting provider.

## Backend

Configure the production environment with the variables from `backend/.env.example`, including MongoDB, JWT, Gemini, CORS/frontend origin, and any scanner configuration required by the current backend.

Never put backend secrets into frontend environment variables.

---

# 🧠 AI Flow

```text
Website / Scan Data
        ↓
Security Findings
        ↓
Evidence
        ↓
Google Gemini
        ↓
AI-Assisted Interpretation
        ↓
User-Facing Security Insights
```

AI results complement scanner findings and should not be treated as an absolute guarantee of safety.

---

# 🔬 Scanner Flow

```text
User submits URL
        ↓
URL validation / safety checks
        ↓
Scan orchestration
        ↓
Playwright browser automation
        ↓
Page / behavior inspection
        ↓
Evidence collection
        ↓
Finding generation
        ↓
Risk analysis
        ↓
Report
```

---

# 📮 Postman

API examples and collections are maintained under:

```text
postman/
```

Recommended API testing flow:

```text
Register
   ↓
Login
   ↓
Authenticate
   ↓
Create scan
   ↓
Inspect results
   ↓
Test reports
   ↓
Test community APIs
```

---

# 📈 Development Workflow

```text
1. Clone repository
2. Install dependencies
3. Configure environment
4. Start MongoDB
5. Start backend
6. Start frontend
7. Test authentication
8. Test scanner
9. Test reports
10. Test community
11. Run typecheck
12. Run builds
13. Commit changes
14. Push branch
```

---

# 🌿 Git Workflow

```bash
git checkout -b feature/your-feature
git status
git add .
git commit -m "feat: describe the change"
git push origin feature/your-feature
```

Recommended commit prefixes:

```text
feat:       New feature
fix:        Bug fix
refactor:   Code refactoring
docs:       Documentation
style:      UI/style changes
test:       Tests
chore:      Maintenance
security:   Security improvements
perf:       Performance improvements
```

---

# ✅ Production Checklist

```text
[ ] npm ci succeeds
[ ] Backend typecheck succeeds
[ ] Backend build succeeds
[ ] API tests pass
[ ] Frontend build succeeds
[ ] MongoDB connection works
[ ] JWT secrets configured
[ ] Gemini API key configured
[ ] CORS configured
[ ] VITE_SITE_URL configured
[ ] .env files excluded from Git
[ ] Authentication tested
[ ] Scanner tested
[ ] Evidence tested
[ ] Reports tested
[ ] Community posts tested
[ ] Comments tested
[ ] Likes tested
[ ] Bookmarks tested
[ ] Community reports tested
[ ] Mobile UI tested
[ ] 404 tested
[ ] SEO files verified
[ ] Production logs checked
```

---

# 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Implement the change.
4. Add or update tests where appropriate.
5. Run typecheck and builds.
6. Commit the change.
7. Push the branch.
8. Open a Pull Request.

Pull Requests should explain what changed, why it changed, how it was tested, and any required environment changes. Include screenshots for significant UI changes.

---

# ⚠️ Responsible Use

HireGuard is a security-assistance platform. Scanner and AI results are security signals and analysis, not legal determinations.

Do not use HireGuard to:

- Expose private credentials
- Collect passwords
- Steal authentication tokens
- Publish private personal information
- Attack systems without authorization
- Circumvent access controls
- Harass individuals or organizations

---

# 📜 License

The repository currently identifies the backend package as using the **ISC** license. Check the repository and package configuration for authoritative licensing information before redistribution.

---

# 🔗 Repository

**GitHub:** https://github.com/riteshhosale/HireGuard

---

# 🛡️ HireGuard AI

### Detect. Analyze. Protect.

HireGuard combines automated website security analysis, AI-assisted insights, evidence collection, and community intelligence to help job seekers make safer decisions.
