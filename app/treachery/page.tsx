import DernekPage from "@/components/DernekPage";
import { requireDernek } from "@/lib/server-auth";

export default async function TreacheryPage() {
  await requireDernek();
  return <DernekPage dernekKey="treachery" title="Treachery" color="red" />;
}
