import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AUTH_COOKIE_NAME } from '../utils/jwt.js';

const app = createApp();

let mongoServer: MongoMemoryServer;
let adminUser: any;
let memberA: any;
let memberB: any;
let adminCookie: string;
let memberACookie: string;
let memberBCookie: string;

describe('Role-Based Team Task Manager API Test Suite (Isolated In-Memory)', () => {
  beforeAll(async () => {
    // Spin up an isolated in-memory MongoDB instance for 100% test isolation
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);
  });

  afterAll(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Safe: only runs on isolated in-memory test instance
    await User.deleteMany({});
    await Task.deleteMany({});
    await ActivityLog.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('TestPass@123', salt);

    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@test.com',
      passwordHash,
      role: 'admin',
    });

    memberA = await User.create({
      name: 'Member Alice',
      email: 'alice@test.com',
      passwordHash,
      role: 'member',
    });

    memberB = await User.create({
      name: 'Member Bob',
      email: 'bob@test.com',
      passwordHash,
      role: 'member',
    });

    // Obtain session cookies
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPass@123' });
    adminCookie = adminRes.headers['set-cookie'][0];

    const memberARes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'TestPass@123' });
    memberACookie = memberARes.headers['set-cookie'][0];

    const memberBRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@test.com', password: 'TestPass@123' });
    memberBCookie = memberBRes.headers['set-cookie'][0];
  });

  describe('Authentication & Authorization', () => {
    it('allows valid login and sets HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'TestPass@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin@test.com');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain(AUTH_COOKIE_NAME);
    });

    it('rejects invalid login credentials with safe error', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('registration enforces member role only (prevents admin injection)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Joe',
          email: 'hacker@test.com',
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'admin', // Attempted role escalation
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('member');

      const savedUser = await User.findOne({ email: 'hacker@test.com' });
      expect(savedUser?.role).toBe('member');
    });

    it('rejects unauthorized request without credentials', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('logout clears authentication cookie', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.headers['set-cookie'][0]).toContain(`${AUTH_COOKIE_NAME}=;`);
    });
  });

  describe('Task Management & Role-Based Permissions', () => {
    it('administrator can create task and assign to member', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', adminCookie)
        .send({
          title: 'Setup Kubernetes Cluster',
          description: 'Deploy cluster with ingress controller',
          assignedTo: memberA._id.toString(),
          priority: 'high',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Setup Kubernetes Cluster');
      expect(res.body.data.task.assignedTo._id.toString()).toBe(memberA._id.toString());

      // Verify activity logs created
      const logs = await ActivityLog.find({ taskId: res.body.data.task._id });
      expect(logs.length).toBeGreaterThanOrEqual(2); // created & assigned
    });

    it('member cannot create task (rejected with 403)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', memberACookie)
        .send({
          title: 'Unauthorized Task',
          assignedTo: memberA._id.toString(),
          priority: 'low',
          dueDate: new Date().toISOString(),
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('member A views own tasks and does not see member B tasks in /my-tasks', async () => {
      // Create Task for Alice
      await Task.create({
        title: 'Alice Task',
        assignedTo: memberA._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(),
      });

      // Create Task for Bob
      await Task.create({
        title: 'Bob Task',
        assignedTo: memberB._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(),
      });

      const res = await request(app)
        .get('/api/tasks/my')
        .set('Cookie', memberACookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const titles = res.body.data.tasks.map((t: any) => t.title);
      expect(titles).toContain('Alice Task');
      expect(titles).not.toContain('Bob Task');
    });

    it('member cannot access another member task details (rejected with 403)', async () => {
      const bobTask = await Task.create({
        title: 'Secret Task for Bob',
        assignedTo: memberB._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'high',
        dueDate: new Date(),
      });

      // Alice tries to access Bob's task
      const res = await request(app)
        .get(`/api/tasks/${bobTask._id}`)
        .set('Cookie', memberACookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('member can update their own task status', async () => {
      const aliceTask = await Task.create({
        title: 'Design API Specs',
        assignedTo: memberA._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(),
      });

      const res = await request(app)
        .patch(`/api/tasks/${aliceTask._id}/status`)
        .set('Cookie', memberACookie)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.status).toBe('in_progress');

      // Verify persistence in MongoDB
      const updated = await Task.findById(aliceTask._id);
      expect(updated?.status).toBe('in_progress');

      // Verify activity log
      const log = await ActivityLog.findOne({
        taskId: aliceTask._id.toString(),
        action: 'STATUS_CHANGED',
      });
      expect(log).toBeDefined();
      expect(log?.oldValue).toBe('todo');
      expect(log?.newValue).toBe('in_progress');
    });

    it('member cannot update another member task status', async () => {
      const bobTask = await Task.create({
        title: 'Bob Production Deploy',
        assignedTo: memberB._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'high',
        dueDate: new Date(),
      });

      // Alice attempts to update Bob's task status
      const res = await request(app)
        .patch(`/api/tasks/${bobTask._id}/status`)
        .set('Cookie', memberACookie)
        .send({ status: 'completed' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('member cannot update task metadata or reassign task', async () => {
      const aliceTask = await Task.create({
        title: 'Alice Review',
        assignedTo: memberA._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(),
      });

      // Alice tries to call the full edit endpoint to change assignee
      const res = await request(app)
        .patch(`/api/tasks/${aliceTask._id}`)
        .set('Cookie', memberACookie)
        .send({ assignedTo: memberB._id.toString() });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('member cannot delete task (rejected with 403)', async () => {
      const aliceTask = await Task.create({
        title: 'Task To Delete',
        assignedTo: memberA._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(),
      });

      const res = await request(app)
        .delete(`/api/tasks/${aliceTask._id}`)
        .set('Cookie', memberACookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('administrator can delete task', async () => {
      const task = await Task.create({
        title: 'Task To Be Removed',
        assignedTo: memberA._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(),
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const exists = await Task.findById(task._id);
      expect(exists).toBeNull();
    });

    it('rejects invalid task identifiers gracefully (400 Bad Request)', async () => {
      const res = await request(app)
        .get('/api/tasks/not-a-valid-id')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('Dashboard Metrics & Audit Logging', () => {
    it('returns role-scoped metrics for admin vs member', async () => {
      // 1 overdue task for Alice
      await Task.create({
        title: 'Overdue Task',
        assignedTo: memberA._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() - 86400000), // yesterday
      });

      // 1 in_progress task for Bob
      await Task.create({
        title: 'Bob Ongoing Task',
        assignedTo: memberB._id,
        createdBy: adminUser._id,
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000),
      });

      // Admin stats
      const adminStats = await request(app)
        .get('/api/dashboard/stats')
        .set('Cookie', adminCookie);
      expect(adminStats.status).toBe(200);
      expect(adminStats.body.data.stats.totalTasks).toBe(2);
      expect(adminStats.body.data.stats.totalMembers).toBe(2);

      // Alice stats
      const aliceStats = await request(app)
        .get('/api/dashboard/stats')
        .set('Cookie', memberACookie);
      expect(aliceStats.status).toBe(200);
      expect(aliceStats.body.data.stats.totalTasks).toBe(1);
      expect(aliceStats.body.data.stats.overdueTasks).toBe(1);
    });
  });

  describe('Regression Tests: Pagination & Query Handling', () => {
    it('paginates tasks correctly when requesting page 2', async () => {
      // Create 12 tasks
      const tasksToCreate = Array.from({ length: 12 }, (_, i) => ({
        title: `Paginated Task ${i + 1}`,
        assignedTo: memberA._id,
        createdBy: adminUser._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 86400000 * (i + 1)),
      }));
      await Task.insertMany(tasksToCreate);

      // Request Page 1 with limit 5
      const page1Res = await request(app)
        .get('/api/tasks?page=1&limit=5')
        .set('Cookie', adminCookie);

      expect(page1Res.status).toBe(200);
      expect(page1Res.body.data.tasks.length).toBe(5);
      expect(page1Res.body.data.pagination.page).toBe(1);
      expect(page1Res.body.data.pagination.totalPages).toBe(3);
      expect(page1Res.body.data.pagination.total).toBe(12);

      // Request Page 2 with limit 5
      const page2Res = await request(app)
        .get('/api/tasks?page=2&limit=5')
        .set('Cookie', adminCookie);

      expect(page2Res.status).toBe(200);
      expect(page2Res.body.data.tasks.length).toBe(5);
      expect(page2Res.body.data.pagination.page).toBe(2);

      // Verify page 1 and page 2 have distinct items
      const page1Ids = page1Res.body.data.tasks.map((t: any) => t._id);
      const page2Ids = page2Res.body.data.tasks.map((t: any) => t._id);
      const intersection = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(intersection.length).toBe(0);
    });
  });
});
