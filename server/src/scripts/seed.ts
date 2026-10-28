import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';

async function seed() {
  try {
    // Safety verification: strictly refuse to seed in production or on remote clusters
    if (env.NODE_ENV === 'production') {
      console.error('[Security Error] Development seeding is strictly forbidden in production.');
      process.exit(1);
    }

    if (env.MONGODB_URI.includes('mongodb.net') && !process.env.ALLOW_REMOTE_SEED) {
      console.error('[Security Error] Detected remote MongoDB cluster URI. Seeding aborted to protect live data.');
      process.exit(1);
    }

    await connectDB();
    console.log('[Seed] Connected to database. Seeding development demo dataset...');

    // Clear existing data only in verified local development environment
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
    const memberPassword = process.env.SEED_MEMBER_PASSWORD || 'Member@123456';

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(adminPassword, salt);
    const memberPasswordHash = await bcrypt.hash(memberPassword, salt);

    // 1 Administrator
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@teamtasks.io',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    // 2 Members
    const memberAlex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@teamtasks.io',
      passwordHash: memberPasswordHash,
      role: 'member',
    });

    const memberSam = await User.create({
      name: 'Sam Taylor',
      email: 'sam@teamtasks.io',
      passwordHash: memberPasswordHash,
      role: 'member',
    });

    console.log('[Seed] Created accounts:');
    console.log(`  - Administrator: ${admin.email}`);
    console.log(`  - Member 1:      ${memberAlex.email}`);
    console.log(`  - Member 2:      ${memberSam.email}`);

    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    // Tasks for Alex
    const task1 = await Task.create({
      title: 'Implement secure authentication middleware',
      description: 'Configure JWT session tokens in HttpOnly cookies with CSRF defense and rate limiting on sign-in attempts.',
      assignedTo: memberAlex._id,
      createdBy: admin._id,
      status: 'in_progress',
      priority: 'high',
      dueDate: inTwoDays,
    });

    const task3 = await Task.create({
      title: 'Conduct security review on authorization endpoints',
      description: 'Audit RBAC guards to verify members cannot update unauthorized task attributes.',
      assignedTo: memberAlex._id,
      createdBy: admin._id,
      status: 'todo',
      priority: 'high',
      dueDate: inFiveDays,
    });

    const task5 = await Task.create({
      title: 'Draft production deployment configuration',
      description: 'Finalize render.yaml and single-origin SPA fallback serving from Express backend.',
      assignedTo: memberAlex._id,
      createdBy: admin._id,
      status: 'todo',
      priority: 'low',
      dueDate: inSevenDays,
    });

    // Tasks for Sam
    const task2 = await Task.create({
      title: 'Design database schemas for task activity tracking',
      description: 'Define Mongoose schema for User, Task, and ActivityLog with indexes on query filters.',
      assignedTo: memberSam._id,
      createdBy: admin._id,
      status: 'completed',
      priority: 'medium',
      dueDate: yesterday,
    });

    const task4 = await Task.create({
      title: 'Build responsive table views for task management',
      description: 'Create clean desktop and mobile task tables matching the neutral color palette with status indicators.',
      assignedTo: memberSam._id,
      createdBy: admin._id,
      status: 'in_progress',
      priority: 'medium',
      dueDate: tomorrow,
    });

    // Activity Logs
    await ActivityLog.create([
      {
        taskId: task1._id,
        performedBy: admin._id,
        action: 'TASK_CREATED',
        newValue: task1.title,
      },
      {
        taskId: task1._id,
        performedBy: admin._id,
        action: 'TASK_ASSIGNED',
        newValue: memberAlex.name,
      },
      {
        taskId: task1._id,
        performedBy: memberAlex._id,
        action: 'STATUS_CHANGED',
        oldValue: 'todo',
        newValue: 'in_progress',
      },
      {
        taskId: task2._id,
        performedBy: admin._id,
        action: 'TASK_CREATED',
        newValue: task2.title,
      },
      {
        taskId: task2._id,
        performedBy: admin._id,
        action: 'TASK_ASSIGNED',
        newValue: memberSam.name,
      },
      {
        taskId: task2._id,
        performedBy: memberSam._id,
        action: 'STATUS_CHANGED',
        oldValue: 'in_progress',
        newValue: 'completed',
      },
      {
        taskId: task3._id,
        performedBy: admin._id,
        action: 'TASK_CREATED',
        newValue: task3.title,
      },
      {
        taskId: task3._id,
        performedBy: admin._id,
        action: 'TASK_ASSIGNED',
        newValue: memberAlex.name,
      },
      {
        taskId: task4._id,
        performedBy: admin._id,
        action: 'TASK_CREATED',
        newValue: task4.title,
      },
      {
        taskId: task4._id,
        performedBy: admin._id,
        action: 'TASK_ASSIGNED',
        newValue: memberSam.name,
      },
      {
        taskId: task4._id,
        performedBy: memberSam._id,
        action: 'STATUS_CHANGED',
        oldValue: 'todo',
        newValue: 'in_progress',
      },
      {
        taskId: task5._id,
        performedBy: admin._id,
        action: 'TASK_CREATED',
        newValue: task5.title,
      },
      {
        taskId: task5._id,
        performedBy: admin._id,
        action: 'TASK_ASSIGNED',
        newValue: memberAlex.name,
      },
    ]);

    console.log('[Seed] Database seeded with 5 demo tasks and 13 activity records.');
    await disconnectDB();
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed Error] Failed to seed database:', error.message || error);
    process.exit(1);
  }
}

seed();
