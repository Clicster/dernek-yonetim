"use client";

import { useEffect, useState } from "react";
import { getData } from "@/lib/store";
import { Ay, AYLAR, DernekData, DernekKey, Ekstra, Period, PERIODLAR, Yonetici } from "@/lib/types";
import { useAy } from "@/lib/ay-context";

function fmtSure(saniye: number): string {
  const s = Math.floor(saniye);
  const saat = Math.floor(s / 3600);
  const dk = Math.floor((s % 3600) / 60);
  const sn = s % 60;
  return `${String(saat).padStart(2, "0")}:${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

interface Props {
  dernekKey: DernekKey;
  title: string;
  color: "blue" | "red";
}

type AktifTab = "uyelikler" | "ikramiyeler" | "ekstralar" | "coinler" | "yoneticiler";

export default function DernekPage({ dernekKey, title, color }: Props) {
  const [data, setData] = useState<DernekData | null>(null);
  const [activeTab, setActiveTab] = useState<AktifTab>("uyelikler");
  const { ay: secilenAy, setAy, ayIndex, yil } = useAy();

  useEffect(() => {
    getData().then((d) => setData(d[dernekKey]));
    const hash = window.location.hash.replace("#", "");
    if (["uyelikler", "ikramiyeler", "ekstralar", "coinler", "yoneticiler"].includes(hash)) {
      setActiveTab(hash as AktifTab);
    }
  }, [dernekKey]);

  const ayFiltre = (tarih: string) => {
    const [y, m] = tarih.split("-").map(Number);
    return y === yil && m === ayIndex + 1;
  };

  if (!data) return null;

  const accent = color === "blue" ? "blue" : "red";
  const badgeColor = color === "blue" ? "bg-blue-600" : "bg-red-600";
  const accentText = color === "blue" ? "text-blue-400" : "text-red-400";

  const uyelikler = data.uyelikler.filter((u) => ayFiltre(u.tarih));
  const ikramiyeler = (data.ikramiyeler ?? []).filter((i) => ayFiltre(i.tarih));
  const ekstralar = (data.ekstralar ?? []).filter((e) => ayFiltre(e.tarih));
  const coinler = data.coinHarcamalar.filter((c) => ayFiltre(c.tarih));
  const toplamCoin = coinler.reduce((s, c) => s + c.miktar, 0);
  const toplamUyelikCoin = uyelikler.reduce((s, u) => s + u.coinMiktar, 0);
  const toplamIkramiyeCoin = ikramiyeler.reduce((s, i) => s + i.coinMiktar, 0);
  const toplamEkstraCoin = ekstralar.reduce((s, e) => s + e.coinMiktar, 0);

  const tabClass = (tab: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab
        ? color === "blue" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${badgeColor} rounded-xl flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">{title[0]}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 text-sm">Dernek istatistikleri ve yönetim bilgileri</p>
        </div>
      </div>

      {/* Ay Seçici */}
      <div className="flex items-center gap-1 flex-wrap">
        {AYLAR.map((a) => (
          <button
            key={a}
            onClick={() => setAy(a)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              secilenAy === a
                ? color === "blue" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {a.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Üyelik" value={uyelikler.reduce((s, u) => s + u.adet, 0)} sub={`${uyelikler.length} kayıt · ${secilenAy}`} color={accent} />
        <SummaryCard label="İkramiye" value={ikramiyeler.length} sub={secilenAy} color={accent} />
        <SummaryCard label="Harcanan Coin" value={toplamCoin} sub={`${coinler.length} işlem · ${secilenAy}`} color={accent} />
        <SummaryCard label="Yönetici" value={data.yoneticiler.length} sub="toplam" color={accent} />
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 flex-wrap">
        <button className={tabClass("uyelikler")} onClick={() => setActiveTab("uyelikler")}>Üyelikler</button>
        <button className={tabClass("ikramiyeler")} onClick={() => setActiveTab("ikramiyeler")}>İkramiyeler</button>
        <button className={tabClass("ekstralar")} onClick={() => setActiveTab("ekstralar")}>Ekstralar</button>
        <button className={tabClass("coinler")} onClick={() => setActiveTab("coinler")}>Coin Raporu</button>
        <button className={tabClass("yoneticiler")} onClick={() => setActiveTab("yoneticiler")}>Yöneticiler</button>
      </div>

      {/* Üyelikler */}
      {activeTab === "uyelikler" && (
        <div className="space-y-3">
          {/* Özet */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["HC", "PA", "VIP", "DC SM"] as const).map((tur) => {
              const count = uyelikler.filter((u) => u.uyelikTuru === tur).reduce((s, u) => s + u.adet, 0);
              const coin = uyelikler.filter((u) => u.uyelikTuru === tur).reduce((s, u) => s + u.coinMiktar, 0);
              return (
                <div key={tur} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">{tur}</p>
                  <p className={`text-xl font-bold ${accentText}`}>{count}</p>
                  <p className="text-yellow-500 text-xs mt-0.5">{coin} coin</p>
                </div>
              );
            })}
          </div>
          {uyelikler.length === 0 ? (
            <EmptyState text={`${secilenAy} ayında üyelik kaydı yok`} />
          ) : (
            uyelikler.map((u) => (
              <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className={`hidden md:flex w-10 h-10 ${badgeColor} rounded-lg items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">{u.uyelikTuru}</span>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <InfoField label="Tarih" value={u.tarih} />
                  <InfoField label="Üyelik Türü" value={u.uyelikTuru} />
                  <InfoField label="Adet" value={String(u.adet)} />
                  <InfoField label="Coin" value={`${u.coinMiktar} Coin`} />
                </div>
              </div>
            ))
          )}
          {uyelikler.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Toplam Üyelik Coin ({secilenAy})</span>
              <span className="text-yellow-400 font-bold text-lg">{toplamUyelikCoin} Coin</span>
            </div>
          )}
        </div>
      )}

      {/* İkramiyeler */}
      {activeTab === "ikramiyeler" && (
        <div className="space-y-3">
          {ikramiyeler.length === 0 ? (
            <EmptyState text={`${secilenAy} ayında ikramiye kaydı yok`} />
          ) : (
            ikramiyeler.map((i) => (
              <div key={i.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className={`hidden md:flex w-10 h-10 ${badgeColor} rounded-lg items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">İKR</span>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                  <InfoField label="İsim" value={i.isim} />
                  <InfoField label="Tarih" value={i.tarih} />
                  <InfoField label="Kredi × Çarpan" value={`${i.kredi} × ${i.carpan}x`} />
                  <InfoField label="Yönetici" value={i.yonetici} />
                  <InfoField label="Coin" value={`${i.coinMiktar} Coin`} />
                </div>
              </div>
            ))
          )}
          {ikramiyeler.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Toplam İkramiye Coin ({secilenAy})</span>
              <span className="text-yellow-400 font-bold text-lg">{toplamIkramiyeCoin} Coin</span>
            </div>
          )}
        </div>
      )}

      {/* Ekstralar */}
      {activeTab === "ekstralar" && (
        <div className="space-y-3">
          {ekstralar.length === 0 ? (
            <EmptyState text={`${secilenAy} ayında ekstra kaydı yok`} />
          ) : (
            ekstralar.map((e) => (
              <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className={`hidden md:flex w-10 h-10 ${badgeColor} rounded-lg items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">EKS</span>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <InfoField label="Tarih" value={e.tarih} />
                  <InfoField label="Açıklama" value={e.aciklama} />
                  <InfoField label="Coin" value={`${e.coinMiktar} Coin`} />
                </div>
              </div>
            ))
          )}
          {ekstralar.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Toplam Ekstra Coin ({secilenAy})</span>
              <span className="text-yellow-400 font-bold text-lg">{toplamEkstraCoin} Coin</span>
            </div>
          )}
        </div>
      )}

      {/* Coin Raporu */}
      {activeTab === "coinler" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between col-span-2 md:col-span-1">
              <span className="text-gray-400 text-sm">Toplam</span>
              <span className={`text-2xl font-bold ${accentText}`}>{toplamCoin} Coin</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Üyeliklerden</span>
              <span className="text-yellow-400 font-bold">{toplamUyelikCoin} Coin</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">İkramiyelerden</span>
              <span className="text-yellow-400 font-bold">{toplamIkramiyeCoin} Coin</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Ekstralardan</span>
              <span className="text-yellow-400 font-bold">{toplamEkstraCoin} Coin</span>
            </div>
          </div>
          {coinler.length === 0 ? (
            <EmptyState text={`${secilenAy} ayında coin kaydı yok`} />
          ) : (
            coinler.map((c) => (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className={`hidden md:flex w-10 h-10 ${badgeColor} rounded-lg items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">COİN</span>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <InfoField label="Tarih" value={c.tarih} />
                  <InfoField label="Miktar" value={`${c.miktar} Coin`} />
                  <InfoField label="Kategori" value={c.kategori} />
                  <InfoField label="Açıklama" value={c.aciklama} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Yöneticiler */}
      {activeTab === "yoneticiler" && (
        <YoneticiTablolar yoneticiler={data.yoneticiler} color={color} secilenAy={secilenAy} />
      )}
    </div>
  );
}

// ─── Yönetici Tablolar ────────────────────────────────────────────────────────

function YoneticiTablolar({ yoneticiler, color, secilenAy }: {
  yoneticiler: Yonetici[];
  color: "blue" | "red";
  secilenAy: Ay;
}) {
  if (yoneticiler.length === 0) return <EmptyState text="Henüz yönetici kaydı yok" />;

  const odaSum = (y: Yonetici, periods: Period[]) =>
    periods.reduce((s, p) => s + (y.aylar?.[secilenAy]?.oda?.[p] ?? 0), 0);
  const calismaSum = (y: Yonetici, periods: Period[]) =>
    periods.reduce((s, p) => s + (y.aylar?.[secilenAy]?.calisma?.[p] ?? 0), 0);

  return (
    <div className="space-y-5">
      <SectionHeader label="Oda — Haftalık" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {PERIODLAR.map((p) => (
          <AktiflikTablosu key={`oda-${p}`} baslik={`${p} Oda`} color={color}
            satirlar={yoneticiler.map((y) => ({ ad: y.ad, rol: y.rol, deger: y.aylar?.[secilenAy]?.oda?.[p] ?? 0 }))} />
        ))}
      </div>
      <SectionHeader label="Çalışma — Haftalık" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {PERIODLAR.map((p) => (
          <AktiflikTablosu key={`calisma-${p}`} baslik={`${p} Çalışma`} color={color}
            satirlar={yoneticiler.map((y) => ({ ad: y.ad, rol: y.rol, deger: y.aylar?.[secilenAy]?.calisma?.[p] ?? 0 }))} />
        ))}
      </div>
      <SectionHeader label={`${secilenAy} Toplamları`} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AktiflikTablosu baslik="1-31 Oda" color={color} vurgula
          satirlar={yoneticiler.map((y) => ({ ad: y.ad, rol: y.rol, deger: odaSum(y, [...PERIODLAR]) }))} />
        <AktiflikTablosu baslik="1-31 Çalışma" color={color} vurgula
          satirlar={yoneticiler.map((y) => ({ ad: y.ad, rol: y.rol, deger: calismaSum(y, [...PERIODLAR]) }))} />
        <AktiflikTablosu baslik="1-31 Oda + Çalışma" color={color} vurgula
          satirlar={yoneticiler.map((y) => ({ ad: y.ad, rol: y.rol, deger: odaSum(y, [...PERIODLAR]) + calismaSum(y, [...PERIODLAR]) }))} />
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-800" />
      <span className="text-gray-400 text-sm font-medium px-2">{label}</span>
      <div className="h-px flex-1 bg-gray-800" />
    </div>
  );
}

interface TabloSatir { ad: string; rol: string; deger: number; }

function AktiflikTablosu({ baslik, color, satirlar, vurgula = false }: {
  baslik: string; color: "blue" | "red"; satirlar: TabloSatir[]; vurgula?: boolean;
}) {
  const sorted = [...satirlar].sort((a, b) => b.deger - a.deger);
  const max = sorted[0]?.deger ?? 1;
  const accentText = color === "blue" ? "text-blue-400" : "text-red-400";
  const accentBorder = color === "blue" ? "border-blue-500/40" : "border-red-500/40";
  const barColor = color === "blue" ? "bg-blue-600" : "bg-red-600";

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden ${vurgula ? accentBorder : "border-gray-800"}`}>
      <div className={`px-4 py-2.5 border-b ${vurgula ? accentBorder : "border-gray-800"} flex items-center justify-between`}>
        <span className={`text-sm font-semibold ${vurgula ? accentText : "text-gray-300"}`}>{baslik}</span>
        <span className="text-gray-600 text-xs font-mono">ss:dd:sn</span>
      </div>
      <div className="divide-y divide-gray-800/60">
        {sorted.map((satir, i) => {
          const yuzde = max > 0 ? (satir.deger / max) * 100 : 0;
          return (
            <div key={satir.ad} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-800/30">
              <span className="text-gray-600 text-xs w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm font-medium truncate">{satir.ad}</p>
                <p className="text-gray-600 text-xs truncate">{satir.rol}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 bg-gray-800 rounded-full h-1.5 hidden sm:block">
                  <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${yuzde}%` }} />
                </div>
                <span className={`text-xs font-bold font-mono ${accentText} tabular-nums`}>{fmtSure(satir.deger)}</span>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <div className="px-4 py-4 text-center text-gray-600 text-sm">Veri yok</div>}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  const textColor = color === "blue" ? "text-blue-400" : "text-red-400";
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      <p className="text-gray-600 text-xs mt-1">{sub}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-gray-200 text-sm font-medium">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
