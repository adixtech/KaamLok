# TODO - MERN Multi-NGO Job Placement Platform

## Step 1 (Backend runtime fixes)
- [x] Fix `backend/src/app.js` to use consistent ESM imports and correct route paths.
- [x] Ensure `backend/src/server.js` calls `connectDB()` before starting the server.
- [x] Remove/avoid duplicate `/api/test` routes (choose single source).

## Step 2 (Backend MVP domain model + APIs)
- [ ] Add Mongoose models:
  - [x] Ngo
  - [x] Course
  - [x] Enrollment
  - [ ] Attendance
  - [ ] Placement
  - [ ] SuccessStory
- [ ] Add controllers for each domain.
- [ ] Add routes:
  - [x] NGO creation/listing (admin flow or direct ngo onboarding)
  - [x] NGO create course / student list courses
  - [x] Student enroll in courses
  - [ ] NGO mark attendance / student view attendance
  - [ ] NGO add placements / student view placements & success stories
- [ ] Add/extend role-based authorization as needed.

## Step 3 (Frontend)
- [ ] Replace test-only `frontend/src/App.jsx` with React Router.
- [ ] Implement auth flow (login/register) using backend APIs.
- [ ] Add protected student/ngo/admin dashboards + pages:
  - [ ] Student: courses, attendance, placements, success stories
  - [ ] NGO: manage courses, manage students, mark attendance, manage placements/stories
  - [ ] Admin: manage NGOs

## Step 4 (Verification)
- [ ] Run backend and verify endpoints via browser/Postman (blocked until `MONGO_URI` is valid). Current error: `Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"`
- [ ] Run frontend and verify screens load & auth works.
