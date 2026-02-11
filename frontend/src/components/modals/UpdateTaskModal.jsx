import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';
import { TASK_STATUS } from '../../constants';

const UpdateTaskModal = ({ isOpen, onClose, task, onSuccess }) => {
    const [formData, setFormData] = useState({
        status: task?.status || TASK_STATUS.TODO,
        progress: task?.progress || 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStatusChange = (newStatus) => {
        let newProgress = formData.progress;

        // Logical Sync: Status -> Progress
        if (newStatus === TASK_STATUS.TODO) newProgress = 0;
        if (newStatus === TASK_STATUS.REVIEW || newStatus === TASK_STATUS.COMPLETED) newProgress = 100;
        if (newStatus === TASK_STATUS.IN_PROGRESS && (newProgress === 0 || newProgress === 100)) newProgress = 10;

        setFormData({ ...formData, status: newStatus, progress: newProgress });
    };

    const handleProgressChange = (value) => {
        const newProgress = parseInt(value);
        let newStatus = formData.status;

        // Logical Sync: Progress -> Status
        if (newProgress === 0) newStatus = TASK_STATUS.TODO;
        else if (newProgress === 100) {
            // If already completed/review, stay there. Otherwise move to review.
            if (newStatus !== TASK_STATUS.COMPLETED && newStatus !== TASK_STATUS.REVIEW) {
                newStatus = TASK_STATUS.REVIEW;
            }
        } else {
            // If progress is between 1-99, it must be 'in progress'
            newStatus = TASK_STATUS.IN_PROGRESS;
        }

        setFormData({ ...formData, progress: newProgress, status: newStatus });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.updateTask(task.id, formData);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Operation Progress">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Operation Status</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(TASK_STATUS).map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(status)}
                                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all ${formData.status === status
                                    ? 'border-brand-green bg-brand-green/10 text-brand-green'
                                    : 'border-card-border bg-background-tertiary text-text-muted hover:border-text-muted'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Completion Percentage</label>
                        <span className="text-xl font-bold text-brand-green">{formData.progress}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-brand-green"
                        value={formData.progress}
                        onChange={(e) => handleProgressChange(e.target.value)}
                    />
                </div>

                {error && <p className="text-error text-xs font-medium bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}

                <div className="flex justify-end space-x-3 pt-6 border-t border-card-border">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" loading={loading} type="submit">Sync Progress</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateTaskModal;
