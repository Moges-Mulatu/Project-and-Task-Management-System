import React from 'react';
import Modal from '../common/Modal';
import { Calendar, User, Tag, Paperclip, MessageSquare, CheckCircle2 } from 'lucide-react';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
    if (!task) return null;

    const tags = Array.isArray(task.tags) ? task.tags : JSON.parse(task.tags || '[]');
    const statusColor = task.status === 'completed' ? 'text-brand-green' : 'text-info';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Operation Details">
            <div className="space-y-8">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${statusColor}`}>
                            {task.status.replace('_', ' ')}
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">{task.title}</h2>
                        <p className="text-sm text-text-muted mt-2 leading-relaxed">{task.description}</p>
                    </div>
                    {task.status === 'completed' && (
                        <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                            <CheckCircle2 size={24} />
                        </div>
                    )}
                </div>

                {/* Grid Metadata */}
                <div className="grid grid-cols-2 gap-6 py-6 border-y border-card-border">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                            <Calendar size={12} className="mr-2" /> Deadline
                        </span>
                        <p className="text-sm font-medium text-text-secondary">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline Set'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                            <User size={12} className="mr-2" /> Assigned To
                        </span>
                        <p className="text-sm font-medium text-text-secondary">{task.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                            <Tag size={12} className="mr-2" /> Points
                        </span>
                        <p className="text-sm font-medium text-text-secondary">{task.storyPoints || 'N/A'} Story Points</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                            <CheckCircle2 size={12} className="mr-2" /> Final Progress
                        </span>
                        <p className="text-sm font-medium text-brand-green">{task.progress}% Synchronized</p>
                    </div>
                </div>

                {/* Tags Section */}
                {tags.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Metatags</h4>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 bg-background-tertiary text-text-secondary text-[10px] font-bold rounded-lg border border-card-border">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* History/Audit Placeholder */}
                <div className="bg-background-tertiary/50 p-6 rounded-2xl border border-card-border space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-text-primary flex items-center">
                            <MessageSquare size={14} className="mr-2 text-info" /> Operation Registry
                        </h4>
                        <span className="text-[10px] text-text-muted">Audit Log v1.0</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex space-x-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-1.5 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                            <div>
                                <p className="text-xs text-text-secondary">Mission marked as <span className="text-brand-green font-bold text-[10px]">COMPLETED</span></p>
                                <span className="text-[10px] text-text-muted">Final synchronization complete.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;
