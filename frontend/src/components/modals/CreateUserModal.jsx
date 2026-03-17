import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';
import { ROLES } from '../../constants';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: ROLES.TEAM_MEMBER,
        department: '',
        position: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // basic trimming + normalization
            const payload = {
                ...formData,
                firstName: formData.firstName?.trim(),
                lastName: formData.lastName?.trim(),
                email: formData.email?.trim().toLowerCase()
            };
            await api.createUser(payload);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Onboard New Personnel">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">First Name</label>
                        <input
                            required
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Last Name</label>
                        <input
                            required
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                    <input
                        required
                        type="email"
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Role Assignment</label>
                    <select
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none appearance-none"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value={ROLES.TEAM_MEMBER}>Team Member</option>
                        <option value={ROLES.PROJECT_MANAGER}>Project Manager</option>
                        <option value={ROLES.ADMIN}>Administrator</option>
                    </select>
                </div>

                {error && <p className="text-error text-xs font-medium bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4 border-t border-card-border mt-6">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" loading={loading} type="submit">Complete Onboarding</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateUserModal;
