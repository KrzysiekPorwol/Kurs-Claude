"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled note");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: "",
    immediatelyRender: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled note",
          contentJson: JSON.stringify(editor.getJSON()),
        }),
      });

      if (!res.ok) throw new Error("Failed to create note");
      const note = await res.json();
      router.push(`/notes/${note.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const toolbarBtn =
    "rounded px-2.5 py-1 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white data-[active=true]:bg-neutral-600 data-[active=true]:text-white";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-100">New Note</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-neutral-400"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        <div>
          <p className="mb-1.5 block text-sm font-medium text-neutral-400">
            Content
          </p>

          {/* Toolbar */}
          <div
            role="toolbar"
            aria-label="Text formatting"
            className="flex flex-wrap gap-0.5 rounded-t-md border border-b-0 border-neutral-700 bg-neutral-900 px-2 py-1.5"
          >
            <button
              type="button"
              data-active={editor?.isActive("bold")}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={toolbarBtn}
              aria-label="Bold"
            >
              B
            </button>
            <button
              type="button"
              data-active={editor?.isActive("italic")}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`${toolbarBtn} italic`}
              aria-label="Italic"
            >
              I
            </button>
            <span className="mx-1.5 self-stretch border-r border-neutral-700" />
            {([1, 2, 3] as const).map((level) => (
              <button
                key={level}
                type="button"
                data-active={editor?.isActive("heading", { level })}
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level }).run()
                }
                className={toolbarBtn}
                aria-label={`Heading ${level}`}
              >
                H{level}
              </button>
            ))}
            <span className="mx-1.5 self-stretch border-r border-neutral-700" />
            <button
              type="button"
              data-active={editor?.isActive("bulletList")}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={toolbarBtn}
              aria-label="Bullet list"
            >
              • List
            </button>
            <span className="mx-1.5 self-stretch border-r border-neutral-700" />
            <button
              type="button"
              data-active={editor?.isActive("code")}
              onClick={() => editor?.chain().focus().toggleCode().run()}
              className={`${toolbarBtn} font-mono`}
              aria-label="Inline code"
            >
              {"<>"}
            </button>
            <button
              type="button"
              data-active={editor?.isActive("codeBlock")}
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={`${toolbarBtn} font-mono`}
              aria-label="Code block"
            >
              {"{ }"}
            </button>
          </div>

          {/* Editor area */}
          <EditorContent
            editor={editor}
            className="min-h-[260px] rounded-b-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-500 [&_.tiptap]:outline-none [&_.tiptap]:min-h-[220px] [&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mb-2 [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:mb-2 [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mb-1 [&_.tiptap_code]:bg-neutral-800 [&_.tiptap_code]:rounded [&_.tiptap_code]:px-1 [&_.tiptap_code]:text-neutral-200 [&_.tiptap_pre]:bg-neutral-800 [&_.tiptap_pre]:rounded [&_.tiptap_pre]:p-3 [&_.tiptap_pre]:text-neutral-200 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-white px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Note"}
          </button>
          <a
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
