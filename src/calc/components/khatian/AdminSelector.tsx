// src/components/khatian/AdminSelector.tsx
import React, { useMemo } from 'react';
import {
  BANGLADESH_GEO,
  getDistrictsByDivision,
  getUpazilasByDistrict,
} from '../../data/bangladesh-geo';
import { getMouzasByUpazila } from '../../data/mouza-data';
import { toBengaliDigits } from '@shared';

export interface AdminSelectorProps {
  divisionId: string;
  districtId: string;
  upazilaId: string;
  khatianType: 'CS' | 'SA' | 'RS' | 'BS';
  mouzaId: string;
  khatianNo: string;
  onDivisionChange: (id: string) => void;
  onDistrictChange: (id: string) => void;
  onUpazilaChange: (id: string) => void;
  onKhatianTypeChange: (type: 'CS' | 'SA' | 'RS' | 'BS') => void;
  onMouzaChange: (id: string) => void;
  onKhatianNoChange: (no: string) => void;
}

export const AdminSelector: React.FC<AdminSelectorProps> = ({
  divisionId = '',
  districtId = '',
  upazilaId = '',
  khatianType = 'CS',
  mouzaId = '',
  khatianNo = '',
  onDivisionChange,
  onDistrictChange,
  onUpazilaChange,
  onKhatianTypeChange,
  onMouzaChange,
  onKhatianNoChange,
}) => {
  const districts = useMemo(
    () => (divisionId ? getDistrictsByDivision(divisionId) : []),
    [divisionId]
  );
  const upazilas = useMemo(
    () => (divisionId && districtId ? getUpazilasByDistrict(divisionId, districtId) : []),
    [divisionId, districtId]
  );
  const mouzas = useMemo(
    () =>
      divisionId && districtId && upazilaId
        ? getMouzasByUpazila(divisionId, districtId, upazilaId)
        : [],
    [divisionId, districtId, upazilaId]
  );

  // ওপরের ঘর বদলালে নিচের সব ঘর ফাঁকা হবে
  const handleDivisionChange = (newDiv: string) => {
    onDivisionChange(newDiv);
    onDistrictChange('');
    onUpazilaChange('');
    onMouzaChange('');
    onKhatianNoChange('');
  };

  const handleDistrictChange = (newDist: string) => {
    onDistrictChange(newDist);
    onUpazilaChange('');
    onMouzaChange('');
    onKhatianNoChange('');
  };

  const handleUpazilaChange = (newUpazila: string) => {
    onUpazilaChange(newUpazila);
    onMouzaChange('');
    onKhatianNoChange('');
  };

  const handleMouzaChange = (newMouzaId: string) => {
    onMouzaChange(newMouzaId);
  };

  const selectClass =
    'w-full px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 cursor-pointer text-left shadow-2xs';

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* ১. বিভাগ */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 text-left">
            বিভাগ
          </label>
          <select
            value={divisionId}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className={selectClass}
          >
            <option value="">— নির্বাচন করুন —</option>
            {BANGLADESH_GEO.map((div) => (
              <option key={div.id} value={div.id}>
                {div.nameBn}
              </option>
            ))}
          </select>
        </div>

        {/* ২. জেলা */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 text-left">
            জেলা
          </label>
          <select
            value={districtId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className={selectClass}
            disabled={!divisionId}
          >
            <option value="">— নির্বাচন করুন —</option>
            {districts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.nameBn}
              </option>
            ))}
          </select>
        </div>

        {/* ৩. উপজেলা/থানা */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 text-left">
            উপজেলা/থানা
          </label>
          <select
            value={upazilaId}
            onChange={(e) => handleUpazilaChange(e.target.value)}
            className={selectClass}
            disabled={!districtId}
          >
            <option value="">— নির্বাচন করুন —</option>
            {upazilas.map((upz) => (
              <option key={upz.id} value={upz.id}>
                {upz.nameBn}
              </option>
            ))}
          </select>
        </div>

        {/* ৪. খতিয়ানের ধরণ */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 text-left">
            খতিয়ানের ধরণ
          </label>
          <select
            value={khatianType}
            onChange={(e) =>
              onKhatianTypeChange(e.target.value as 'CS' | 'SA' | 'RS' | 'BS')
            }
            className={selectClass}
          >
            <option value="CS">সি. এস. (CS)</option>
            <option value="SA">এস. এ. (SA)</option>
            <option value="RS">আর. এস. (RS)</option>
            <option value="BS">বি. এস. (BS)</option>
          </select>
        </div>

        {/* ৫. মৌজা */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 text-left">
            মৌজা
          </label>
          <select
            value={mouzaId}
            onChange={(e) => handleMouzaChange(e.target.value)}
            className={selectClass}
            disabled={!upazilaId}
          >
            <option value="">— মৌজা নির্বাচন করুন —</option>
            {mouzas.map((mouza) => (
              <option key={mouza.id} value={mouza.id}>
                {mouza.nameBn} (জে.এল {toBengaliDigits(mouza.jlNo)})
              </option>
            ))}
          </select>
        </div>

        {/* ৬. খতিয়ান নম্বর */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 text-left">
            খতিয়ান নম্বর
          </label>
          <input
            type="text"
            value={khatianNo}
            onChange={(e) => onKhatianNoChange(e.target.value)}
            placeholder="যেমন: ৪৪১ বা ১২১"
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-300 bg-white text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 font-mono-num tabular-nums text-left shadow-2xs"
            title="খতিয়ান নম্বর লিখুন (যেমন: ৪৪১)"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSelector;