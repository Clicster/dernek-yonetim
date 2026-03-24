import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USERS, VERIFY_COOKIE } from "@/lib/auth";

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(request: Request) {
  const { username } = await request.json() as { username: string };

  if (!username || !USERS[username]) {
    return NextResponse.json({ error: "Bu Habbo adı sisteme kayıtlı değil." }, { status: 403 });
  }

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
