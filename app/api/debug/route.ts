import { NextResponse } from "next/server";
import { supabaseStatus } from "@/lib/server-store";

export async function GET() {
  return NextResponse.json({
    supabase: supabaseStatus,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + "..." : "MISSING",
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "SET (gizli)" : "MISSING",
    },
  });
}
