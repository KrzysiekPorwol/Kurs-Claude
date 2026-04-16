import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNotesByUser } from "@/lib/notes";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const notes = getNotesByUser(user.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-100">My Notes</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors"
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-neutral-500">No notes yet. Create your first one!</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-5 py-4 hover:border-neutral-600 transition-colors"
              >
                <span className="font-medium text-neutral-100">{note.title}</span>
                <span className="text-xs text-neutral-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
