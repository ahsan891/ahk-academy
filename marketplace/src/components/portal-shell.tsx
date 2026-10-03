import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface PortalLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function PortalShell({
  links,
  userName,
  roleLabel,
  children,
}: {
  links: PortalLink[];
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b bg-white md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-lg font-bold text-indigo-600">AHK Cover Network</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-4 md:block md:space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t p-4 md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
              {userName?.[0] || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-4 sm:p-6">{children}</main>
    </div>
  );
}
