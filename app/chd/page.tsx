import DernekPage from "@/components/DernekPage";
import { requireDernek } from "@/lib/server-auth";

export default async function CHDPage() {
  await requireDernek();
  return <DernekPage dernekKey="chd" title="CHD" color="blue" />;
}
