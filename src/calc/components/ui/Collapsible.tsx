import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const reactId = useId();
  const contentId = `collapsible-${reactId}`;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="
          w-full flex items-center justify-between gap-3
          px-4 py-3 text-left
          hover:bg-[var(--bg-surface-subtle)] transition-colors
          cursor-pointer focus-ring
        "
      >
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{title}</div>
          {subtitle && (
            <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</div>
          )}
        </div>
        <ChevronDown
          className={`
            w-4 h-4 text-[var(--text-tertiary)] shrink-0
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {isOpen && (
        <div
          id={contentId}
          className="px-4 pb-4 border-t border-[var(--border-subtle)]"
        >
          {children}
        </div>
      )}
    </div>
  );
};