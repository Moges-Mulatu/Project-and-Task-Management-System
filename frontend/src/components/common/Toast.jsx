import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={18} className="text-brand-green" />;
            case 'error':
                return <AlertCircle size={18} className="text-error" />;
            case 'warning':
                return <AlertTriangle size={18} className="text-warning" />;
            default:
                return <Info size={18} className="text-info" />;
        }
    };

    const getBackgroundClass = () => {
        switch (type) {
            case 'success':
                return 'bg-brand-green/10 border-brand-green/30';
            case 'error':
                return 'bg-error/10 border-error/30';
            case 'warning':
                return 'bg-warning/10 border-warning/30';
            default:
                return 'bg-info/10 border-info/30';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 ${getBackgroundClass()} ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div className="flex items-center space-x-3">
                {getIcon()}
                <p className="text-sm font-medium text-text-primary max-w-sm">{message}</p>
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-4 text-text-muted hover:text-text-primary transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
