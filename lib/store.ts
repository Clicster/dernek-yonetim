import { AppData, Ay, AYLAR, AylikVeri, Period, PERIODLAR } from "./types";

const AUTH_KEY = "dernek_admin_auth";
const ADMIN_PASSWORD = "admin123";

export function emptyPeriods(): Record<Period, number> {
  return Object.fromEntries(PERIODLAR.map((p) => [p, 0])) as Record<Period, number>;
}

export function emptyAylikVeri(): AylikVeri {
  return {
    oda: emptyPeriods(),
    calisma: emptyPeriods(),
  };
}

export function emptyAylar(): Record<Ay, AylikVeri> {
  return Object.fromEntries(AYLAR.map((ay) => [ay, emptyAylikVeri()])) as Record<Ay, AylikVeri>;
}

export async function getData(): Promise<AppData> {
  const res = await fetch("/api/data", { cache: "no-store" });
  return res.json();
}

export async function saveData(data: AppData): Promise<void> {
  await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}
