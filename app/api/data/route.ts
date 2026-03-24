import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/server-store";

export async function GET() {
  return NextResponse.json(await readData());
}

export async function POST(request: Request) {
  const data = await request.json();
  await writeData(data);
  return NextResponse.json({ ok: true });
}
