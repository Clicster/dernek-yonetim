"use client";

import { useEffect, useState } from "react";
import { getData } from "@/lib/store";
import { AppData, PERIODLAR, Period, SureKisi } from "@/lib/types";
import { useAy } from "@/lib/ay-context";

function fmtSure(saniye: number): string {
  const s = Math.floor(saniye);
  const saat = Math.floor(s / 3600);
  const dk = Math.floor((s % 3600) / 60);
  const sn = s % 60;
  return `${String(saat).padStart(2, "0")}:${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

export default function YonetimSurePage() {
  const [data, setData] = useState<AppData | null>(null);
  const { ay: secilenAy } = useAy();

  useEffect(() => {
    getData().then(setData);
  }, []);

  if (!data) return null;

  const kisiler: SureKisi[] = data.yonetimSure ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Yönetim Süre</h1>
        <p className="text-gray-400 text-sm mt-1">Yönetim kadrosu süre takibi — {secilenAy}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-white font-semibold">
            Süre Tablosu <span className="text-gray-500 font-normal text-sm">— {secilenAy}</span>
          </h2>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {kisiler.map((k) => {
                const ay = k.aylar?.[secilenAy] ?? { oda: {}, calisma: {} };
                return (
                  <tr key={k.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2 text-gray-200 font-medium whitespace-nowrap">{k.ad}</td>
                    <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{k.rol}</td>
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
                  </tr>
                );
              })}
              {kisiler.length === 0 && (
                <tr>
                  <td colSpan={2 + PERIODLAR.length * 2} className="px-4 py-8 text-center text-gray-600">
                    Henüz kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
