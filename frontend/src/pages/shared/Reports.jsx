import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

const Reports = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = user?.role === ROLES.PROJECT_MANAGER ? `?projectManagerId=${user.id}` : '';
                const [tasksRes, projectsRes] = await Promise.all([
                    api.getTasks(query),
                    api.getProjects(query)
                ]);
                setTasks(tasksRes.data || []);
                setProjects(projectsRes.data || []);
            } catch (err) {
                console.error('❌ Data fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Data Aggregation
    const taskStats = [
        { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#FACC15' },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
        { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#8B5CF6' },
        { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#22C55E' },
    ].filter(s => s.value > 0);

    const velocityData = projects
        .filter(p => p.progress > 0)
        .map(p => ({
            name: p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name,
            velocity: p.progress || 0
        }))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Performance Analytics</h2>
                    <p className="text-text-secondary text-sm">Real-time data synchronization and velocity tracking.</p>
                </div>
                <Button variant="outline" onClick={() => window.print()}>
                    <Download size={18} className="mr-2" />
                    Export PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Task Distribution Chart */}
                <Card title="Operation Distribution" headerAction={<PieChart size={20} className="text-brand-green" />}>
                    <div className="h-80 w-full mt-4">
                        {taskStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={taskStats}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {taskStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend iconType="circle" />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
                                No operational data found.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Project Velocity Chart */}
                <Card title="Active Velocity (Top 5)" headerAction={<TrendingUp size={20} className="text-brand-blue" />}>
                    <div className="h-80 w-full mt-4">
                        {velocityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={velocityData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                                        unit="%"
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar
                                        dataKey="velocity"
                                        fill="#22C55E"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
                                No projects identified.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Card title="Mission Intelligence">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="p-6 bg-background-tertiary rounded-2xl border border-card-border">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Completion Rate</p>
                        <p className="text-3xl font-bold text-brand-green">
                            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                        </p>
                    </div>
                    <div className="p-6 bg-background-tertiary rounded-2xl border border-card-border">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">High Priority Risks</p>
                        <p className="text-3xl font-bold text-error">
                            {tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}
                        </p>
                    </div>
                    <div className="p-6 bg-background-tertiary rounded-2xl border border-card-border">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Total Managed Operations</p>
                        <p className="text-3xl font-bold text-info">{tasks.length}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Reports;
