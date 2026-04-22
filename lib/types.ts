export const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;
export type Ay = (typeof AYLAR)[number];

// Periyot artık dinamik: admin panelden tanımlanır
export interface Periyot {
  baslangic: number; // 1–31
  bitis: number;     // 1–31
}

// Periyot anahtarı: "baslangic-bitis" (örn. "1-7")
export function periyotKey(p: Periyot): string {
  return `${p.baslangic}-${p.bitis}`;
}

// Bir gün numarasının hangi periyoda düştüğünü döndür
export function gundenPeriyotKey(gun: number, periyotlar: Periyot[]): string | null {
  const p = periyotlar.find((x) => gun >= x.baslangic && gun <= x.bitis);
  return p ? periyotKey(p) : null;
}

export interface AylikVeri {
  oda: Record<string, number>;
  calisma: Record<string, number>;
}

export interface SureKisi {
  id: string;
  ad: string;
  rol: string;
  habboismi: string;
  aylar: Record<Ay, AylikVeri>;
}

export interface AppData {
  periyotlar: Periyot[];
  yonetimSure: SureKisi[];
  konseySure: SureKisi[];
  verifiedKullanicilar: string[];
  kullaniciSifreleri: Record<string, string>;
}

// Varsayılan periyotlar (eski sabit yapıdan geçiş için)
export const DEFAULT_PERIYOTLAR: Periyot[] = [
  { baslangic: 1, bitis: 7 },
  { baslangic: 8, bitis: 14 },
  { baslangic: 15, bitis: 21 },
  { baslangic: 22, bitis: 28 },
  { baslangic: 29, bitis: 31 },
];
