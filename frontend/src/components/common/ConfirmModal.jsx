import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger' }) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getIconColor = () => {
        switch (type) {
            case 'danger':
                return 'text-error bg-error/10';
            case 'warning':
                return 'text-warning bg-warning/10';
            default:
                return 'text-info bg-info/10';
        }
    };

    const getConfirmButtonVariant = () => {
        switch (type) {
            case 'danger':
                return 'danger';
            case 'warning':
                return 'primary';
            default:
                return 'secondary';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${getIconColor()}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <p className="text-text-primary">{message}</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-card-border">
                    <Button variant="ghost" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button variant={getConfirmButtonVariant()} onClick={handleConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
