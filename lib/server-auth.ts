import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "dernek_session";

const USERS: Record<string, {
  canSeeDernek: boolean;
  canSeeYonetimSure: boolean;
  canSeeKonseySure: boolean;
  canSeeAdmin: boolean;
}> = {
  "BTNR7":        { canSeeDernek: false, canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: false },
  "TRZiboWTR":    { canSeeDernek: false, canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: false },
  "alparda33":    { canSeeDernek: true,  canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "TPDRoom":      { canSeeDernek: true,  canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "FunkyŞimal01": { canSeeDernek: true,  canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
};

const DEFAULT = { canSeeDernek: true, canSeeYonetimSure: false, canSeeKonseySure: false, canSeeAdmin: false };

function getPerms(username: string) {
  const key = Object.keys(USERS).find(k => k.toLowerCase() === username.toLowerCase());
  return key ? USERS[key] : DEFAULT;
}

export async function requireDernek() {
  const cookieStore = await cookies();
  const val = cookieStore.get(SESSION_COOKIE)?.value;
  if (!val) redirect("/giris");
  try {
    const { username } = JSON.parse(val) as { username?: string };
    if (!username) redirect("/giris");
    const perms = getPerms(username);
    if (!perms.canSeeDernek) redirect("/erisim-yok");
  } catch { redirect("/giris"); }
}

export async function requireYonetimSure() {
  const cookieStore = await cookies();
  const val = cookieStore.get(SESSION_COOKIE)?.value;
  if (!val) redirect("/erisim-yok");
  try {
    const { username } = JSON.parse(val) as { username?: string };
    if (!username) redirect("/erisim-yok");
    const perms = getPerms(username);
    if (!perms.canSeeYonetimSure) redirect("/erisim-yok");
  } catch { redirect("/erisim-yok"); }
}

export async function requireKonseySure() {
  const cookieStore = await cookies();
  const val = cookieStore.get(SESSION_COOKIE)?.value;
  if (!val) redirect("/erisim-yok");
  try {
    const { username } = JSON.parse(val) as { username?: string };
    if (!username) redirect("/erisim-yok");
    const perms = getPerms(username);
    if (!perms.canSeeKonseySure) redirect("/erisim-yok");
  } catch { redirect("/erisim-yok"); }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const val = cookieStore.get(SESSION_COOKIE)?.value;
  if (!val) redirect("/giris");
  try {
    const { username } = JSON.parse(val) as { username?: string };
    if (!username) redirect("/giris");
    const perms = getPerms(username);
    if (!perms.canSeeAdmin) redirect("/erisim-yok");
  } catch { redirect("/giris"); }
}
