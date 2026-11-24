// src/calc/features/hisya-converter/HisyaConverter.tsx
import React, { useState, useMemo } from 'react';
import {
  Rational,
  ONE,
  ZERO,
  eq,
  gt,
  parseRational,
  createCheck,
  buildReconciliationReport,
} from '@calculation-core';
import { compoundToRational, KHATIAN_TYPES } from '@land-domain';
import { toBengaliDigits, normalizeUserInput } from '@shared';
import {
  AdminSelector,
  KhatianTable,
  KhatianOwner,
} from '../../components/khatian';
import { VisualShareBar, VisualShareItem } from '../../components/VisualShareBar';
import { ReconciliationBanner } from '../../components/ReconciliationBanner';
import { PrintCertificateModal } from '../../components/PrintCertificateModal';
import { useToast } from '../../components/ui';
import { copyToClipboard } from '../../lib/clipboard';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { BANGLADESH_GEO } from '../../data/bangladesh-geo';
import { getMouzasByUpazila } from '../../data/mouza-data';
import {
  getFullShareDisplay,
  get1000Based,
  getReconciled1000BasedList,
  getReconciledLandList,
} from '../../components/khatian/TraditionalSymbols';
import {
  summarizeTotalShare,
  formatDistributedLand,
  getReconciled1BasedList,
} from '../../components/khatian/shareTotals';
import {
  AreaOwnerInput,
  computeAreaShares,
} from '../../components/khatian/areaShares';
import { AreaShareTable } from '../../components/khatian/AreaShareTable';
import { Copy, Check, Printer } from 'lucide-react';

type ConverterMode = 'ANA' | 'AREA';

interface Props {
  readonly digitLocale?: 'bn' | 'en';
  readonly displayPrecision?: number;
  readonly initialMode?: ConverterMode;
}

// নাম না দিলে "মালিক ১", "মালিক ২"... (রিপোর্টে "অজ্ঞাত" নয়)
function ownerLabel(o: { name?: string }, idx: number): string {
  return (o.name || '').trim() || `মালিক ${toBengaliDigits(idx + 1)}`;
}

export const HisyaConverter: React.FC<Props> = ({
  displayPrecision = 4,
  initialMode = 'ANA',
}) => {
  const { showToast } = useToast();

  // ---------- অপশন বাছাই: ১ = আনা-গণ্ডা থেকে হিস্যা, ২ = জমির পরিমাণ থেকে হিস্যা ----------
  const [mode, setMode] = useState<ConverterMode>(initialMode);

  // ---------- Administrative Location State (ডিফল্ট ফাঁকা) ----------
  const [divisionId, setDivisionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [upazilaId, setUpazilaId] = useState('');
  const [khatianType, setKhatianType] = useState<'CS' | 'SA' | 'RS' | 'BS'>('CS');
  const [mouzaId, setMouzaId] = useState('');
  const [khatianNo, setKhatianNo] = useState('');

  // ---------- অপশন ১: Land Amount State (ডিফল্ট ফাঁকা) ----------
  const [totalLand, setTotalLand] = useState<string>('');
  const [landUnit, setLandUnit] = useState<string>('শতাংশ');

  // ---------- অপশন ১: Default State: 3 empty owner rows ----------
  const [owners, setOwners] = useState<KhatianOwner[]>([
    { id: 'owner_1', name: '', ana: 0, gonda: 0, kora: 0, kranti: 0, til: 0 },
    { id: 'owner_2', name: '', ana: 0, gonda: 0, kora: 0, kranti: 0, til: 0 },
    { id: 'owner_3', name: '', ana: 0, gonda: 0, kora: 0, kranti: 0, til: 0 },
  ]);

  // ---------- অপশন ২: জমির পরিমাণ থেকে হিস্যা (নিজস্ব আলাদা ডেটা) ----------
  const [areaTotal, setAreaTotal] = useState<string>('');
  const [areaOwners, setAreaOwners] = useState<AreaOwnerInput[]>([
    { id: 'area_owner_1', name: '', land: '' },
    { id: 'area_owner_2', name: '', land: '' },
    { id: 'area_owner_3', name: '', land: '' },
  ]);

  // ---------- UI State ----------
  const [copied, setCopied] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // ---------- Derived Location Names (না বাছলে ফাঁকা) ----------
  const divisionName = useMemo(() => {
    return BANGLADESH_GEO.find((d) => d.id === divisionId)?.nameBn || '';
  }, [divisionId]);

  const districtName = useMemo(() => {
    const div = BANGLADESH_GEO.find((d) => d.id === divisionId);
    return div?.districts.find((d) => d.id === districtId)?.nameBn || '';
  }, [divisionId, districtId]);

  const thanaName = useMemo(() => {
    const div = BANGLADESH_GEO.find((d) => d.id === divisionId);
    const dist = div?.districts.find((d) => d.id === districtId);
    return dist?.upazilas.find((u) => u.id === upazilaId)?.nameBn || '';
  }, [divisionId, districtId, upazilaId]);

  const mouzaName = useMemo(() => {
    if (!divisionId || !districtId || !upazilaId) return '—';
    const mouzas = getMouzasByUpazila(divisionId, districtId, upazilaId);
    return mouzas.find((m) => m.id === mouzaId)?.nameBn || (mouzaId ? mouzaId : '—');
  }, [divisionId, districtId, upazilaId, mouzaId]);

  const jlNo = useMemo(() => {
    if (!divisionId || !districtId || !upazilaId) return '';
    const mouzas = getMouzasByUpazila(divisionId, districtId, upazilaId);
    return mouzas.find((m) => m.id === mouzaId)?.jlNo || '';
  }, [divisionId, districtId, upazilaId, mouzaId]);

  // ---------- Convert Owners to Rationals for VisualShareBar & Reconciliation ----------
  const visualShareItems = useMemo<VisualShareItem[]>(() => {
    return owners.map((o, idx) => {
      const share = compoundToRational(
        BigInt(o.ana),
        BigInt(o.gonda),
        BigInt(o.kora),
        BigInt(o.kranti),
        BigInt(o.til)
      );
      return {
        id: o.id,
        name: ownerLabel(o, idx),
        share,
      };
    });
  }, [owners]);

  // Total share as Rational
  const totalShare = useMemo<Rational>(() => {
    let totalTil = 0n;
    for (const o of owners) {
      totalTil +=
        BigInt(o.ana) * 4800n +
        BigInt(o.gonda) * 240n +
        BigInt(o.kora) * 60n +
        BigInt(o.kranti) * 20n +
        BigInt(o.til);
    }
    return { n: totalTil, d: 76800n };
  }, [owners]);

  // মোট হিস্যার সারাংশ: পর্দা, কপি ও প্রিন্ট একই মান নেয়
  const summary = useMemo(
    () => summarizeTotalShare(owners, displayPrecision),
    [owners, displayPrecision]
  );
  // কারও হিস্যা না দিলে প্রতিবেদন বানানো অর্থহীন
  const hasAnyShare = summary.totalTil > 0n;

  // মোট জমি: সঠিক ভগ্নাংশে (ঠিক না হলে বা শূন্য হলে null)
  const totalLandRational = useMemo<Rational | null>(() => {
    if (!totalLand) return null;
    try {
      const val = parseRational(normalizeUserInput(totalLand));
      return gt(val, ZERO) ? val : null;
    } catch {
      return null;
    }
  }, [totalLand]);

  const reconciledShares1000 = useMemo(() => {
    return getReconciled1000BasedList(owners, displayPrecision);
  }, [owners, displayPrecision]);

  const reconciledShares1 = useMemo(() => {
    return getReconciled1BasedList(owners);
  }, [owners]);

  const reconciledLandAmounts = useMemo(() => {
    return getReconciledLandList(owners, totalLandRational, displayPrecision);
  }, [owners, totalLandRational, displayPrecision]);

  // Reconciliation report
  const reconciliationReport = useMemo(() => {
    const isReconciled = eq(totalShare, ONE);
    const check = createCheck(
      'TOTAL_SHARE',
      '১৬ আনা = ১.০০০ (১০০০ হিস্যা পূর্ণ সমন্বয়)',
      ONE,
      totalShare,
      {
        allowUnderAllocation: true,
        note: isReconciled
          ? 'সকল হিস্যা সম্পূর্ণভাবে সমন্বিত'
          : totalShare.n < 76800n
          ? 'অসম্পূর্ণ হিস্যা — খতিয়ানের কিছু অংশ অবণ্টিত'
          : 'অতিরিক্ত হিস্যা — মোট ১৬ আনার বেশি',
      }
    );
    return buildReconciliationReport([check]);
  }, [totalShare]);

  // ---------- অপশন ২: জমির পরিমাণ থেকে হিস্যার হিসাব ----------
  const areaResult = useMemo(
    () => computeAreaShares(areaTotal, areaOwners, displayPrecision),
    [areaTotal, areaOwners, displayPrecision]
  );

  const areaVisualItems = useMemo<VisualShareItem[]>(() => {
    if (!areaResult.ok) return [];
    const items: VisualShareItem[] = [];
    areaResult.rows.forEach((r, i) => {
      if (r.share !== null) {
        items.push({
          id: r.id,
          name: ownerLabel(areaOwners[i], i),
          share: r.share,
        });
      }
    });
    return items;
  }, [areaResult, areaOwners]);

  // প্রিন্ট ও কপি চালু থাকবে কি না (অপশন অনুযায়ী)
  const canExport = mode === 'ANA' ? hasAnyShare : areaResult.ok;

  // Copy summary to clipboard (অপশন ১)
  const handleCopySummary = async () => {
    if (!hasAnyShare) return;

    const typeName =
      KHATIAN_TYPES.find((t) => t.id === khatianType)?.nameBn || khatianType;

    const isLandValid = totalLandRational !== null;

    let txt = `জমির হিসাব প্রতিবেদন\n`;
    txt += `খতিয়ানের ধরন: ${typeName}\n`;
    const placeParts: string[] = [];
    if (divisionName) placeParts.push(`বিভাগ: ${divisionName}`);
    if (districtName) placeParts.push(`জেলা: ${districtName}`);
    if (thanaName) placeParts.push(`উপজেলা: ${thanaName}`);
    if (placeParts.length > 0) txt += `${placeParts.join(' | ')}\n`;
    txt += `মৌজা: ${mouzaName} | খতিয়ান নং: ${toBengaliDigits(khatianNo || '—')}\n`;
    if (isLandValid) {
      txt += `খতিয়ানে মোট জমি: ${toBengaliDigits(totalLand)} ${landUnit}\n`;
    }
    txt += `=========================================\n`;
    txt += `মালিকগণের হিস্যা ও প্রাপ্ত জমি:\n`;

    owners.forEach((o, i) => {
      const ownerLand = reconciledLandAmounts[i] ?? null;
      const ownerShare1000 =
        reconciledShares1000[i] ?? get1000Based(o.ana, o.gonda, o.kora, o.kranti, o.til, displayPrecision);
      const ownerShare1 = reconciledShares1[i] ?? '—';

      const label = ownerLabel(o, i);
      const ownerTitle = o.parentage ? `${label} (${o.parentage})` : label;
      txt += `${toBengaliDigits(i + 1)}. ${ownerTitle}\n`;
      txt += `   অংশ: ${getFullShareDisplay(o.ana, o.gonda, o.kora, o.kranti, o.til)} | ${ownerShare1} (১ ভিত্তিক) | ${ownerShare1000} (১০০০ ভিত্তিক)\n`;
      if (ownerLand !== null) {
        txt += `   প্রাপ্ত জমি: ${ownerLand} ${landUnit}\n`;
      }
    });

    txt += `-----------------------------------------\n`;
    txt += `সর্বমোট হিস্যা: ${summary.total1} (১ ভিত্তিক) | ${summary.total1000} (১০০০ ভিত্তিক)\n`;
    const totalDist = formatDistributedLand(totalLandRational, summary.totalTil, displayPrecision);
    if (totalDist !== null) {
      txt += `সর্বমোট বণ্টনকৃত জমি: ${totalDist} ${landUnit}\n`;
    }
    txt += `সমন্বয় অবস্থা: ${reconciliationReport.summary}\n`;

    const ok = await copyToClipboard(txt);
    if (ok) {
      setCopied(true);
      showToast('success', 'প্রতিবেদন ক্লিপবোর্ডে অনুলিপি হয়েছে ✅');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('error', 'অনুলিপি করা যায়নি');
    }
  };

  // Copy summary to clipboard (অপশন ২: জমির পরিমাণ থেকে হিস্যা)
  const handleCopyAreaSummary = async () => {
    if (!areaResult.ok) return;

    const typeName =
      KHATIAN_TYPES.find((t) => t.id === khatianType)?.nameBn || khatianType;

    let txt = `জমির হিস্যা প্রতিবেদন (জমির পরিমাণ থেকে হিস্যা)\n`;
    txt += `খতিয়ানের ধরন: ${typeName}\n`;
    const placeParts: string[] = [];
    if (divisionName) placeParts.push(`বিভাগ: ${divisionName}`);
    if (districtName) placeParts.push(`জেলা: ${districtName}`);
    if (thanaName) placeParts.push(`উপজেলা: ${thanaName}`);
    if (placeParts.length > 0) txt += `${placeParts.join(' | ')}\n`;
    txt += `মৌজা: ${mouzaName} | খতিয়ান নং: ${toBengaliDigits(khatianNo || '—')}\n`;
    txt += `খতিয়ানে মোট জমি: ${areaResult.totalLandText} শতাংশ\n`;
    txt += `=========================================\n`;
    txt += `মালিকগণের প্রাপ্য জমি ও হিস্যা:\n`;

    areaOwners.forEach((o, i) => {
      const r = areaResult.rows[i];
      if (!r) return;
      txt += `${toBengaliDigits(i + 1)}. ${ownerLabel(o, i)}\n`;
      txt += `   প্রাপ্য জমি: ${r.landText || '০'} শতাংশ\n`;
      txt += `   আনা-গণ্ডা: ${r.traditional}\n`;
      txt += `   অংশ: ${r.share1} (১ ভিত্তিক) | ${r.share1000} (১০০০ ভিত্তিক)\n`;
    });

    txt += `-----------------------------------------\n`;
    txt += `সর্বমোট হিস্যা: ১.০০০ (১ ভিত্তিক) | ${areaResult.total1000} (১০০০ ভিত্তিক)\n`;
    txt += `সর্বমোট জমি: ${areaResult.totalLandText} শতাংশ\n`;
    if (areaResult.anyRounded) {
      txt += `নোট: কিছু মান গোল করা হয়েছে; যোগফল ঠিক রাখা হয়েছে।\n`;
    }

    const ok = await copyToClipboard(txt);
    if (ok) {
      setCopied(true);
      showToast('success', 'প্রতিবেদন ক্লিপবোর্ডে অনুলিপি হয়েছে ✅');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('error', 'অনুলিপি করা যায়নি');
    }
  };

  const handleCopy = () => {
    if (mode === 'ANA') return handleCopySummary();
    return handleCopyAreaSummary();
  };

  useKeyboardShortcut({
    key: 'p',
    ctrl: true,
    handler: () => setIsCertificateOpen(true),
    enabled: canExport,
  });
  useKeyboardShortcut({
    key: 'c',
    ctrl: true,
    shift: true,
    handler: () => handleCopy(),
    enabled: canExport,
  });

  const modeButtonClass = (active: boolean) =>
    `px-3 py-2 rounded-lg border text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
      active
        ? 'border-emerald-700 bg-emerald-700 text-white'
        : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
    }`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            হিস্যা কনভার্টার ও জমি বণ্টন
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {mode === 'ANA'
              ? 'আনা-গণ্ডা-কড়া হিস্যা হতে ১০০০ ভিত্তিক রূপান্তর এবং খতিয়ানের মোট জমির সুষম বণ্টন'
              : 'মোট জমি ও প্রত্যেকের প্রাপ্য জমির পরিমাণ থেকে আনা-গণ্ডা ও আধুনিক হিস্যা'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!canExport}
            title={
              canExport
                ? 'প্রতিবেদন কপি করুন'
                : mode === 'ANA'
                ? 'আগে অন্তত একজন মালিকের হিস্যা দিন'
                : 'আগে মোট জমি ও প্রত্যেকের প্রাপ্য জমি মিলিয়ে দিন'
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>{copied ? 'অনুলিপি হয়েছে' : 'প্রতিবেদন কপি'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCertificateOpen(true)}
            disabled={!canExport}
            title={
              canExport
                ? 'প্রিন্ট প্রতিবেদন'
                : mode === 'ANA'
                ? 'আগে অন্তত একজন মালিকের হিস্যা দিন'
                : 'আগে মোট জমি ও প্রত্যেকের প্রাপ্য জমি মিলিয়ে দিন'
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট প্রতিবেদন</span>
          </button>
        </div>
      </div>

      {/* অপশন বাছাই */}
      <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label="রূপান্তরের অপশন">
        <button
          type="button"
          aria-pressed={mode === 'ANA'}
          onClick={() => setMode('ANA')}
          className={modeButtonClass(mode === 'ANA')}
        >
          ১. আনা-গণ্ডা থেকে আধুনিক হিস্যা
        </button>
        <button
          type="button"
          aria-pressed={mode === 'AREA'}
          onClick={() => setMode('AREA')}
          className={modeButtonClass(mode === 'AREA')}
        >
          ২. জমির পরিমাণ থেকে আনা-গণ্ডা ও আধুনিক হিস্যা
        </button>
      </div>

      {/* 1. AdminSelector (দুই অপশনেই একই) */}
      <AdminSelector
        divisionId={divisionId}
        districtId={districtId}
        upazilaId={upazilaId}
        khatianType={khatianType}
        mouzaId={mouzaId}
        khatianNo={khatianNo}
        onDivisionChange={setDivisionId}
        onDistrictChange={setDistrictId}
        onUpazilaChange={setUpazilaId}
        onKhatianTypeChange={setKhatianType}
        onMouzaChange={setMouzaId}
        onKhatianNoChange={setKhatianNo}
      />

      {mode === 'ANA' ? (
        <>
          {/* 2. KhatianTable */}
          <KhatianTable
            owners={owners}
            onOwnersChange={setOwners}
            totalLand={totalLand}
            onTotalLandChange={setTotalLand}
            landUnit={landUnit}
            onLandUnitChange={setLandUnit}
            displayPrecision={displayPrecision}
          />

          {/* 3. Reconciliation Banner & Visual Share Bar */}
          {totalShare.n > 0n && !eq(totalShare, ONE) && (
            <ReconciliationBanner report={reconciliationReport} digitLocale="bn" />
          )}

          {owners.some((o) => o.ana > 0 || o.gonda > 0 || o.kora > 0 || o.kranti > 0 || o.til > 0) && (
            <VisualShareBar
              items={visualShareItems}
              totalTitle="খতিয়ানের হিস্যা বণ্টন চিত্র"
              digitLocale="bn"
              displayPrecision={displayPrecision}
            />
          )}
        </>
      ) : (
        <>
          <AreaShareTable
            totalLand={areaTotal}
            onTotalLandChange={setAreaTotal}
            owners={areaOwners}
            onOwnersChange={setAreaOwners}
            result={areaResult}
          />

          {areaResult.ok && areaVisualItems.length > 0 && (
            <VisualShareBar
              items={areaVisualItems}
              totalTitle="খতিয়ানের হিস্যা বণ্টন চিত্র"
              digitLocale="bn"
              displayPrecision={displayPrecision}
            />
          )}
        </>
      )}

      {/* Print Certificate Modal */}
      {isCertificateOpen && canExport && mode === 'ANA' && (
        <PrintCertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          division={divisionName}
          district={districtName}
          upazila={thanaName}
          mouza={mouzaName === '—' ? '' : mouzaName}
          jlNo={jlNo}
          khatianType={KHATIAN_TYPES.find((t) => t.id === khatianType)?.nameBn || khatianType}
          khatianNo={khatianNo}
          totalLand={totalLand}
          landUnit={landUnit}
          rows={owners.map((o, idx) => {
            const ownerLand = reconciledLandAmounts[idx] ?? '—';
            const ownerShare1000 =
              reconciledShares1000[idx] ?? get1000Based(o.ana, o.gonda, o.kora, o.kranti, o.til, displayPrecision);

            return {
              name: ownerLabel(o, idx),
              parentage: o.parentage || '',
              shareFraction: getFullShareDisplay(o.ana, o.gonda, o.kora, o.kranti, o.til),
              share1: reconciledShares1[idx] ?? '—',
              share1000: ownerShare1000,
              landAmount: ownerLand !== '—' && ownerLand !== null ? ownerLand : '—',
              remarks: o.parentage || '',
            };
          })}
          totalRow={{
            totalTraditional: summary.traditional,
            totalShare1: summary.total1,
            totalShare1000: summary.total1000,
            totalLand:
              formatDistributedLand(totalLandRational, summary.totalTil, displayPrecision) ?? '—',
          }}
        />
      )}

      {isCertificateOpen && canExport && mode === 'AREA' && (
        <PrintCertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          division={divisionName}
          district={districtName}
          upazila={thanaName}
          mouza={mouzaName === '—' ? '' : mouzaName}
          jlNo={jlNo}
          khatianType={KHATIAN_TYPES.find((t) => t.id === khatianType)?.nameBn || khatianType}
          khatianNo={khatianNo}
          totalLand={areaResult.totalLandText}
          landUnit="শতাংশ"
          rows={areaOwners.map((o, idx) => {
            const r = areaResult.rows[idx];
            return {
              name: ownerLabel(o, idx),
              parentage: '',
              shareFraction: r ? r.traditional : '—',
              share1: r ? r.share1 : '—',
              share1000: r ? r.share1000 : '—',
              landAmount: r && r.landText ? r.landText : '—',
              remarks: '',
            };
          })}
          totalRow={{
            totalTraditional: areaResult.totalTraditional,
            totalShare1: '১.০০০',
            totalShare1000: areaResult.total1000,
            totalLand: areaResult.totalLandText,
          }}
        />
      )}
    </div>
  );
};

export default HisyaConverter;