import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const [statsRes, projectsRes] = await Promise.all([
                    apiService.getStats(),
                    apiService.getProjects()
                ]);
                setStats(statsRes.data);
                setProjects(projectsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch report data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">
                    System Analytics & Reports
                </h1>
                <p className="mt-1 text-sm text-text-secondary">High-level performance metrics and project health</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-brand-blue/10 to-transparent border-brand-blue/20">
                    <Card.Body className="p-6">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Management Units</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-text-primary">{projects.length}</h3>
                            <span className="text-xs font-bold text-brand-blue uppercase">Projects</span>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="bg-gradient-to-br from-brand-green/10 to-transparent border-brand-green/20">
                    <Card.Body className="p-6">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Execution Velocity</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-text-primary">{stats?.tasksCount || 0}</h3>
                            <span className="text-xs font-bold text-brand-green uppercase">Live Tasks</span>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                    <Card.Body className="p-6">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Team Bandwidth</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-text-primary">{stats?.usersCount || 0}</h3>
                            <span className="text-xs font-bold text-purple-400 uppercase">Agents</span>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                    <Card.Body className="p-6">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Collaborative Units</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-text-primary">8</h3>
                            <span className="text-xs font-bold text-orange-400 uppercase">Teams</span>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Health Table */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-bold text-text-primary">Project Health Overview</h3>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-card-border/30">
                                <thead className="bg-background-secondary/10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase">Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase">Progress</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase">Health</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border/20">
                                    {projects.map(project => (
                                        <tr key={project.id}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-text-primary">{project.name}</div>
                                                <div className="text-[10px] text-text-muted uppercase">{project.department || 'General'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand-blue"
                                                            style={{ width: `${project.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-text-secondary">{project.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${(project.progress || 0) >= 80 ? 'bg-green-100 text-green-800' :
                                                        (project.progress || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {(project.progress || 0) >= 80 ? 'Optimal' : (project.progress || 0) >= 40 ? 'At Risk' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Efficiency Chart Placeholder */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <Card.Header>
                            <h3 className="text-lg font-bold text-text-primary">Team Efficiency</h3>
                        </Card.Header>
                        <Card.Body className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                            <div className="w-32 h-32 rounded-full border-8 border-brand-green/20 border-t-brand-green flex items-center justify-center mb-4">
                                <span className="text-3xl font-bold text-brand-green">94%</span>
                            </div>
                            <h4 className="font-bold text-text-primary mb-2">High Performance Zone</h4>
                            <p className="text-xs text-text-muted leading-relaxed">
                                Task completion velocity has increased by 12% compared to last month. Average resolution time: 4.2 hours.
                            </p>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Reports;
