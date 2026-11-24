// src/calc/ConverterApp.tsx
import { useState } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { HisyaConverter } from './features/hisya-converter/HisyaConverter';
import './styles/calc.css';

interface Props {
  readonly initialMode?: 'ANA' | 'AREA';
}

export default function ConverterApp({ initialMode = 'ANA' }: Props) {
  const [displayPrecision, setDisplayPrecision] = useState<number>(4);

  return (
    <ToastProvider>
      <div className="calc-root">
        <div className="no-print mb-4 flex items-center justify-end gap-2 text-xs text-stone-600">
          <label htmlFor="calc-precision" className="font-semibold">
            দশমিকের ঘর
          </label>
          <select
            id="calc-precision"
            value={displayPrecision}
            onChange={(e) => setDisplayPrecision(Number(e.target.value))}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 font-semibold text-stone-800"
          >
            <option value={2}>২ ঘর</option>
            <option value={4}>৪ ঘর</option>
            <option value={6}>৬ ঘর</option>
          </select>
        </div>

        <HisyaConverter
          initialMode={initialMode}
          displayPrecision={displayPrecision}
        />
      </div>
    </ToastProvider>
  );
}