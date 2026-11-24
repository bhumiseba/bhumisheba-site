import { Rational, createRational, mul, div } from '@calculation-core';

export interface LandUnitMetadata {
  readonly id: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly toDecimalRatio: Rational; // Multiplier to canonical 'শতাংশ' (Decimal)
  readonly descriptionBn: string;
  readonly sourceRef: string;
  readonly verified: boolean;
}

export const CANONICAL_LAND_UNIT = 'decimal';

// ভিত্তি: ১ শতাংশ = ৪৩৫.৬ বর্গফুট = ২১৭৮/৫ বর্গফুট।
// প্রতিটি একক আগে বর্গফুটে ধরা হয়েছে, তারপর সঠিক ভগ্নাংশে শতাংশে রূপান্তর হয়েছে।
const SQFT_PER_DECIMAL: Rational = createRational(2178n, 5n);

/** n/d বর্গফুট সমান কত শতাংশ (সঠিক ভগ্নাংশে) */
function fromSqft(n: bigint, d: bigint = 1n): Rational {
  return div(createRational(n, d), SQFT_PER_DECIMAL);
}

const PENDING_SOURCE =
  'প্রচলিত মান (সাধারণ ও শিক্ষামূলক সূত্র); আইন বা সরকারি পরিমাপ-তালিকা থেকে মেলানো বাকি';

export const LAND_UNIT_DEFINITIONS: Record<string, LandUnitMetadata> = {
  decimal: {
    id: 'decimal',
    nameBn: 'শতাংশ (Decimal)',
    nameEn: 'Decimal',
    toDecimalRatio: createRational(1n, 1n),
    descriptionBn: '১ শতাংশ = ৪৩৫.৬ বর্গফুট',
    sourceRef: PENDING_SOURCE,
    verified: false,
  },
  acre: {
    id: 'acre',
    nameBn: 'একর (Acre)',
    nameEn: 'Acre',
    toDecimalRatio: createRational(100n, 1n),
    descriptionBn: '১ একর = ১০০ শতাংশ = ৪৩,৫৬০ বর্গফুট = ৬০.৫ কাঠা',
    sourceRef: PENDING_SOURCE,
    verified: false,
  },
  bigha: {
    id: 'bigha',
    nameBn: 'বিঘা (Bigha)',
    nameEn: 'Bigha',
    toDecimalRatio: fromSqft(14400n),
    descriptionBn: '১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট (প্রায় ৩৩.০৬ শতাংশ)',
    sourceRef: PENDING_SOURCE,
    verified: false,
  },
  katha: {
    id: 'katha',
    nameBn: 'কাঠা (Katha)',
    nameEn: 'Katha',
    toDecimalRatio: fromSqft(720n),
    descriptionBn: '১ কাঠা = ১৬ ছটাক = ৭২০ বর্গফুট (প্রায় ১.৬৫ শতাংশ)',
    sourceRef: PENDING_SOURCE,
    verified: false,
  },
  chhatak: {
    id: 'chhatak',
    nameBn: 'ছটাক (Chhatak)',
    nameEn: 'Chhatak',
    toDecimalRatio: fromSqft(45n),
    descriptionBn: '১ ছটাক = ৪৫ বর্গফুট (১ কাঠা = ১৬ ছটাক)',
    sourceRef: PENDING_SOURCE,
    verified: false,
  },
  sqft: {
    id: 'sqft',
    nameBn: 'বর্গফুট (Sq. Ft.)',
    nameEn: 'Square Feet',
    toDecimalRatio: fromSqft(1n),
    descriptionBn: '৪৩৫.৬ বর্গফুট = ১ শতাংশ',
    sourceRef: PENDING_SOURCE,
    verified: false,
  },
  sqyd: {
    id: 'sqyd',
    nameBn: 'বর্গগজ (Sq. Yard)',
    nameEn: 'Square Yard',
    toDecimalRatio: fromSqft(9n),
    descriptionBn: '১ বর্গগজ = ৯ বর্গফুট (১ কাঠা = ৮০ বর্গগজ)',
    sourceRef: PENDING_SOURCE,
    verified: false,
  },
  sqm: {
    id: 'sqm',
    nameBn: 'বর্গমিটার (Sq. Meter)',
    nameEn: 'Square Meter',
    // ১ ফুট = ০.৩০৪৮ মিটার (সঠিক), তাই ১ বর্গফুট = ০.০৯২৯০৩০৪ বর্গমিটার
    // ১ বর্গমিটার = ১০০০০০০০০ / ৯২৯০৩০৪ বর্গফুট
    toDecimalRatio: fromSqft(100000000n, 9290304n),
    descriptionBn: '১ বর্গমিটার ≈ ১০.৭৬৩৯ বর্গফুট (১ ফুট = ০.৩০৪৮ মিটার)',
    sourceRef: 'আন্তর্জাতিক ফুট-মিটার সংজ্ঞা (১ ফুট = ০.৩০৪৮ মিটার)',
    verified: false,
  },
  hectare: {
    id: 'hectare',
    nameBn: 'হেক্টর (Hectare)',
    nameEn: 'Hectare',
    toDecimalRatio: fromSqft(1000000000000n, 9290304n),
    descriptionBn: '১ হেক্টর = ১০,০০০ বর্গমিটার ≈ ২.৪৭১ একর',
    sourceRef: 'আন্তর্জাতিক ফুট-মিটার সংজ্ঞা (১ ফুট = ০.৩০৪৮ মিটার)',
    verified: false,
  },
};

/**
 * Converts any land amount from a specified unit to canonical 'শতাংশ' (Decimal)
 */
export function toCanonicalDecimal(amount: Rational, unitId: string): Rational {
  const unit = LAND_UNIT_DEFINITIONS[unitId] || LAND_UNIT_DEFINITIONS.decimal;
  return mul(amount, unit.toDecimalRatio);
}

/**
 * Converts from canonical 'শতাংশ' (Decimal) to a destination unit
 */
export function fromCanonicalDecimal(amountInDecimal: Rational, targetUnitId: string): Rational {
  const target = LAND_UNIT_DEFINITIONS[targetUnitId] || LAND_UNIT_DEFINITIONS.decimal;
  return div(amountInDecimal, target.toDecimalRatio);
}