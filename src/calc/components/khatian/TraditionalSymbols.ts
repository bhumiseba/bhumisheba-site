// src/components/khatian/TraditionalSymbols.ts
import {
  Rational,
  createRational,
  ZERO,
  mul,
  gt,
  formatDecimal,
  parseRational,
  allocateLargestRemainder,
} from '@calculation-core';
import { toBengaliDigits, normalizeUserInput } from '@shared';

/**
 * Traditional Ana symbols (1 to 15)
 * Bengali Unicode Numerator marks & Fraction Slash
 */
const ANA_SYMBOLS: Record<number, string> = {
  1: '⁄',   // U+2044
  2: '৵',   // U+09F5
  3: '৶',   // U+09F6
  4: '৷',   // U+09F7
  5: '৷⁄',
  6: '৷৵',
  7: '৷৶',
  8: '৷৷',
  9: '৷৷⁄',
  10: '৷৷৵',
  11: '৷৷৶',
  12: '৸',  // U+09F8
  13: '৸⁄',
  14: '৸৵',
  15: '৸৶',
};

/**
 * Kora symbols (1 to 3) — ড্রপডাউনের সঙ্গে মিল রাখা হয়েছে
 */
const KORA_SYMBOLS: Record<number, string> = {
  1: '৷',
  2: '৷৷',
  3: '৸',
};

/**
 * Kranti symbols (1 to 2)
 */
const KRANTI_SYMBOLS: Record<number, string> = {
  1: '৴',  // U+09F4
  2: '৴৴',
};

export interface TraditionalDropdownOption {
  readonly value: number;
  readonly label: string;
}

/**
 * আনা ড্রপডাউন অপশন — ট্রেডিশনাল চিহ্ন ও সংখ্যা সহ
 */
export const ANA_DROPDOWN_OPTIONS: readonly TraditionalDropdownOption[] = [
  { value: 0, label: '০' },
  { value: 1, label: '⁄ (১ আনা)' },
  { value: 2, label: '৵ (২ আনা)' },
  { value: 3, label: '৶ (৩ আনা)' },
  { value: 4, label: '৷ (৪ আনা)' },
  { value: 5, label: '৷⁄ (৫ আনা)' },
  { value: 6, label: '৷৵ (৬ আনা)' },
  { value: 7, label: '৷৶ (৭ আনা)' },
  { value: 8, label: '৷৷ (৮ আনা)' },
  { value: 9, label: '৷৷⁄ (৯ আনা)' },
  { value: 10, label: '৷৷৵ (১০ আনা)' },
  { value: 11, label: '৷৷৶ (১১ আনা)' },
  { value: 12, label: '৸ (১২ আনা)' },
  { value: 13, label: '৸⁄ (১৩ আনা)' },
  { value: 14, label: '৸৵ (১৪ আনা)' },
  { value: 15, label: '৸৶ (১৫ আনা)' },
];

/**
 * গণ্ডা ড্রপডাউন অপশন — গণ্ডা সংখ্যা ও বিবরণ সহ
 */
export const GONDA_DROPDOWN_OPTIONS: readonly TraditionalDropdownOption[] = Array.from(
  { length: 20 },
  (_, i) => ({
    value: i,
    label: i === 0 ? '০' : `${toBengaliDigits(i)} (${toBengaliDigits(i)} গণ্ডা)`,
  })
);

/**
 * কড়া ড্রপডাউন অপশন — ট্রেডিশনাল কড়া চিহ্ন (৷, ৷৷, ৸) সহ
 */
export const KORA_DROPDOWN_OPTIONS: readonly TraditionalDropdownOption[] = [
  { value: 0, label: '০' },
  { value: 1, label: '৷ (১ কড়া)' },
  { value: 2, label: '৷৷ (২ কড়া)' },
  { value: 3, label: '৸ (৩ কড়া)' },
];

/**
 * ক্রান্তি ড্রপডাউন অপশন — ট্রেডিশনাল ক্রান্তি চিহ্ন (৴, ৴৴) সহ
 */
export const KRANTI_DROPDOWN_OPTIONS: readonly TraditionalDropdownOption[] = [
  { value: 0, label: '০' },
  { value: 1, label: '৴ (১ ক্রান্তি)' },
  { value: 2, label: '৴৴ (২ ক্রান্তি)' },
];

/**
 * তিল ড্রপডাউন অপশন — তিল সংখ্যা ও একক সহ
 */
export const TIL_DROPDOWN_OPTIONS: readonly TraditionalDropdownOption[] = Array.from(
  { length: 20 },
  (_, i) => ({
    value: i,
    label: i === 0 ? '০' : `${toBengaliDigits(i)} (${toBengaliDigits(i)} তিল)`,
  })
);

// ---------------------------------------------------------------------------
// সঠিক ভগ্নাংশের হিসাব: ১৬ আনা = ৭৬,৮০০ তিল
// ১ আনা = ২০ গণ্ডা = ৪৮০০ তিল; ১ গণ্ডা = ২৪০ তিল; ১ কড়া = ৬০ তিল; ১ ক্রান্তি = ২০ তিল
// ---------------------------------------------------------------------------

const FULL_TIL = 76800n;

interface OwnerShareInput {
  readonly ana: number;
  readonly gonda: number;
  readonly kora: number;
  readonly kranti: number;
  readonly til: number;
}

function toTil(o: OwnerShareInput): bigint {
  return (
    BigInt(Math.trunc(o.ana)) * 4800n +
    BigInt(Math.trunc(o.gonda)) * 240n +
    BigInt(Math.trunc(o.kora)) * 60n +
    BigInt(Math.trunc(o.kranti)) * 20n +
    BigInt(Math.trunc(o.til))
  );
}

function clampPrecision(p: number): number {
  if (!Number.isFinite(p)) return 4;
  return Math.min(20, Math.max(0, Math.trunc(p)));
}

/** জমির পরিমাণ Rational বা (পুরনো কোডের জন্য) number আসতে পারে */
function toLandRational(value: Rational | number | null): Rational | null {
  if (value === null) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    try {
      return parseRational(normalizeUserInput(String(value)));
    } catch {
      return null;
    }
  }
  return value;
}

/**
 * Returns the Bengali symbol for a given Ana value (0-15)
 */
export function getAnaSymbol(ana: number): string {
  if (ana <= 0 || ana > 15) return '';
  return ANA_SYMBOLS[ana] || '';
}

/**
 * Returns a full symbolic string for a compound share with NO SPACES between components.
 * Example: getSymbolicShare(14, 5, 2, 1, 10) → "৸৵৫৷৷৴১০"
 */
export function getSymbolicShare(
  ana: number,
  gonda: number,
  kora: number,
  kranti: number,
  til: number
): string {
  let res = '';

  if (ana > 0 && ana <= 15) {
    res += ANA_SYMBOLS[ana] || '';
  }

  if (gonda > 0) {
    res += toBengaliDigits(gonda);
  }

  if (kora > 0) {
    res += KORA_SYMBOLS[kora] || toBengaliDigits(kora);
  }

  if (kranti > 0) {
    res += KRANTI_SYMBOLS[kranti] || '';
  }

  if (til > 0) {
    res += toBengaliDigits(til);
  }

  return res || '০';
}

/**
 * Returns a Bengali descriptive string listing each non-zero unit.
 * Example: getDescriptiveShare(14, 5, 2, 1, 10) → "১৪ আনা ৫ গণ্ডা ২ কড়া ১ ক্রান্তি ১০ তিল"
 */
export function getDescriptiveShare(
  ana: number,
  gonda: number,
  kora: number,
  kranti: number,
  til: number
): string {
  const parts: string[] = [];

  if (ana > 0) {
    parts.push(`${toBengaliDigits(ana)} আনা`);
  }
  if (gonda > 0) {
    parts.push(`${toBengaliDigits(gonda)} গণ্ডা`);
  }
  if (kora > 0) {
    parts.push(`${toBengaliDigits(kora)} কড়া`);
  }
  if (kranti > 0) {
    parts.push(`${toBengaliDigits(kranti)} ক্রান্তি`);
  }
  if (til > 0) {
    parts.push(`${toBengaliDigits(til)} তিল`);
  }

  if (parts.length === 0) {
    return '০ অংশ';
  }

  return parts.join(' ');
}

/**
 * Returns the combined share string in format:
 * [ana symbol][gonda digits][kora symbol][kranti symbol][til digits] ([descriptive Bengali])
 * If all units are 0, returns "০ (০ অংশ)"
 */
export function getFullShareDisplay(
  ana: number,
  gonda: number,
  kora: number,
  kranti: number,
  til: number
): string {
  if (ana === 0 && gonda === 0 && kora === 0 && kranti === 0 && til === 0) {
    return '০ (০ অংশ)';
  }
  const symbolic = getSymbolicShare(ana, gonda, kora, kranti, til);
  const descriptive = getDescriptiveShare(ana, gonda, kora, kranti, til);
  return `${symbolic} (${descriptive})`;
}

/**
 * ১০০০-ভিত্তিক মান (সংখ্যা হিসেবে, শুধু তুলনা/প্রদর্শনের সুবিধার জন্য)।
 * সঠিক মান = মোট তিল × ১০০০ ÷ ৭৬,৮০০। প্রদর্শনের জন্য get1000Based ব্যবহার করুন।
 */
export function get1000BasedRaw(
  ana: number,
  gonda: number,
  kora: number,
  kranti: number,
  til: number
): number {
  const totalTil = toTil({ ana, gonda, kora, kranti, til });
  return Number(totalTil * 1000n) / Number(FULL_TIL);
}

/**
 * ১০০০-ভিত্তিক দশমিক স্ট্রিং (বাংলা অঙ্ক), সঠিক ভগ্নাংশ থেকে।
 * Example: get1000Based(14, 0, 0, 0, 0) → "৮৭৫.০০০০"
 */
export function get1000Based(
  ana: number,
  gonda: number,
  kora: number,
  kranti: number,
  til: number,
  precision: number = 4
): string {
  const totalTil = toTil({ ana, gonda, kora, kranti, til });
  const share = createRational(totalTil * 1000n, FULL_TIL);
  return toBengaliDigits(formatDecimal(share, clampPrecision(precision)));
}

/**
 * মালিকদের ১০০০-ভিত্তিক হিস্যা। মোট ঠিক ১৬ আনা হলে বৃহত্তম-অবশিষ্ট পদ্ধতিতে (সঠিক BigInt)
 * মিলিয়ে দেওয়া হয়, যাতে যোগফল ঠিক ১০০০.০০০০ হয়।
 * ৩ সমান মালিক: ৩৩৩.৩৩৩৪, ৩৩৩.৩৩৩৩, ৩৩৩.৩৩৩৩
 */
export function getReconciled1000BasedList(
  owners: readonly OwnerShareInput[],
  precision: number = 4
): string[] {
  if (owners.length === 0) return [];

  const p = clampPrecision(precision);
  const tils = owners.map(toTil);
  const totalTil = tils.reduce((a, b) => a + b, 0n);

  // পুরো ১৬ আনা না হলে প্রতিটি আলাদাভাবে
  if (totalTil !== FULL_TIL) {
    return tils.map((t) =>
      toBengaliDigits(formatDecimal(createRational(t * 1000n, FULL_TIL), p))
    );
  }

  const scale = 10n ** BigInt(p);
  const units = allocateLargestRemainder(
    1000n * scale,
    tils.map((t) => createRational(t, FULL_TIL))
  );

  return units.map((u) => toBengaliDigits(formatDecimal(createRational(u, scale), p)));
}

/**
 * মালিকদের প্রাপ্য জমি। মোট ঠিক ১৬ আনা হলে বৃহত্তম-অবশিষ্ট পদ্ধতিতে (সঠিক BigInt)
 * মিলিয়ে দেওয়া হয়, যাতে যোগফল ঠিক মোট জমির সমান হয়।
 */
export function getReconciledLandList(
  owners: readonly OwnerShareInput[],
  totalLand: Rational | number | null,
  precision: number = 4
): (string | null)[] {
  const land = toLandRational(totalLand);
  if (land === null || !gt(land, ZERO) || owners.length === 0) {
    return owners.map(() => null);
  }

  const p = clampPrecision(precision);
  const tils = owners.map(toTil);
  const totalTil = tils.reduce((a, b) => a + b, 0n);

  if (totalTil === 0n) {
    return owners.map(() => toBengaliDigits(formatDecimal(ZERO, p)));
  }

  if (totalTil === FULL_TIL) {
    const scale = 10n ** BigInt(p);
    // মোট জমি × ১০^p, নিকটতম পূর্ণসংখ্যায় (half-up)
    const scaled = mul(land, createRational(scale, 1n));
    const target = (2n * scaled.n + scaled.d) / (2n * scaled.d);

    const units = allocateLargestRemainder(
      target,
      tils.map((t) => createRational(t, FULL_TIL))
    );
    return units.map((u) => toBengaliDigits(formatDecimal(createRational(u, scale), p)));
  }

  // মোট ১৬ আনা না হলে প্রতিটি আলাদা অনুপাতে
  return tils.map((t) =>
    toBengaliDigits(formatDecimal(mul(land, createRational(t, FULL_TIL)), p))
  );
}