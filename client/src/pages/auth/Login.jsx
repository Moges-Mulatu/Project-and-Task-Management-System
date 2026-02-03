import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '/src/components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Logic here
  };

  return (
    /* MAIN WRAPPER: Using your brand-green for the deep dark base */
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a2e22] relative overflow-hidden font-sans">
      
      {/* 1. Background Glows using your Brand Blue and Green */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-blue/30 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-brand-green/40 blur-[120px]"></div>
      
      {/* 2. Subtle Grid Overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      {/* LOGIN CARD: Slide up and Fade in animation */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Top Gradient Border using both brand colors */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-green to-brand-blue"></div>
        
        <div className="p-10">
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Sign in to manage your account.</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-xs font-bold text-brand-blue hover:text-brand-green transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Custom Button using brand-blue */}
            <Button className="w-full py-3 bg-brand-blue hover:bg-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all transform active:scale-[0.98]">
              Sign In
            </Button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              New?{' '}
              <Link to="/register" className="text-brand-green font-extrabold hover:underline">
                Create account
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;