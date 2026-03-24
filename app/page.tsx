"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getData } from "@/lib/store";
import { AppData } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    getData().then(setData);
  }, []);

  if (!data) return null;

  const stats = (key: "chd" | "treachery") => {
    const d = data[key];
    const toplamCoin = d.coinHarcamalar.reduce((s, c) => s + c.miktar, 0);
    return {
      uyelikler: d.uyelikler.reduce((s, u) => s + u.adet, 0),
      ikramiyeler: (d.ikramiyeler ?? []).length,
      toplamCoin,
      toplamYonetici: d.yoneticiler.length,
    };
  };

  const chd = stats("chd");
  const treachery = stats("treachery");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dernek Takip Sistemi</h1>
        <p className="text-gray-400 mt-1">CHD ve Treachery derneklerinin genel durumu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHD Card */}
        <Link href="/chd" className="group block">
          <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">CHD</h2>
                  <p className="text-gray-400 text-sm">Dernek Sayfası</p>
                </div>
              </div>
              <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <StatBox label="Üyelik" value={chd.uyelikler} color="blue" />
              <StatBox label="İkramiye" value={chd.ikramiyeler} color="blue" />
              <StatBox label="Coin Harcandı" value={chd.toplamCoin} color="blue" />
              <StatBox label="Yönetici" value={chd.toplamYonetici} color="blue" />
            </div>
          </div>
        </Link>

        {/* Treachery Card */}
        <Link href="/treachery" className="group block">
          <div className="bg-gray-900 border border-gray-800 hover:border-red-500 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-red-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Treachery</h2>
                  <p className="text-gray-400 text-sm">Dernek Sayfası</p>
                </div>
              </div>
              <span className="text-red-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <StatBox label="Üyelik" value={treachery.uyelikler} color="red" />
              <StatBox label="İkramiye" value={treachery.ikramiyeler} color="red" />
              <StatBox label="Coin Harcandı" value={treachery.toplamCoin} color="red" />
              <StatBox label="Yönetici" value={treachery.toplamYonetici} color="red" />
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Hızlı Erişim</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/chd#uyelikler" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
            CHD Üyelikler
          </Link>
          <Link href="/chd#ikramiyeler" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
            CHD İkramiyeler
          </Link>
          <Link href="/treachery#uyelikler" className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
            Treachery Üyelikler
          </Link>
          <Link href="/treachery#ikramiyeler" className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
            Treachery İkramiyeler
          </Link>
          <Link href="/admin" className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 transition-colors text-sm">
            Admin Paneli
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: "blue" | "red" }) {
  const colorClass = color === "blue" ? "text-blue-400" : "text-red-400";
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
