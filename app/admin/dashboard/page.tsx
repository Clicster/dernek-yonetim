import { requireAdmin } from "@/lib/server-auth";
import AdminDashboardContent from "./content";

export default async function AdminDashboardPage() {
  await requireAdmin();
  return <AdminDashboardContent />;
}
