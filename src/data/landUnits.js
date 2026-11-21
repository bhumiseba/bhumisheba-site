/**
 * জমির একক রূপান্তরের ডেটা।
 * বেস একক: শতাংশ (Shotangsho / Decimal) = 435.6 sq ft
 *
 * রেফারেন্স:
 *   1 বিঘা   = 33 শতাংশ = 20 কাঠা
 *   1 কাঠা   = 1.65 শতাংশ = 16 ছটাক
 *   1 ছটাক   = 0.103125 শতাংশ
 *   1 একর   = 100 শতাংশ = 3.025 বিঘা
 *   1 হেক্টর = 247.105 শতাংশ
 *   1 কানি   = 120 শতাংশ (আঞ্চলিক ভিন্নতা আছে)
 */

export const toShotangsho = {
  sqft: 1 / 435.6,
  sqm: 1 / 40.4686,
  chotak: 1.65 / 16,
  katha: 1.65,
  shotangsho: 1,
  bigha: 33,
  acre: 100,
  hectare: 247.105,
  kani: 120,
};

export const units = [
  { key: "sqft",       bn: "বর্গফুট",   decimals: 2 },
  { key: "sqm",        bn: "বর্গমিটার", decimals: 3 },
  { key: "chotak",     bn: "ছটাক",      decimals: 3 },
  { key: "katha",      bn: "কাঠা",      decimals: 3 },
  { key: "shotangsho", bn: "শতাংশ",     decimals: 3 },
  { key: "bigha",      bn: "বিঘা",      decimals: 4 },
  { key: "acre",       bn: "একর",       decimals: 4 },
  { key: "hectare",    bn: "হেক্টর",    decimals: 4 },
  { key: "kani",       bn: "কানি",      decimals: 4, note: "আঞ্চলিক ভিন্নতা" },
];

/** সংখ্যা বাংলা ফরম্যাটে */
export function fmtBn(num, decimals = 3) {
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("bn-BD", { maximumFractionDigits: decimals });
}