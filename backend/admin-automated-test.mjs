import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5003/api/v1';
let token = null;
let testResults = [];

// Helper to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: null, error: error.message, ok: false };
  }
}

// Log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const result = `${status} - ${testName}${details ? ' - ' + details : ''}`;
  testResults.push(result);
  console.log(result);
  return passed;
}

// Test Suite
async function runAdminTests() {
  console.log('\n========================================');
  console.log('🧪 ADMIN ROLE AUTOMATED TESTING');
  console.log('========================================\n');

  // 1. LOGIN AS ADMIN
  console.log('1️⃣  Testing Admin Login...');
  const loginRes = await apiCall('/auth/login', 'POST', {
    email: 'admin@debo.com',
    password: 'password123'
  });
  
  if (loginRes.ok && loginRes.data?.success) {
    token = loginRes.data.data.token;
    logTest('Admin Login', true, `Token received: ${token.substring(0, 20)}...`);
    console.log(`   👤 User: ${loginRes.data.data.user.email} (${loginRes.data.data.user.role})`);
  } else {
    logTest('Admin Login', false, loginRes.data?.message || loginRes.error);
    return;
  }

  // 2. VIEW ALL PROJECTS (Admin should see all)
  console.log('\n2️⃣  Testing View All Projects...');
  const projectsRes = await apiCall('/projects');
  if (projectsRes.ok && projectsRes.data?.success) {
    const projects = projectsRes.data.data;
    logTest('View All Projects', true, `${projects.length} projects found`);
    projects.forEach(p => console.log(`   📁 ${p.name} - ${p.status}`));
  } else {
    logTest('View All Projects', false, projectsRes.data?.message);
  }

  // 3. CREATE PROJECT
  console.log('\n3️⃣  Testing Create Project...');
  const newProject = {
    name: 'Test Admin Project',
    description: 'Created by automated test',
    teamId: 't1-backend-01',
    projectManagerId: 'u2-pm-001',
    status: 'planning',
    priority: 'medium',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  const createProjectRes = await apiCall('/projects', 'POST', newProject);
  let createdProjectId = null;
  if (createProjectRes.ok && createProjectRes.data?.success) {
    createdProjectId = createProjectRes.data.data.id;
    logTest('Create Project', true, `ID: ${createdProjectId}`);
  } else {
    logTest('Create Project', false, createProjectRes.data?.message);
  }

  // 4. UPDATE PROJECT
  if (createdProjectId) {
    console.log('\n4️⃣  Testing Update Project...');
    const updateRes = await apiCall(`/projects/${createdProjectId}`, 'PATCH', {
      ...newProject,
      name: 'Test Admin Project (Updated)',
      status: 'active'
    });
    logTest('Update Project', updateRes.ok && updateRes.data?.success, updateRes.data?.message);
  }

  // 5. VIEW ALL TASKS
  console.log('\n5️⃣  Testing View All Tasks...');
  const tasksRes = await apiCall('/tasks');
  if (tasksRes.ok && tasksRes.data?.success) {
    const tasks = tasksRes.data.data;
    logTest('View All Tasks', true, `${tasks.length} tasks found`);
  } else {
    logTest('View All Tasks', false, tasksRes.data?.message);
  }

  // 6. CREATE TASK (use created project)
  console.log('\n6️⃣  Testing Create Task...');
  const newTask = {
    title: 'Test Admin Task',
    description: 'Created by automated test',
    projectId: createdProjectId || 'p1-core-001',
    assignedTo: 'u3-member-001',
    status: 'todo',
    priority: 'medium',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  const createTaskRes = await apiCall('/tasks', 'POST', newTask);
  let createdTaskId = null;
  if (createTaskRes.ok && createTaskRes.data?.success) {
    createdTaskId = createTaskRes.data.data.id;
    logTest('Create Task', true, `ID: ${createdTaskId}`);
  } else {
    logTest('Create Task', false, createTaskRes.data?.message);
  }

  // 7. UPDATE TASK
  if (createdTaskId) {
    console.log('\n7️⃣  Testing Update Task...');
    const updateTaskRes = await apiCall(`/tasks/${createdTaskId}`, 'PATCH', {
      ...newTask,
      title: 'Test Admin Task (Updated)',
      status: 'in_progress'
    });
    logTest('Update Task', updateTaskRes.ok && updateTaskRes.data?.success);
  }

  // 8. VIEW ALL USERS (Admin only)
  console.log('\n8️⃣  Testing View All Users (Admin only)...');
  const usersRes = await apiCall('/users');
  if (usersRes.ok && usersRes.data?.success) {
    const users = usersRes.data.data;
    logTest('View All Users', true, `${users.length} users found`);
    users.forEach(u => console.log(`   👤 ${u.email} - ${u.role}`));
  } else {
    logTest('View All Users', false, usersRes.data?.message);
  }

  // 9. CREATE TEAM (Admin only)
  console.log('\n9️⃣  Testing Create Team (Admin only)...');
  const newTeam = {
    name: `Test Automation Team ${Date.now()}`,
    description: 'Created by automated test',
    department: 'QA',
    teamLeadId: 'u2-pm-001',
    maxMembers: 5
  };
  const createTeamRes = await apiCall('/teams', 'POST', newTeam);
  let createdTeamId = null;
  if (createTeamRes.ok && createTeamRes.data?.success) {
    createdTeamId = createTeamRes.data.data.id;
    logTest('Create Team', true, `ID: ${createdTeamId}`);
  } else {
    logTest('Create Team', false, createTeamRes.data?.message);
  }

  // 10. VIEW ALL TEAMS
  console.log('\n🔟 Testing View All Teams...');
  const teamsRes = await apiCall('/teams');
  if (teamsRes.ok && teamsRes.data?.success) {
    const teams = teamsRes.data.data;
    logTest('View All Teams', true, `${teams.length} teams found`);
  } else {
    logTest('View All Teams', false, teamsRes.data?.message);
  }

  // 11. DELETE TASK (Cleanup)
  if (createdTaskId) {
    console.log('\n🗑️  Testing Delete Task...');
    const deleteTaskRes = await apiCall(`/tasks/${createdTaskId}`, 'DELETE');
    logTest('Delete Task', deleteTaskRes.ok && deleteTaskRes.data?.success);
  }

  // 12. DELETE PROJECT (Cleanup)
  if (createdProjectId) {
    console.log('\n🗑️  Testing Delete Project...');
    const deleteProjectRes = await apiCall(`/projects/${createdProjectId}`, 'DELETE');
    logTest('Delete Project', deleteProjectRes.ok && deleteProjectRes.data?.success);
  }

  // 13. DELETE TEAM (Cleanup)
  if (createdTeamId) {
    console.log('\n🗑️  Testing Delete Team...');
    const deleteTeamRes = await apiCall(`/teams/${createdTeamId}`, 'DELETE');
    logTest('Delete Team', deleteTeamRes.ok && deleteTeamRes.data?.success);
  }

  // GENERATE REPORT
  console.log('\n========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================');
  const passed = testResults.filter(r => r.includes('✅')).length;
  const failed = testResults.filter(r => r.includes('❌')).length;
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / testResults.length) * 100)}%`);
  
  // Save report to file
  const reportContent = [
    'ADMIN ROLE AUTOMATED TEST REPORT',
    '================================',
    `Generated: ${new Date().toISOString()}`,
    `Total Tests: ${testResults.length}`,
    `Passed: ${passed}`,
    `Failed: ${failed}`,
    `Success Rate: ${Math.round((passed / testResults.length) * 100)}%`,
    '',
    'DETAILED RESULTS:',
    '=================',
    ...testResults,
    '',
    'ROLE PERMISSIONS TESTED:',
    '- View all projects ✓',
    '- Create/Edit/Delete projects ✓',
    '- View all tasks ✓',
    '- Create/Edit/Delete tasks ✓',
    '- View all users ✓',
    '- Create/Delete teams ✓',
    '- View all teams ✓'
  ].join('\n');

  fs.writeFileSync('admin-test-report.txt', reportContent);
  console.log('\n📝 Report saved to: admin-test-report.txt');
}

// Run tests
runAdminTests().catch(console.error);
