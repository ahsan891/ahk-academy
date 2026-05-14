import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-gray-900">AHK Marketplace</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">Connect with expert tutors for personalized English lessons.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Students</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/tutors" className="hover:text-indigo-600">Find Tutors</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-600">Pricing</Link></li>
              <li><Link href="/register" className="hover:text-indigo-600">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Tutors</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/tutor/apply" className="hover:text-indigo-600">Become a Tutor</Link></li>
              <li><Link href="/login" className="hover:text-indigo-600">Tutor Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-indigo-600">About</Link></li>
              <li><Link href="/" className="hover:text-indigo-600">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AHK Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
