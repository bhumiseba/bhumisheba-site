import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <nav aria-label="ধাপসমূহ" className="w-full">
      <ol className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep;

          return (
            <li key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  text-xs font-semibold transition-all
                  ${isCurrent
                    ? 'bg-emerald-700 text-white shadow-elevation-2 cursor-default'
                    : isComplete
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-tertiary)] border border-[var(--border-subtle)] cursor-not-allowed'
                  }
                  focus-ring
                `}
              >
                <span
                  className={`
                    flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                    ${isCurrent
                      ? 'bg-white/20 text-white'
                      : isComplete
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)]'
                    }
                  `}
                >
                  {isComplete ? <Check className="w-3 h-3" /> : index + 1}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`
                    w-6 h-0.5 rounded-full
                    ${index < currentStep ? 'bg-emerald-500' : 'bg-[var(--border-subtle)]'}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};