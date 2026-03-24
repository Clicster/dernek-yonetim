import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USERS, SESSION_COOKIE, VERIFY_COOKIE } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const verifyCookie = cookieStore.get(VERIFY_COOKIE);

  if (!verifyCookie) {
    return NextResponse.json({ error: "Doğrulama süresi doldu. Tekrar dene." }, { status: 400 });
  }

  let username: string;
  let code: string;

  try {
    const parsed = JSON.parse(verifyCookie.value) as { username: string; code: string };
    username = parsed.username;
    code = parsed.code;
  } catch {
    return NextResponse.json({ error: "Geçersiz oturum. Tekrar dene." }, { status: 400 });
  }

  if (!USERS[username]) {
    return NextResponse.json({ error: "Bu Habbo adı sisteme kayıtlı değil." }, { status: 403 });
  }

  // Habbo API'den motto kontrolü
  try {
    const res = await fetch(
      `https://www.habbo.com.tr/api/public/users?name=${encodeURIComponent(username)}`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Habbo profili bulunamadı. Kullanıcı adını kontrol et." }, { status: 400 });
    }

    const profile = await res.json() as { motto?: string };
    const motto = profile.motto ?? "";

    if (!motto.includes(code)) {
      return NextResponse.json({ error: `Motto'da kod bulunamadı. Habbo profilinde "${code}" kodunu motto kısmına yaz ve tekrar dene.` }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Habbo sunucusuna ulaşılamadı. İnternet bağlantını kontrol et." }, { status: 500 });
  }

  // Başarılı — session oluştur
  cookieStore.set(SESSION_COOKIE, JSON.stringify({ username }), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 gün
    sameSite: "lax",
  });

  cookieStore.delete(VERIFY_COOKIE);

  return NextResponse.json({ ok: true, username });
}
