import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '/src/components/common/Button';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registered!", formData);
    navigate("/"); 
  };

  return (
    /* MAIN WRAPPER: Matching the Login page base */
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a2e22] relative overflow-hidden font-sans">
      
      {/* 1. Background Glows (Flipped positions for visual variety) */}
      <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-blue/20 blur-[120px]"></div>
      <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-brand-green/30 blur-[120px] animate-pulse"></div>
      
      {/* 2. Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      {/* REGISTER CARD */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative z-10 transition-all duration-500">
        
        {/* Accent Bar - Using Brand Green for Register */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-green to-[#1e8a69]"></div>
        
        <div className="p-10">
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project & Task Management System</h2>
            <p className="text-slate-500 mt-2">Create account.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="pt-2">
              <Button className="w-full py-3 bg-brand-green hover:bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 transition-all transform active:scale-[0.98]">
                Sign Up
              </Button>
            </div>
          </form>

          <footer className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/" className="text-brand-blue font-extrabold hover:text-brand-green transition-colors">
                Log in
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;