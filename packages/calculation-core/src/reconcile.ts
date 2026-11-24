import { Rational, ZERO, add, sub, eq, gt, lt, abs } from './rational';
import { ReconciliationCheck, ReconciliationReport, ReconciliationState } from './types';

export function createCheck(
  id: string,
  description: string,
  expected: Rational,
  actual: Rational,
  options: {
    allowUnderAllocation?: boolean;
    underAllocationState?: ReconciliationState;
    warningThreshold?: Rational;
    note?: string;
  } = {}
): ReconciliationCheck {
  const difference = sub(actual, expected);

  let state: ReconciliationState = 'VALID';

  if (!eq(difference, ZERO)) {
    if (gt(actual, expected)) {
      state = 'INVALID';
    } else if (lt(actual, expected)) {
      if (options.underAllocationState) {
        state = options.underAllocationState;
      } else {
        state = options.allowUnderAllocation ? 'WARNING' : 'INVALID';
      }
    }
  }

  return {
    id,
    description,
    expected,
    actual,
    difference,
    state,
    note: options.note,
  };
}

export function buildReconciliationReport(
  checks: readonly ReconciliationCheck[]
): ReconciliationReport {
  let hasInvalid = false;
  let hasWarning = false;
  let totalDiff = ZERO;

  for (const c of checks) {
    // FIX: previously used sub() which made totalDiff negative.
    // totalDiff is now the sum of absolute deviations (always ≥ 0).
    totalDiff = add(totalDiff, abs(c.difference));

    if (c.state === 'INVALID') {
      hasInvalid = true;
    } else if (c.state === 'WARNING') {
      hasWarning = true;
    }
  }

  let state: ReconciliationState = 'VALID';
  let summary = 'হিসাব সঠিকভাবে মিলেছে (সকল যাচাই উত্তীর্ণ)';

  if (hasInvalid) {
    state = 'INVALID';
    summary = 'তথ্যের অসামঞ্জস্য রয়েছে — হিস্যা বা জমির পরিমাণ মূল পরিমাণের সাথে মেলেনি';
  } else if (hasWarning) {
    state = 'WARNING';
    summary = 'যাচাই প্রয়োজন — হিস্যা বা জমির কিছু অংশ অবণ্টিত বা অপূর্ণ রয়েছে';
  }

  return {
    state,
    checks,
    summary,
    totalDifference: totalDiff,
  };
}