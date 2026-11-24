import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div
      className="
        flex flex-col items-center justify-center text-center
        py-12 px-6 rounded-2xl
        border-2 border-dashed border-[var(--border-subtle)]
        bg-[var(--bg-surface-subtle)]
      "
    >
      <div
        className="
          w-14 h-14 rounded-2xl flex items-center justify-center mb-4
          bg-[var(--bg-surface)] border border-[var(--border-subtle)]
        "
      >
        <Icon className="w-7 h-7 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-5 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="
            inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
            bg-emerald-700 hover:bg-emerald-800 text-white
            text-sm font-semibold shadow-elevation-2
            transition-colors cursor-pointer focus-ring
          "
        >
          {action.label}
        </button>
      )}
    </div>
  );
};