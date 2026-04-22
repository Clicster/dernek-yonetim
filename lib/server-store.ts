import { AppData, AYLAR, DEFAULT_PERIYOTLAR } from "./types";

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

const defaultData: AppData = {
  periyotlar: DEFAULT_PERIYOTLAR,
  yonetimSure: [],
  konseySure: [],
  verifiedKullanicilar: [],
  kullaniciSifreleri: {},
};

function migrateData(raw: unknown): AppData {
  const data = raw as Record<string, unknown>;

  // Eski dernek alanlarını kaldır
  delete data.chd;
  delete data.treachery;

  // Periyotlar yoksa veya geçersizse varsayılanları ekle
  if (!Array.isArray(data.periyotlar)) data.periyotlar = DEFAULT_PERIYOTLAR;

  // Sure kişi migrasyon (eski oda/calisma flat → aylar)
  for (const key of ["yonetimSure", "konseySure"] as const) {
    if (!data[key]) { data[key] = []; continue; }
    data[key] = ((data[key] as Record<string, unknown>[]) ?? []).map((y) => {
      if (y.aylar) return y;
      // Eski düz format → aylı formata çevir
      const aylar = Object.fromEntries(
        AYLAR.map((ay) => [
          ay,
          { oda: {}, calisma: {} },
        ])
      );
      return { id: y.id, ad: y.ad, rol: y.rol, habboismi: y.habboismi ?? "", aylar };
    });
  }

  if (!data.verifiedKullanicilar) data.verifiedKullanicilar = [];
  if (!data.kullaniciSifreleri) data.kullaniciSifreleri = {};

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
