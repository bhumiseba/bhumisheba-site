/**
 * Pure calculation-core types
 * No DOM, no React, no locale, no floating point.
 */

export interface Rational {
  readonly n: bigint;
  readonly d: bigint; // Invariant: d > 0n, gcd(|n|, d) === 1n
}

export interface SerializedRational {
  readonly n: string;
  readonly d: string;
}

export type ReconciliationState = 'VALID' | 'WARNING' | 'INVALID';

export interface ReconciliationCheck {
  readonly id: string;
  readonly description: string;
  readonly expected: Rational;
  readonly actual: Rational;
  readonly difference: Rational; // actual - expected
  readonly state: ReconciliationState;
  readonly note?: string;
}

export interface ReconciliationReport {
  readonly state: ReconciliationState;
  readonly checks: readonly ReconciliationCheck[];
  readonly summary: string;
  readonly totalDifference: Rational;
}

export interface ExplanationStep {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly formula?: string;
  readonly mathExpression?: string;
  readonly resultFraction?: Rational;
}

export interface NormalizedInput {
  readonly raw: string;
  readonly normalizedAscii: string;
  readonly parsed?: Rational;
  readonly error?: string;
}
