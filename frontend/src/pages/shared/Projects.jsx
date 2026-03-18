import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Search, Filter, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';
import CreateProjectModal from '../../components/modals/CreateProjectModal';
import UpdateProjectModal from '../../components/modals/UpdateProjectModal';

const Projects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    const isAdmin = user?.role === ROLES.ADMIN;
    const isPM = user?.role === ROLES.PROJECT_MANAGER;

    // Status-based progress mapping for consistency
    const getProgressByStatus = (status, currentProgress) => {
        switch (status) {
            case 'planning': return 0;
            case 'active': return currentProgress || 0;
            case 'on_hold': return currentProgress || 0;
            case 'completed': return 100;
            case 'cancelled': return currentProgress || 0;
            default: return currentProgress || 0;
        }
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            let response;
            if (isPM) {
                response = await api.getProjects(`?projectManagerId=${user.id}`);
            } else if (isAdmin) {
                response = await api.getProjects();
            } else {
                // team member: show projects for their team
                response = await api.getProjects(user?.teamId ? `?teamId=${user.teamId}` : '');
            }
            setProjects(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id) => {
        setDeleteConfirmation(id);
    };
    
    const confirmDelete = async () => {
        const projectId = deleteConfirmation;
        setDeleteConfirmation(null);
        try {
            console.log('Attempting to delete project:', projectId);
            await api.deleteProject(projectId);
            console.log('Delete successful, refreshing projects...');
            await fetchProjects(); // Make sure fetch completes
        } catch (err) {
            console.error('Delete failed:', err);
            alert(`Failed to delete project: ${err.message || 'Unknown error'}`);
        }
    };
    
    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Projects Portfolio</h2>
                    <p className="text-text-secondary text-sm">Oversee and manage high-tier engineering projects.</p>
                </div>
                {isPM && (
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" />
                        Initialize Project
                    </Button>
                )}
            </div>

            <div className="flex gap-4 bg-background-secondary p-4 rounded-xl border border-card-border">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-text-muted w-4 h-4" />
                    <input
                        placeholder="Search projects by ID, name or manager..."
                        className="w-full bg-background-tertiary border border-card-border rounded-lg py-2 pl-10 pr-4 text-sm text-text-primary focus:ring-1 focus:ring-brand-green/50 outline-none"
                    />
                </div>
                <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Refine
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-card-background animate-pulse rounded-xl border border-card-border"></div>)
                ) : projects.map(project => (
                    <Card key={project.id} className="group hover:border-brand-green/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                    project.status === 'active' ? 'bg-brand-green/10 text-brand-green' :
                                    project.status === 'planning' ? 'bg-blue-500/10 text-blue-400' :
                                    project.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                    project.status === 'on_hold' ? 'bg-orange-500/10 text-orange-400' :
                                    project.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                    'bg-gray-500/10 text-gray-400'
                                }`}>
                                    {project.status === 'active' ? 'Active' :
                                     project.status === 'planning' ? 'Planning' :
                                     project.status === 'completed' ? 'Completed' :
                                     project.status === 'on_hold' ? 'On Hold' :
                                     project.status === 'cancelled' ? 'Cancelled' :
                                     project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </span>
                                <h3 className="text-lg font-bold text-text-primary mt-2">{project.name}</h3>
                            </div>
                            {isPM ? (
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors ml-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center text-text-muted text-[10px] font-bold">
                                    #{project.id.slice(0, 4)}
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-text-secondary line-clamp-2 mb-4 h-10 italic">
                            {project.description || 'No specialized description provided...'}
                        </p>

                        <div className="space-y-3">
                            <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        project.status === 'completed' ? 'bg-green-500' :
                                        project.status === 'cancelled' ? 'bg-red-500' :
                                        project.status === 'on_hold' ? 'bg-orange-500' :
                                        'bg-gradient-to-r from-brand-green to-brand-blue'
                                    }`}
                                    style={{ width: `${getProgressByStatus(project.status, project.progress)}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-card-border">
                            <div className="flex items-center text-xs text-text-muted">
                                <div className="w-5 h-5 rounded-full bg-background-tertiary mr-2 border border-card-border flex items-center justify-center text-[8px] font-bold">PM</div>
                                <span>ID: {project.projectManagerId}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => isPM ? setSelectedProject(project) : null}
                            >
                                {isPM ? (
                                    <span className="flex items-center"><Edit3 size={12} className="mr-1" /> Manage</span>
                                ) : (
                                    // Admins just see the ID, no interaction
                                    <span className="text-text-muted cursor-default">Oversight Only</span>
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
                {projects.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-text-muted border-2 border-dashed border-card-border rounded-2xl">
                        No projects identified within your clearance level.
                    </div>
                )}
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProjects}
            />

            {selectedProject && (
                <UpdateProjectModal
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                    project={selectedProject}
                    onSuccess={fetchProjects}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background-secondary border border-card-border rounded-xl p-6 max-w-md mx-4">
                        <h3 className="text-lg font-bold text-text-primary mb-4">Delete Project</h3>
                        <p className="text-text-secondary mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-error text-white hover:bg-error/90 rounded-lg transition-colors"
                            >
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
