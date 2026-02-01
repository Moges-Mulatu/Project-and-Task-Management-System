import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '/src/components/common/Button';
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // After login logic, you might go to a dashboard
    // navigate("/dashboard"); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-brand-blue">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-brand-blue mb-6">Welcome Back</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" placeholder="Email" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Password" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
            />

            <Button>Sign In</Button>
          </form>
          <p className="mt-6 text-center text-sm">
            New to Debo?{' '}
            <Link to="/register" className="text-brand-blue font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;