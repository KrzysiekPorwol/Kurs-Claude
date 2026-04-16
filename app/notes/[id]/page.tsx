import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import TipTapRenderer, { type TipTapDoc } from "@/components/tiptap-renderer";
import DeleteNoteButton from "@/components/delete-note-button";

export default async function NoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const { id } = await params;
  const note = getNoteById(user.id, id);
  if (!note) notFound();

  const content = JSON.parse(note.contentJson) as TipTapDoc;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-100">{note.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/notes/${id}/edit`}
            className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors"
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={id} />
        </div>
      </div>

      <div className="rounded-md border border-neutral-700 bg-neutral-900 px-6 py-5">
        <TipTapRenderer content={content} />
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        Last updated: {new Date(note.updatedAt.replace(" ", "T") + "Z").toLocaleString("en-GB", { timeZone: "UTC" })}
      </p>
    </main>
  );
}
