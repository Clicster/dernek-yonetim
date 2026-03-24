import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { normalizeUsername, VERIFY_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import { readData } from "@/lib/server-store";

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(request: Request) {
  const { username } = await request.json() as { username: string };

  if (!username || !username.trim()) {
    return NextResponse.json({ error: "Habbo kullanıcı adı boş olamaz." }, { status: 400 });
  }

  // Canonical username kullan (USERS'da varsa onun halini, yoksa girileni)
  const cleanUsername = normalizeUsername(username.trim());

  // Daha önce doğrulanmış mı kontrol et
  const data = await readData();
  const alreadyVerified = (data.verifiedKullanicilar ?? []).includes(cleanUsername);

  if (alreadyVerified) {
    // Direkt session oluştur
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify({ username: cleanUsername }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
      sameSite: "lax",
    });
    return NextResponse.json({ ok: true, alreadyVerified: true, username: cleanUsername });
  }

  // İlk giriş — kod doğrulama gerekli
  const code = randomCode();
  const cookieStore = await cookies();

  cookieStore.set(VERIFY_COOKIE, JSON.stringify({ username: cleanUsername, code }), {
    httpOnly: true,
    path: "/",
    maxAge: 600,
    sameSite: "lax",
  });

  return NextResponse.json({ code });
}
