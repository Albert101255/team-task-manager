# Team Task Manager

**A full-stack, role-based task management application for teams.** Administrators assign and manage work; members see only their own assigned tasks and update their progress.

A professional, role-based team task management web application built with **React**, **Express**, **TypeScript**, **MongoDB**, and **Tailwind CSS**.

Designed with a restrained, minimal, and information-focused interface (inspired by tools like Linear, Notion, and GitHub Projects) and backed by server-enforced role-based access control (RBAC), HttpOnly JWT sessions, and a comprehensive activity audit log.

---

## Demo and Source

- **Source code:** [GitHub repository](https://github.com/Albert101255/team-task-manager)
- **Temporary preview (may be offline):** [Cloudflare demo tunnel](https://cindy-released-applying-speak.trycloudflare.com). This link only works while the local server and tunnel are running; it is **not** a permanent deployment.

**Evaluation note:** Features and security controls described below reflect the repository implementation. Deployment availability and automated test results should be verified in the target environment.

---

## Demo Administrator Access

- **Email:** `admin@teamtasks.io`
- **Password:** Not published in this public repository. Obtain it privately from the project owner, or configure your own administrator account with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `npm run bootstrap:admin`.

> For a public demo, use a dedicated, resettable account with restricted data. Never reuse production administrator credentials.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router 7, TanStack Query 5, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose 8, JWT, bcryptjs, Zod, Helmet, Express Rate Limit |
| **Database** | MongoDB (MongoDB Atlas in production / Docker / Local MongoDB) |
| **Testing** | Vitest, Supertest, MongoMemoryServer (100% database isolation) |
| **Deployment** | Single-origin Node.js web service (Render / Docker / VPS) |

---

## How it works

1. An administrator signs in, creates a task, sets its priority and deadline, and assigns it to a member.
2. The member signs in and views their own tasks under **My Tasks**, without access to other members' assignments.
3. The member updates the task status as work progresses.
4. The administrator monitors team progress, deadlines, and an activity history of changes.

Role restrictions are checked on the server, not just by hiding controls in the interface.

---

## Key Features

- **Role-Based Workspaces**:
  - **Administrator**: Full team overview, metrics, create tasks, assign/reassign members, edit full task details, delete tasks with confirmation, view team member directory, and view global audit logs.
  - **Member**: Role-scoped workspace (`/my-tasks`), viewing assigned workload only, and updating permitted task status (`To Do` &rarr; `In Progress` &rarr; `Completed`). Blocked from seeing or modifying tasks assigned to other members.
- **Task Lifecycle & Filtering**:
  - Filter tasks by Status, Priority (`Low`, `Medium`, `High`), Assignee (Admin), and Title Search.
  - Page-synchronized pagination with independent page-advance controls.
  - Clean empty states and accessible confirmation modals for destructive operations.
- **Deadline Tracking**:
  - Automated due-date badges calculating `Overdue`, `Due Today`, `Due Soon`, and `Completed`.
  - Date boundary normalization prevents false overdue flags on completed tasks.
- **Activity Audit Trail**:
  - Automatic recording of `TASK_CREATED`, `TASK_ASSIGNED`, `TASK_REASSIGNED`, `STATUS_CHANGED`, `TASK_UPDATED`, and `TASK_DELETED` with actor details, timestamps, and previous/new values.
- **Responsive Layout**:
  - Desktop fixed sidebar with accessible mobile navigation drawer, avoiding horizontal scrollbars.

---

## Role Permissions Matrix

| Capability | Administrator | Member |
|---|:---:|:---:|
| View Global Overview Dashboard | Yes | No (Member Workspace only) |
| View All Team Tasks | Yes | No |
| View Assigned Tasks (`/my-tasks`) | Yes | Yes |
| View Tasks of Other Members | Yes | No (Enforced by backend 403) |
| Create New Tasks | Yes | No (Enforced by backend 403) |
| Reassign Tasks | Yes | No (Enforced by backend 403) |
| Edit Task Title, Description, Due Date | Yes | No (Enforced by backend 403) |
| Update Assigned Task Status | Yes | Yes (Field allowlist enforced) |
| Delete Tasks | Yes | No (Enforced by backend 403) |
| View Team Member Directory | Yes | No |
| View Full Activity Audit Log | Yes | No (Task-specific only for assignee) |

---

## Architecture

```
[ React SPA (Vite + Tailwind) ]
              │
              ▼  (Relative /api calls over HttpOnly Cookie Session)
[ Express.js REST API ]
   ├── Helmet (Content Security Policy & Security Headers)
   ├── Rate Limiter (Auth brute-force mitigation)
   ├── CSRF / Origin Verification
   ├── JWT Auth & Server RBAC Middleware (Role & Assignee verification)
   └── Zod Request Validation
              │
              ▼  (Mongoose ORM)
[ MongoDB Database ]
```

---

## Project Structure

```text
team-task-manager/
├── client/                     # Frontend React application
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
│   │   ├── middleware/         # Auth, RBAC, Rate limiter, CSRF/Origin, Error handler
│   │   ├── models/             # User, Task, ActivityLog (Mongoose)
│   │   ├── routes/             # REST route declarations
│   │   ├── scripts/            # Seed script and Admin bootstrap CLI
│   │   ├── services/           # Activity logging service
│   │   ├── utils/              # JWT signing, cookie configuration
│   │   ├── validation/         # Zod schemas for request payloads
│   │   ├── __tests__/          # Vitest + Supertest integration tests with MongoMemoryServer
│   │   ├── app.ts              # Express application factory & middleware chain
│   │   └── index.ts            # Server entry and graceful shutdown
│   └── package.json
│
├── tests/                      # Live end-to-end integration scenario scripts
├── .env.example                # Configuration template with placeholders
├── render.yaml                 # Render infrastructure configuration
└── package.json                # Root npm workspaces configuration
```

---

## Installation & Local Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Clone and Install
```bash
git clone https://github.com/Albert101255/team-task-manager.git
cd team-task-manager
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your environment parameters:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=your_secure_random_jwt_secret_min_32_characters
COOKIE_SECRET=your_secure_random_cookie_secret_min_32_characters

# Administrator Bootstrap Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password_min_12_chars
ADMIN_NAME=System Administrator
```

### 4. Running Development Servers
```bash
# Seed development demo data (local development only)
npm run seed

# Run concurrent client (:3000) and backend (:5000)
npm run dev
```

---

## Administrator Setup & Seeding

### Initial Administrator Bootstrap
To securely create or update an administrator account without exposing credentials:
1. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` (minimum 12 characters in production) in your environment variables.
2. Run the secure bootstrap command:
   ```bash
   npm run bootstrap:admin
   ```
3. The script will securely hash the password with `bcryptjs` and establish the administrator account without printing passwords to stdout.

### Development Seeding Safeguards
- The seed script (`npm run seed`) is strictly blocked from running when `NODE_ENV=production` or against remote `mongodb.net` clusters.
- Seeding is reserved exclusively for verified local development environments.

---

## Database Configuration

- **Local MongoDB**: By default, connects to `mongodb://127.0.0.1:27017/team_task_manager`.
- **MongoDB Atlas**: Provide your cloud connection string via `MONGODB_URI` in production:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/team_task_manager?retryWrites=true&w=majority
  ```

---

## REST API Reference

### Authentication
- `POST /api/auth/register` — Member registration (strictly assigns `member` role; rate-limited).
- `POST /api/auth/login` — Sign in and receive HttpOnly session cookie (rate-limited).
- `POST /api/auth/logout` — Invalidate session and clear auth cookie.
- `GET /api/auth/me` — Retrieve active session user profile.

### Tasks
- `GET /api/tasks` — List tasks with filters & pagination (*Admin only*).
- `GET /api/tasks/my` — List tasks assigned to authenticated user (*Role-scoped*).
- `GET /api/tasks/:id` — Get task details (*Admin or Assignee*).
- `POST /api/tasks` — Create task and assign to member (*Admin only*).
- `PATCH /api/tasks/:id` — Update full task details (*Admin only*).
- `PATCH /api/tasks/:id/status` — Update task status (*Admin or Assignee; allowlist enforced*).
- `DELETE /api/tasks/:id` — Delete task (*Admin only; records audit log*).

### Dashboard & Activity
- `GET /api/dashboard/stats` — Role-scoped metric counts (Total, In Progress, Completed, Overdue).
- `GET /api/activity` — Retrieve global audit trail (*Admin only*).
- `GET /api/activity/tasks/:id` — Retrieve task-specific history trail (*Admin or Assignee*).
- `GET /api/users` — Directory of members (*Admin only*).
- `GET /api/health` — Service health check.

---

## Testing & Quality Assurance

### Automated Isolated Test Suite
The automated test suite uses `mongodb-memory-server` to run in a 100% isolated, in-memory MongoDB instance. It never connects to or modifies development or production databases:
```bash
npm test
```
**Previously reported result:** `17/17 passed` across authentication, authorization, role isolation, task lifecycle, deletion, and pagination regressions. Run the command above to verify against the current revision.

### Type Checking
```bash
npm run typecheck
```
**Verification:** Run the command above to check client and server TypeScript compilation on the current revision.

### Live Integration Scenario Script
```bash
npx tsx tests/liveVerification.ts
```
**Previously reported result:** 10/10 integration checks passed. This script requires a running application; repeat it to confirm the current environment.

---

## Deployment to Render

The repository includes a ready-to-use `render.yaml` configuration:
1. Push repository to GitHub.
2. In Render, select **New +** &rarr; **Blueprint** and connect the repository.
3. Configure `MONGODB_URI` in the environment settings pointing to your MongoDB Atlas cluster.
4. Render executes `npm install && npm run build` and starts the service using `npm start`.

---

## Security Implementation Summary

1. **Password Security**: Passwords hashed using `bcryptjs` with 10 salt rounds.
2. **Session Security**: JWT session cookies set with `HttpOnly`, `SameSite=Lax`, and `Secure` (production).
3. **CSRF / Origin Verification**: State-changing requests (`POST`, `PATCH`, `DELETE`) verify `Origin`/`Referer` headers against the hosting origin.
4. **Content Security Policy (CSP)**: Configured via Helmet to restrict script, style, and font resources to self and Google Fonts.
5. **Rate Limiting**: Express rate limiting on `/api/auth/*` routes to protect against brute-force attacks.
6. **Server-Side RBAC**: Authorization middleware validates roles and ownership on every request; client-side role parameters are never trusted.
7. **Production Environment Guards**: Server startup fails immediately if `JWT_SECRET`, `COOKIE_SECRET`, or `MONGODB_URI` use development defaults in production.
8. **Test Database Isolation**: Tests run in an isolated in-memory MongoDB environment, preventing data deletion in non-test databases.

---

## Recent Improvements

- **Database Test Isolation**: Integrated `MongoMemoryServer` into Vitest test suite so automated tests run in ephemeral in-memory storage without touching local or cloud databases.
- **Seeding Safeguards**: Added environment checks preventing `seed.ts` from executing in production or on remote database clusters.
- **Pagination Bug Fix**: Separated filter updates from pagination navigation in `AllTasksPage.tsx` so advancing or retreating pages correctly increments/decrements the page parameter without resetting to page 1.
- **CSRF & CSP Hardening**: Configured Helmet Content Security Policy and added Origin verification middleware for state-changing authenticated requests.
- **Production Environment Validation**: Added strict validation in `env.ts` requiring high-entropy secrets and production MongoDB URIs when `NODE_ENV=production`.
- **Credential Hygiene**: Sanitized all documentation and templates to remove plaintext default credentials.

---

## Troubleshooting

- **MongoDB connection fails:** Ensure MongoDB is running, or provide a working Atlas connection string in `MONGODB_URI`.
- **Login/session fails:** Check that the frontend is calling the intended API origin and that cookie settings match HTTP/HTTPS and hosting configuration.
- **Environment validation fails:** Replace placeholder secrets with strong, unique values; do not commit your `.env` file.
- **Temporary demo link is unavailable:** Run the application locally or deploy it to a persistent host. Cloudflare quick tunnels expire when their session ends.

---

## Known Limitations

- **Email Notifications**: Currently notification bells and external email delivery for assignments are not integrated; activity audit history is tracked in-app via database records.
- **Task Comments**: Task detail views currently include activity audit history; rich threaded commenting is planned for future iterations.

---

## Project Scope

Built as a team-oriented web development project demonstrating React interfaces, Express REST APIs, MongoDB persistence, authentication, role-based authorization, and task lifecycle management. The repository is intended for technical evaluation and continued development; production deployment requires environment-specific verification.
