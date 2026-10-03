import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { homeForRole } from "@/lib/cover";

export const metadata = { title: "Sign Up - AHK Marketplace" };

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  async function register(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // Never trust the submitted role: only these can self-register.
    const submittedRole = String(formData.get("role") ?? "STUDENT").toUpperCase();
    const role = ["STUDENT", "TUTOR", "HEAD_TEACHER"].includes(submittedRole) ? submittedRole : "STUDENT";

    if (!name || !email || !password) {
      redirect("/register?error=All fields are required");
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      redirect("/register?error=An account with this email already exists");
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Create associated profile based on role
    if (role === "TUTOR") {
      await db.tutorProfile.create({
        data: {
          userId: user.id,
          hourlyRate: 15,
          teachingLanguages: "English",
        },
      });
    } else if (role === "STUDENT") {
      await db.studentMarketProfile.create({
        data: {
          userId: user.id,
          learningLanguage: "English",
          proficiencyLevel: "beginner",
        },
      });
    }

    // Sign in the new user
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch {
      redirect("/login?error=Account created. Please sign in.");
    }

    redirect(role === "HEAD_TEACHER" ? "/institution/settings" : homeForRole(role));
  }

  return <RegisterPageInner registerAction={register} searchParams={searchParams} />;
}

async function RegisterPageInner({
  registerAction,
  searchParams,
}: {
  registerAction: (fd: FormData) => Promise<void>;
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Join AHK Marketplace and start learning today
            </p>
          </CardHeader>
          <CardContent>
            {params?.error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {params.error}
              </p>
            )}
            <form action={registerAction} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Must be at least 6 characters
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  I want to
                </label>
                <Select name="role" required defaultValue={params.role ?? "STUDENT"}>
                  <option value="STUDENT">Learn English (Student)</option>
                  <option value="TUTOR">Teach English (Tutor)</option>
                  <option value="HEAD_TEACHER">Find cover teachers (Head teacher / course)</option>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
