import { LayoutDashboard, PlusCircle, Users, Settings } from "lucide-react";
import { requireRole } from "@/lib/cover";
import { PortalShell } from "@/components/portal-shell";

export default async function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("HEAD_TEACHER");

  const links = [
    { href: "/institution", label: "Cover requests", icon: LayoutDashboard },
    { href: "/institution/requests/new", label: "Request a teacher", icon: PlusCircle },
    { href: "/institution/teachers", label: "Verified teachers", icon: Users },
    { href: "/institution/settings", label: "Institution", icon: Settings },
  ];

  return (
    <PortalShell links={links} userName={user.name} roleLabel="Head teacher">
      {children}
    </PortalShell>
  );
}
