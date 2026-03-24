import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USERS, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) {
    return NextResponse.json({ username: null });
  }

  try {
    const { username } = JSON.parse(sessionCookie.value) as { username: string };
    const userDef = USERS[username];
    if (!userDef) return NextResponse.json({ username: null });
    return NextResponse.json({ username, ...userDef });
  } catch {
    return NextResponse.json({ username: null });
  }
}
