import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import NoteEditor from "@/components/note-editor";

export default async function NoteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const { id } = await params;
  const note = getNoteById(user.id, id);
  if (!note) notFound();

  return <NoteEditor note={note} />;
}
