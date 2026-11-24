// src/data/mouza-data.ts
import {
  KURIGRAM_SADAR_MOUZAS,
  ULIPUR_MOUZAS,
  PHULBARI_MOUZAS,
  BHURUNGAMARI_MOUZAS,
  NAGESHWARI_MOUZAS,
  CHILMARI_MOUZAS,
  RAOMARI_MOUZAS,
  RAJARHAT_MOUZAS,
  RAJIBPUR_MOUZAS,
  OfficialMouza,
} from './kurigram-mouza-database';

export interface Mouza {
  readonly id: string;
  readonly nameBn: string;
  readonly jlNo: string;
  readonly khatianNumbers?: readonly string[];
}

const mapOfficialToMouza = (list: readonly OfficialMouza[]): readonly Mouza[] => {
  return list.map((m) => ({
    id: m.id,
    nameBn: m.nameBn,
    jlNo: m.jlNo,
    khatianNumbers: [], // Free manual entry
  }));
};

export const MOUZA_DATA: Record<string, readonly Mouza[]> = {
  // Kurigram District — All 9 Official Upazilas (687 official mouzas from Deputy Commissioner's Office, Kurigram)
  'rangpur-kurigram-kurigram-sadar': mapOfficialToMouza(KURIGRAM_SADAR_MOUZAS),
  'rangpur-kurigram-ulipur': mapOfficialToMouza(ULIPUR_MOUZAS),
  'rangpur-kurigram-phulbari': mapOfficialToMouza(PHULBARI_MOUZAS),
  'rangpur-kurigram-bhurungamari': mapOfficialToMouza(BHURUNGAMARI_MOUZAS),
  'rangpur-kurigram-nageshwari': mapOfficialToMouza(NAGESHWARI_MOUZAS),
  'rangpur-kurigram-chilmari': mapOfficialToMouza(CHILMARI_MOUZAS),
  'rangpur-kurigram-raomari': mapOfficialToMouza(RAOMARI_MOUZAS),
  'rangpur-kurigram-rajarhat': mapOfficialToMouza(RAJARHAT_MOUZAS),
  'rangpur-kurigram-char-rajibpur': mapOfficialToMouza(RAJIBPUR_MOUZAS),
  'rangpur-kurigram-rajibpur': mapOfficialToMouza(RAJIBPUR_MOUZAS),

  // Other samples
  'dhaka-dhaka-district-savar': [
    {
      id: 'aminbazar',
      nameBn: 'আমিনবাজার',
      jlNo: '১০২',
    },
    {
      id: 'birulia',
      nameBn: 'বিরুলিয়া',
      jlNo: '৮৯',
    },
  ],
};

export const MOUZA_DATABASE = MOUZA_DATA;

export const getMouzasByUpazila = (
  divisionId: string,
  districtId: string,
  upazilaId: string
): readonly Mouza[] => {
  const key = `${divisionId}-${districtId}-${upazilaId}`;
  return MOUZA_DATA[key] ?? [];
};
