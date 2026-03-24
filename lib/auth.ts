export type UserRole = "admin" | "viewer";

export interface UserDef {
  role: UserRole;
  canSeeDernek: boolean;
  canSeeYonetimSure: boolean;
  canSeeKonseySure: boolean;
  canSeeAdmin: boolean;
}

export const USERS: Record<string, UserDef> = {
  "BTNR7": {
    role: "viewer",
    canSeeDernek: false,
    canSeeYonetimSure: true,
    canSeeKonseySure: true,
    canSeeAdmin: false,
  },
  "TRZiboWTR": {
    role: "viewer",
    canSeeDernek: false,
    canSeeYonetimSure: true,
    canSeeKonseySure: true,
    canSeeAdmin: false,
  },
  "alparda33": {
    role: "admin",
    canSeeDernek: true,
    canSeeYonetimSure: true,
    canSeeKonseySure: true,
    canSeeAdmin: true,
  },
  "TPDRoom": {
    role: "admin",
    canSeeDernek: true,
    canSeeYonetimSure: true,
    canSeeKonseySure: true,
    canSeeAdmin: true,
  },
  "FunkyŞimal01": {
    role: "admin",
    canSeeDernek: true,
    canSeeYonetimSure: true,
    canSeeKonseySure: true,
    canSeeAdmin: true,
  },
};

// Listede olmayan kullanıcılar için varsayılan yetki — sadece dernekler
export const DEFAULT_PERMS: UserDef = {
  role: "viewer",
  canSeeDernek: true,
  canSeeYonetimSure: false,
  canSeeKonseySure: false,
  canSeeAdmin: false,
};

export function getUserPerms(username: string): UserDef {
  return USERS[username] ?? DEFAULT_PERMS;
}

export const SESSION_COOKIE = "dernek_session";
export const VERIFY_COOKIE = "dernek_verify";
