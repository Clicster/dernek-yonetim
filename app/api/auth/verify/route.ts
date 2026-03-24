import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { normalizeUsername, VERIFY_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import { readData, writeData } from "@/lib/server-store";

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function hashPassword(password: string): string {
  return createHmac("sha256", process.env.NEXTAUTH_SECRET ?? "tpd-istatistik-2026")
    .update(password)
    .digest("hex");
}

export async function POST(request: Request) {
  const { username, password } = await request.json() as { username: string; password?: string };

  if (!username || !username.trim()) {
    return NextResponse.json({ error: "Habbo kullanıcı adı boş olamaz." }, { status: 400 });
  }
  if (!password || !password.trim()) {
    return NextResponse.json({ error: "Şifre boş olamaz." }, { status: 400 });
  }

  const cleanUsername = normalizeUsername(username.trim());
  const data = await readData();

  const alreadyVerified = (data.verifiedKullanicilar ?? []).includes(cleanUsername);
  const sifreleri = data.kullaniciSifreleri ?? {};
  const hasPassword = !!sifreleri[cleanUsername];

  if (alreadyVerified && hasPassword) {
    // Şifre kontrolü
    const hash = hashPassword(password.trim());
    if (hash !== sifreleri[cleanUsername]) {
      return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
    }
    // Doğru şifre — session oluştur
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify({ username: cleanUsername }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
      sameSite: "lax",
    });
    return NextResponse.json({ ok: true, alreadyVerified: true, username: cleanUsername });
  }

  // İlk giriş veya şifre henüz ayarlanmamış — motto doğrulaması gerekli
  const code = randomCode();
  const cookieStore = await cookies();
  cookieStore.set(VERIFY_COOKIE, JSON.stringify({ username: cleanUsername, code, passwordHash: hashPassword(password.trim()) }), {
    httpOnly: true,
    path: "/",
    maxAge: 600,
    sameSite: "lax",
  });

  return NextResponse.json({ code });
}
