import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import { Briefcase, ListTodo, MoreHorizontal, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PMDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ projects: [], tasks: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPMData = async () => {
            if (!user) return;
            try {
                const [p, t] = await Promise.all([
                    api.getProjects(`?projectManagerId=${user.id}`),
                    api.getTasks(`?projectManagerId=${user.id}`)
                ]);
                setData({
                    projects: p.data || [],
                    tasks: t.data || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPMData();
    }, [user]);

    const activeProjects = data.projects.filter(p => p.status === 'active');

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">Project Management</h2>
                <p className="text-text-secondary">Monitored managed projects and task progress.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-brand-blue/20 to-transparent border-brand-blue/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-text-muted">My Projects</p>
                            <p className="text-3xl font-bold text-brand-blue mt-1">{data.projects.length}</p>
                        </div>
                        <Briefcase className="w-6 h-6 text-brand-blue" />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-brand-green/20 to-transparent border-brand-green/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-text-muted">Managed Tasks</p>
                            <p className="text-3xl font-bold text-brand-green mt-1">{data.tasks.length}</p>
                        </div>
                        <ListTodo className="w-6 h-6 text-brand-green" />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-info/20 to-transparent border-info/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-text-muted">In Progress</p>
                            <p className="text-3xl font-bold text-info mt-1">
                                {data.tasks.filter(t => t.status === 'in progress').length}
                            </p>
                        </div>
                        <Clock className="w-6 h-6 text-info" />
                    </div>
                </Card>
            </div>

            <Card title="Active Projects Status" headerAction={<button className="text-text-muted hover:text-text-primary"><MoreHorizontal size={20} /></button>}>
                <div className="space-y-6">
                    {activeProjects.map(project => (
                        <div key={project.id} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-text-primary">{project.name}</span>
                                <span className="text-text-muted">{project.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-green transition-all duration-500 shadow-glow"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {activeProjects.length === 0 && <p className="text-center text-text-muted italic py-4">No active projects found.</p>}
                </div>
            </Card>
        </div>
    );
};

export default PMDashboard;
