export interface Member {
  id: string;
  nome_civil: string;
  nome_praxe: string;
  ano_entrada: number | null;
  patrao_id: string | null;
  tipo: string;
  status?: "pending" | "active";
  photoUrl?: string;
  uid?: string; // Firebase Auth UID
  manualShiftX?: number; // in slots (e.g., -1, 0, 1)
  manualExtension?: number; // in pixels
  curso_faina?: string;
  curso_atual?: string;
  bannerUrl?: string;
  order?: number;
  avatar?: AvatarConfig;
}

export interface AvatarConfig {
  skinIndex: number;
  mouthIndex: number;
  beardIndex: number; // 0 is none
  beardColor: string;
  glassesIndex: number; // 0 is none
  glassesColor: string;
  hairIndex: number; // 0 is none
  hairColor: string;
  clothingType: 'male' | 'female';
  isFirstYear: boolean;
  hasWhiteNet?: boolean;
}
