export const UYELIK_TURLERI = ["HC", "PA", "VIP", "DC SM"] as const;
export type UyelikTuru = (typeof UYELIK_TURLERI)[number];

export interface KurFiyatlari {
  HC: number;
  PA: number;
  VIP: number;
  "DC SM": number;
}

export const DEFAULT_KUR: KurFiyatlari = { HC: 0, PA: 0, VIP: 0, "DC SM": 0 };

export interface Uyelik {
  id: string;
  tarih: string;
  uyelikTuru: UyelikTuru;
  adet: number;
  coinMiktar: number; // adet × kur fiyatı
}

export interface Ikramiye {
  id: string;
  tarih: string;
  isim: string;
  kredi: number;
  carpan: number;
  yonetici: string;
  coinMiktar: number; // kredi × carpan
}

export interface CoinHarcama {
  id: string;
  tarih: string;
  miktar: number;
  aciklama: string;
  kategori: string;
}

export interface Ekstra {
  id: string;
  tarih: string;
  aciklama: string;
  coinMiktar: number;
}

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

export interface Yonetici {
  id: string;
  ad: string;
  rol: string;
  aylar: Record<Ay, AylikVeri>;
}

export interface DernekData {
  uyelikler: Uyelik[];
  ikramiyeler: Ikramiye[];
  coinHarcamalar: CoinHarcama[];
  ekstralar: Ekstra[];
  yoneticiler: Yonetici[];
  kurFiyatlari: KurFiyatlari;
}

export interface AppData {
  chd: DernekData;
  treachery: DernekData;
}

export type DernekKey = "chd" | "treachery";

export function gundenPeriod(gun: number): Period {
  if (gun <= 7) return "1-7";
  if (gun <= 14) return "8-14";
  if (gun <= 21) return "15-21";
  if (gun <= 28) return "22-28";
  return "28-31";
}
