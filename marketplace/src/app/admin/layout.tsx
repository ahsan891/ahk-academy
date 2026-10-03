import { ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/cover";
import { PortalShell } from "@/components/portal-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const links = [{ href: "/admin/verification", label: "Vetting queue", icon: ShieldCheck }];

  return (
    <PortalShell links={links} userName={user.name} roleLabel="AHK admin">
      {children}
    </PortalShell>
  );
}
