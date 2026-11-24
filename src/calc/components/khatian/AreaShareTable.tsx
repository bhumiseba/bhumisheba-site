// src/components/khatian/AreaShareTable.tsx
// অপশন ২: জমির পরিমাণ থেকে আনা-গণ্ডা ও আধুনিক হিস্যা — ইনপুট ও ফলের টেবিল
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toBengaliDigits } from '@shared';
import { AreaOwnerInput, AreaSharesResult } from './areaShares';

interface Props {
  readonly totalLand: string;
  readonly onTotalLandChange: (v: string) => void;
  readonly owners: readonly AreaOwnerInput[];
  readonly onOwnersChange: (next: AreaOwnerInput[]) => void;
  readonly result: AreaSharesResult;
}

export const AreaShareTable: React.FC<Props> = ({
  totalLand,
  onTotalLandChange,
  owners,
  onOwnersChange,
  result,
}) => {
  const updateOwner = (idx: number, patch: Partial<AreaOwnerInput>) => {
    onOwnersChange(owners.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  };

  const addOwner = () => {
    onOwnersChange([
      ...owners,
      { id: `area_owner_${owners.length + 1}_${Date.now()}`, name: '', land: '' },
    ]);
  };

  const removeOwner = (idx: number) => {
    if (owners.length <= 1) return;
    onOwnersChange(owners.filter((_, i) => i !== idx));
  };

  const isError =
    result.reason === 'MISMATCH' ||
    result.reason === 'INVALID_ROWS' ||
    result.reason === 'BAD_TOTAL';

  const messageClass = result.ok
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
    : isError
    ? 'border-red-300 bg-red-50 text-red-800'
    : 'border-stone-200 bg-stone-50 text-stone-600';

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4">
      <div>
        <h3 className="text-base font-black text-stone-900">জমির পরিমাণ থেকে হিস্যা</h3>
        <p className="text-xs text-stone-500 mt-0.5">
          মোট জমি ও প্রত্যেকের প্রাপ্য জমি (শতাংশ) লিখলে আনা-গণ্ডা এবং আধুনিক হিস্যা বসবে
        </p>
      </div>

      <label className="block max-w-xs">
        <span className="block text-xs font-bold text-stone-700 mb-1">
          খতিয়ানের মোট জমি (শতাংশ)
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={totalLand}
          onChange={(e) => onTotalLandChange(e.target.value)}
          placeholder="যেমন ৫০০"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
            result.reason === 'BAD_TOTAL' ? 'border-red-400' : 'border-stone-300'
          }`}
        />
      </label>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-700 text-xs">
              <th rowSpan={2} className="px-2 py-2 text-left">#</th>
              <th rowSpan={2} className="px-2 py-2 text-left">মালিকের নাম</th>
              <th rowSpan={2} className="px-2 py-2 text-left">প্রাপ্য জমি (শতাংশ)</th>
              <th colSpan={3} className="px-2 py-1.5 text-center bg-stone-200/80 border-l border-stone-300">
                অংশ
              </th>
              <th rowSpan={2} className="px-2 py-2" />
            </tr>
            <tr className="bg-amber-100/40 text-stone-700 text-xs">
              <th className="px-2 py-1.5 text-left border-l border-stone-300">১=১৬ আনা</th>
              <th className="px-2 py-1.5 text-left">১.০০০</th>
              <th className="px-2 py-1.5 text-left">১০০০.০০০০</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o, i) => {
              const r = result.rows[i];
              const bad = r?.status === 'INVALID';
              // যোগফল না মিললেও পূর্ণ সারির হিসাব দেখানো হয়
              const hasValues = !!r && r.status === 'OK' && r.share1000 !== '—';
              return (
                <tr key={o.id} className="border-b border-stone-100 align-top">
                  <td className="px-2 py-2 text-stone-500">{toBengaliDigits(i + 1)}</td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={o.name}
                      onChange={(e) => updateOwner(i, { name: e.target.value })}
                      placeholder={`মালিক ${toBengaliDigits(i + 1)}`}
                      className="w-full min-w-[8rem] rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={o.land}
                      onChange={(e) => updateOwner(i, { land: e.target.value })}
                      placeholder="০"
                      className={`w-full min-w-[6rem] rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                        bad ? 'border-red-400' : 'border-stone-300'
                      }`}
                    />
                  </td>
                  <td className="px-2 py-2 text-stone-800">
                    {hasValues ? r.traditional : '—'}
                  </td>
                  <td className="px-2 py-2 text-stone-800 whitespace-nowrap">
                    {hasValues ? r.share1 : '—'}
                  </td>
                  <td className="px-2 py-2 font-semibold text-stone-900 whitespace-nowrap">
                    {hasValues ? r.share1000 : '—'}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeOwner(i)}
                      disabled={owners.length <= 1}
                      title="এই মালিক বাদ দিন"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {result.ok && (
            <tfoot>
              <tr className="bg-stone-50 font-bold text-stone-900">
                <td className="px-2 py-2" />
                <td className="px-2 py-2">সর্বমোট</td>
                <td className="px-2 py-2">{result.totalLandText}</td>
                <td className="px-2 py-2">{result.totalTraditional}</td>
                <td className="px-2 py-2 whitespace-nowrap">১.০০০</td>
                <td className="px-2 py-2 whitespace-nowrap">{result.total1000}</td>
                <td className="px-2 py-2" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <button
        type="button"
        onClick={addOwner}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>মালিক যোগ</span>
      </button>

      <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${messageClass}`}>
        {result.message}
      </div>

      {result.ok && result.anyRounded && (
        <p className="text-[11px] text-stone-500">
          নোট: কিছু হিস্যা ঠিক ভাগ হয় না। আনা-গণ্ডা তিল পর্যন্ত, ১.০০০ ভিত্তিক মান ৩ ঘর এবং ১০০০ ভিত্তিক
          মান দশমিকের ৪ ঘর পর্যন্ত গোল করা হয়েছে। গোল করার পরও সবার যোগফল ঠিক ১৬ আনা, ১.০০০ ও
          ১০০০ থাকে।
        </p>
      )}
    </div>
  );
};

export default AreaShareTable;