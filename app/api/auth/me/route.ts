import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserPerms, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) {
    return NextResponse.json({ username: null });
  }

  try {
    const { username } = JSON.parse(sessionCookie.value) as { username: string };
    if (!username) return NextResponse.json({ username: null });
    const perms = getUserPerms(username);
    return NextResponse.json({ username, ...perms });
  } catch {
    return NextResponse.json({ username: null });
  }
}
