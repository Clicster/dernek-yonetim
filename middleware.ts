import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserPerms, SESSION_COOKIE } from "@/lib/auth";

function getUser(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  if (!sessionCookie) return null;
  try {
    const { username } = JSON.parse(sessionCookie.value) as { username: string };
    if (!username) return null;
    return { username, ...getUserPerms(username) };
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

  // Yönetim Süre — yetkili kullanıcılar
  if (pathname.startsWith("/yonetim-sure")) {
    if (!user) return NextResponse.redirect(new URL("/giris", request.url));
    if (!user.canSeeYonetimSure) return NextResponse.redirect(new URL("/erisim-yok", request.url));
  }

  // Konsey Süre — yetkili kullanıcılar
  if (pathname.startsWith("/konsey-sure")) {
    if (!user) return NextResponse.redirect(new URL("/giris", request.url));
    if (!user.canSeeKonseySure) return NextResponse.redirect(new URL("/erisim-yok", request.url));
  }

  // Dernek sayfaları — giriş zorunlu, viewer kullanıcılar göremez
  if (pathname.startsWith("/chd") || pathname.startsWith("/treachery")) {
    if (!user) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    if (!user.canSeeDernek) {
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
