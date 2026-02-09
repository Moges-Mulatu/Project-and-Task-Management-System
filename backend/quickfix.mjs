fetch('http://localhost:5003/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin2@debo.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Created:', data.user.email);
  console.log('Now run in MySQL:');
  console.log("UPDATE users SET role='admin' WHERE email='admin2@debo.com';");
})
.catch(console.error);
