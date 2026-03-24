"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "username" | "verify";

export default function GirisPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json() as { code?: string; error?: string; alreadyVerified?: boolean };

      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu.");
      } else if (data.alreadyVerified) {
        // Daha önce doğrulanmış — direkt giriş
        router.push("/");
        router.refresh();
      } else {
        setCode(data.code!);
        setStep("verify");
      }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", { method: "POST" });
      const data = await res.json() as { ok?: boolean; error?: string; username?: string };

      if (!res.ok) {
        setError(data.error ?? "Doğrulama başarısız.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Habbo Girişi</h1>
            <p className="text-gray-400 text-sm">habbo.com.tr hesabınla giriş yap</p>
          </div>
        </div>

        {step === "username" && (
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Habbo Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Habbo adını yaz"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Şifreni yaz"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Kontrol ediliyor..." : "Devam"}
            </button>
          </form>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-2">Habbo profilinde <strong className="text-white">Motto</strong> kısmına şu kodu yaz:</p>
              <div className="bg-gray-950 rounded-lg px-4 py-3 mt-2">
                <span className="text-indigo-300 font-mono font-bold text-2xl tracking-widest">{code}</span>
              </div>
              <p className="text-gray-600 text-xs mt-2">Kodu yazdıktan sonra aşağıdaki butona bas</p>
            </div>

            <p className="text-gray-500 text-xs text-center">
              Kullanıcı: <span className="text-gray-300 font-medium">{username}</span>
            </p>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Doğrulanıyor..." : "Kodu Yazdım, Giriş Yap"}
            </button>

            <button
              onClick={() => { setStep("username"); setError(""); setCode(""); }}
              className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Geri dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
