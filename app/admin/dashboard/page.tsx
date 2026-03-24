"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getData, isAuthenticated, saveData, emptyAylar } from "@/lib/store";
import {
  AppData, Ay, AYLAR, CoinHarcama, DEFAULT_KUR, DernekKey,
  Ekstra, Ikramiye, KurFiyatlari, Period, PERIODLAR, UYELIK_TURLERI,
  Uyelik, UyelikTuru, Yonetici, gundenPeriod,
} from "@/lib/types";
import { useAy } from "@/lib/ay-context";

type Section = "uyelikler" | "ikramiyeler" | "ekstralar" | "coinler" | "yoneticiler" | "ayarlar";

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

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<DernekKey>("chd");
  const [activeSection, setActiveSection] = useState<Section>("uyelikler");
  const [modal, setModal] = useState<"uyelik" | "ikramiye" | "ekstra" | "yonetici-edit" | "sure-gir" | null>(null);
  const [editYonetici, setEditYonetici] = useState<Yonetici | null>(null);
  const [sureHedefYonetici, setSureHedefYonetici] = useState<Yonetici | null>(null);
  const [saved, setSaved] = useState(false);

  const { ay: secilenAy, setAy, ayIndex, yil } = useAy();

  const ayFiltre = (tarih: string) => {
    const [y, m] = tarih.split("-").map(Number);
    return y === yil && m === ayIndex + 1;
  };

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin"); return; }
    getData().then(setData);
  }, [router]);

  if (!data) return null;

  const save = async (updated: AppData) => {
    setData(updated);
    await saveData(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const d = data[activeTab];
  const color = activeTab === "chd" ? "blue" : "red";
  const btnColor = color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700";

  const uyelikler = d.uyelikler.filter((u) => ayFiltre(u.tarih));
  const ikramiyeler = d.ikramiyeler.filter((i) => ayFiltre(i.tarih));
  const ekstralar = (d.ekstralar ?? []).filter((e) => ayFiltre(e.tarih));
  const coinler = d.coinHarcamalar.filter((c) => ayFiltre(c.tarih));
  const kur = d.kurFiyatlari ?? { ...DEFAULT_KUR };

  const removeUyelik = async (id: string) => {
    const updated = { ...data };
    updated[activeTab].uyelikler = updated[activeTab].uyelikler.filter((x) => x.id !== id);
    updated[activeTab].coinHarcamalar = updated[activeTab].coinHarcamalar.filter((x) => x.id !== id + "c");
    await save(updated);
  };
  const removeIkramiye = async (id: string) => {
    const updated = { ...data };
    updated[activeTab].ikramiyeler = updated[activeTab].ikramiyeler.filter((x) => x.id !== id);
    updated[activeTab].coinHarcamalar = updated[activeTab].coinHarcamalar.filter((x) => x.id !== id + "c");
    await save(updated);
  };
  const removeCoin = async (id: string) => {
    const updated = { ...data };
    updated[activeTab].coinHarcamalar = updated[activeTab].coinHarcamalar.filter((x) => x.id !== id);
    await save(updated);
  };
  const removeEkstra = async (id: string) => {
    const updated = { ...data };
    updated[activeTab].ekstralar = (updated[activeTab].ekstralar ?? []).filter((x) => x.id !== id);
    updated[activeTab].coinHarcamalar = updated[activeTab].coinHarcamalar.filter((x) => x.id !== id + "c");
    await save(updated);
  };
  const removeYonetici = async (id: string) => {
    const updated = { ...data };
    updated[activeTab].yoneticiler = updated[activeTab].yoneticiler.filter((x) => x.id !== id);
    await save(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
          <p className="text-gray-400 text-sm">Dernek verilerini yönet</p>
        </div>
        {saved && (
          <span className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
            Kaydedildi
          </span>
        )}
      </div>

      {/* Dernek Seçici */}
      <div className="flex gap-2">
        {(["chd", "treachery"] as DernekKey[]).map((key) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === key
                ? key === "chd" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}>
            {key === "chd" ? "CHD" : "Treachery"}
          </button>
        ))}
      </div>

      {/* Bölüm Seçici */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 flex-wrap">
        {(["uyelikler", "ikramiyeler", "ekstralar", "coinler", "yoneticiler", "ayarlar"] as Section[]).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === s
                ? color === "blue" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}>
            {s === "uyelikler" ? "Üyelikler" : s === "ikramiyeler" ? "İkramiyeler" : s === "ekstralar" ? "Ekstralar" : s === "coinler" ? "Coin Raporu" : s === "yoneticiler" ? "Yöneticiler" : "Ayarlar"}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-wrap gap-2">
          <h2 className="text-white font-semibold flex items-center gap-2">
            {activeSection === "uyelikler" ? "Üyelikler" : activeSection === "ikramiyeler" ? "İkramiyeler" : activeSection === "ekstralar" ? "Ekstralar" : activeSection === "coinler" ? "Coin Raporu" : activeSection === "yoneticiler" ? "Yöneticiler" : "Ayarlar"}
            {(activeSection === "uyelikler" || activeSection === "ikramiyeler" || activeSection === "ekstralar" || activeSection === "coinler") && (
              <span className="text-gray-500 text-sm font-normal">— {secilenAy}</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {activeSection === "yoneticiler" && (
              <select value={secilenAy} onChange={(e) => setAy(e.target.value as Ay)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                {AYLAR.map((ay) => <option key={ay} value={ay}>{ay}</option>)}
              </select>
            )}
            {(activeSection === "uyelikler" || activeSection === "ikramiyeler" || activeSection === "ekstralar") && (
              <button
                onClick={() => setModal(activeSection === "uyelikler" ? "uyelik" : activeSection === "ikramiyeler" ? "ikramiye" : "ekstra")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${btnColor}`}>
                + Ekle
              </button>
            )}
          </div>
        </div>

        {/* Üyelikler */}
        {activeSection === "uyelikler" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="px-4 py-2">Tarih</th>
                <th className="px-4 py-2">Tür</th>
                <th className="px-4 py-2 text-center">Adet</th>
                <th className="px-4 py-2 text-right">Kur</th>
                <th className="px-4 py-2 text-right">Coin</th>
                <th className="px-4 py-2"></th>
              </tr></thead>
              <tbody>
                {uyelikler.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2 text-gray-300">{u.tarih}</td>
                    <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300">{u.uyelikTuru}</span></td>
                    <td className="px-4 py-2 text-gray-300 text-center">{u.adet}</td>
                    <td className="px-4 py-2 text-gray-400 text-right">{kur[u.uyelikTuru]}</td>
                    <td className="px-4 py-2 text-yellow-400 font-bold text-right">{u.coinMiktar}</td>
                    <td className="px-4 py-2"><button onClick={() => removeUyelik(u.id)} className="text-red-500 hover:text-red-400 text-xs">Sil</button></td>
                  </tr>
                ))}
                {uyelikler.length === 0 && <EmptyRow cols={6} />}
              </tbody>
            </table>
          </div>
        )}

        {/* İkramiyeler */}
        {activeSection === "ikramiyeler" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="px-4 py-2">Tarih</th>
                <th className="px-4 py-2">İsim</th>
                <th className="px-4 py-2 text-center">Kredi</th>
                <th className="px-4 py-2 text-center">Çarpan</th>
                <th className="px-4 py-2">Yönetici</th>
                <th className="px-4 py-2 text-right">Coin</th>
                <th className="px-4 py-2"></th>
              </tr></thead>
              <tbody>
                {ikramiyeler.map((i) => (
                  <tr key={i.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2 text-gray-300">{i.tarih}</td>
                    <td className="px-4 py-2 text-gray-200 font-medium">{i.isim}</td>
                    <td className="px-4 py-2 text-gray-300 text-center">{i.kredi}</td>
                    <td className="px-4 py-2 text-gray-300 text-center">{i.carpan}x</td>
                    <td className="px-4 py-2 text-gray-400">{i.yonetici}</td>
                    <td className="px-4 py-2 text-yellow-400 font-bold text-right">{i.coinMiktar}</td>
                    <td className="px-4 py-2"><button onClick={() => removeIkramiye(i.id)} className="text-red-500 hover:text-red-400 text-xs">Sil</button></td>
                  </tr>
                ))}
                {ikramiyeler.length === 0 && <EmptyRow cols={7} />}
              </tbody>
            </table>
          </div>
        )}

        {/* Ekstralar */}
        {activeSection === "ekstralar" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="px-4 py-2">Tarih</th>
                <th className="px-4 py-2">Açıklama</th>
                <th className="px-4 py-2 text-right">Coin</th>
                <th className="px-4 py-2"></th>
              </tr></thead>
              <tbody>
                {ekstralar.map((e) => (
                  <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2 text-gray-300">{e.tarih}</td>
                    <td className="px-4 py-2 text-gray-200">{e.aciklama}</td>
                    <td className="px-4 py-2 text-yellow-400 font-bold text-right">{e.coinMiktar}</td>
                    <td className="px-4 py-2"><button onClick={() => removeEkstra(e.id)} className="text-red-500 hover:text-red-400 text-xs">Sil</button></td>
                  </tr>
                ))}
                {ekstralar.length === 0 && <EmptyRow cols={4} />}
              </tbody>
            </table>
            {ekstralar.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-gray-400 text-sm">Toplam ({secilenAy})</span>
                <span className="text-yellow-400 font-bold text-lg">{ekstralar.reduce((s, e) => s + e.coinMiktar, 0)} Coin</span>
              </div>
            )}
          </div>
        )}

        {/* Coin Raporu */}
        {activeSection === "coinler" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="px-4 py-2">Tarih</th>
                <th className="px-4 py-2 text-right">Miktar</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Açıklama</th>
                <th className="px-4 py-2"></th>
              </tr></thead>
              <tbody>
                {coinler.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2 text-gray-300">{c.tarih}</td>
                    <td className="px-4 py-2 text-yellow-400 font-bold text-right">{c.miktar}</td>
                    <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">{c.kategori}</span></td>
                    <td className="px-4 py-2 text-gray-500">{c.aciklama}</td>
                    <td className="px-4 py-2"><button onClick={() => removeCoin(c.id)} className="text-red-500 hover:text-red-400 text-xs">Sil</button></td>
                  </tr>
                ))}
                {coinler.length === 0 && <EmptyRow cols={5} />}
              </tbody>
            </table>
            {coinler.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-gray-400 text-sm">Toplam ({secilenAy})</span>
                <span className="text-yellow-400 font-bold text-lg">{coinler.reduce((s, c) => s + c.miktar, 0)} Coin</span>
              </div>
            )}
          </div>
        )}

        {/* Yöneticiler */}
        {activeSection === "yoneticiler" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-800">
                  <th className="px-4 py-2">Ad</th>
                  <th className="px-4 py-2">Rol</th>
                  {PERIODLAR.map((p) => (
                    <th key={`o-${p}`} className="px-3 py-2 text-center whitespace-nowrap text-xs">
                      {p}<br /><span className="text-blue-500">Oda</span>
                    </th>
                  ))}
                  {PERIODLAR.map((p) => (
                    <th key={`c-${p}`} className="px-3 py-2 text-center whitespace-nowrap text-xs">
                      {p}<br /><span className="text-green-500">Çalışma</span>
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {d.yoneticiler.map((y) => {
                  const ay = y.aylar?.[secilenAy] ?? { oda: {}, calisma: {} };
                  return (
                    <tr key={y.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-2 text-gray-200 font-medium whitespace-nowrap">{y.ad}</td>
                      <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{y.rol}</td>
                      {PERIODLAR.map((p) => (
                        <td key={`o-${p}`} className="px-3 py-2 text-center text-blue-400 font-mono text-xs tabular-nums whitespace-nowrap">
                          {fmtSure((ay.oda as Record<Period, number>)[p] ?? 0)}
                        </td>
                      ))}
                      {PERIODLAR.map((p) => (
                        <td key={`c-${p}`} className="px-3 py-2 text-center text-green-400 font-mono text-xs tabular-nums whitespace-nowrap">
                          {fmtSure((ay.calisma as Record<Period, number>)[p] ?? 0)}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => { setSureHedefYonetici(y); setModal("sure-gir"); }}
                            className="text-emerald-500 hover:text-emerald-400 text-xs whitespace-nowrap">Süre Ekle</button>
                          <button onClick={() => { setEditYonetici(y); setModal("yonetici-edit"); }}
                            className="text-blue-500 hover:text-blue-400 text-xs">Düzenle</button>
                          <button onClick={() => removeYonetici(y.id)} className="text-red-500 hover:text-red-400 text-xs">Sil</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {d.yoneticiler.length === 0 && <EmptyRow cols={2 + PERIODLAR.length * 2 + 1} />}
              </tbody>
            </table>
          </div>
        )}

        {/* Ayarlar — Kur Fiyatları */}
        {activeSection === "ayarlar" && (
          <KurFiyatlariAyar
            kur={kur}
            onSave={async (yeniKur) => {
              const u = { ...data };
              u[activeTab].kurFiyatlari = yeniKur;
              await save(u);
            }}
          />
        )}
      </div>

      {/* Yönetici ekle butonu */}
      {activeSection === "yoneticiler" && (
        <button onClick={() => setModal("sure-gir" as "sure-gir")}
          style={{ display: "none" }} />
      )}
      {activeSection === "yoneticiler" && (
        <div className="flex justify-end">
          <button
            onClick={() => setModal("yonetici-edit")}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${btnColor}`}
            style={{ display: "none" }}
          />
        </div>
      )}
      {/* Yönetici ekle — ayrı düğme */}
      {activeSection === "yoneticiler" && (
        <div className="flex justify-end -mt-4">
          <button
            onClick={() => {
              setEditYonetici(null);
              setModal("yonetici-edit");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${btnColor}`}
          >
            + Yönetici Ekle
          </button>
        </div>
      )}

      {/* Modaller */}
      {modal === "uyelik" && (
        <UyelikModal
          kur={kur}
          yoneticiler={d.yoneticiler}
          onClose={() => setModal(null)}
          onSave={async (uyelik, coinEntry) => {
            const u = { ...data };
            u[activeTab].uyelikler.push(uyelik);
            if (coinEntry) u[activeTab].coinHarcamalar.push(coinEntry);
            await save(u);
            setModal(null);
          }}
        />
      )}
      {modal === "ikramiye" && (
        <IkramiyeModal
          yoneticiler={d.yoneticiler}
          onClose={() => setModal(null)}
          onSave={async (ikramiye, coinEntry) => {
            const u = { ...data };
            u[activeTab].ikramiyeler.push(ikramiye);
            if (coinEntry) u[activeTab].coinHarcamalar.push(coinEntry);
            await save(u);
            setModal(null);
          }}
        />
      )}
      {modal === "ekstra" && (
        <EkstraModal
          onClose={() => setModal(null)}
          onSave={async (ekstra, coinEntry) => {
            const u = { ...data };
            if (!u[activeTab].ekstralar) u[activeTab].ekstralar = [];
            u[activeTab].ekstralar.push(ekstra);
            if (coinEntry) u[activeTab].coinHarcamalar.push(coinEntry);
            await save(u);
            setModal(null);
          }}
        />
      )}
      {modal === "yonetici-edit" && (
        editYonetici ? (
          <YoneticiDuzenleModal
            yonetici={editYonetici}
            onClose={() => { setModal(null); setEditYonetici(null); }}
            onSave={async (item) => {
              const u = { ...data };
              u[activeTab].yoneticiler = u[activeTab].yoneticiler.map((y) => y.id === item.id ? item : y);
              await save(u);
              setModal(null);
              setEditYonetici(null);
            }}
          />
        ) : (
          <YoneticiEkleModal
            onClose={() => setModal(null)}
            onSave={async (item) => {
              const u = { ...data };
              u[activeTab].yoneticiler.push(item);
              await save(u);
              setModal(null);
            }}
          />
        )
      )}
      {modal === "sure-gir" && sureHedefYonetici && (
        <SureGirModal
          yonetici={sureHedefYonetici}
          varsayilanAy={secilenAy}
          onClose={() => { setModal(null); setSureHedefYonetici(null); }}
          onSave={async (guncelY) => {
            const u = { ...data };
            u[activeTab].yoneticiler = u[activeTab].yoneticiler.map((y) =>
              y.id === guncelY.id ? guncelY : y
            );
            await save(u);
            setModal(null);
            setSureHedefYonetici(null);
          }}
        />
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

// ─── Tarih Satırı (ay göstergesi + gün input) ─────────────────────────────────

function TarihGirisi({ gun, setGun }: { gun: number; setGun: (g: number) => void }) {
  const { ay, ayIndex, yil } = useAy();
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">Tarih</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-indigo-400 text-sm font-medium">{ay} {yil}</div>
        <input type="number" min={1} max={31} value={gun}
          onChange={(e) => setGun(Math.min(31, Math.max(1, Number(e.target.value))))}
          className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
          placeholder="Gün" />
      </div>
    </div>
  );
}

// ─── Üyelik Modal ─────────────────────────────────────────────────────────────

function UyelikModal({ kur, yoneticiler, onClose, onSave }: {
  kur: KurFiyatlari;
  yoneticiler: Yonetici[];
  onClose: () => void;
  onSave: (u: Uyelik, coin: CoinHarcama | null) => void;
}) {
  const { ayIndex, yil } = useAy();
  const [gun, setGun] = useState<number>(1);
  const [tur, setTur] = useState<UyelikTuru>("HC");
  const [adet, setAdet] = useState<number>(1);

  const kurFiyati = kur[tur] ?? 0;
  const coinMiktar = adet * kurFiyati;
  const tarih = `${yil}-${String(ayIndex + 1).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;

  const handleSave = () => {
    const id = Date.now().toString();
    const uyelik: Uyelik = { id, tarih, uyelikTuru: tur, adet, coinMiktar };
    const coinEntry: CoinHarcama | null = coinMiktar > 0 ? {
      id: id + "c",
      tarih,
      miktar: coinMiktar,
      kategori: "Üyelik",
      aciklama: `${adet}x ${tur} üyelik`,
    } : null;
    onSave(uyelik, coinEntry);
  };

  return (
    <ModalWrapper title="Üyelik Ekle" onClose={onClose}>
      <div className="space-y-4">
        <TarihGirisi gun={gun} setGun={setGun} />

        {/* Üyelik türü */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Üyelik Türü</label>
          <div className="grid grid-cols-4 gap-2">
            {UYELIK_TURLERI.map((t) => (
              <button key={t} onClick={() => setTur(t)}
                className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                  tur === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Adet */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Adet</label>
          <input type="number" min={1} value={adet}
            onChange={(e) => setAdet(Math.max(1, Number(e.target.value)))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        {/* Coin önizleme */}
        <div className="bg-gray-800/60 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            <span>{adet} × {kurFiyati} (kur)</span>
          </div>
          <span className="text-yellow-400 font-bold text-lg">{coinMiktar} Coin</span>
        </div>
        {kurFiyati === 0 && (
          <p className="text-amber-500 text-xs">Bu tür için kur fiyatı 0. Ayarlar sekmesinden güncelleyin.</p>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">İptal</button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors">Kaydet</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── İkramiye Modal ───────────────────────────────────────────────────────────

function IkramiyeModal({ yoneticiler, onClose, onSave }: {
  yoneticiler: Yonetici[];
  onClose: () => void;
  onSave: (i: Ikramiye, coin: CoinHarcama | null) => void;
}) {
  const { ayIndex, yil } = useAy();
  const [gun, setGun] = useState<number>(1);
  const [isim, setIsim] = useState("");
  const [kredi, setKredi] = useState<number>(0);
  const [carpan, setCarpan] = useState<number>(1);
  const [yonetici, setYonetici] = useState<string>(yoneticiler[0]?.ad ?? "");

  const coinMiktar = kredi * carpan;
  const tarih = `${yil}-${String(ayIndex + 1).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;

  const handleSave = () => {
    if (!isim.trim()) return;
    const id = Date.now().toString();
    const ikramiye: Ikramiye = { id, tarih, isim, kredi, carpan, yonetici, coinMiktar };
    const coinEntry: CoinHarcama | null = coinMiktar > 0 ? {
      id: id + "c",
      tarih,
      miktar: coinMiktar,
      kategori: "İkramiye",
      aciklama: `${isim} — ${carpan}x ${kredi} kredi (${yonetici})`,
    } : null;
    onSave(ikramiye, coinEntry);
  };

  return (
    <ModalWrapper title="İkramiye Ekle" onClose={onClose}>
      <div className="space-y-4">
        <TarihGirisi gun={gun} setGun={setGun} />

        <div>
          <label className="block text-gray-400 text-sm mb-1">İsim</label>
          <input value={isim} onChange={(e) => setIsim(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="İkramiye adı" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Kredi</label>
            <input type="number" min={0} value={kredi}
              onChange={(e) => setKredi(Math.max(0, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Çarpan (x)</label>
            <input type="number" min={1} value={carpan}
              onChange={(e) => setCarpan(Math.max(1, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Yönetici</label>
          {yoneticiler.length > 0 ? (
            <select value={yonetici} onChange={(e) => setYonetici(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {yoneticiler.map((y) => <option key={y.id} value={y.ad}>{y.ad} — {y.rol}</option>)}
            </select>
          ) : (
            <input value={yonetici} onChange={(e) => setYonetici(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Yönetici adı" />
          )}
        </div>

        {/* Coin önizleme */}
        <div className="bg-gray-800/60 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">{kredi} kredi × {carpan}x</span>
          <span className="text-yellow-400 font-bold text-lg">{coinMiktar} Coin</span>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">İptal</button>
          <button onClick={handleSave} disabled={!isim.trim()}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium text-sm transition-colors">Kaydet</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Kur Fiyatları Ayar ───────────────────────────────────────────────────────

function KurFiyatlariAyar({ kur, onSave }: { kur: KurFiyatlari; onSave: (k: KurFiyatlari) => void }) {
  const [vals, setVals] = useState<KurFiyatlari>({ ...kur });

  const set = (key: UyelikTuru, val: number) => setVals((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="p-4 space-y-4">
      <p className="text-gray-400 text-sm">Her üyelik türü için coin kur fiyatını belirle. Üyelik eklerken otomatik hesaplanır.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {UYELIK_TURLERI.map((t) => (
          <div key={t}>
            <label className="block text-gray-400 text-sm mb-1">{t} (Coin)</label>
            <input type="number" min={0} value={vals[t]}
              onChange={(e) => set(t, Math.max(0, Number(e.target.value)))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 text-center font-bold" />
          </div>
        ))}
      </div>
      <button onClick={() => onSave(vals)}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
        Kaydet
      </button>
    </div>
  );
}

// ─── Yönetici Ekle ────────────────────────────────────────────────────────────

function YoneticiEkleModal({ onClose, onSave }: { onClose: () => void; onSave: (y: Yonetici) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      ad: f.get("ad") as string,
      rol: f.get("rol") as string,
      aylar: emptyAylar(),
    });
  };
  return (
    <ModalWrapper title="Yönetici Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Ad Soyad" name="ad" required />
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

// ─── Yönetici Düzenle ─────────────────────────────────────────────────────────

function YoneticiDuzenleModal({ yonetici, onClose, onSave }: { yonetici: Yonetici; onClose: () => void; onSave: (y: Yonetici) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({ ...yonetici, ad: f.get("ad") as string, rol: f.get("rol") as string });
  };
  return (
    <ModalWrapper title="Yönetici Düzenle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Ad Soyad" name="ad" required defaultValue={yonetici.ad} />
        <div>
          <label className="block text-gray-400 text-sm mb-1">Rol</label>
          <select name="rol" defaultValue={yonetici.rol} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option>Başkan</option><option>Lider</option><option>Moderatör</option><option>Yardımcı</option><option>Üye</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">Güncelle</button>
      </form>
    </ModalWrapper>
  );
}

// ─── Süre Giriş Modalı ────────────────────────────────────────────────────────

function SureGirModal({ yonetici, varsayilanAy, onClose, onSave }: {
  yonetici: Yonetici;
  varsayilanAy: Ay;
  onClose: () => void;
  onSave: (y: Yonetici) => void;
}) {
  const [ay, setAyState] = useState<Ay>(varsayilanAy);
  const [tur, setTur] = useState<"oda" | "calisma">("oda");
  const [girisMode, setGirisMode] = useState<"gun" | "periyot">("periyot");
  const [gun, setGun] = useState<number>(1);
  const [periyot, setPeriyot] = useState<Period>("1-7");
  const [sure, setSure] = useState<number>(0);
  const [islem, setIslem] = useState<"ekle" | "ayarla">("ekle");

  const seciliPeriyot = girisMode === "gun" ? gundenPeriod(gun) : periyot;
  const mevcutSure = yonetici.aylar?.[ay]?.[tur]?.[seciliPeriyot] ?? 0;

  const handleSave = () => {
    if (sure === 0 && islem === "ekle") return;
    const guncelYonetici = { ...yonetici };
    if (!guncelYonetici.aylar) guncelYonetici.aylar = emptyAylar();
    if (!guncelYonetici.aylar[ay]) {
      guncelYonetici.aylar[ay] = {
        oda: Object.fromEntries(PERIODLAR.map((p) => [p, 0])) as Record<Period, number>,
        calisma: Object.fromEntries(PERIODLAR.map((p) => [p, 0])) as Record<Period, number>,
      };
    }
    const mevcut = guncelYonetici.aylar[ay][tur][seciliPeriyot] ?? 0;
    guncelYonetici.aylar[ay][tur][seciliPeriyot] = islem === "ekle" ? mevcut + sure : sure;
    onSave(guncelYonetici);
  };

  return (
    <ModalWrapper title={`Süre Gir — ${yonetici.ad}`} onClose={onClose} maxW="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Ay</label>
          <div className="grid grid-cols-4 gap-1.5">
            {AYLAR.map((a) => (
              <button key={a} onClick={() => setAyState(a)}
                className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  ay === a ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}>
                {a.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTur("oda")}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${tur === "oda" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            Oda
          </button>
          <button onClick={() => setTur("calisma")}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${tur === "calisma" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            Çalışma
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setGirisMode("periyot")}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${girisMode === "periyot" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            Periyot Seç
          </button>
          <button onClick={() => setGirisMode("gun")}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${girisMode === "gun" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            Gün Gir
          </button>
        </div>

        {girisMode === "periyot" ? (
          <div>
            <label className="block text-gray-400 text-sm mb-1">Periyot</label>
            <div className="flex gap-2">
              {PERIODLAR.map((p) => (
                <button key={p} onClick={() => setPeriyot(p)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    periyot === p ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Gün <span className="text-gray-600">(otomatik periyot: <span className="text-indigo-400">{seciliPeriyot}</span>)</span>
            </label>
            <input type="number" min={1} max={31} value={gun}
              onChange={(e) => setGun(Math.min(31, Math.max(1, Number(e.target.value))))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
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
          <button onClick={() => setIslem("ekle")}
            className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${islem === "ekle" ? "bg-emerald-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            + Üstüne Ekle
          </button>
          <button onClick={() => setIslem("ayarla")}
            className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${islem === "ayarla" ? "bg-orange-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            = Değeri Ayarla
          </button>
        </div>

        {sure > 0 && (
          <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-gray-500 text-xs">Kaydedilecek değer</span>
            <span className={`font-mono text-sm font-bold ${tur === "oda" ? "text-blue-400" : "text-green-400"}`}>
              {fmtSure(islem === "ekle" ? mevcutSure + sure : sure)}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">İptal</button>
          <button onClick={handleSave} disabled={sure === 0 && islem === "ekle"}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium text-sm transition-colors">Kaydet</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Ekstra Modal ─────────────────────────────────────────────────────────────

function EkstraModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (e: Ekstra, coin: CoinHarcama | null) => void;
}) {
  const { ayIndex, yil } = useAy();
  const [gun, setGun] = useState<number>(1);
  const [aciklama, setAciklama] = useState("");
  const [coinMiktar, setCoinMiktar] = useState<number>(0);

  const tarih = `${yil}-${String(ayIndex + 1).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;

  const handleSave = () => {
    if (!aciklama.trim() || coinMiktar <= 0) return;
    const id = Date.now().toString();
    const ekstra: Ekstra = { id, tarih, aciklama, coinMiktar };
    const coinEntry: CoinHarcama = {
      id: id + "c",
      tarih,
      miktar: coinMiktar,
      kategori: "Ekstra",
      aciklama,
    };
    onSave(ekstra, coinEntry);
  };

  return (
    <ModalWrapper title="Ekstra Ekle" onClose={onClose}>
      <div className="space-y-4">
        <TarihGirisi gun={gun} setGun={setGun} />

        <div>
          <label className="block text-gray-400 text-sm mb-1">Açıklama</label>
          <input value={aciklama} onChange={(e) => setAciklama(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Açıklama yazın..." />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Coin Miktarı</label>
          <input type="number" min={0} value={coinMiktar}
            onChange={(e) => setCoinMiktar(Math.max(0, Number(e.target.value)))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 text-center font-bold" />
        </div>

        <div className="bg-gray-800/60 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Coin</span>
          <span className="text-yellow-400 font-bold text-lg">{coinMiktar} Coin</span>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">İptal</button>
          <button onClick={handleSave} disabled={!aciklama.trim() || coinMiktar <= 0}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium text-sm transition-colors">Kaydet</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
