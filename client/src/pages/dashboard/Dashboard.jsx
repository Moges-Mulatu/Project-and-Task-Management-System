import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-blue">Welcome, {user?.fullName}</h1>
        <p className="text-gray-500">Role: {user?.role}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-brand-green">
          <h3 className="text-gray-400 text-sm font-semibold uppercase">Project Status</h3>
          <p className="text-2xl font-bold text-brand-blue">In Progress</p>
        </div>

        {/* Progress Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-brand-blue">
          <h3 className="text-gray-400 text-sm font-semibold uppercase">Overall Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-brand-green h-2.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-right text-xs mt-1 font-bold text-brand-green">65% Complete</p>
        </div>
      </div>
    </div>
  );
};