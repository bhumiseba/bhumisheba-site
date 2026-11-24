// src/components/khatian/areaShares.ts
// জমির পরিমাণ থেকে হিস্যা: মোট জমি ও প্রত্যেক মালিকের প্রাপ্য জমি দিলে
// আনা-গণ্ডা, ১.০০০ ভিত্তিক ও ১০০০ ভিত্তিক হিস্যা বের করে। সব হিসাব সঠিক ভগ্নাংশে (BigInt)।
import {
  Rational,
  createRational,
  formatDecimal,
  parseRational,
  allocateLargestRemainder,
} from '@calculation-core';
import { toBengaliDigits, normalizeUserInput } from '@shared';
import { getFullShareDisplay, getDescriptiveShare } from './TraditionalSymbols';

// ১৬ আনা = ৭৬,৮০০ তিল
const FULL_TIL = 76800n;

export interface AreaOwnerInput {
  readonly id: string;
  readonly name: string;
  /** ব্যবহারকারীর লেখা জমির পরিমাণ (শতাংশ), যেমন "১০০" বা "33.5" */
  readonly land: string;
}

export type AreaRowStatus = 'OK' | 'EMPTY' | 'INVALID';

export interface AreaOwnerResult {
  readonly id: string;
  readonly status: AreaRowStatus;
  /** ব্যবহারকারীর লেখা জমি, বাংলা অঙ্কে */
  readonly landText: string;
  /** সংক্ষিপ্ত সঠিক ভগ্নাংশ, যেমন "১/৫" */
  readonly fraction: string;
  /** আনা-গণ্ডা, যেমন "৶৪ (৩ আনা ৪ গণ্ডা)" */
  readonly traditional: string;
  /** ১.০০০ ভিত্তিক (৩ ঘর), যেমন "০.২০০" */
  readonly share1: string;
  /** ১০০০ ভিত্তিক, যেমন "২০০.০০০০" */
  readonly share1000: string;
  /** কোনো মান গোল করতে হয়নি কি না */
  readonly exact: boolean;
  /** ভিজ্যুয়াল বারের জন্য সঠিক ভগ্নাংশ (শূন্য হলে null) */
  readonly share: Rational | null;
}

export type AreaResultReason =
  | 'OK'
  | 'NO_TOTAL'
  | 'BAD_TOTAL'
  | 'INVALID_ROWS'
  | 'NO_OWNER'
  | 'MISMATCH';

export interface AreaSharesResult {
  readonly ok: boolean;
  readonly reason: AreaResultReason;
  readonly message: string;
  readonly rows: readonly AreaOwnerResult[];
  readonly totalLandText: string;
  readonly totalTraditional: string;
  readonly total1000: string;
  /** কোনো মান গোল করতে হলে true */
  readonly anyRounded: boolean;
}

// ---------------------------------------------------------------------------
// ছোট ভগ্নাংশ-সহায়ক (নিজস্ব, BigInt)
// ---------------------------------------------------------------------------
interface Q {
  readonly n: bigint;
  readonly d: bigint;
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function norm(q: Q): Q {
  if (q.d === 0n) return q;
  let n = q.n;
  let d = q.d;
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return g === 0n ? { n, d } : { n: n / g, d: d / g };
}

function add(a: Q, b: Q): Q {
  return norm({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}

/** a − b এর চিহ্ন: -1, 0, 1 */
function cmp(a: Q, b: Q): number {
  const x = a.n * b.d - b.n * a.d;
  return x < 0n ? -1 : x > 0n ? 1 : 0;
}

function clampPrecision(p: number): number {
  if (!Number.isFinite(p)) return 4;
  return Math.min(20, Math.max(0, Math.trunc(p)));
}

function fmt(q: Q, precision: number): string {
  return toBengaliDigits(formatDecimal(createRational(q.n, q.d), precision));
}

/** নিকটতম পূর্ণসংখ্যায় ভাগ (half-up); num, den দুটোই ধনাত্মক */
function roundDiv(num: bigint, den: bigint): bigint {
  return (2n * num + den) / (2n * den);
}

function fractionText(q: Q): string {
  return q.d === 1n
    ? toBengaliDigits(q.n.toString())
    : `${toBengaliDigits(q.n.toString())}/${toBengaliDigits(q.d.toString())}`;
}

type Parsed =
  | { readonly status: 'EMPTY' }
  | { readonly status: 'INVALID' }
  | { readonly status: 'OK'; readonly q: Q };

function parseLand(text: string): Parsed {
  const t = (text ?? '').trim();
  if (t === '') return { status: 'EMPTY' };
  try {
    const r = parseRational(normalizeUserInput(t));
    const q = norm({ n: r.n, d: r.d });
    if (q.d === 0n || q.n < 0n) return { status: 'INVALID' };
    return { status: 'OK', q };
  } catch {
    return { status: 'INVALID' };
  }
}

/** মোট তিল থেকে আনা-গণ্ডা-কড়া-ক্রান্তি-তিলের লেখা */
function tilToDisplay(til: bigint): string {
  if (til === FULL_TIL) return '১ (১৬ আনা পূর্ণ)';
  let rem = til;
  const ana = rem / 4800n;
  rem %= 4800n;
  const gonda = rem / 240n;
  rem %= 240n;
  const kora = rem / 60n;
  rem %= 60n;
  const kranti = rem / 20n;
  const tilLeft = rem % 20n;
  // আনা ১৫-এর বেশি হলে চিহ্ন নেই, শুধু কথায়
  if (ana > 15n) {
    return getDescriptiveShare(
      Number(ana),
      Number(gonda),
      Number(kora),
      Number(kranti),
      Number(tilLeft)
    );
  }
  return getFullShareDisplay(
    Number(ana),
    Number(gonda),
    Number(kora),
    Number(kranti),
    Number(tilLeft)
  );
}

function blankRow(o: AreaOwnerInput, status: AreaRowStatus): AreaOwnerResult {
  return {
    id: o.id,
    status,
    landText: toBengaliDigits((o.land ?? '').trim()),
    fraction: '—',
    traditional: '—',
    share1: '—',
    share1000: '—',
    exact: true,
    share: null,
  };
}

/** জমি ফাঁকা বা ০ এমন মালিকের সারি */
function zeroRow(o: AreaOwnerInput, status: AreaRowStatus, p: number): AreaOwnerResult {
  const scale = 10n ** BigInt(p);
  return {
    id: o.id,
    status,
    landText: toBengaliDigits((o.land ?? '').trim()),
    fraction: '০',
    traditional: '০ (০ অংশ)',
    share1: toBengaliDigits(formatDecimal(createRational(0n, 1000n), 3)),
    share1000: toBengaliDigits(formatDecimal(createRational(0n, scale), p)),
    exact: true,
    share: null,
  };
}

/**
 * একজন মালিকের আলাদা হিসাব (যোগফল না মিললেও চলে)।
 * প্রতিটি মান নিজে নিজে নিকটতম মানে গোল; সবার যোগফল মেলানোর সমন্বয় এখানে নেই।
 */
function singleRow(o: AreaOwnerInput, q: Q, total: Q, p: number): AreaOwnerResult {
  const shareQ = norm({ n: q.n * total.d, d: q.d * total.n });
  const til = roundDiv(q.n * FULL_TIL * total.d, q.d * total.n);
  return {
    id: o.id,
    status: 'OK',
    landText: toBengaliDigits((o.land ?? '').trim()),
    fraction: fractionText(shareQ),
    traditional: tilToDisplay(til),
    share1: fmt(shareQ, 3),
    share1000: fmt({ n: shareQ.n * 1000n, d: shareQ.d }, p),
    exact: true,
    share: createRational(shareQ.n, shareQ.d),
  };
}

// ---------------------------------------------------------------------------
// মূল হিসাব
// ---------------------------------------------------------------------------
export function computeAreaShares(
  totalText: string,
  owners: readonly AreaOwnerInput[],
  precision: number = 4
): AreaSharesResult {
  const p = clampPrecision(precision);

  const blank = (reason: AreaResultReason, message: string): AreaSharesResult => ({
    ok: false,
    reason,
    message,
    rows: owners.map((o) => blankRow(o, 'EMPTY')),
    totalLandText: toBengaliDigits((totalText ?? '').trim()),
    totalTraditional: '—',
    total1000: '—',
    anyRounded: false,
  });

  const totalParsed = parseLand(totalText);
  if (totalParsed.status === 'EMPTY') {
    return blank('NO_TOTAL', 'আগে খতিয়ানের মোট জমি লিখুন');
  }
  if (totalParsed.status !== 'OK' || totalParsed.q.n <= 0n) {
    return blank('BAD_TOTAL', 'মোট জমির সংখ্যা ঠিক নয়। শূন্যের বেশি একটি সংখ্যা লিখুন');
  }
  const total = totalParsed.q;

  const parsed = owners.map((o) => parseLand(o.land));

  const badRows: number[] = [];
  parsed.forEach((r, i) => {
    if (r.status === 'INVALID') badRows.push(i + 1);
  });
  if (badRows.length > 0) {
    const res = blank(
      'INVALID_ROWS',
      `প্রাপ্য জমির সংখ্যা ঠিক নয়: সারি ${badRows.map((x) => toBengaliDigits(x)).join(', ')}`
    );
    return {
      ...res,
      rows: owners.map((o, i) => blankRow(o, parsed[i].status === 'INVALID' ? 'INVALID' : 'EMPTY')),
    };
  }

  let sum: Q = { n: 0n, d: 1n };
  for (const r of parsed) {
    if (r.status === 'OK') sum = add(sum, r.q);
  }

  if (sum.n === 0n) {
    return blank('NO_OWNER', 'অন্তত একজন মালিকের প্রাপ্য জমি লিখুন');
  }

  const c = cmp(sum, total);
  if (c !== 0) {
    const diff = norm({
      n: sum.n * total.d - total.n * sum.d,
      d: sum.d * total.d,
    });
    const absDiff: Q = { n: diff.n < 0n ? -diff.n : diff.n, d: diff.d };
    const label = c < 0 ? 'ঘাটতি' : 'অতিরিক্ত';
    const res = blank(
      'MISMATCH',
      `${label}: মালিকদের জমির যোগফল ${fmt(sum, p)} শতাংশ, মোট জমি ${fmt(total, p)} শতাংশ (পার্থক্য ${fmt(absDiff, p)} শতাংশ)। প্রিন্ট ও কপির জন্য যোগফল মেলান`
    );
    // যোগফল না মিললেও প্রতিটি সারির হিসাব আলাদাভাবে দেখানো হয়
    return {
      ...res,
      rows: owners.map((o, i) => {
        const r = parsed[i];
        if (r.status === 'OK') {
          return r.q.n > 0n ? singleRow(o, r.q, total, p) : zeroRow(o, 'OK', p);
        }
        return blankRow(o, 'EMPTY');
      }),
    };
  }

  // ---- যোগফল মিলেছে: হিস্যা বের করা ----
  const posIdx: number[] = [];
  parsed.forEach((r, i) => {
    if (r.status === 'OK' && r.q.n > 0n) posIdx.push(i);
  });

  const weights: Rational[] = posIdx.map((i) => {
    const q = (parsed[i] as { status: 'OK'; q: Q }).q;
    return createRational(q.n * total.d, q.d * total.n);
  });

  const scale = 10n ** BigInt(p);
  // আনা-গণ্ডা: মোট ঠিক ৭৬,৮০০ তিল
  const tilUnits = allocateLargestRemainder(FULL_TIL, weights);
  // ১.০০০ ভিত্তিক: মোট ঠিক ১.০০০ (১০০০ একক, ৩ দশমিক ঘর)
  const units1 = allocateLargestRemainder(1000n, weights);
  // ১০০০ ভিত্তিক: মোট ঠিক ১০০০.০০০০ (p ঘর)
  const units1000 = allocateLargestRemainder(1000n * scale, weights);

  let anyRounded = false;

  const rows: AreaOwnerResult[] = owners.map((o, i) => {
    const k = posIdx.indexOf(i);
    const landText = toBengaliDigits((o.land ?? '').trim());
    if (k === -1) {
      return zeroRow(o, parsed[i].status === 'OK' ? 'OK' : 'EMPTY', p);
    }

    const q = (parsed[i] as { status: 'OK'; q: Q }).q;
    const shareQ = norm({ n: q.n * total.d, d: q.d * total.n });

    const den = q.d * total.n;
    const exactTil = (q.n * FULL_TIL * total.d) % den === 0n;
    const exact1 = (q.n * 1000n * total.d) % den === 0n;
    const exact1000 = (q.n * 1000n * scale * total.d) % den === 0n;
    const exact = exactTil && exact1 && exact1000;
    if (!exact) anyRounded = true;

    return {
      id: o.id,
      status: 'OK',
      landText,
      fraction: fractionText(shareQ),
      traditional: tilToDisplay(tilUnits[k]),
      share1: toBengaliDigits(formatDecimal(createRational(units1[k], 1000n), 3)),
      share1000: toBengaliDigits(formatDecimal(createRational(units1000[k], scale), p)),
      exact,
      share: createRational(shareQ.n, shareQ.d),
    };
  });

  return {
    ok: true,
    reason: 'OK',
    message: 'জমির যোগফল মোটের সঙ্গে মিলেছে',
    rows,
    totalLandText: toBengaliDigits((totalText ?? '').trim()),
    totalTraditional: '১ (১৬ আনা পূর্ণ)',
    total1000: toBengaliDigits(formatDecimal(createRational(1000n * scale, scale), p)),
    anyRounded,
  };
}