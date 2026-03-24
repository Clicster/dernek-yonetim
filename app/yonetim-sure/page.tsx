import { requireYonetimSure } from "@/lib/server-auth";
import YonetimSureContent from "./content";

export default async function YonetimSurePage() {
  await requireYonetimSure();
  return <YonetimSureContent />;
}
