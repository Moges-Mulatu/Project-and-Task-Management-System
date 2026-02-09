USE project_management;

UPDATE users SET password = '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgOzt0bBduu' WHERE email IN (
  'admin@debo.com',
  'pm@debo.com', 
  'member@debo.com',
  'backend@debo.com',
  'frontend@debo.com',
  'mobile@debo.com',
  'ux@debo.com',
  'pm2@debo.com',
  'member2@debo.com'
);
