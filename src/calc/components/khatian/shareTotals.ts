
import { Rational, createRational, mul, formatDecimal } from '@calculation-core';
import { toBengaliDigits } from '@shared';
import { getFullShareDisplay, getDescriptiveShare } from './TraditionalSymbols';

const FULL_TIL = 76800n;
const ONE_BASED_SCALE = 1000n;

export interface ShareInput {
  readonly ana: number;
  readonly gonda: number;
  readonly kora: number;
  readonly kranti: number;
  readonly til: number;
}

export type TotalShareStatus = 'UNDER' | 'EXACT' | 'OVER';

export interface TotalShareSummary {
  readonly totalTil: bigint;
  readonly status: TotalShareStatus;
  readonly traditional: string;
  readonly total1: string;
  readonly total1000: string;
  readonly message: string;
}

function clampPrecision(p: number): number {
  if (!Number.isFinite(p)) return 4;
  return Math.min(20, Math.max(0, Math.trunc(p)));
}

/**
 * মালিকদের অংশকে তিলে রূপান্তর করে মোট যোগফল নির্ণয়।
 *
 * ১ আনা = ৪৮০০ তিল
 * ১ গণ্ডা = ২৪০ তিল
 * ১ কড়া = ৬০ তিল
 * ১ ক্রান্তি = ২০ তিল
 * ১৬ আনা = ৭৬৮০০ তিল
 */
export function sumTil(owners: readonly ShareInput[]): bigint {
  let total = 0n;

  for (const owner of owners) {
    total +=
      BigInt(Math.trunc(owner.ana)) * 4800n +
      BigInt(Math.trunc(owner.gonda)) * 240n +
      BigInt(Math.trunc(owner.kora)) * 60n +
      BigInt(Math.trunc(owner.kranti)) * 20n +
      BigInt(Math.trunc(owner.til));
  }

  return total;
}

/** তিলকে প্রচলিত আনা-গণ্ডা-কড়া-ক্রান্তি-তিল প্রদর্শনে রূপান্তর। */
function showTil(til: bigint): string {
  if (til === FULL_TIL) return '১ (১৬ আনা পূর্ণ)';

  let remainder = til;

  const ana = remainder / 4800n;
  remainder %= 4800n;

  const gonda = remainder / 240n;
  remainder %= 240n;

  const kora = remainder / 60n;
  remainder %= 60n;

  const kranti = remainder / 20n;
  const tilLeft = remainder % 20n;

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

/** নির্দিষ্ট precision-এ ১০০০ ভিত্তিক অংশ প্রদর্শন। */
function to1000(til: bigint, precision: number): string {
  return toBengaliDigits(
    formatDecimal(
      createRational(til * ONE_BASED_SCALE, FULL_TIL),
      precision
    )
  );
}

/**
 * ১০০০ ভিত্তিক এককের ক্ষুদ্রতম অংশকে ৩ দশমিক ঘরে প্রদর্শন।
 * উদাহরণ: 123n => ০.১২৩
 */
function formatThousandths(value: bigint): string {
  const whole = value / ONE_BASED_SCALE;
  const fraction = (value % ONE_BASED_SCALE)
    .toString()
    .padStart(3, '0');

  return toBengaliDigits(`${whole.toString()}.${fraction}`);
}

/**
 * তিলকে ১ ভিত্তিক ৩ দশমিক ঘরে রূপান্তর।
 * সাধারণ ক্ষেত্রে নিকটতম মানে round করা হয়।
 */
function to1Based(til: bigint): string {
  const scaled = (til * ONE_BASED_SCALE + FULL_TIL / 2n) / FULL_TIL;
  return formatThousandths(scaled);
}

/**
 * মালিকদের ১ ভিত্তিক অংশের তালিকা তৈরি।
 *
 * মোট অংশ ঠিক ১৬ আনা হলে Largest Remainder পদ্ধতিতে
 * ৩ দশমিক ঘরে সমন্বয় করা হয়, যাতে সব মালিকের অংশের
 * যোগফল ঠিক ১.০০০ হয়।
 *
 * মোট অংশ ১৬ আনা না হলে প্রতিটি মালিকের অংশ আলাদাভাবে
 * নিকটতম ৩ দশমিক ঘরে round করা হয়।
 */
export function getReconciled1BasedList(
  owners: readonly ShareInput[]
): string[] {
  if (owners.length === 0) return [];

  const ownerTil = owners.map((owner) =>
    sumTil([owner])
  );

  const totalTil = ownerTil.reduce(
    (total, value) => total + value,
    0n
  );

  // মোট ১৬ আনা না হলে স্বাভাবিক rounding।
  if (totalTil !== FULL_TIL) {
    return ownerTil.map(to1Based);
  }

  // প্রতিটি মালিকের জন্য ১০০০ ভিত্তিক পূর্ণসংখ্যা অংশ।
  const allocations = ownerTil.map((til, index) => {
    const numerator = til * ONE_BASED_SCALE;

    return {
      index,
      units: numerator / FULL_TIL,
      remainder: numerator % FULL_TIL,
    };
  });

  const allocatedTotal = allocations.reduce(
    (total, item) => total + item.units,
    0n
  );

  // অবশিষ্ট ০.০০১ এককগুলো বৃহত্তম remainder-কে দেওয়া হবে।
  const remainingUnits = ONE_BASED_SCALE - allocatedTotal;

  const ranked = [...allocations].sort((a, b) => {
    if (a.remainder > b.remainder) return -1;
    if (a.remainder < b.remainder) return 1;

    // সমান remainder হলে মূল তালিকার ক্রম বজায় থাকবে।
    return a.index - b.index;
  });

  for (let i = 0; i < Number(remainingUnits); i++) {
    ranked[i].units += 1n;
  }

  // মূল মালিক তালিকার ক্রমেই ফলাফল ফেরত।
  const result = new Array<string>(owners.length);

  for (const item of allocations) {
    result[item.index] = formatThousandths(item.units);
  }

  return result;
}

/** সর্বমোট অংশের সারসংক্ষেপ। */
export function summarizeTotalShare(
  owners: readonly ShareInput[],
  precision: number = 4
): TotalShareSummary {
  const p = clampPrecision(precision);
  const totalTil = sumTil(owners);

  const total1 = to1Based(totalTil);
  const total1000 = to1000(totalTil, p);

  if (totalTil === FULL_TIL) {
    return {
      totalTil,
      status: 'EXACT',
      traditional: '১ (১৬ আনা পূর্ণ)',
      total1: '১.০০০',
      total1000,
      message: `সর্বমোট: ${total1000} — সম্পূর্ণ খতিয়ান (১৬ আনা পূর্ণ)`,
    };
  }

  if (totalTil < FULL_TIL) {
    const left = FULL_TIL - totalTil;

    return {
      totalTil,
      status: 'UNDER',
      traditional: showTil(totalTil),
      total1,
      total1000,
      message: `অবশিষ্ট অবণ্টিত: ${showTil(left)} — ${to1000(left, p)}`,
    };
  }

  const extra = totalTil - FULL_TIL;

  return {
    totalTil,
    status: 'OVER',
    traditional: showTil(totalTil),
    total1,
    total1000,
    message: `অতিরিক্ত: ${showTil(extra)} — ${to1000(extra, p)}`,
  };
}

/** মোট জমির পরিমাণ অনুযায়ী মালিকের প্রাপ্য জমি নির্ণয়। */
export function formatDistributedLand(
  land: Rational | null,
  totalTil: bigint,
  precision: number = 4
): string | null {
  if (land === null) return null;

  const share = createRational(totalTil, FULL_TIL);

  return toBengaliDigits(
    formatDecimal(
      mul(land, share),
      clampPrecision(precision)
    )
  );
}
