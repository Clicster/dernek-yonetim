"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/store";
import { useEffect, useState } from "react";
import { useAy } from "@/lib/ay-context";
import { AYLAR } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const { ay, setAy } = useAy();

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setAuthed(false);
    router.push("/");
  };

  const links = [
    { href: "/chd", label: "CHD", color: "bg-blue-600" },
    { href: "/treachery", label: "Treachery", color: "bg-red-600" },
    { href: "/admin", label: "Admin", color: "bg-indigo-600" },
  ];

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
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? `${link.color} text-white`
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {authed && (
              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Çıkış
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
