# KaamLok

> Connecting students with free NGO skill development programs across India.

![Status](https://img.shields.io/badge/Status-MVP%20Development-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Database](https://img.shields.io/badge/Database-MongoDB-success)
![License](https://img.shields.io/badge/License-Private-red)

---

# 📖 About KaamLok

KaamLok is a centralized platform that helps students discover free skill development programs offered by NGOs across India.

Instead of students searching dozens of NGO websites individually, KaamLok provides a single platform where they can:

- Discover verified NGO programs
- Register for courses
- Apply online
- Track applications
- Build employable skills
- Connect with NGOs

NGOs can publish programs, manage applications, and reach verified students.

The platform will eventually expand to include CSR organizations, companies, and government initiatives.

---

# 🎯 Vision

Build India's largest ecosystem connecting:

- Students
- NGOs
- CSR Organizations
- Companies
- Government Programs

through one unified platform.

---

# 🚀 Current Features

## Landing Website

- Modern responsive landing page
- Hero section
- Featured programs
- NGO partners
- Success stories
- Testimonials
- FAQ
- Footer
- Search section

---

## Student Authentication

- Registration
- Login
- Email OTP verification
- Forgot Password
- Reset Password
- JWT Authentication
- HttpOnly Cookie Authentication

---

## NGO Authentication

- NGO Registration
- Email OTP Verification
- Pending Approval Flow
- Login
- Protected Dashboard Access
- Admin Approval Required

---

## Admin Module (Foundation)

- Admin Authentication
- Dashboard Layout
- User Management
- NGO Management
- Approval Workflow

*(Currently under development)*

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Hook Form
- React Router
- Axios
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Cookie Authentication
- Express Validator

---

## Future Infrastructure

- AWS Cognito
- Amazon S3
- MongoDB Atlas
- Redis
- Docker
- CI/CD
- AWS EC2

---

# 📂 Project Structure

```
PROJECT
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   └── validators
│   │
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   ├── types
│   │   └── main.tsx
│   │
│   └── package.json
│
├── README.md
├── TODO.md
└── .gitignore
```

---

# 🔐 Authentication Flow

Student Registration

↓

Email OTP Verification

↓

JWT Cookie

↓

Student Dashboard

---

NGO Registration

↓

Email OTP Verification

↓

Pending Approval

↓

Admin Verification

↓

NGO Dashboard

---

# 👥 User Roles

### Student

- Register
- Login
- Search Programs
- Apply
- Track Applications
- Profile Management

---

### NGO

- Register
- Verify Email
- Await Approval
- Create Programs
- Manage Students
- Analytics

---

### Admin

- Dashboard
- Approve NGOs
- Manage Students
- Manage Users
- Platform Analytics
- Reports
- System Settings

---

### Super Admin

- Full Platform Control
- Manage Admins
- Role Management
- Security
- Audit Logs
- Platform Configuration

---

# 📈 Planned Features

## Phase 1

- Student Dashboard
- NGO Dashboard
- Admin Dashboard
- Program Management

---

## Phase 2

- CSR Portal
- Company Portal
- Advanced Search
- Notifications

---

## Phase 3

- AI Course Recommendation
- AI Student Matching
- Resume Builder
- Certificate Verification

---

## Phase 4

- Mobile App
- Regional Languages
- Government Integration
- CSR Analytics

---

# 📊 Future Analytics

Dashboard will include:

- Total Students
- Active Students
- NGOs
- Courses
- Applications
- Placement Rate
- Completion Rate
- CSR Partners
- Companies
- Revenue Analytics
- Monthly Growth
- Geographic Distribution

---

# 🔒 Security

- JWT Authentication
- HttpOnly Cookies
- Password Hashing
- Email OTP
- Route Protection
- Role Based Access
- Input Validation
- Rate Limiting
- Helmet Security
- CORS Protection

---

# 🚧 Development Status

| Module | Status |
|----------|--------|
| Landing Website | ✅ Complete |
| Student Auth | ✅ Complete |
| NGO Auth | ✅ Complete |
| OTP Verification | ✅ Complete |
| JWT Authentication | ✅ Complete |
| Admin Foundation | 🚧 In Progress |
| Student Dashboard | 🚧 In Progress |
| NGO Dashboard | 🚧 In Progress |
| CSR Module | ⏳ Planned |
| Company Module | ⏳ Planned |
| AI Features | ⏳ Planned |
| Mobile App | ⏳ Planned |

---

# ⚡ Getting Started

## Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🤝 Contributing

This project is currently under private development.

---

# 📜 License

Private Project.

Copyright © 2026 KaamLok.

All Rights Reserved.
