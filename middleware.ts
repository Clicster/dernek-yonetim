import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "dernek_session";

const USERS: Record<string, {
  canSeeDernek: boolean;
  canSeeYonetimSure: boolean;
  canSeeKonseySure: boolean;
  canSeeAdmin: boolean;
}> = {
  "BTNR7":         { canSeeDernek: false, canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: false },
  "TRZiboWTR":     { canSeeDernek: false, canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: false },
  "alparda33":     { canSeeDernek: true,  canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "TPDRoom":       { canSeeDernek: true,  canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "FunkyŞimal01":  { canSeeDernek: true,  canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
};

const DEFAULT = { canSeeDernek: true, canSeeYonetimSure: false, canSeeKonseySure: false, canSeeAdmin: false };

function getUser(request: NextRequest) {
  try {
    const val = request.cookies.get(SESSION_COOKIE)?.value;
    if (!val) return null;
    const { username } = JSON.parse(val) as { username?: string };
    if (!username) return null;
    // Büyük/küçük harf duyarsız eşleşme
    const key = Object.keys(USERS).find(k => k.toLowerCase() === username.toLowerCase());
    const perms = key ? USERS[key] : DEFAULT;
    return { username: key ?? username, ...perms };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getUser(request);

  if (pathname.startsWith("/admin")) {
    if (!user?.canSeeAdmin)
      return NextResponse.redirect(new URL("/giris", request.url));
  }

  if (pathname.startsWith("/yonetim-sure")) {
    if (!user) return NextResponse.redirect(new URL("/giris", request.url));
    if (!user.canSeeYonetimSure) return NextResponse.redirect(new URL("/erisim-yok", request.url));
  }

  if (pathname.startsWith("/konsey-sure")) {
    if (!user) return NextResponse.redirect(new URL("/giris", request.url));
    if (!user.canSeeKonseySure) return NextResponse.redirect(new URL("/erisim-yok", request.url));
  }

  if (pathname.startsWith("/chd") || pathname.startsWith("/treachery")) {
    if (!user) return NextResponse.redirect(new URL("/giris", request.url));
    if (!user.canSeeDernek) return NextResponse.redirect(new URL("/erisim-yok", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/yonetim-sure",
    "/yonetim-sure/:path*",
    "/konsey-sure",
    "/konsey-sure/:path*",
    "/chd/:path*",
    "/treachery/:path*",
  ],
};
