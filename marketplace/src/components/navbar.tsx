"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GraduationCap, LogOut, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">AHK <span className="text-indigo-600">Marketplace</span></span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/tutors" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Find Tutors</Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm"><User className="mr-1.5 h-4 w-4" />Dashboard</Button>
              </Link>
              <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button size="sm">Get Started</Button></Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/tutors" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Find Tutors</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Pricing</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-left text-sm text-red-600">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}><Button size="sm" className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
