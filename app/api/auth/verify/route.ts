import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USERS, VERIFY_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import { readData } from "@/lib/server-store";

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(request: Request) {
  const { username } = await request.json() as { username: string };

  if (!username || !USERS[username]) {
    return NextResponse.json({ error: "Bu Habbo adı sisteme kayıtlı değil." }, { status: 403 });
  }

  // Daha önce doğrulanmış mı kontrol et
  const data = await readData();
  const alreadyVerified = (data.verifiedKullanicilar ?? []).includes(username);

  if (alreadyVerified) {
    // Direkt session oluştur — kod istemeden giriş yap
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify({ username }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // kalıcı
      sameSite: "lax",
    });
    return NextResponse.json({ ok: true, alreadyVerified: true, username });
  }

  // İlk giriş — kod doğrulama gerekli
  const code = randomCode();
  const cookieStore = await cookies();

  cookieStore.set(VERIFY_COOKIE, JSON.stringify({ username, code }), {
    httpOnly: true,
    path: "/",
    maxAge: 600, // 10 dakika
    sameSite: "lax",
  });

  return NextResponse.json({ code });
}
