// Quick fix: Create a test user via API, then update to admin
fetch('http://localhost:5003/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'Admin',
    email: 'testadmin@debo.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('User created:', data);
  console.log('Now run this SQL to make admin:');
  console.log("UPDATE users SET role = 'admin' WHERE email = 'testadmin@debo.com';");
})
.catch(err => console.error('Error:', err));
