import {
  Rational,
  createRational,
  ZERO,
  ONE,
  add,
  sub,
  mul,
  div,
  eq,
  ReconciliationCheck,
  ReconciliationReport,
  ExplanationStep,
  createCheck,
  buildReconciliationReport,
  allocateProportional,
} from '@calculation-core';

export interface OwnerInput {
  readonly id: string;
  readonly name: string;
  readonly share: Rational;
  readonly customDagLands?: Record<string, Rational>; // For Model C
}

export interface DagInput {
  readonly id: string;
  readonly dagNo: string;
  readonly dagLand: Rational; // in land units
}

export interface OwnerAllocation {
  readonly ownerId: string;
  readonly ownerName: string;
  readonly share: Rational;
  readonly totalLand: Rational;
  readonly dagAllocations: Record<string, Rational>; // dagId -> allocatedLand
}

export interface KhatianResult {
  readonly khatianTotalLand: Rational;
  readonly owners: readonly OwnerAllocation[];
  readonly dags: readonly DagInput[];
  readonly totalDagLand: Rational;
  readonly totalAllocatedLand: Rational;
  readonly totalShare: Rational;
  readonly reconciliation: ReconciliationReport;
  readonly explanations: readonly ExplanationStep[];
}

/**
 * Calculates owner-wise land across a Khatian and its constituent Dags.
 * Supports Model A (Uniform proportional share across all dags).
 */
export function calculateKhatianModelA(
  khatianTotalLand: Rational,
  owners: readonly OwnerInput[],
  dags: readonly DagInput[]
): KhatianResult {
  // 1. Calculate sum of shares
  let totalShare = ZERO;
  for (const o of owners) {
    totalShare = add(totalShare, o.share);
  }

  // 2. Calculate sum of dag land
  let totalDagLand = ZERO;
  for (const d of dags) {
    totalDagLand = add(totalDagLand, d.dagLand);
  }

  // 3. Owner allocations
  const ownerAllocations: OwnerAllocation[] = owners.map((owner) => {
    // Total land for owner in khatian = khatianTotalLand * owner.share
    const totalLand = mul(khatianTotalLand, owner.share);

    // Dag-wise land = dag.dagLand * owner.share
    const dagAllocations: Record<string, Rational> = {};
    for (const dag of dags) {
      dagAllocations[dag.id] = mul(dag.dagLand, owner.share);
    }

    return {
      ownerId: owner.id,
      ownerName: owner.name,
      share: owner.share,
      totalLand,
      dagAllocations,
    };
  });

  // 4. Total allocated land across all owners
  let totalAllocatedLand = ZERO;
  for (const alloc of ownerAllocations) {
    totalAllocatedLand = add(totalAllocatedLand, alloc.totalLand);
  }

  // 5. Reconciliation checks
  const checks: ReconciliationCheck[] = [];

  // Check A: Sum of owner shares == 1 (16 আনা বা ১.০ অংশ)
  checks.push(
    createCheck('CH_SHARE_SUM', 'খতিয়ানের সকল মালিকের মোট হিস্যা যোগফল (১.০ বা ষোল আনা)', ONE, totalShare, {
      allowUnderAllocation: true,
      note: eq(totalShare, ONE)
        ? 'হিস্যা সম্পূর্ণ (১.০ অংশ)'
        : 'হিস্যা সম্পূর্ণ নয়; অবণ্টিত অংশ বিদ্যমান',
    })
  );

  // Check B: Sum of dag land == Khatian total land (if dags are provided)
  if (dags.length > 0) {
    checks.push(
      createCheck(
        'CH_DAG_SUM',
        'দাগসমূহের মোট জমির যোগফল বনাম খতিয়ানের মোট জমি',
        khatianTotalLand,
        totalDagLand,
        {
          allowUnderAllocation: false,
          note: eq(totalDagLand, khatianTotalLand)
            ? 'দাগের মোট জমি ও খতিয়ানের মোট জমি সমান'
            : 'দাগের মোট জমি ও খতিয়ানের মোট জমিতে অমিল রয়েছে',
        }
      )
    );
  }

  // Check C: Total allocated land vs Khatian total land
  checks.push(
    createCheck(
      'CH_LAND_ALLOC_SUM',
      'মালিকদের বণ্টিত মোট জমি বনাম খতিয়ানের মোট জমি',
      khatianTotalLand,
      totalAllocatedLand,
      {
        allowUnderAllocation: true,
      }
    )
  );

  const reconciliation = buildReconciliationReport(checks);

  // 6. Step-by-step explanations
  const explanations: ExplanationStep[] = [
    {
      id: 'step_shares',
      title: 'মালিকদের হিস্যা যোগকরণ',
      detail: `খতিয়ানের সকল মালিকের হিস্যা যোগ করা হয়েছে। মোট হিস্যা = ${totalShare.n}/${totalShare.d} অংশ।`,
      resultFraction: totalShare,
    },
    {
      id: 'step_khatian_land',
      title: 'খতিয়ানের ভিত্তিতে প্রত্যেকের মোট প্রাপ্য জমি নির্ধারণ',
      detail:
        'প্রতিটি মালিকের প্রাপ্য জমি = খতিয়ানের মোট জমি × মালিকের নিজস্ব হিস্যা। কোনো রাউন্ডিং ছাড়াই সম্পূর্ণ নির্ভুল ভগ্নাংশ আকারে হিসাব সম্পন্ন হয়েছে।',
      formula: 'মালিকের জমি = খতিয়ান জমি × হিস্যা',
    },
  ];

  if (dags.length > 0) {
    explanations.push({
      id: 'step_dag_land',
      title: 'দাগভিত্তিক অংশ বণ্টন (মডেল এ: সমানুপাতিক হিস্যা)',
      detail:
        'প্রতিটি দাগে মালিকের জমি = ওই নির্দিষ্ট দাগের মোট জমি × মালিকের খতিয়ান হিস্যা। প্রতিটি দাগের মালিক-অংশের যোগফল দাগের মূল জমির হুবহু সমান।',
      formula: 'দাগে প্রাপ্য জমি = দাগের জমি × হিস্যা',
    });
  }

  return {
    khatianTotalLand,
    owners: ownerAllocations,
    dags,
    totalDagLand,
    totalAllocatedLand,
    totalShare,
    reconciliation,
    explanations,
  };
}

/**
 * Calculates Khatian under Model C (Per-dag explicit land).
 * Derives shares from entered lands and reconciles.
 */
export function calculateKhatianModelC(
  khatianTotalLand: Rational,
  owners: readonly OwnerInput[],
  dags: readonly DagInput[]
): KhatianResult {
  // Model C: Owner has explicit land per dag
  const ownerAllocations: OwnerAllocation[] = owners.map((owner) => {
    let ownerTotalLand = ZERO;
    const dagAllocations: Record<string, Rational> = {};

    for (const dag of dags) {
      const landInDag = owner.customDagLands?.[dag.id] || ZERO;
      dagAllocations[dag.id] = landInDag;
      ownerTotalLand = add(ownerTotalLand, landInDag);
    }

    // Derived share in khatian = ownerTotalLand / khatianTotalLand
    const derivedShare = eq(khatianTotalLand, ZERO)
      ? ZERO
      : div(ownerTotalLand, khatianTotalLand);

    return {
      ownerId: owner.id,
      ownerName: owner.name,
      share: derivedShare,
      totalLand: ownerTotalLand,
      dagAllocations,
    };
  });

  let totalAllocatedLand = ZERO;
  let totalShare = ZERO;
  for (const alloc of ownerAllocations) {
    totalAllocatedLand = add(totalAllocatedLand, alloc.totalLand);
    totalShare = add(totalShare, alloc.share);
  }

  let totalDagLand = ZERO;
  for (const d of dags) {
    totalDagLand = add(totalDagLand, d.dagLand);
  }

  const checks: ReconciliationCheck[] = [
    createCheck('CH_LAND_SUM_C', 'মালিকদের প্রাপ্ত মোট জমি বনাম খতিয়ানের জমি', khatianTotalLand, totalAllocatedLand, {
      allowUnderAllocation: true,
    }),
  ];

  if (dags.length > 0) {
    checks.push(
      createCheck('CH_DAG_SUM_C', 'দাগের মোট জমি বনাম খতিয়ানের মোট জমি', khatianTotalLand, totalDagLand, {
        allowUnderAllocation: false,
      })
    );
  }

  const reconciliation = buildReconciliationReport(checks);

  const explanations: ExplanationStep[] = [
    {
      id: 'step_c_calc',
      title: 'দাগভিত্তিক নির্দিষ্ট জমি থেকে হিস্যা নির্ণয় (মডেল সি)',
      detail:
        'প্রতিটি মালিকের প্রতিটি দাগের জমি যোগ করে মোট জমি নির্ধারণ করা হয়েছে এবং তা থেকে খতিয়ানের মূল অংশের বিপরীতে হিস্যা ভগ্নাংশ গঠিত হয়েছে।',
    },
  ];

  return {
    khatianTotalLand,
    owners: ownerAllocations,
    dags,
    totalDagLand,
    totalAllocatedLand,
    totalShare,
    reconciliation,
    explanations,
  };
}
