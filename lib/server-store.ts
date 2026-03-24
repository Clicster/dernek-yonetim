import { AppData, DEFAULT_KUR, AYLAR, PERIODLAR } from "./types";

const USE_SUPABASE = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

// Dosya tabanlı depolama (local geliştirme için)
let readFileSync: typeof import("fs").readFileSync;
let writeFileSync: typeof import("fs").writeFileSync;
let existsSync: typeof import("fs").existsSync;
let mkdirSync: typeof import("fs").mkdirSync;
let DATA_DIR: string;
let DATA_FILE: string;

if (!USE_SUPABASE) {
  const fs = require("fs");
  const path = require("path");
  readFileSync = fs.readFileSync;
  writeFileSync = fs.writeFileSync;
  existsSync = fs.existsSync;
  mkdirSync = fs.mkdirSync;
  DATA_DIR = path.join(process.cwd(), "data");
  DATA_FILE = path.join(DATA_DIR, "app-data.json");
}

const defaultDernekData = () => ({
  uyelikler: [],
  ikramiyeler: [],
  coinHarcamalar: [],
  ekstralar: [],
  yoneticiler: [],
  kurFiyatlari: { ...DEFAULT_KUR },
});

const defaultData: AppData = {
  chd: defaultDernekData(),
  treachery: defaultDernekData(),
  yonetimSure: [],
  konseySure: [],
  verifiedKullanicilar: [],
  kullaniciSifreleri: {},
};

function migrateData(raw: unknown): AppData {
  const data = raw as Record<string, Record<string, unknown>>;

  for (const key of ["chd", "treachery"] as const) {
    const dernek = data[key];
    if (!dernek) { data[key] = defaultDernekData(); continue; }

    // Eski cekilisler alanını kaldır (artık kullanılmıyor)
    delete dernek.cekilisler;

    // Eksik alanları ekle
    if (!dernek.uyelikler) dernek.uyelikler = [];
    if (!dernek.ikramiyeler) dernek.ikramiyeler = [];
    if (!dernek.coinHarcamalar) dernek.coinHarcamalar = [];
    if (!dernek.ekstralar) dernek.ekstralar = [];
    if (!dernek.yoneticiler) dernek.yoneticiler = [];
    if (!dernek.kurFiyatlari) dernek.kurFiyatlari = { ...DEFAULT_KUR };

    // Eski üyelik formatını temizle (kisiAdi, notlar vs artık yok)
    dernek.uyelikler = (dernek.uyelikler as Record<string, unknown>[]).map((u) => {
      if (u.uyelikTuru && typeof u.adet === "number") return u; // zaten yeni format
      // Eski format: dönüştür
      return {
        id: u.id ?? Date.now().toString(),
        tarih: u.tarih ?? "",
        uyelikTuru: "HC",
        adet: 1,
        coinMiktar: 0,
      };
    });

    // Yönetici migrasyonu (eski oda/calisma flat → aylar)
    dernek.yoneticiler = (dernek.yoneticiler as Record<string, unknown>[]).map((y) => {
      if (y.aylar) return y;
      const aylar = Object.fromEntries(
        AYLAR.map((ay) => [
          ay,
          {
            oda: Object.fromEntries(PERIODLAR.map((p) => [p, (y as Record<string, Record<string, number>>).oda?.[p] ?? 0])),
            calisma: Object.fromEntries(PERIODLAR.map((p) => [p, (y as Record<string, Record<string, number>>).calisma?.[p] ?? 0])),
          },
        ])
      );
      return { id: y.id, ad: y.ad, rol: y.rol, aylar };
    });
  }

  // Yeni alanları ekle (yoksa)
  if (!data.yonetimSure) (data as Record<string, unknown>).yonetimSure = [];
  if (!data.konseySure) (data as Record<string, unknown>).konseySure = [];
  if (!data.verifiedKullanicilar) (data as Record<string, unknown>).verifiedKullanicilar = [];

  return data as unknown as AppData;
}

export async function readData(): Promise<AppData> {
  if (USE_SUPABASE) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
      const { data } = await supabase.from("app_data").select("data").eq("id", "main").single();
      return data ? migrateData(data.data) : defaultData;
    } catch {
      return defaultData;
    }
  }
  try {
    if (!existsSync(DATA_FILE)) return defaultData;
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
    return migrateData(raw);
  } catch {
    return defaultData;
  }
}

export async function writeData(data: AppData): Promise<void> {
  if (USE_SUPABASE) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    await supabase.from("app_data").upsert({ id: "main", data });
    return;
  }
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}
