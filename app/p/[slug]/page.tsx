import { notFound } from "next/navigation";
import { getNoteByPublicSlug } from "@/lib/notes";
import TipTapRenderer, { type TipTapDoc } from "@/components/tiptap-renderer";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) notFound();

  const content = JSON.parse(note.contentJson) as TipTapDoc;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">{note.title}</h1>

      <div className="rounded-md border border-neutral-700 bg-neutral-900 px-6 py-5">
        <TipTapRenderer content={content} />
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        Ostatnia zmiana: {new Date(note.updatedAt.replace(" ", "T") + "Z").toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}
      </p>
    </main>
  );
}
