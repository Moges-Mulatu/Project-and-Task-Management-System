import React from 'react';

const Card = ({ children, className = '', title, headerAction, footer, ...props }) => {
    return (
        <div
            className={`bg-card-background border border-card-border rounded-xl shadow-lg overflow-hidden ${className}`}
            {...props}
        >
            {(title || headerAction) && (
                <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
                    {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="px-6 py-4">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 bg-background-secondary/30 border-t border-card-border">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
