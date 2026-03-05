import React from 'react';

type BadgeVariant = 'approve' | 'reject' | 'warning' | 'info' | 'critical';

interface StatusBadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
    pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    approve: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    reject: 'bg-alert-500/15 text-alert-400 border-alert-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    critical: 'bg-alert-500/15 text-alert-400 border-alert-500/20',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, children, pulse }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${variantStyles[variant]}`}>
        {pulse && (
            <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variant === 'critical' || variant === 'reject' ? 'bg-alert-400' : variant === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${variant === 'critical' || variant === 'reject' ? 'bg-alert-400' : variant === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </span>
        )}
        {children}
    </span>
);
