import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(`/${session.user.role.toLowerCase()}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" userName={session.user.name} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
