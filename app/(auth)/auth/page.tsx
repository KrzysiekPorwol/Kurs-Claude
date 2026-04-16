import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "./auth-form";

type Props = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function AuthPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { mode } = await searchParams;
  const isSignUp = mode === "signup";

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-white">
          {isSignUp ? "Create account" : "Sign in"}
        </h1>
        <AuthForm mode={isSignUp ? "signup" : "signin"} />
      </div>
    </main>
  );
}
