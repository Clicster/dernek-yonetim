import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USERS, SESSION_COOKIE } from "@/lib/auth";

function getUser(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  if (!sessionCookie) return null;
  try {
    const { username } = JSON.parse(sessionCookie.value) as { username: string };
    const userDef = USERS[username];
    if (!userDef) return null;
    return { username, ...userDef };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getUser(request);

  // Admin paneli — sadece admin rolü
  if (pathname.startsWith("/admin")) {
    if (!user || !user.canSeeAdmin) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
  }

  // Yönetim Süre — viewer + admin
  if (pathname.startsWith("/yonetim-sure")) {
    if (!user || !user.canSeeYonetimSure) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
  }

  // Konsey Süre — viewer + admin
  if (pathname.startsWith("/konsey-sure")) {
    if (!user || !user.canSeeKonseySure) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
  }

  // Dernek sayfaları — viewer kullanıcılar göremez
  if (pathname.startsWith("/chd") || pathname.startsWith("/treachery")) {
    if (user && !user.canSeeDernek) {
      return NextResponse.redirect(new URL("/erisim-yok", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/yonetim-sure/:path*",
    "/konsey-sure/:path*",
    "/chd/:path*",
    "/treachery/:path*",
  ],
};
