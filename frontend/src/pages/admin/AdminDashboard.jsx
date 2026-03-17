import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import { Users, Network, Briefcase, CheckCircle2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="hover:scale-[1.02] transition-transform duration-300 shadow-glow">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-text-muted">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    </Card>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, teams: 0, projects: 0, tasks: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [u, t, p, tasks] = await Promise.all([
                    api.getUsers(),
                    api.getTeams(),
                    api.getProjects(),
                    api.getTasks()
                ]);
                console.log('📦 Admin Dashboard Data Loaded:', { users: u, teams: t, projects: p, tasks: tasks });
                setStats({
                    users: u.data?.length || 0,
                    teams: t.data?.length || 0,
                    projects: p.data?.length || 0,
                    tasks: tasks.data?.length || 0
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="animate-pulse space-y-4">...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">System Overview</h2>
                <p className="text-text-secondary">Global management and system statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.users} icon={Users} color="brand-green" />
                <StatCard title="Active Teams" value={stats.teams} icon={Network} color="info" />
                <StatCard title="All Projects" value={stats.projects} icon={Briefcase} color="brand-blue" />
                <StatCard title="Total Tasks" value={stats.tasks} icon={CheckCircle2} color="success" />
            </div>

        </div>
    );
};

export default AdminDashboard;
