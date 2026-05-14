"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  LogOut,
  UserCheck,
  FileText,
  BarChart3,
  Building2,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminLinks: SidebarItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
  { label: "Students", href: "/admin/students", icon: <Users size={20} /> },
  { label: "Teachers", href: "/admin/teachers", icon: <GraduationCap size={20} /> },
  { label: "Classes", href: "/admin/classes", icon: <BookOpen size={20} /> },
  { label: "Payments", href: "/admin/payments", icon: <CreditCard size={20} /> },
  { label: "Reports", href: "/admin/reports", icon: <BarChart3 size={20} /> },
  { label: "Departments", href: "/admin/departments", icon: <Building2 size={20} /> },
];

const teacherLinks: SidebarItem[] = [
  { label: "Dashboard", href: "/teacher", icon: <LayoutDashboard size={20} /> },
  { label: "My Classes", href: "/teacher/classes", icon: <BookOpen size={20} /> },
  { label: "Attendance", href: "/teacher/attendance", icon: <UserCheck size={20} /> },
  { label: "Assignments", href: "/teacher/assignments", icon: <ClipboardList size={20} /> },
  { label: "Lessons", href: "/teacher/lessons", icon: <FileText size={20} /> },
  { label: "Students", href: "/teacher/students", icon: <Users size={20} /> },
];

const studentLinks: SidebarItem[] = [
  { label: "Dashboard", href: "/student", icon: <LayoutDashboard size={20} /> },
  { label: "My Classes", href: "/student/classes", icon: <BookOpen size={20} /> },
  { label: "Lessons", href: "/student/lessons", icon: <FileText size={20} /> },
  { label: "Homework", href: "/student/homework", icon: <ClipboardList size={20} /> },
  { label: "Attendance", href: "/student/attendance", icon: <Calendar size={20} /> },
  { label: "Payments", href: "/student/payments", icon: <CreditCard size={20} /> },
];

interface SidebarProps {
  role: "ADMIN" | "TEACHER" | "STUDENT";
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const links =
    role === "ADMIN" ? adminLinks : role === "TEACHER" ? teacherLinks : studentLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">AHK Academy</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== `/${role.toLowerCase()}` &&
                  pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Settings size={18} />
              Settings
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
