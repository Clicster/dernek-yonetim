import { AppData, Ay, AYLAR, AylikVeri } from "./types";

export function emptyAylikVeri(): AylikVeri {
  return { oda: {}, calisma: {} };
}

export function emptyAylar(): Record<Ay, AylikVeri> {
  return Object.fromEntries(AYLAR.map((ay) => [ay, emptyAylikVeri()])) as Record<Ay, AylikVeri>;
}

export async function getData(): Promise<AppData> {
  const res = await fetch("/api/data", { cache: "no-store" });
  return res.json();
}

export async function saveData(data: AppData): Promise<void> {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}
