import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, getCurrentUser } from "@/lib/auth";

export default async function Header() {
  const user = await getCurrentUser();

  async function signOut() {
    "use server";
    await auth.api.signOut({ headers: await headers() });
    redirect("/auth");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight text-white hover:text-neutral-300 transition-colors"
        >
          NextNotes
        </Link>

        {user && (
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
