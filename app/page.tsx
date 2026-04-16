import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <h1 className="text-4xl font-bold text-white">Welcome to Notes</h1>
        <p className="text-sm text-neutral-400 max-w-xs">
          A simple note-taking app with rich text editing and public sharing.
        </p>
        <div className="flex gap-3">
          <Link
            href="/auth"
            className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth"
            className="px-5 py-2 rounded-full border border-neutral-700 text-white text-sm font-medium hover:border-neutral-500 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
