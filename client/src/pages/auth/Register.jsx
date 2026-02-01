import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '/src/components/common/Button';
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registered!", formData);
    // After logic, redirect to Login
    navigate("/"); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-brand-green">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-brand-blue mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" placeholder="Full Name" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
            <input 
              type="email" placeholder="Email" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="password" placeholder="Password" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <Button>Sign Up</Button>
          </form>
          <p className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/" className="text-brand-blue font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;