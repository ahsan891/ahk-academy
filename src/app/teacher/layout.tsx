import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER") redirect(`/${session.user.role.toLowerCase()}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="TEACHER" userName={session.user.name} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
