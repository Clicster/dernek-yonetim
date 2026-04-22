import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/server-store";

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await writeData(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/data POST] writeData hatası:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
