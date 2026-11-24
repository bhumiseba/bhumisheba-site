import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputErrorProps {
  message: string;
}

export const InputError: React.FC<InputErrorProps> = ({ message }) => {
  return (
    <p
      role="alert"
      className="text-[11px] text-rose-700 mt-1 flex items-center gap-1"
    >
      <AlertCircle className="w-3 h-3 shrink-0" />
      <span>{message}</span>
    </p>
  );
};