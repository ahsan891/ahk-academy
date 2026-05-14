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

export const metadata = { title: "Sign Up - AHK Marketplace" };

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  async function register(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "STUDENT";

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
        role: role.toUpperCase(),
      },
    });

    // Create associated profile based on role
    if (role.toUpperCase() === "TUTOR") {
      await db.tutorProfile.create({
        data: {
          userId: user.id,
          hourlyRate: 15,
          teachingLanguages: "English",
        },
      });
    } else {
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

    redirect("/dashboard");
  }

  return <RegisterPageInner registerAction={register} searchParams={searchParams} />;
}

async function RegisterPageInner({
  registerAction,
  searchParams,
}: {
  registerAction: (fd: FormData) => Promise<void>;
  searchParams: Promise<{ error?: string }>;
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
                <Select name="role" required>
                  <option value="STUDENT">Learn English (Student)</option>
                  <option value="TUTOR">Teach English (Tutor)</option>
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
