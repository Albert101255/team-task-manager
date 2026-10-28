import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}, cookie?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const setCookie = res.headers.get('set-cookie');
  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  }

  return { status: res.status, data, setCookie };
}

async function runScenario() {
  console.log('--- STARTING COMPREHENSIVE LIVE SCENARIO TEST ---');

  // 1. Admin login
  console.log('1. Testing Administrator Login...');
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@teamtasks.io', password: 'Admin@123456' }),
  });
  assert.strictEqual(adminLogin.status, 200);
  assert.strictEqual(adminLogin.data.data.user.role, 'admin');
  const adminCookie = adminLogin.setCookie!.split(';')[0];
  console.log('   Admin logged in successfully. Cookie received.');

  // 2. Admin creates Task A assigned to Alex
  console.log('2. Admin Creating Task for Alex Rivera...');
  const usersRes = await request('/api/users?role=member', {}, adminCookie);
  const alex = usersRes.data.data.users.find((u: any) => u.email === 'alex@teamtasks.io');
  const sam = usersRes.data.data.users.find((u: any) => u.email === 'sam@teamtasks.io');
  assert(alex, 'Alex should exist');
  assert(sam, 'Sam should exist');

  const createTaskRes = await request(
    '/api/tasks',
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'Verify End-to-End Scenario Compliance',
        description: 'Ensure all acceptance criteria and security checks are met.',
        assignedTo: alex.id || alex._id,
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'todo',
      }),
    },
    adminCookie
  );
  assert.strictEqual(createTaskRes.status, 201);
  const taskAId = createTaskRes.data.data.task._id;
  console.log(`   Task A created with ID: ${taskAId}`);

  // 3. Alex login
  console.log('3. Testing Member Alex Login...');
  const alexLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex@teamtasks.io', password: 'Member@123456' }),
  });
  assert.strictEqual(alexLogin.status, 200);
  assert.strictEqual(alexLogin.data.data.user.role, 'member');
  const alexCookie = alexLogin.setCookie!.split(';')[0];

  // 4. Alex checks /my-tasks and verifies Task A is visible, Sam tasks are not
  console.log('4. Verifying Alex sees Task A and only their own tasks...');
  const alexTasks = await request('/api/tasks/my', {}, alexCookie);
  assert.strictEqual(alexTasks.status, 200);
  const alexTaskIds = alexTasks.data.data.tasks.map((t: any) => t._id);
  assert(alexTaskIds.includes(taskAId), 'Alex must see Task A');
  alexTasks.data.data.tasks.forEach((t: any) => {
    assert.strictEqual(
      (t.assignedTo._id || t.assignedTo.id).toString(),
      (alex.id || alex._id).toString(),
      'All tasks in /my-tasks must be assigned to Alex'
    );
  });
  console.log(`   Verified: Alex sees ${alexTasks.data.data.tasks.length} tasks, all assigned to Alex.`);

  // 5. Alex updates status of Task A to "in_progress"
  console.log('5. Alex updates status of Task A to "in_progress"...');
  const updateStatusRes = await request(
    `/api/tasks/${taskAId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress' }),
    },
    alexCookie
  );
  assert.strictEqual(updateStatusRes.status, 200);
  assert.strictEqual(updateStatusRes.data.data.task.status, 'in_progress');
  console.log('   Task status updated to in_progress successfully.');

  // 6. Admin verifies updated status
  console.log('6. Administrator verifies updated status on Task A...');
  const adminCheckTask = await request(`/api/tasks/${taskAId}`, {}, adminCookie);
  assert.strictEqual(adminCheckTask.status, 200);
  assert.strictEqual(adminCheckTask.data.data.task.status, 'in_progress');
  console.log('   Admin sees updated status in_progress.');

  // 7. Security: Alex attempts to modify Sam\'s task
  console.log('7. Security: Alex attempts to modify Sam\'s task status directly...');
  const samTasks = await request('/api/tasks?assignedTo=' + (sam.id || sam._id), {}, adminCookie);
  const samTask = samTasks.data.data.tasks[0];
  assert(samTask, 'Sam should have a task');

  const unauthorizedUpdate = await request(
    `/api/tasks/${samTask._id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    },
    alexCookie
  );
  assert.strictEqual(unauthorizedUpdate.status, 403, 'Alex must receive 403 Forbidden');
  console.log('   Blocked with 403 Forbidden as required.');

  // 8. Security: Alex attempts to assign a task
  console.log('8. Security: Alex attempts to create and assign a task directly...');
  const unauthorizedCreate = await request(
    '/api/tasks',
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'Unauthorized Task Creation',
        assignedTo: sam.id || sam._id,
        priority: 'low',
        dueDate: new Date().toISOString(),
      }),
    },
    alexCookie
  );
  assert.strictEqual(unauthorizedCreate.status, 403, 'Alex must receive 403 Forbidden');
  console.log('   Blocked with 403 Forbidden as required.');

  // 9. Activity log verification
  console.log('9. Verifying Activity Log contains TASK_CREATED and STATUS_CHANGED...');
  const activityRes = await request(`/api/activity/tasks/${taskAId}`, {}, adminCookie);
  assert.strictEqual(activityRes.status, 200);
  const actions = activityRes.data.data.activities.map((a: any) => a.action);
  assert(actions.includes('TASK_CREATED'), 'Activity must contain TASK_CREATED');
  assert(actions.includes('STATUS_CHANGED'), 'Activity must contain STATUS_CHANGED');
  console.log('   Activity audit history verified: actions recorded accurately.');

  // 10. Registration of new member
  console.log('10. Testing New Member Registration...');
  const newEmail = `member_${Date.now()}@test.com`;
  const registerRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Taylor Jordan',
      email: newEmail,
      password: 'StrongPassword@123',
      confirmPassword: 'StrongPassword@123',
    }),
  });
  assert.strictEqual(registerRes.status, 201);
  assert.strictEqual(registerRes.data.data.user.role, 'member');
  console.log('   New member registered successfully with "member" role.');

  console.log('--- ALL ACCEPTANCE CRITERIA VERIFIED ON LIVE SERVER! ---');
}

runScenario().catch((err) => {
  console.error('Scenario failed:', err);
  process.exit(1);
});
