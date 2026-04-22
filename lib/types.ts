export const PERIODLAR = ["1-7", "8-14", "15-21", "22-28", "28-31"] as const;
export type Period = (typeof PERIODLAR)[number];

export const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;
export type Ay = (typeof AYLAR)[number];

export interface AylikVeri {
  oda: Record<Period, number>;
  calisma: Record<Period, number>;
}

export interface SureKisi {
  id: string;
  ad: string;
  rol: string;
  habboismi: string;
  aylar: Record<Ay, AylikVeri>;
}

export interface AppData {
  yonetimSure: SureKisi[];
  konseySure: SureKisi[];
  verifiedKullanicilar: string[];
  kullaniciSifreleri: Record<string, string>;
}

export function gundenPeriod(gun: number): Period {
  if (gun <= 7) return "1-7";
  if (gun <= 14) return "8-14";
  if (gun <= 21) return "15-21";
  if (gun <= 28) return "22-28";
  return "28-31";
}
