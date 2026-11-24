import React, { useState } from 'react';
import { ReconciliationReport } from '@calculation-core';
import { formatDisplayNumber } from '@shared';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface Props {
  readonly report: ReconciliationReport;
  readonly digitLocale: 'bn' | 'en';
}

export const ReconciliationBanner: React.FC<Props> = ({ report, digitLocale }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (report.state) {
      case 'VALID':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />,
          title: 'হিসাবের যোগফল মিলেছে',
          statusText: 'যোগফল ঠিক আছে',
          statusColor: 'text-emerald-800',
          bg: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
          description: 'ভাগগুলোর যোগফল ঠিক ১। এটি শুধু গাণিতিক মিল, আইনি যাচাই নয়।',
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />,
          title: 'যাচাই প্রয়োজন',
          statusText: 'সতর্কতা (WARNING)',
          statusColor: 'text-amber-800',
          bg: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
          description: report.summary,
        };
      case 'INVALID':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-700 shrink-0" />,
          title: 'তথ্যে বৈসাদৃশ্য পরিলক্ষিত',
          statusText: 'অমিল (INVALID)',
          statusColor: 'text-rose-800',
          bg: 'bg-rose-50/70 border-rose-200/90 text-rose-950',
          description: report.summary,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`rounded-xl border p-4 transition-colors ${config.bg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-stone-900 text-sm tracking-tight">{config.title}</span>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <span className={`font-semibold ${config.statusColor}`}>{config.statusText}</span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{config.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 shadow-2xs transition-colors self-start sm:self-center shrink-0 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
          <span>যাচাই বিবরণী ({formatDisplayNumber(report.checks.length, digitLocale)})</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-stone-400" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3.5 pt-3 border-t border-stone-200/80 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200/80 text-stone-500 font-semibold">
                <th className="py-2 px-2.5">যাচাইয়ের ক্ষেত্র</th>
                <th className="py-2 px-2.5 text-right font-mono-num tabular-nums">প্রত্যাশিত মান</th>
                <th className="py-2 px-2.5 text-right font-mono-num tabular-nums">প্রকৃত মান</th>
                <th className="py-2 px-2.5 text-right font-mono-num tabular-nums">পার্থক্য</th>
                <th className="py-2 px-2.5 text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/70 font-mono-num tabular-nums">
              {report.checks.map((chk) => {
                const diffFraction = `${chk.difference.n}/${chk.difference.d}`;
                const expFraction = `${chk.expected.n}/${chk.expected.d}`;
                const actFraction = `${chk.actual.n}/${chk.actual.d}`;

                return (
                  <tr key={chk.id} className="hover:bg-white/50 transition-colors">
                    <td className="py-2 px-2.5 font-sans font-medium text-stone-900">
                      <div>{chk.description}</div>
                      {chk.note && <div className="text-[11px] text-stone-500 font-normal">{chk.note}</div>}
                    </td>
                    <td className="py-2 px-2.5 text-right font-medium text-stone-700">
                      {formatDisplayNumber(expFraction, digitLocale)}
                    </td>
                    <td className="py-2 px-2.5 text-right font-semibold text-stone-900">
                      {formatDisplayNumber(actFraction, digitLocale)}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      {chk.difference.n === 0n ? (
                        <span className="text-emerald-700 font-sans font-bold">০</span>
                      ) : (
                        <span className="text-stone-700">{formatDisplayNumber(diffFraction, digitLocale)}</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-center font-sans">
                      <span
                        className={`font-semibold text-[11px] ${
                          chk.state === 'VALID'
                            ? 'text-emerald-700'
                            : chk.state === 'WARNING'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {chk.state === 'VALID' ? 'মিলেছে' : chk.state === 'WARNING' ? 'সতর্কতা' : 'অমিল'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};