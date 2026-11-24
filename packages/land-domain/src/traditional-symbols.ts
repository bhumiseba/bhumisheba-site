import { Rational, createRational } from '@calculation-core';
import { compoundToRational } from './traditional-units';

export interface TraditionalSymbolShortcut {
  readonly symbol: string;
  readonly nameBn: string;
  readonly ana: number;
  readonly gonda: number;
  readonly kora: number;
  readonly kranti: number;
  readonly til: number;
  readonly description: string;
}

/**
 * Corrected Ana symbols — verified against:
 *   - teachers.gov.bd/blog/details/729097
 *   - landregistrationbd.com (Sub-Registrar Md. Shahjahan Ali)
 *   - KhatianDoc paper (North South University, 2026)
 *
 * Positional rule: Ana comes BEFORE gonda.
 * Uses Bengali Currency Numerator marks U+09F4–U+09F8 plus
 * FRACTION SLASH (U+2044) for the "one ana" glyph.
 */
export const TRADITIONAL_ANA_SYMBOLS: readonly TraditionalSymbolShortcut[] = [
  { symbol: '⁄',   nameBn: '১ আনা',   ana: 1,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '১ আনা = ০.০৬২৫ অংশ' },
  { symbol: '৵',   nameBn: '২ আনা',   ana: 2,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '২ আনা = ০.১২৫০ অংশ' },
  { symbol: '৶',   nameBn: '৩ আনা',   ana: 3,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '৩ আনা = ০.১৮৭৫ অংশ' },
  { symbol: '৷',   nameBn: '৪ আনা',   ana: 4,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '৪ আনা = ০.২৫০০ অংশ (১/৪)' },
  { symbol: '৷⁄',  nameBn: '৫ আনা',   ana: 5,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '৫ আনা = ০.৩১২৫ অংশ' },
  { symbol: '৷৵',  nameBn: '৬ আনা',   ana: 6,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '৬ আনা = ০.৩৭৫০ অংশ' },
  { symbol: '৷৶',  nameBn: '৭ আনা',   ana: 7,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '৭ আনা = ০.৪৩৭৫ অংশ' },
  { symbol: '৷৷',  nameBn: '৮ আনা',   ana: 8,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '৮ আনা = ০.৫০০০ অংশ (১/২)' },
  { symbol: '৷৷⁄', nameBn: '৯ আনা',   ana: 9,  gonda: 0, kora: 0, kranti: 0, til: 0, description: '৯ আনা = ০.৫৬২৫ অংশ' },
  { symbol: '৷৷৵', nameBn: '১০ আনা',  ana: 10, gonda: 0, kora: 0, kranti: 0, til: 0, description: '১০ আনা = ০.৬২৫০ অংশ' },
  { symbol: '৷৷৶', nameBn: '১১ আনা',  ana: 11, gonda: 0, kora: 0, kranti: 0, til: 0, description: '১১ আনা = ০.৬৮৭৫ অংশ' },
  { symbol: '৸',   nameBn: '১২ আনা',  ana: 12, gonda: 0, kora: 0, kranti: 0, til: 0, description: '১২ আনা = ০.৭৫০০ অংশ (৩/৪)' },
  { symbol: '৸⁄',  nameBn: '১৩ আনা',  ana: 13, gonda: 0, kora: 0, kranti: 0, til: 0, description: '১৩ আনা = ০.৮১২৫ অংশ' },
  { symbol: '৸৵',  nameBn: '১৪ আনা',  ana: 14, gonda: 0, kora: 0, kranti: 0, til: 0, description: '১৪ আনা = ০.৮৭৫০ অংশ' },
  { symbol: '৸৶',  nameBn: '১৫ আনা',  ana: 15, gonda: 0, kora: 0, kranti: 0, til: 0, description: '১৫ আনা = ০.৯৩৭৫ অংশ' },
  { symbol: '১',   nameBn: '১৬ আনা (পূর্ণ খতিয়ান)', ana: 16, gonda: 0, kora: 0, kranti: 0, til: 0, description: '১৬ আনা = ১.০০০০ অংশ' },
];

export interface DropdownOption {
  readonly value: number;
  readonly label: string;
  readonly symbol?: string;
  readonly shortHint?: string;
}

export const ANA_OPTIONS: readonly DropdownOption[] = [
  { value: 0,  label: '০ — কোনো আনা নেই',              symbol: '০',     shortHint: '০ অংশ' },
  { value: 1,  label: '⁄ — ১ আনা',                     symbol: '⁄',     shortHint: '১/১৬' },
  { value: 2,  label: '৵ — ২ আনা',                     symbol: '৵',     shortHint: '১/৮' },
  { value: 3,  label: '৶ — ৩ আনা',                     symbol: '৶',     shortHint: '৩/১৬' },
  { value: 4,  label: '৷ — ৪ আনা (চৌকা)',              symbol: '৷',     shortHint: '১/৪' },
  { value: 5,  label: '৷⁄ — ৫ আনা',                    symbol: '৷⁄',    shortHint: '৫/১৬' },
  { value: 6,  label: '৷৵ — ৬ আনা',                    symbol: '৷৵',    shortHint: '৩/৮' },
  { value: 7,  label: '৷৶ — ৭ আনা',                    symbol: '৷৶',    shortHint: '৭/১৬' },
  { value: 8,  label: '৷৷ — ৮ আনা (আধা)',              symbol: '৷৷',    shortHint: '১/২' },
  { value: 9,  label: '৷৷⁄ — ৯ আনা',                   symbol: '৷৷⁄',   shortHint: '৯/১৬' },
  { value: 10, label: '৷৷৵ — ১০ আনা',                  symbol: '৷৷৵',   shortHint: '৫/৮' },
  { value: 11, label: '৷৷৶ — ১১ আনা',                  symbol: '৷৷৶',   shortHint: '১১/১৬' },
  { value: 12, label: '৸ — ১২ আনা (তিন পোয়া)',         symbol: '৸',     shortHint: '৩/৪' },
  { value: 13, label: '৸⁄ — ১৩ আনা',                   symbol: '৸⁄',    shortHint: '১৩/১৬' },
  { value: 14, label: '৸৵ — ১৪ আনা',                   symbol: '৸৵',    shortHint: '৭/৮' },
  { value: 15, label: '৸৶ — ১৫ আনা',                   symbol: '৸৶',    shortHint: '১৫/১৬' },
  { value: 16, label: '১ — ১৬ আনা (পূর্ণ খতিয়ান)',      symbol: '১',     shortHint: '১.০০০' },
];

const BN_NUMS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯','১০','১১','১২','১৩','১৪','১৫','১৬','১৭','১৮','১৯','২০'];

/**
 * GONDA_OPTIONS — ০ হতে ১৯ গণ্ডা (কোনো special symbol নেই, শুধু বাংলা সংখ্যা)
 * Position rule: Gonda comes AFTER ana and BEFORE kora.
 */
export const GONDA_OPTIONS: readonly DropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
  value: i,
  label: i === 0 ? '০ — কোনো গণ্ডা নেই' : `${BN_NUMS[i]} — ${BN_NUMS[i]} গণ্ডা`,
  symbol: BN_NUMS[i],
  shortHint: i === 0 ? '০' : `${BN_NUMS[i]} গণ্ডা`,
}));

/**
 * KORA_OPTIONS — ০ হতে ৩ কড়া
 * Position rule: Kora comes AFTER gonda and BEFORE kranti.
 */
export const KORA_OPTIONS: readonly DropdownOption[] = [
  { value: 0, label: '০ — কোনো কড়া নেই',         symbol: '০',    shortHint: '০' },
  { value: 1, label: '৷ — ১ কড়া (একটি খাড়া দাগ)', symbol: '৷',    shortHint: '১ কড়া' },
  { value: 2, label: '৷৷ — ২ কড়া (দুইটি খাড়া দাগ)', symbol: '৷৷', shortHint: '২ কড়া' },
  { value: 3, label: '৸ — ৩ কড়া (তিন কড়ার চিহ্ন)', symbol: '৸',  shortHint: '৩ কড়া' },
];

/**
 * KRANTI_OPTIONS — ০ হতে ২ ক্রান্তি
 * Position rule: Kranti comes AFTER kora and BEFORE til.
 */
export const KRANTI_OPTIONS: readonly DropdownOption[] = [
  { value: 0, label: '০ — কোনো ক্রান্তি নেই',           symbol: '০',     shortHint: '০' },
  { value: 1, label: '৴ — ১ ক্রান্তি (একটি বাঁকা রেখা)', symbol: '৴',    shortHint: '১ ক্রান্তি' },
  { value: 2, label: '৴৴ — ২ ক্রান্তি (দুইটি বাঁকা রেখা)', symbol: '৴৴', shortHint: '২ ক্রান্তি' },
];

/**
 * TIL_OPTIONS — ০ হতে ১৯ তিল (কোনো special symbol নেই)
 */
export const TIL_OPTIONS: readonly DropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
  value: i,
  label: i === 0 ? '০ — কোনো তিল নেই' : `${BN_NUMS[i]} তিল`,
  symbol: BN_NUMS[i],
  shortHint: i === 0 ? '০' : `${BN_NUMS[i]} তিল`,
}));

export interface KhatianTypeOption {
  readonly id: string;
  readonly nameBn: string;
  readonly defaultSystem: 'TRADITIONAL_ANA_GONDA' | 'MODERN_1000';
  readonly eraBn: string;
  readonly description: string;
}

export const KHATIAN_TYPES: readonly KhatianTypeOption[] = [
  {
    id: 'SA',
    nameBn: 'এস. এ. খতিয়ান (SA Khatian)',
    defaultSystem: 'TRADITIONAL_ANA_GONDA',
    eraBn: '১৯৫৬ - ১৯৬৩ সন (State Acquisition)',
    description: 'জমিদারি অধিগ্রহণ পরবর্তী খতিয়ান; আনা-গণ্ডা-কড়া ও সাঙ্কেতিক চিহ্নে (যেমন ৷৷ = ৮ আনা) হিস্যা লিপিবদ্ধ।',
  },
  {
    id: 'CS',
    nameBn: 'সি. এস. খতিয়ান (CS Khatian)',
    defaultSystem: 'TRADITIONAL_ANA_GONDA',
    eraBn: '১৮৮৮ - ১৯৪০ সন (Cadastral Survey)',
    description: 'উপমহাদেশের প্রথম প্রামাণ্য ক্যাডাস্ট্রাল খতিয়ান; পূর্ণ খতিয়ান ১৬ আনা হিসেবে সংরক্ষিত।',
  },
  {
    id: 'RS',
    nameBn: 'আর. এস. খতিয়ান (RS Khatian)',
    defaultSystem: 'MODERN_1000',
    eraBn: '১৯৬৫ - ১৯৯০ সন (Revisional Survey)',
    description: 'আধুনিক রিভিশনাল সার্ভে; হিস্যা ১০০০ ভিত্তিতে দশমিক আকারে (যেমন ০.৫০০) লিপিবদ্ধ।',
  },
  {
    id: 'BS',
    nameBn: 'বি. এস. / বি. আর. এস. (BS / BRS)',
    defaultSystem: 'MODERN_1000',
    eraBn: '১৯৯৮ হতে বর্তমান (Bangladesh Survey)',
    description: 'সর্বাধুনিক খতিয়ান; ১০০০ বা ১.০০০ ভিত্তিতে অংশ এবং একর/শতাংশে জমির পরিমাণ লিপিবদ্ধ।',
  },
  {
    id: 'CITY',
    nameBn: 'সিটি জরিপ খতিয়ান (City Survey)',
    defaultSystem: 'MODERN_1000',
    eraBn: 'ঢাকা ও প্রধান মহানগরী জরিপ',
    description: 'মহানগরীর বিশেষ খতিয়ান; ১০০০ ভিত্তিতে হিস্যা সংরক্ষিত।',
  },
  {
    id: 'DIARA',
    nameBn: 'দিয়ারা খতিয়ান (Diara Survey)',
    defaultSystem: 'TRADITIONAL_ANA_GONDA',
    eraBn: 'নদী সিকস্তি ও পয়স্তি চরাঞ্চল জরিপ',
    description: 'নদী ভাঙন ও নতুন চরের খতিয়ান; ঐতিহ্যবাহী বা আধুনিক উভয় পদ্ধতিতে হিস্যা লিপিবদ্ধ।',
  },
  {
    id: 'PETI',
    nameBn: 'পেটি খতিয়ান (Peti Khatian)',
    defaultSystem: 'TRADITIONAL_ANA_GONDA',
    eraBn: 'উপ-স্বত্ব ও মধ্যস্বত্ব প্রজা খতিয়ান',
    description: 'রায়তি ও মধ্যস্বত্বাধীন ক্ষুদ্র খতিয়ান।',
  },
];