# Team Task Manager

A professional, role-based team task management web application built with **React**, **Express**, **TypeScript**, **MongoDB**, and **Tailwind CSS**.

Designed with a restrained, minimal, and information-focused interface (inspired by tools like Linear, Notion, and GitHub Projects) and backed by server-enforced role-based access control (RBAC), HttpOnly JWT sessions, and a comprehensive activity audit log.

---

## Key Features

- **Role-Based Workspaces**:
  - **Administrator**: Full team overview, metrics, create tasks, assign/reassign tasks, edit all fields, delete tasks, view audit logs, view members directory.
  - **Member**: Role-scoped workspace (`/my-tasks`), view assigned workload only, update permitted task status (`To Do` &rarr; `In Progress` &rarr; `Completed`). Blocked from viewing or modifying other members' tasks.
- **Task Lifecycle & Filtering**:
  - Filter by Status, Priority (`Low`, `Medium`, `High`), Assignee (Admin), and Title Search.
  - Clean pagination and empty state handling.
- **Deadline Tracking**:
  - Automated due-date badges calculating `Overdue`, `Due Today`, `Due Soon`, and `Completed`.
  - Date boundary normalization prevents false overdue flags on completed tasks.
- **Activity Audit Trail**:
  - Captures `TASK_CREATED`, `TASK_ASSIGNED`, `TASK_REASSIGNED`, `STATUS_CHANGED`, `TASK_UPDATED`, and `TASK_DELETED` with actor details and timestamps.
- **Security-First Architecture**:
  - Passwords hashed using `bcrypt` (10 rounds).
  - JWT session tokens stored exclusively in `HttpOnly`, `SameSite`, and `Secure` (production) cookies.
  - Rate limiting on authentication routes to mitigate credential stuffing.
  - Server-side RBAC middleware and field allowlists preventing mass-assignment attacks.
  - Single-origin production deployment: Express serves `/api/*` and compiled React SPA with fallback without leaking HTML for missing API routes.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router 7, TanStack Query 5, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose 8, JWT, bcryptjs, Zod, Helmet, Express Rate Limit |
| **Database** | MongoDB (MongoDB Atlas / Docker / Local) |
| **Testing** | Vitest, Supertest, TypeScript type checking |
| **Deployment** | Single-origin Node.js service (Render / Docker / VPS) |

---

## Project Structure

```text
team-task-manager/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # StatusBadge, PriorityBadge, DueDateBadge, StatCard, Filters, Modal, etc.
│   │   ├── hooks/              # useAuth context provider
│   │   ├── layouts/            # AppLayout, Sidebar, TopBar (responsive drawer)
│   │   ├── pages/              # Login, Register, Dashboards, Task views, Members, Activity, Profile
│   │   ├── services/           # Typed API client
│   │   ├── styles/             # Tailwind CSS entry
│   │   ├── types/              # Domain models and API interfaces
│   │   ├── App.tsx             # Application routing & role guards
│   │   └── main.tsx            # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/             # Environment validation (Zod) and MongoDB connection
│   │   ├── controllers/        # Auth, User, Task, Activity, Dashboard controllers
│   │   ├── middleware/         # Auth, RBAC, Rate limiter, Error handler
│   │   ├── models/             # User, Task, ActivityLog (Mongoose)
│   │   ├── routes/             # REST route declarations
│   │   ├── scripts/            # Seed script and Admin bootstrap CLI
│   │   ├── services/           # Activity logging service
│   │   ├── utils/              # JWT signing, cookie configuration
│   │   ├── validation/         # Zod schemas for request payloads
│   │   ├── __tests__/          # Vitest + Supertest integration tests
│   │   ├── app.ts              # Express application factory
│   │   └── index.ts            # Server entry and graceful shutdown
│   └── package.json
│
├── tests/                      # Live end-to-end integration scenario scripts
├── .env.example                # Documented configuration template
├── render.yaml                 # Infrastructure as Code deployment blueprint
└── package.json                # Root npm workspaces configuration
```

---

## Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd team-task-manager
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the parameters (defaults work out of the box for local MongoDB):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=your_super_secret_jwt_key
COOKIE_SECRET=your_super_secret_cookie_key
ADMIN_EMAIL=admin@teamtasks.io
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=System Administrator
```

### 4. Seed Development Data
Populates the database with 1 Administrator, 2 Members, 5 realistic tasks with varied statuses/deadlines, and 13 activity records:
```bash
npm run seed
```

**Seed Credentials**:
- **Administrator**: `admin@teamtasks.io` / `Admin@123456`
- **Member A**: `alex@teamtasks.io` / `Member@123456`
- **Member B**: `sam@teamtasks.io` / `Member@123456`

### 5. Start Development Environment
Runs both server and client concurrently with hot reloading:
```bash
npm run dev
```
- Client runs on `http://localhost:3000` (proxies `/api` requests to backend).
- Backend runs on `http://localhost:5000`.

---

## Testing & Quality Assurance

### Run Automated API Tests (Vitest + Supertest)
Runs the test suite verifying authentication, RBAC authorization, member isolation, status updates, activity tracking, and metrics:
```bash
npm test
```

### Run Type Checking
Runs TypeScript validation on both client and server:
```bash
npm run typecheck
```

### Run Live Scenario Integration Script
Tests all real-world acceptance flows directly against the running server:
```bash
npx tsx tests/liveVerification.ts
```

---

## REST API Reference

### Authentication
- `POST /api/auth/register` — Member registration (strictly assigns `member` role).
- `POST /api/auth/login` — Sign in and receive HttpOnly session cookie.
- `POST /api/auth/logout` — Invalidate session and clear auth cookie.
- `GET /api/auth/me` — Retrieve active session user profile.

### Tasks
- `GET /api/tasks` — List tasks with filters & pagination (*Admin only*).
- `GET /api/tasks/my` — List tasks assigned to authenticated user (*Role-scoped*).
- `GET /api/tasks/:id` — Get task details (*Admin or Assignee*).
- `POST /api/tasks` — Create task and assign to member (*Admin only*).
- `PATCH /api/tasks/:id` — Update full task details (*Admin only*).
- `PATCH /api/tasks/:id/status` — Update task status (*Admin or Assignee*).
- `DELETE /api/tasks/:id` — Delete task (*Admin only*).

### Dashboard & Activity
- `GET /api/dashboard/stats` — Role-scoped metric counts (Total, In Progress, Completed, Overdue).
- `GET /api/activity` — Retrieve global audit trail (*Admin only*).
- `GET /api/activity/tasks/:id` — Retrieve task-specific change history (*Admin or Assignee*).
- `GET /api/users` — Directory of members (*Admin only*).
- `GET /api/health` — Service health check.

---

## Production Build & Deployment

### Production Build
```bash
npm run build
```
This compiles the React frontend to `client/dist` and compiles TypeScript on the backend to `server/dist`.

### Start Production Server
```bash
npm start
```
The server will bind to `PORT` (or default 5000) and serve both the API and the compiled React SPA.

### Deploying to Render
1. Push repository to GitHub.
2. In Render Dashboard, click **New +** &rarr; **Blueprint** and select your repository (it will automatically detect `render.yaml`).
3. Add your `MONGODB_URI` environment variable pointing to your MongoDB Atlas cluster.
4. Render builds the project using `npm install && npm run build` and boots it using `npm run start`.
