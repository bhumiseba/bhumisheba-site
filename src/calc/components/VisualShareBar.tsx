import React, { useState } from 'react';
import { Rational, formatDecimal, ZERO } from '@calculation-core';
import { toBengaliDigits } from '@shared';
import { PieChart } from 'lucide-react';

export interface VisualShareItem {
  readonly id: string;
  readonly name: string;
  readonly share: Rational;
  readonly land?: Rational;
  readonly color?: string;
}

interface Props {
  readonly items: readonly VisualShareItem[];
  readonly totalTitle?: string;
  readonly landUnitName?: string;
  readonly digitLocale?: 'bn' | 'en';
  readonly displayPrecision?: number;
  readonly showPlotGrid?: boolean;
}

const PALETTE = [
  '#047857', // forest emerald
  '#0369a1', // ocean blue
  '#b45309', // warm amber
  '#6d28d9', // royal purple
  '#be123c', // deep rose
  '#0f766e', // teal
  '#c2410c', // brick orange
  '#4338ca', // indigo
  '#15803d', // deep green
  '#a16207', // ochre gold
  '#be185d', // magenta
  '#1d4ed8', // classic blue
];

// ভগ্নাংশকে শতাংশের লেখায় বদলায় (বাংলা অঙ্কে)। ছাঁটা নয়, সঠিকভাবে গোল করা হয়,
// যাতে ১৬.৬৬৬৭ → ১৬.৬৭ হয় এবং সব শতকরার যোগফল ১০০ থাকে।
const percentText = (share: Rational, decimals: number): string => {
  if (share.d === 0n) {
    return toBengaliDigits((0).toFixed(decimals));
  }
  const scale = 10n ** BigInt(decimals);
  const scaled = (share.n * 100n * scale * 2n + share.d) / (share.d * 2n);
  const whole = scaled / scale;
  const frac = (scaled % scale).toString().padStart(decimals, '0');
  return toBengaliDigits(decimals > 0 ? `${whole}.${frac}` : `${whole}`);
};

export const VisualShareBar: React.FC<Props> = ({
  items,
  totalTitle = 'মোট হিস্যা বণ্টন',
  landUnitName = 'শতাংশ',
  displayPrecision = 4,
  showPlotGrid = true,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [visualMode, setVisualMode] = useState<'RIBBON' | 'PARCEL'>('RIBBON');

  // Calculate sum of shares (exact fraction)
  let sumShares = ZERO;
  for (const item of items) {
    if (item.share && item.share.n > 0n) {
      sumShares = {
        n: sumShares.n * item.share.d + item.share.n * sumShares.d,
        d: sumShares.d * item.share.d,
      };
      const g = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : g(b, a % b));
      const divG = g(sumShares.n, sumShares.d);
      if (divG > 1n) {
        sumShares = { n: sumShares.n / divG, d: sumShares.d / divG };
      }
    }
  }

  // সঠিক ভগ্নাংশে তুলনা: যোগফল ১-এর বেশি / কম / সমান
  const isOverAllocated = sumShares.n > sumShares.d;
  const isUnderAllocated = sumShares.n < sumShares.d;

  // শুধু পর্দায় দেখানোর জন্য দশমিক
  const sumPercentNum = Number((sumShares.n * 10000n) / (sumShares.d || 1n)) / 100;
  const unallocatedPercent = Math.max(0, 100 - sumPercentNum);

  return (
    <div className="rounded-xl border border-stone-200/90 bg-white p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm tracking-tight">{totalTitle}</h4>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>অনুপাতিক অংশ ও জমির চিত্ররূপ</span>
              <span className="text-stone-300" aria-hidden="true">·</span>
              {isOverAllocated ? (
                <span className="font-semibold text-rose-700">১০০% এর বেশি ({toBengaliDigits(sumPercentNum.toFixed(1))}%)</span>
              ) : isUnderAllocated ? (
                <span className="font-semibold text-amber-700">অবশিষ্ট: {toBengaliDigits(unallocatedPercent.toFixed(2))}%</span>
              ) : (
                <span className="font-semibold text-emerald-700">ভাগের যোগফল ১০০%</span>
              )}
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs self-start sm:self-center font-medium">
          <button
            type="button"
            onClick={() => setVisualMode('RIBBON')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              visualMode === 'RIBBON' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ফিতা চিত্র
          </button>
          <button
            type="button"
            onClick={() => setVisualMode('PARCEL')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              visualMode === 'PARCEL' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            প্লট নকশা
          </button>
        </div>
      </div>

      {/* Ribbon Visualization */}
      {visualMode === 'RIBBON' ? (
        <div className="space-y-3">
          <div className="h-6 sm:h-7 w-full rounded-lg overflow-hidden flex bg-stone-100 border border-stone-200/90 shadow-inner">
            {items.map((item, idx) => {
              if (!item.share || item.share.n <= 0n) return null;
              // pct শুধু ফিতার প্রস্থের জন্য; লেখা আসে percentText থেকে
              const pct = Number((item.share.n * 10000n) / item.share.d) / 100;
              const color = item.color || PALETTE[idx % PALETTE.length];
              const isHovered = activeItem === item.id;

              return (
                <div
                  key={item.id}
                  style={{ width: `${Math.min(100, Math.max(1, pct))}%`, backgroundColor: color }}
                  onMouseEnter={() => setActiveItem(item.id)}
                  onMouseLeave={() => setActiveItem(null)}
                  className={`h-full relative group transition-opacity cursor-pointer ${
                    activeItem && !isHovered ? 'opacity-40' : 'opacity-100'
                  }`}
                  title={`${item.name}: ${percentText(item.share, 2)}%`}
                >
                  {pct > 9 && (
                    <div className="absolute inset-0 flex items-center justify-center px-1 text-[11px] font-bold text-white tracking-wider truncate drop-shadow-xs font-mono-num tabular-nums">
                      {percentText(item.share, 1)}%
                    </div>
                  )}
                </div>
              );
            })}

            {isUnderAllocated && unallocatedPercent > 0.05 && (
              <div
                style={{ width: `${Math.min(100, unallocatedPercent)}%` }}
                className="h-full bg-stone-200/80 flex items-center justify-center text-[10px] text-stone-600 font-medium px-1 truncate"
                title={`অবশিষ্ট অবণ্টিত অংশ: ${toBengaliDigits(unallocatedPercent.toFixed(2))}%`}
              >
                {unallocatedPercent > 12 && 'অবশিষ্ট অংশ'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2D Land Parcel Map Representation */
        <div className="space-y-3">
          <div className="p-3 bg-stone-50/70 border border-stone-200/80 rounded-lg">
            <div className="text-[11px] font-semibold text-stone-600 mb-2">
              অনুপাতিক নকশা চিত্র
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {items.map((item, idx) => {
                const color = item.color || PALETTE[idx % PALETTE.length];
                const isHovered = activeItem === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveItem(item.id)}
                    onMouseLeave={() => setActiveItem(null)}
                    style={{ borderColor: color }}
                    className={`p-2.5 rounded-lg border-l-4 bg-white border-stone-200 shadow-2xs transition-all cursor-pointer ${
                      isHovered ? 'ring-1 ring-emerald-600 shadow-xs' : ''
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900 truncate">{item.name}</div>
                    <div className="flex items-center justify-between text-xs mt-1 font-mono-num tabular-nums">
                      <span className="font-semibold text-emerald-800">
                        {percentText(item.share, 2)}%
                      </span>
                      {item.land && (
                        <span className="text-stone-500 text-[11px]">
                          {toBengaliDigits(formatDecimal(item.land, displayPrecision))} {landUnitName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend & Breakdown Grid */}
      <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {items.map((item, idx) => {
          const color = item.color || PALETTE[idx % PALETTE.length];
          const isHovered = activeItem === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
                activeItem && !isHovered ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: color }} />
              <span className="font-medium text-stone-800">{item.name}</span>
              <span className="text-stone-400">·</span>
              <span className="font-mono-num tabular-nums text-stone-600 font-medium">
                {percentText(item.share, 2)}%
              </span>
              {item.land && (
                <span className="text-stone-400 font-mono-num tabular-nums text-[11px]">
                  ({toBengaliDigits(formatDecimal(item.land, 2))} {landUnitName})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};