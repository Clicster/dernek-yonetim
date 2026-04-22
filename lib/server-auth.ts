import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "dernek_session";

const USERS: Record<string, {
  canSeeYonetimSure: boolean;
  canSeeKonseySure: boolean;
  canSeeAdmin: boolean;
}> = {
  "BTNR7":        { canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "TRZiboWTR":    { canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "alparda33":    { canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "TPDRoom":      { canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
  "FunkyŞimal01": { canSeeYonetimSure: true,  canSeeKonseySure: true,  canSeeAdmin: true  },
};

const DEFAULT = { canSeeYonetimSure: false, canSeeKonseySure: false, canSeeAdmin: false };

function getPerms(username: string) {
  const key = Object.keys(USERS).find(k => k.toLowerCase() === username.toLowerCase());
  return key ? USERS[key] : DEFAULT;
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
