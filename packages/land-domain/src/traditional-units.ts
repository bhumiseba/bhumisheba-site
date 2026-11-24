import { Rational, createRational, ZERO, ONE, add, mul, div } from '@calculation-core';

export const TIL_PER_KRANTI = 20n;
export const KRANTI_PER_KORA = 3n;
export const KORA_PER_GONDA = 4n;
export const GONDA_PER_ANA = 20n;
export const ANA_PER_WHOLE = 16n;

// Invariant multipliers to Til (the smallest classical unit):
// 1 Kranti = 20 Til
// 1 Kora   = 3 Kranti = 60 Til
// 1 Gonda  = 4 Kora = 240 Til
// 1 Ana    = 20 Gonda = 4,800 Til
// 1 Whole  = 16 Ana = 76,800 Til
export const TIL_PER_KORA = KRANTI_PER_KORA * TIL_PER_KRANTI; // 60n
export const TIL_PER_GONDA = KORA_PER_GONDA * TIL_PER_KORA;   // 240n
export const TIL_PER_ANA = GONDA_PER_ANA * TIL_PER_GONDA;     // 4,800n
export const TIL_PER_WHOLE = ANA_PER_WHOLE * TIL_PER_ANA;     // 76,800n

export interface TraditionalShareBreakdown {
  readonly ana: bigint;
  readonly gonda: bigint;
  readonly kora: bigint;
  readonly kranti: bigint;
  readonly til: bigint;
  readonly tilFraction: Rational; // exact fractional til if any
  readonly exactTotalTil: Rational;
  readonly share: Rational;
}

export interface TraditionalUnitMetadata {
  readonly id: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly multiplierToTil: bigint;
  readonly sourceRef: string;
  readonly verified: boolean;
}

export const TRADITIONAL_UNIT_DEFINITIONS: Record<string, TraditionalUnitMetadata> = {
  ana: {
    id: 'ana',
    nameBn: 'আনা',
    nameEn: 'Ana',
    multiplierToTil: TIL_PER_ANA,
    sourceRef: 'Bengal Tenancy Act 1885 / Survey & Settlement Manual (U-001, U-002)',
    verified: true,
  },
  gonda: {
    id: 'gonda',
    nameBn: 'গণ্ডা',
    nameEn: 'Gonda',
    multiplierToTil: TIL_PER_GONDA,
    sourceRef: 'Bengal Survey Act 1875 / Survey Manual (U-003)',
    verified: true,
  },
  kora: {
    id: 'kora',
    nameBn: 'কড়া',
    nameEn: 'Kora',
    multiplierToTil: TIL_PER_KORA,
    sourceRef: 'Survey & Settlement Manual 1935 (U-004)',
    verified: true,
  },
  kranti: {
    id: 'kranti',
    nameBn: 'ক্রান্তি',
    nameEn: 'Kranti',
    multiplierToTil: TIL_PER_KRANTI,
    sourceRef: 'Survey & Settlement Manual 1935 (U-005)',
    verified: true,
  },
  til: {
    id: 'til',
    nameBn: 'তিল',
    nameEn: 'Til',
    multiplierToTil: 1n,
    sourceRef: 'Land Management Manual 1990 (U-005)',
    verified: true,
  },
};

/**
 * Converts compound traditional units (আনা, গণ্ডা, কড়া, ক্রান্তি, তিল) into an exact Rational share.
 * Formula:
 * total_til = ana * 4800 + gonda * 240 + kora * 60 + kranti * 20 + til
 * share = total_til / 76800
 */
export function compoundToRational(
  ana: bigint | number = 0n,
  gonda: bigint | number = 0n,
  kora: bigint | number = 0n,
  kranti: bigint | number = 0n,
  til: bigint | number = 0n
): Rational {
  const a = BigInt(ana);
  const g = BigInt(gonda);
  const ko = BigInt(kora);
  const kr = BigInt(kranti);
  const t = BigInt(til);

  const totalTil =
    a * TIL_PER_ANA +
    g * TIL_PER_GONDA +
    ko * TIL_PER_KORA +
    kr * TIL_PER_KRANTI +
    t;

  return createRational(totalTil, TIL_PER_WHOLE);
}

/**
 * Decomposes an exact rational share into classical units:
 * আনা, গণ্ডা, কড়া, ক্রান্তি, তিল and any remaining fractional til.
 */
export function rationalToTraditional(share: Rational): TraditionalShareBreakdown {
  // Total til = share * 76,800
  // totalTilRational = (share.n * 76800) / share.d
  const scaledNum = share.n * TIL_PER_WHOLE;
  const den = share.d;

  let wholeTil = scaledNum / den;
  const remTilNum = scaledNum % den;
  const tilFraction = createRational(remTilNum, den);

  let remaining = wholeTil;

  const ana = remaining / TIL_PER_ANA;
  remaining %= TIL_PER_ANA;

  const gonda = remaining / TIL_PER_GONDA;
  remaining %= TIL_PER_GONDA;

  const kora = remaining / TIL_PER_KORA;
  remaining %= TIL_PER_KORA;

  const kranti = remaining / TIL_PER_KRANTI;
  remaining %= TIL_PER_KRANTI;

  const til = remaining;

  return {
    ana,
    gonda,
    kora,
    kranti,
    til,
    tilFraction,
    exactTotalTil: createRational(scaledNum, den),
    share,
  };
}
