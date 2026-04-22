"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getData, saveData, emptyAylar } from "@/lib/store";
import {
  AppData, Ay, AYLAR, Period, PERIODLAR, SureKisi, gundenPeriod,
} from "@/lib/types";
import { useAy } from "@/lib/ay-context";

// AylikVeri tipi import için
import type { AylikVeri } from "@/lib/types";

type MainTab = "yonetim" | "konsey";
type SureModal = "sure-ekle" | "sure-kisi-ekle" | "sure-kisi-duzenle" | null;

function fmtSure(saniye: number): string {
  const s = Math.floor(saniye);
  const saat = Math.floor(s / 3600);
  const dk = Math.floor((s % 3600) / 60);
  const sn = s % 60;
  return `${String(saat).padStart(2, "0")}:${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

function hmsToSaniye(saat: number, dk: number, sn: number): number {
  return saat * 3600 + dk * 60 + sn;
}

// Tüm eşleşen kişilerde süreyi senkronize et (yonetim + konsey)
function syncHabboismi(data: AppData, habboismi: string, aylar: Record<Ay, AylikVeri>): AppData {
  if (!habboismi) return data;
  const updated = { ...data };
  updated.yonetimSure = updated.yonetimSure.map((k) => k.habboismi === habboismi ? { ...k, aylar } : k);
  updated.konseySure = updated.konseySure.map((k) => k.habboismi === habboismi ? { ...k, aylar } : k);
  return updated;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("yonetim");

  // Süre (Yönetim/Konsey) modalleri
  const [sureModal, setSureModal] = useState<SureModal>(null);
  const [sureHedefKisi, setSureHedefKisi] = useState<SureKisi | null>(null);
  const [editKisi, setEditKisi] = useState<SureKisi | null>(null);

  const [saved, setSaved] = useState(false);
  const { ay: secilenAy, setAy } = useAy();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u: { username: null | string; canSeeAdmin?: boolean }) => {
        if (!u.username || !u.canSeeAdmin) router.replace("/giris");
      });
    getData().then(setData);
  }, [router]);

  if (!data) return null;

  const save = async (updated: AppData) => {
    setData(updated);
    await saveData(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const removeKisi = async (id: string, tip: "yonetim" | "konsey") => {
    const u = { ...data };
    if (tip === "yonetim") u.yonetimSure = u.yonetimSure.filter((x) => x.id !== id);
    else u.konseySure = u.konseySure.filter((x) => x.id !== id);
    await save(u);
  };

  const aktifKisiler = mainTab === "yonetim" ? (data.yonetimSure ?? []) : (data.konseySure ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
          <p className="text-gray-400 text-sm">Süre verilerini yönet</p>
        </div>
        {saved && (
          <span className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">Kaydedildi</span>
        )}
      </div>

      {/* Ana Sekme */}
      <div className="flex gap-2">
        {(["yonetim", "konsey"] as MainTab[]).map((t) => (
          <button key={t} onClick={() => setMainTab(t)}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
              mainTab === t
                ? t === "yonetim" ? "bg-emerald-600 text-white" : "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}>
            {t === "yonetim" ? "Yönetim Süre" : "Konsey Süre"}
          </button>
        ))}
      </div>

      {/* ─── YÖNETİM SÜRE / KONSEY SÜRE BÖLÜMÜ ─── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-wrap gap-2">
          <h2 className="text-white font-semibold flex items-center gap-2">
            {mainTab === "yonetim" ? "Yönetim Süre" : "Konsey Süre"}
            <span className="text-gray-500 text-sm font-normal">— {secilenAy}</span>
          </h2>
          <div className="flex items-center gap-2">
            <select value={secilenAy} onChange={(e) => setAy(e.target.value as Ay)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
              {AYLAR.map((ay) => <option key={ay} value={ay}>{ay}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="px-4 py-2">Ad</th><th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2">Habbo</th>
                {PERIODLAR.map((p) => (
                  <th key={`o-${p}`} className="px-3 py-2 text-center whitespace-nowrap text-xs">
                    {p}<br /><span className="text-blue-500">Oda</span>
                  </th>
                ))}
                {PERIODLAR.map((p) => (
                  <th key={`c-${p}`} className="px-3 py-2 text-center whitespace-nowrap text-xs">
                    {p}<br /><span className={mainTab === "yonetim" ? "text-green-500" : "text-purple-500"}>Çalışma</span>
                  </th>
                ))}
                <th className="px-4 py-2 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {aktifKisiler.map((k) => {
                const ay = k.aylar?.[secilenAy] ?? { oda: {}, calisma: {} };
                return (
                  <tr key={k.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2 text-gray-200 font-medium whitespace-nowrap">{k.ad}</td>
                    <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{k.rol}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{k.habboismi}</td>
                    {PERIODLAR.map((p) => (
                      <td key={`o-${p}`} className="px-3 py-2 text-center text-blue-400 font-mono text-xs tabular-nums whitespace-nowrap">
                        {fmtSure((ay.oda as Record<Period, number>)[p] ?? 0)}
                      </td>
                    ))}
                    {PERIODLAR.map((p) => (
                      <td key={`c-${p}`} className={`px-3 py-2 text-center font-mono text-xs tabular-nums whitespace-nowrap ${mainTab === "yonetim" ? "text-green-400" : "text-purple-400"}`}>
                        {fmtSure((ay.calisma as Record<Period, number>)[p] ?? 0)}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => { setSureHedefKisi(k); setSureModal("sure-ekle"); }}
                          className="text-emerald-500 hover:text-emerald-400 text-xs whitespace-nowrap">Süre Ekle</button>
                        <button onClick={() => { setEditKisi(k); setSureModal("sure-kisi-duzenle"); }}
                          className="text-blue-500 hover:text-blue-400 text-xs">Düzenle</button>
                        <button onClick={() => removeKisi(k.id, mainTab === "yonetim" ? "yonetim" : "konsey")}
                          className="text-red-500 hover:text-red-400 text-xs">Sil</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {aktifKisiler.length === 0 && <EmptyRow cols={3 + PERIODLAR.length * 2 + 1} />}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end -mt-4">
        <button onClick={() => { setEditKisi(null); setSureModal("sure-kisi-ekle"); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${mainTab === "yonetim" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-purple-600 hover:bg-purple-700"}`}>
          + Kişi Ekle
        </button>
      </div>

      {/* Süre kişi ekle */}
      {sureModal === "sure-kisi-ekle" && (
        <SureKisiEkleModal onClose={() => setSureModal(null)}
          onSave={async (kisi) => {
            const u = { ...data };
            if (mainTab === "yonetim") u.yonetimSure = [...u.yonetimSure, kisi];
            else u.konseySure = [...u.konseySure, kisi];
            await save(u); setSureModal(null);
          }} />
      )}
      {/* Süre kişi düzenle */}
      {sureModal === "sure-kisi-duzenle" && editKisi && (
        <SureKisiDuzenleModal kisi={editKisi} onClose={() => { setSureModal(null); setEditKisi(null); }}
          onSave={async (kisi) => {
            const u = { ...data };
            if (mainTab === "yonetim") u.yonetimSure = u.yonetimSure.map((k) => k.id === kisi.id ? kisi : k);
            else u.konseySure = u.konseySure.map((k) => k.id === kisi.id ? kisi : k);
            await save(u); setSureModal(null); setEditKisi(null);
          }} />
      )}
      {/* Süre gir */}
      {sureModal === "sure-ekle" && sureHedefKisi && (
        <SureKisiGirModal kisi={sureHedefKisi} varsayilanAy={secilenAy}
          onClose={() => { setSureModal(null); setSureHedefKisi(null); }}
          onSave={async (guncelK) => {
            let u = { ...data };
            if (mainTab === "yonetim") u.yonetimSure = u.yonetimSure.map((k) => k.id === guncelK.id ? guncelK : k);
            else u.konseySure = u.konseySure.map((k) => k.id === guncelK.id ? guncelK : k);
            // Senkronizasyon
            if (guncelK.habboismi) u = syncHabboismi(u, guncelK.habboismi, guncelK.aylar);
            await save(u); setSureModal(null); setSureHedefKisi(null);
          }} />
      )}
    </div>
  );
}

// ─── Yardımcı ─────────────────────────────────────────────────────────────────

function EmptyRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className="px-4 py-8 text-center text-gray-600">Kayıt bulunamadı</td></tr>;
}

function ModalWrapper({ title, onClose, children, maxW = "max-w-lg" }: { title: string; onClose: () => void; children: React.ReactNode; maxW?: string }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full ${maxW} my-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", required, defaultValue }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string | number }) {
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      <input type={type} name={name} required={required} defaultValue={defaultValue}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
    </div>
  );
}

function SureInput({ value, onChange }: { value: number; onChange: (s: number) => void }) {
  const saat = Math.floor(value / 3600);
  const dk = Math.floor((value % 3600) / 60);
  const sn = value % 60;
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <label className="block text-gray-500 text-xs mb-1 text-center">Saat</label>
        <input type="number" min={0} max={999} value={saat}
          onChange={(e) => onChange(hmsToSaniye(Number(e.target.value), dk, sn))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-indigo-500" />
      </div>
      <span className="text-gray-500 text-lg font-bold mt-4">:</span>
      <div className="flex-1">
        <label className="block text-gray-500 text-xs mb-1 text-center">Dakika</label>
        <input type="number" min={0} max={59} value={dk}
          onChange={(e) => onChange(hmsToSaniye(saat, Number(e.target.value), sn))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-indigo-500" />
      </div>
      <span className="text-gray-500 text-lg font-bold mt-4">:</span>
      <div className="flex-1">
        <label className="block text-gray-500 text-xs mb-1 text-center">Saniye</label>
        <input type="number" min={0} max={59} value={sn}
          onChange={(e) => onChange(hmsToSaniye(saat, dk, Number(e.target.value)))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-indigo-500" />
      </div>
    </div>
  );
}

// ─── Süre Kişi Ekle / Düzenle ─────────────────────────────────────────────────

function SureKisiEkleModal({ onClose, onSave }: { onClose: () => void; onSave: (k: SureKisi) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({ id: Date.now().toString() + Math.random().toString(36).slice(2), ad: f.get("ad") as string, rol: f.get("rol") as string, habboismi: f.get("habboismi") as string, aylar: emptyAylar() });
  };
  return (
    <ModalWrapper title="Kişi Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Ad Soyad" name="ad" required />
        <InputField label="Habbo Kullanıcı Adı" name="habboismi" required />
        <div>
          <label className="block text-gray-400 text-sm mb-1">Rol</label>
          <select name="rol" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option>Başkan</option><option>Lider</option><option>Moderatör</option><option>Yardımcı</option><option>Üye</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">Ekle</button>
      </form>
    </ModalWrapper>
  );
}

function SureKisiDuzenleModal({ kisi, onClose, onSave }: { kisi: SureKisi; onClose: () => void; onSave: (k: SureKisi) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({ ...kisi, ad: f.get("ad") as string, rol: f.get("rol") as string, habboismi: f.get("habboismi") as string });
  };
  return (
    <ModalWrapper title="Kişi Düzenle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Ad Soyad" name="ad" required defaultValue={kisi.ad} />
        <InputField label="Habbo Kullanıcı Adı" name="habboismi" required defaultValue={kisi.habboismi} />
        <div>
          <label className="block text-gray-400 text-sm mb-1">Rol</label>
          <select name="rol" defaultValue={kisi.rol} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option>Başkan</option><option>Lider</option><option>Moderatör</option><option>Yardımcı</option><option>Üye</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">Güncelle</button>
      </form>
    </ModalWrapper>
  );
}

// ─── Süre Giriş Modalı (SureKisi) ─────────────────────────────────────────────

function SureKisiGirModal({ kisi, varsayilanAy, onClose, onSave }: { kisi: SureKisi; varsayilanAy: Ay; onClose: () => void; onSave: (k: SureKisi) => void }) {
  const [ay, setAyState] = useState<Ay>(varsayilanAy);
  const [tur, setTur] = useState<"oda" | "calisma">("oda");
  const [girisMode, setGirisMode] = useState<"gun" | "periyot">("periyot");
  const [gun, setGun] = useState<number>(1);
  const [periyot, setPeriyot] = useState<Period>("1-7");
  const [sure, setSure] = useState<number>(0);
  const [islem, setIslem] = useState<"ekle" | "ayarla">("ekle");
  const seciliPeriyot = girisMode === "gun" ? gundenPeriod(gun) : periyot;
  const mevcutSure = kisi.aylar?.[ay]?.[tur]?.[seciliPeriyot] ?? 0;
  const handleSave = () => {
    if (sure === 0 && islem === "ekle") return;
    const guncelKisi = { ...kisi };
    if (!guncelKisi.aylar) guncelKisi.aylar = emptyAylar();
    if (!guncelKisi.aylar[ay]) guncelKisi.aylar[ay] = { oda: Object.fromEntries(PERIODLAR.map((p) => [p, 0])) as Record<Period, number>, calisma: Object.fromEntries(PERIODLAR.map((p) => [p, 0])) as Record<Period, number> };
    const mevcut = guncelKisi.aylar[ay][tur][seciliPeriyot] ?? 0;
    guncelKisi.aylar[ay][tur][seciliPeriyot] = islem === "ekle" ? mevcut + sure : sure;
    onSave(guncelKisi);
  };
  return <SureGirModalUI title={`Süre Gir — ${kisi.ad}`} ay={ay} setAy={setAyState} tur={tur} setTur={setTur} girisMode={girisMode} setGirisMode={setGirisMode} gun={gun} setGun={setGun} periyot={periyot} setPeriyot={setPeriyot} seciliPeriyot={seciliPeriyot} mevcutSure={mevcutSure} sure={sure} setSure={setSure} islem={islem} setIslem={setIslem} onClose={onClose} onSave={handleSave} />;
}

// ─── Ortak Süre Giriş UI ──────────────────────────────────────────────────────

function SureGirModalUI({ title, ay, setAy, tur, setTur, girisMode, setGirisMode, gun, setGun, periyot, setPeriyot, seciliPeriyot, mevcutSure, sure, setSure, islem, setIslem, onClose, onSave }: {
  title: string; ay: Ay; setAy: (a: Ay) => void; tur: "oda" | "calisma"; setTur: (t: "oda" | "calisma") => void;
  girisMode: "gun" | "periyot"; setGirisMode: (m: "gun" | "periyot") => void; gun: number; setGun: (g: number) => void;
  periyot: Period; setPeriyot: (p: Period) => void; seciliPeriyot: Period; mevcutSure: number;
  sure: number; setSure: (s: number) => void; islem: "ekle" | "ayarla"; setIslem: (i: "ekle" | "ayarla") => void;
  onClose: () => void; onSave: () => void;
}) {
  return (
    <ModalWrapper title={title} onClose={onClose} maxW="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Ay</label>
          <div className="grid grid-cols-4 gap-1.5">
            {AYLAR.map((a) => (
              <button key={a} onClick={() => setAy(a)} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${ay === a ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>{a.slice(0, 3)}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTur("oda")} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${tur === "oda" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>Oda</button>
          <button onClick={() => setTur("calisma")} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${tur === "calisma" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>Çalışma</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setGirisMode("periyot")} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${girisMode === "periyot" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>Periyot Seç</button>
          <button onClick={() => setGirisMode("gun")} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${girisMode === "gun" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>Gün Gir</button>
        </div>
        {girisMode === "periyot" ? (
          <div>
            <label className="block text-gray-400 text-sm mb-1">Periyot</label>
            <div className="flex gap-2">
              {PERIODLAR.map((p) => (
                <button key={p} onClick={() => setPeriyot(p)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${periyot === p ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>{p}</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-gray-400 text-sm mb-1">Gün <span className="text-gray-600">(otomatik periyot: <span className="text-indigo-400">{seciliPeriyot}</span>)</span></label>
            <input type="number" min={1} max={31} value={gun} onChange={(e) => setGun(Math.min(31, Math.max(1, Number(e.target.value))))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        )}
        <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-gray-500 text-xs">Mevcut ({ay} / {seciliPeriyot} / {tur === "oda" ? "Oda" : "Çalışma"})</span>
          <span className={`font-mono text-sm font-bold ${tur === "oda" ? "text-blue-400" : "text-green-400"}`}>{fmtSure(mevcutSure)}</span>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-2">Süre</label>
          <SureInput value={sure} onChange={setSure} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIslem("ekle")} className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${islem === "ekle" ? "bg-emerald-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>+ Üstüne Ekle</button>
          <button onClick={() => setIslem("ayarla")} className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${islem === "ayarla" ? "bg-orange-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>= Değeri Ayarla</button>
        </div>
        {sure > 0 && (
          <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-gray-500 text-xs">Kaydedilecek değer</span>
            <span className={`font-mono text-sm font-bold ${tur === "oda" ? "text-blue-400" : "text-green-400"}`}>{fmtSure(islem === "ekle" ? mevcutSure + sure : sure)}</span>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">İptal</button>
          <button onClick={onSave} disabled={sure === 0 && islem === "ekle"} className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium text-sm transition-colors">Kaydet</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
