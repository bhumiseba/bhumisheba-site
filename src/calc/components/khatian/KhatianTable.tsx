// src/components/khatian/KhatianTable.tsx
import React, { useMemo } from 'react';
import { Rational, ZERO, gt, parseRational } from '@calculation-core';
import { toBengaliDigits, normalizeUserInput } from '@shared';
import {
  getFullShareDisplay,
  get1000Based,
  getReconciled1000BasedList,
  getReconciledLandList,
  ANA_DROPDOWN_OPTIONS,
  GONDA_DROPDOWN_OPTIONS,
  KORA_DROPDOWN_OPTIONS,
  KRANTI_DROPDOWN_OPTIONS,
  TIL_DROPDOWN_OPTIONS,
} from './TraditionalSymbols';
import {
  summarizeTotalShare,
  formatDistributedLand,
  getReconciled1BasedList,
} from './shareTotals';
import { Plus, Trash2, CheckCircle2, AlertTriangle, Info, MapPin } from 'lucide-react';

export interface KhatianOwner {
  readonly id: string;
  name: string;
  parentage?: string;
  ana: number;
  gonda: number;
  kora: number;
  kranti: number;
  til: number;
}

export interface KhatianTableProps {
  owners: readonly KhatianOwner[];
  onOwnersChange: (owners: KhatianOwner[]) => void;
  totalLand?: string;
  onTotalLandChange?: (val: string) => void;
  landUnit?: string;
  onLandUnitChange?: (unit: string) => void;
  displayPrecision?: number;
}

export const KhatianTable: React.FC<KhatianTableProps> = ({
  owners,
  onOwnersChange,
  totalLand = '',
  onTotalLandChange,
  landUnit = 'শতাংশ',
  onLandUnitChange,
  displayPrecision = 4,
}) => {
  const addOwner = () => {
    const newOwner: KhatianOwner = {
      id: `owner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: '',
      ana: 0,
      gonda: 0,
      kora: 0,
      kranti: 0,
      til: 0,
    };
    onOwnersChange([...owners, newOwner]);
  };

  const removeOwner = (id: string) => {
    if (owners.length <= 1) return;
    onOwnersChange(owners.filter((o) => o.id !== id));
  };

  const updateOwner = <K extends keyof KhatianOwner>(
    id: string,
    field: K,
    value: KhatianOwner[K]
  ) => {
    onOwnersChange(
      owners.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  // মোট জমি: সঠিক ভগ্নাংশে (ঠিক না হলে বা শূন্য হলে null)
  const totalLandRational = useMemo<Rational | null>(() => {
    if (!totalLand.trim()) return null;
    try {
      const val = parseRational(normalizeUserInput(totalLand));
      return gt(val, ZERO) ? val : null;
    } catch {
      return null;
    }
  }, [totalLand]);

  // কিছু লেখা আছে কিন্তু সংখ্যা হিসেবে ঠিক নয়
  const landInputInvalid = totalLand.trim() !== '' && totalLandRational === null;

  // মোট হিস্যার সারাংশ (সঠিক ভগ্নাংশে)
  const summary = useMemo(
    () => summarizeTotalShare(owners, displayPrecision),
    [owners, displayPrecision]
  );

  // ১০০০ ভিত্তিক হিস্যা (মোট ১৬ আনা হলে বৃহত্তম-অবশিষ্ট পদ্ধতিতে মেলানো)
  const reconciledShares1000 = useMemo(() => {
    return getReconciled1000BasedList(owners, displayPrecision);
  }, [owners, displayPrecision]);

  // ১.০০০ ভিত্তিক হিস্যা (৩ ঘর; মোট ১৬ আনা হলে যোগফল ঠিক ১.০০০)
  const reconciledShares1 = useMemo(() => {
    return getReconciled1BasedList(owners);
  }, [owners]);

  const reconciledLandAmounts = useMemo(() => {
    return getReconciledLandList(owners, totalLandRational, displayPrecision);
  }, [owners, totalLandRational, displayPrecision]);

  const totalDistributedLand = useMemo(
    () => formatDistributedLand(totalLandRational, summary.totalTil, displayPrecision),
    [totalLandRational, summary.totalTil, displayPrecision]
  );

  const selectClass =
    'w-full px-1.5 py-1 text-xs font-semibold rounded border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 text-left cursor-pointer truncate';

  return (
    <div className="space-y-3">
      {/* Header control bar: Title, Total Land Input & Add Owner Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 shadow-2xs">
        <div>
          <h3 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>খতিয়ান মালিক ও হিস্যা বণ্টন তালিকা</span>
          </h3>
          <p className="text-[11px] text-stone-500">
            মালিকগণের আনা-গণ্ডা-কড়া হিস্যা অনুযায়ী মোট জমির বণ্টন সরাসরি পাশের কলামে দেখুন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* খতিয়ানে মোট জমির পরিমাণ ইনপুট */}
          <div
            className={`flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border shadow-2xs ${
              landInputInvalid ? 'border-rose-400' : 'border-stone-300'
            }`}
            title="যে জমি মালিকদের মধ্যে ভাগ করতে চান, তার মোট পরিমাণ লিখুন"
          >
            <label htmlFor="total-land-input" className="text-xs font-bold text-stone-700 whitespace-nowrap">
              খতিয়ানে মোট জমি <span className="text-[10px] text-emerald-800 font-semibold">(নিজ দখলীয়)</span>:
            </label>
            <input
              id="total-land-input"
              type="text"
              value={totalLand}
              onChange={(e) => onTotalLandChange?.(e.target.value)}
              placeholder="৫.৫৪"
              aria-invalid={landInputInvalid}
              className="w-24 px-2 py-0.5 text-xs font-bold text-right text-emerald-950 bg-stone-50 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono-num tabular-nums"
              title="জমির পরিমাণ লিখুন (যেমন: ৫.৫৪)"
            />
            <select
              value={landUnit}
              onChange={(e) => onLandUnitChange?.(e.target.value)}
              className="text-xs font-bold text-emerald-800 bg-transparent focus:outline-none cursor-pointer border-l border-stone-200 pl-1.5"
              title="জমির একক নির্বাচন করুন"
            >
              <option value="শতাংশ">শতাংশ</option>
              <option value="একর">একর</option>
              <option value="কাঠা">কাঠা</option>
              <option value="বিঘা">বিঘা</option>
              <option value="বর্গফুট">বর্গফুট</option>
            </select>
          </div>

          <button
            type="button"
            onClick={addOwner}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>মালিক যোগ</span>
          </button>
        </div>
      </div>

      {landInputInvalid && (
        <p className="text-[11px] font-semibold text-rose-600 px-1">
          জমির পরিমাণ সঠিক সংখ্যা হতে হবে (০-এর বেশি), যেমন ৫.৫৪ বা ১২০।
        </p>
      )}

      {/* Main Table */}
      <div className="rounded-xl border border-stone-300 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Row 1: 'অংশ' colSpan 3 এবং ডানে 'প্রাপ্ত জমি' */}
              <tr className="bg-stone-100 text-stone-800 border-b border-stone-300 text-center font-bold">
                <th rowSpan={2} className="py-2 px-2 border-r border-stone-300 w-14 text-center">
                  ক্রমিক নং
                </th>
                <th rowSpan={2} className="py-2 px-3 border-r border-stone-300 text-left min-w-[170px]">
                  খতিয়ান মালিক/দখলদার
                </th>
                <th rowSpan={2} className="py-2 px-3 border-r border-stone-300 min-w-[400px] text-left">
                  আনা, গণ্ডা, কড়া, ক্রান্তি, তিল নির্বাচন করুন
                </th>
                <th colSpan={3} className="py-1.5 px-3 border-b border-r border-stone-300 bg-stone-200/80 text-center">
                  অংশ
                </th>
                <th rowSpan={2} className="py-2 px-3 border-r border-stone-300 min-w-[130px] bg-emerald-50/70 text-right pr-3 text-emerald-950">
                  প্রাপ্ত জমি ({landUnit})
                </th>
                <th rowSpan={2} className="py-2 px-2 w-12 text-center">
                  মুছুন
                </th>
              </tr>
              {/* Row 2: আনা-গণ্ডা, ১.০০০ ভিত্তিক, ১০০০ ভিত্তিক */}
              <tr className="bg-amber-100/40 text-stone-800 border-b border-stone-300 text-center font-bold">
                <th className="py-1.5 px-2 border-r border-stone-300 w-44 text-center">
                  ১=১৬ আনা
                </th>
                <th className="py-1.5 px-2 border-r border-stone-300 w-24 text-right font-mono-num tabular-nums pr-3">
                  ১.০০০
                </th>
                <th className="py-1.5 px-2 border-r border-stone-300 w-32 text-right font-mono-num tabular-nums pr-3">
                  ১০০০.০০০০
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-300">
              {owners.map((owner, index) => {
                const combinedShare = getFullShareDisplay(
                  owner.ana,
                  owner.gonda,
                  owner.kora,
                  owner.kranti,
                  owner.til
                );
                const share1000 =
                  reconciledShares1000[index] ??
                  get1000Based(
                    owner.ana,
                    owner.gonda,
                    owner.kora,
                    owner.kranti,
                    owner.til,
                    displayPrecision
                  );
                const share1 = reconciledShares1[index] ?? '—';

                const ownerLandAmountFormatted = reconciledLandAmounts[index] ?? null;

                return (
                  <tr
                    key={owner.id}
                    className="hover:bg-amber-50/40 transition-colors"
                  >
                    {/* ক্রমিক নং */}
                    <td className="py-2 px-2 text-center border-r border-stone-300 font-bold text-stone-600 font-mono-num tabular-nums">
                      {toBengaliDigits(index + 1)}
                    </td>

                    {/* খতিয়ান মালিক/দখলদার এবং পিতা/স্বামী/ঠিকানা (পিং, জং, সাং) সাব-টাইটেল */}
                    <td className="py-2 px-2 border-r border-stone-300">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={owner.name}
                          onChange={(e) => updateOwner(owner.id, 'name', e.target.value)}
                          placeholder="মালিকের নাম লিখুন"
                          className="w-full px-2.5 py-1 text-xs font-bold rounded border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 text-left font-bengali"
                        />
                        <input
                          type="text"
                          value={owner.parentage || ''}
                          onChange={(e) => updateOwner(owner.id, 'parentage', e.target.value)}
                          placeholder="পিং / জং (পিতা বা স্বামী)"
                          className="w-full px-2 py-0.5 text-[10px] text-stone-600 rounded border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bengali placeholder:text-stone-400"
                          title="পিতা (পিং) বা স্বামী (জং)"
                        />
                      </div>
                    </td>

                    {/* ৫টি ড্রপডাউন: আনা, গণ্ডা, কড়া, ক্রান্তি, তিল */}
                    <td className="py-2 px-2 border-r border-stone-300">
                      <div className="grid grid-cols-5 gap-1.5">
                        {/* আনা (0-15) */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-left">
                            আনা
                          </label>
                          <select
                            value={owner.ana}
                            onChange={(e) =>
                              updateOwner(owner.id, 'ana', Number(e.target.value))
                            }
                            className={selectClass}
                            title="আনা নির্বাচন করুন"
                          >
                            {ANA_DROPDOWN_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* গণ্ডা (0-19) */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-left">
                            গণ্ডা
                          </label>
                          <select
                            value={owner.gonda}
                            onChange={(e) =>
                              updateOwner(owner.id, 'gonda', Number(e.target.value))
                            }
                            className={selectClass}
                            title="গণ্ডা নির্বাচন করুন"
                          >
                            {GONDA_DROPDOWN_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* কড়া (0-3) */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-left">
                            কড়া
                          </label>
                          <select
                            value={owner.kora}
                            onChange={(e) =>
                              updateOwner(owner.id, 'kora', Number(e.target.value))
                            }
                            className={selectClass}
                            title="কড়া নির্বাচন করুন"
                          >
                            {KORA_DROPDOWN_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* ক্রান্তি (0-2) */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-left">
                            ক্রান্তি
                          </label>
                          <select
                            value={owner.kranti}
                            onChange={(e) =>
                              updateOwner(owner.id, 'kranti', Number(e.target.value))
                            }
                            className={selectClass}
                            title="ক্রান্তি নির্বাচন করুন"
                          >
                            {KRANTI_DROPDOWN_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* তিল (0-19) */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-left">
                            তিল
                          </label>
                          <select
                            value={owner.til}
                            onChange={(e) =>
                              updateOwner(owner.id, 'til', Number(e.target.value))
                            }
                            className={selectClass}
                            title="তিল নির্বাচন করুন"
                          >
                            {TIL_DROPDOWN_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* অংশ (১=১৬ আনা) */}
                    <td className="py-2 px-2.5 border-r border-stone-300 text-left font-semibold text-stone-800 leading-tight">
                      {combinedShare}
                    </td>

                    {/* অংশ (১.০০০ ভিত্তিক) */}
                    <td className="py-2 px-3 border-r border-stone-300 text-right font-bold text-emerald-800 text-sm">
                      {share1}
                    </td>

                    {/* অংশ (১০০০.০০০০ ভিত্তিক) */}
                    <td className="py-2 px-3 border-r border-stone-300 text-right font-bold text-emerald-800 text-sm">
                      {share1000}
                    </td>

                    {/* প্রাপ্ত জমি */}
                    <td className="py-2 px-3 border-r border-stone-300 text-right font-bold text-stone-900 bg-emerald-50/20">
                      {ownerLandAmountFormatted !== null ? (
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-emerald-950 font-bold text-xs">
                            {ownerLandAmountFormatted}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {landUnit}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 font-normal" title="মোট জমি লিখুন">—</span>
                      )}
                    </td>

                    {/* মুছুন */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeOwner(owner.id)}
                        disabled={owners.length <= 1}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          owners.length <= 1
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="মালিক মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-400">
                <td colSpan={3} className="py-2.5 px-3 text-left border-r border-stone-300">
                  সর্বমোট হিস্যা ও বণ্টনকৃত জমি
                </td>
                <td className="py-2.5 px-2.5 text-left border-r border-stone-300 font-semibold text-xs">
                  {summary.traditional}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-950 text-sm border-r border-stone-300">
                  {summary.total1}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-950 text-sm border-r border-stone-300">
                  {summary.total1000}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-950 text-sm border-r border-stone-300 bg-emerald-100/40">
                  {totalDistributedLand !== null ? (
                    <div className="flex items-baseline justify-end gap-1">
                      <span>{totalDistributedLand}</span>
                      <span className="text-[10px] text-emerald-800 font-semibold">{landUnit}</span>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Message */}
      <div className="pt-1">
        {summary.status === 'OVER' ? (
          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{summary.message}</span>
          </div>
        ) : summary.status === 'UNDER' ? (
          <div className="p-3 rounded-lg border border-sky-300 bg-sky-50 text-sky-900 text-xs flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{summary.message}</span>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{summary.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KhatianTable;