"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAy } from "@/lib/ay-context";
import { AYLAR } from "@/lib/types";
import type { UserDef } from "@/lib/auth";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type UserInfo = (UserDef & { username: string }) | { username: null };

function NavItem({
  label,
  href,
  active,
  activeClass,
  allowed,
  router,
}: {
  label: string;
  href: string;
  active: boolean;
  activeClass: string;
  allowed: boolean;
  router: AppRouterInstance;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (!allowed) {
      e.preventDefault();
      router.push("/giris");
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active && allowed
          ? activeClass
          : allowed
          ? "text-gray-300 hover:text-white hover:bg-gray-700"
          : "text-gray-500 hover:text-gray-300 hover:bg-gray-800 cursor-pointer"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { ay, setAy } = useAy();
  const [user, setUser] = useState<UserInfo>({ username: null });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: UserInfo) => setUser(data))
      .catch(() => setUser({ username: null }));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser({ username: null });
    router.push("/");
    router.refresh();
  };

  const isLoggedIn = !!user.username;
  // Giriş yapılmamışsa false → NavItem /giris'e yönlendirir
  const canSeeDernek = isLoggedIn && (user as UserDef).canSeeDernek;
  const canSeeYonetim = isLoggedIn && (user as UserDef).canSeeYonetimSure;
  const canSeeKonsey = isLoggedIn && (user as UserDef).canSeeKonseySure;
  const canSeeAdmin = isLoggedIn && (user as UserDef).canSeeAdmin;

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
              Dernek Takip
            </span>
          </Link>

          {/* Ay Seçici */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 justify-center">
            {AYLAR.map((a) => (
              <button
                key={a}
                onClick={() => setAy(a)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  ay === a
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {a.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Linkler */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Dernekler — her zaman görünür */}
            <NavItem
              label="CHD"
              href="/chd"
              active={pathname.startsWith("/chd")}
              activeClass="bg-blue-600 text-white"
              allowed={canSeeDernek}
              router={router}
            />
            <NavItem
              label="Treachery"
              href="/treachery"
              active={pathname.startsWith("/treachery")}
              activeClass="bg-red-600 text-white"
              allowed={canSeeDernek}
              router={router}
            />

            {/* Yönetim Süre — her zaman görünür */}
            <NavItem
              label="Yönetim Süre"
              href="/yonetim-sure"
              active={pathname.startsWith("/yonetim-sure")}
              activeClass="bg-emerald-600 text-white"
              allowed={canSeeYonetim}
              router={router}
            />

            {/* Konsey Süre — her zaman görünür */}
            <NavItem
              label="Konsey Süre"
              href="/konsey-sure"
              active={pathname.startsWith("/konsey-sure")}
              activeClass="bg-purple-600 text-white"
              allowed={canSeeKonsey}
              router={router}
            />

            {/* Admin */}
            {canSeeAdmin && (
              <Link
                href="/admin/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                Admin
              </Link>
            )}

            {/* Giriş / Çıkış */}
            {isLoggedIn ? (
              <div className="ml-1 flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:block">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <Link
                href="/giris"
                className={`ml-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/giris"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                Giriş
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
