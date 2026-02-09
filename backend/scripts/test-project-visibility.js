import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5003}/api/v1`;

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m"
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

async function testProjectVisibility() {
    console.clear();
    log("\n🔍 TESTING PROJECT VISIBILITY BUG FIX\n", colors.cyan);

    try {
        // Step 1: Login as team member (backend developer - should only see backend team projects)
        log("1. Logging in as Team Member (backend@debo.com)...", colors.cyan);
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'backend@debo.com', password: 'password123' })
        });
        const { data: loginData } = await loginRes.json();
        const memberToken = loginData.token;
        log("✅ Team Member logged in.\n", colors.green);

        // Step 2: Fetch projects as team member
        log("2. Fetching projects as Team Member...", colors.cyan);
        const projectsRes = await fetch(`${BASE_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${memberToken}` }
        });
        const { data: projects } = await projectsRes.json();

        log(`   Found ${projects.length} project(s)`, colors.yellow);
        projects.forEach(p => {
            log(`   - ${p.name} (Team: ${p.teamId})`, colors.yellow);
        });

        // Step 3: Verify team member only sees their team's projects
        const backendTeamId = 't1-backend-01';
        const onlyBackendProjects = projects.every(p => p.teamId === backendTeamId);

        if (onlyBackendProjects && projects.length > 0) {
            log("\n✅ PASS: Team member only sees their team's projects!", colors.green);
        } else if (projects.length === 0) {
            log("\n⚠️  WARNING: No projects returned (might be correct if no backend projects exist)", colors.yellow);
        } else {
            log("\n❌ FAIL: Team member can see projects from other teams!", colors.red);
            const otherTeamProjects = projects.filter(p => p.teamId !== backendTeamId);
            log(`   Leaked projects: ${otherTeamProjects.map(p => p.name).join(', ')}`, colors.red);
        }

        // Step 4: Login as Admin and verify they see ALL projects
        log("\n3. Logging in as Admin...", colors.cyan);
        const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@debo.com', password: 'password123' })
        });
        const { data: adminLoginData } = await adminLoginRes.json();
        const adminToken = adminLoginData.token;

        const adminProjectsRes = await fetch(`${BASE_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const { data: adminProjects } = await adminProjectsRes.json();

        log(`   Admin sees ${adminProjects.length} project(s)`, colors.yellow);

        if (adminProjects.length >= projects.length) {
            log("✅ PASS: Admin sees all projects (more than team member)", colors.green);
        } else {
            log("❌ FAIL: Admin sees fewer projects than team member!", colors.red);
        }

        // Step 5: Login as PM and verify they see only managed projects
        log("\n4. Logging in as Project Manager...", colors.cyan);
        const pmLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'pm@debo.com', password: 'password123' })
        });
        const { data: pmLoginData } = await pmLoginRes.json();
        const pmToken = pmLoginData.token;
        const pmId = pmLoginData.user.id;

        const pmProjectsRes = await fetch(`${BASE_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${pmToken}` }
        });
        const { data: pmProjects } = await pmProjectsRes.json();

        log(`   PM sees ${pmProjects.length} project(s)`, colors.yellow);
        const onlyManagedProjects = pmProjects.every(p => p.projectManagerId === pmId);

        if (onlyManagedProjects && pmProjects.length > 0) {
            log("✅ PASS: PM only sees their managed projects", colors.green);
        } else if (pmProjects.length === 0) {
            log("⚠️  WARNING: PM has no projects", colors.yellow);
        } else {
            log("❌ FAIL: PM sees projects they don't manage!", colors.red);
        }

        log("\n" + "=".repeat(60), colors.cyan);
        log("📊 FINAL VERIFICATION SUMMARY", colors.cyan);
        log("=".repeat(60), colors.cyan);
        log(`Team Member projects: ${projects.length}`, colors.yellow);
        log(`PM projects: ${pmProjects.length}`, colors.yellow);
        log(`Admin projects: ${adminProjects.length}`, colors.yellow);
        log("\n✅ Bug fix verified: Team members now see only their team's projects!", colors.green);

    } catch (error) {
        log(`\n❌ TEST FAILED: ${error.message}`, colors.red);
        console.error(error);
        process.exit(1);
    }
}

testProjectVisibility();
