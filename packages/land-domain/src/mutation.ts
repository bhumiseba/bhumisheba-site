import {
  Rational,
  createRational,
  ZERO,
  ONE,
  add,
  sub,
  div,
  mul,
  eq,
  gt,
  ReconciliationCheck,
  ReconciliationReport,
  ExplanationStep,
  createCheck,
  buildReconciliationReport,
} from '@calculation-core';

export type MutationBasisType = 'DEED_LAND' | 'SELLER_HOLDING' | 'DAG_LAND';

export const MUTATION_BASIS_LABELS: Record<MutationBasisType, { nameBn: string; descBn: string }> = {
  DEED_LAND: {
    nameBn: 'দলিলকৃত ক্রয়কৃত জমি (Deed Land)',
    descBn: 'আবেদনকারীগণের ক্রয়কৃত বা হস্তান্তরকৃত দলিলের মোট জমি ভিত্তি হিসেবে ধরা হয়েছে।',
  },
  SELLER_HOLDING: {
    nameBn: 'বিক্রেতার মোট খতিয়ান হিস্যার জমি (Seller Holding)',
    descBn: 'খতিয়ানে বিক্রেতা বা মূল মালিকের মোট প্রাপ্য জমি ভিত্তি হিসেবে ব্যবহৃত হয়েছে।',
  },
  DAG_LAND: {
    nameBn: 'নির্দিষ্ট দাগের মোট জমি (Dag Land)',
    descBn: 'আবেদনকৃত নির্দিষ্ট দাগের মূল জমি ভিত্তি হিসেবে ব্যবহৃত হয়েছে।',
  },
};

export interface MutationApplicantInput {
  readonly id: string;
  readonly name: string;
  readonly appliedLand: Rational; // in selected land unit (e.g. শতাংশ)
}

export interface MutationApplicantResult {
  readonly id: string;
  readonly name: string;
  readonly appliedLand: Rational;
  readonly shareInBasis: Rational; // appliedLand / basisLand
  readonly shareInKhatian?: Rational; // appliedLand / khatianTotalLand (if provided)
}

export interface MutationResult {
  readonly basisType: MutationBasisType;
  readonly basisLand: Rational;
  readonly khatianTotalLand?: Rational;
  readonly applicants: readonly MutationApplicantResult[];
  readonly totalAppliedLand: Rational;
  readonly remainingLand: Rational; // basisLand - totalAppliedLand
  readonly totalShareInBasis: Rational;
  readonly reconciliation: ReconciliationReport;
  readonly explanations: readonly ExplanationStep[];
}

/**
 * Calculates Mutation (নামজারি) Application Share for single or multiple applicants.
 */
export function calculateMutationShare(
  basisType: MutationBasisType,
  basisLand: Rational,
  applicants: readonly MutationApplicantInput[],
  khatianTotalLand?: Rational
): MutationResult {
  if (eq(basisLand, ZERO)) {
    throw new Error('ভিত্তি জমি শূন্য (০) হতে পারে না।');
  }

  let totalAppliedLand = ZERO;
  for (const app of applicants) {
    totalAppliedLand = add(totalAppliedLand, app.appliedLand);
  }

  const applicantResults: MutationApplicantResult[] = applicants.map((app) => {
    const shareInBasis = div(app.appliedLand, basisLand);
    const shareInKhatian =
      khatianTotalLand && !eq(khatianTotalLand, ZERO)
        ? div(app.appliedLand, khatianTotalLand)
        : undefined;

    return {
      id: app.id,
      name: app.name,
      appliedLand: app.appliedLand,
      shareInBasis,
      shareInKhatian,
    };
  });

  let totalShareInBasis = ZERO;
  for (const res of applicantResults) {
    totalShareInBasis = add(totalShareInBasis, res.shareInBasis);
  }

  const remainingLand = sub(basisLand, totalAppliedLand);

  // Reconciliation checks
  const checks: ReconciliationCheck[] = [];

  // Check 1: Applied land vs Basis land
  const isOverAllocated = gt(totalAppliedLand, basisLand);
  checks.push(
    createCheck(
      'CH_MUTATION_LAND',
      'আবেদনকৃত মোট জমি বনাম মূল ভিত্তি জমি',
      basisLand,
      totalAppliedLand,
      {
        allowUnderAllocation: true,
        underAllocationState: 'VALID', // per CALCULATION_SPECIFICATION.md §11 (remainder shown as unaffected)
        note: isOverAllocated
          ? 'আবেদনকৃত জমি মূল ভিত্তি জমির চেয়ে বেশি (ত্রুটিপূর্ণ)'
          : eq(totalAppliedLand, basisLand)
          ? 'সম্পূর্ণ ভিত্তি জমি আবেদনকারীদের মধ্যে শতভাগ অন্তর্ভুক্ত হয়েছে'
          : `অবশিষ্ট অবিক্রীত/অবণ্টনকৃত জমি: ${remainingLand.n}/${remainingLand.d}`,
      }
    )
  );

  const reconciliation = buildReconciliationReport(checks);

  const basisMeta = MUTATION_BASIS_LABELS[basisType];

  const explanations: ExplanationStep[] = [
    {
      id: 'step_basis',
      title: 'হিসাবের ভিত্তি নির্ধারণ',
      detail: `${basisMeta.nameBn} (${basisMeta.descBn})। মোট ভিত্তি জমি: ${basisLand.n}/${basisLand.d}`,
    },
    {
      id: 'step_share_ratio',
      title: 'আবেদনকারীভিত্তিক হিস্যা ভগ্নাংশ নির্ধারণ',
      detail:
        'প্রতি আবেদনকারীর হিস্যা = (আবেদনকৃত জমি ÷ মোট ভিত্তি জমি)। কোনো দশমিক রাউন্ডিং ছাড়া খাঁটি অনুপাত ও ভগ্নাংশে হিসাব সংরক্ষিত।',
      formula: 'হিস্যা = আবেদনকৃত জমি / ভিত্তি জমি',
    },
  ];

  if (khatianTotalLand && !eq(khatianTotalLand, ZERO)) {
    explanations.push({
      id: 'step_khatian_share',
      title: 'মূল খতিয়ানে সামগ্রিক হিস্যা নির্ধারণ',
      detail:
        'নামজারি খতিয়ান সৃজনে মূল খতিয়ানের মোট জমির সাপেক্ষে প্রতিটি আবেদনকারীর হিস্যা = (আবেদনকৃত জমি ÷ খতিয়ানের মোট জমি)।',
      formula: 'খতিয়ানে হিস্যা = আবেদনকৃত জমি / খতিয়ানের মোট জমি',
    });
  }

  return {
    basisType,
    basisLand,
    khatianTotalLand,
    applicants: applicantResults,
    totalAppliedLand,
    remainingLand,
    totalShareInBasis,
    reconciliation,
    explanations,
  };
}
