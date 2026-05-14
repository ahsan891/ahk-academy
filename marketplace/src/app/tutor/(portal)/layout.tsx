import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Calendar, BookOpen, DollarSign, Settings } from "lucide-react";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const links = [
    { href: "/tutor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tutor/bookings", label: "Bookings", icon: BookOpen },
    { href: "/tutor/availability", label: "Availability", icon: Calendar },
    { href: "/tutor/earnings", label: "Earnings", icon: DollarSign },
    { href: "/tutor/profile/edit", label: "Edit Profile", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-lg font-bold text-indigo-600">AHK Marketplace</Link>
        </div>
        <nav className="space-y-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
              {session.user.name?.[0] || "T"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">Tutor</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
