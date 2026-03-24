import { requireKonseySure } from "@/lib/server-auth";
import KonseySureContent from "./content";

export default async function KonseySurePage() {
  await requireKonseySure();
  return <KonseySureContent />;
}
