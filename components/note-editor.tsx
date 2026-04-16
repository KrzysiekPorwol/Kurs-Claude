"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Note } from "@/lib/notes";

export default function NoteEditor({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    ],
    content: JSON.parse(note.contentJson),
    immediatelyRender: false,
  });

  async function handleSave() {
    if (!editor) return;
    setSaving(true);
    setSaved(false);
    setSaveError(false);

    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled note",
          contentJson: JSON.stringify(editor.getJSON()),
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  const toolbarBtn =
    "rounded px-2.5 py-1 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white data-[active=true]:bg-neutral-600 data-[active=true]:text-white";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Note title"
          className="flex-1 bg-transparent text-2xl font-bold text-neutral-100 placeholder-neutral-600 focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : saveError ? "Save failed" : "Save"}
        </button>
        {saveError && (
          <p role="alert" className="text-sm text-red-400">
            Could not save your note. Please try again.
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap gap-0.5 rounded-t-md border border-b-0 border-neutral-700 bg-neutral-900 px-2 py-1.5"
      >
        <button type="button" data-active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} className={toolbarBtn} aria-label="Bold">B</button>
        <button type="button" data-active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} className={`${toolbarBtn} italic`} aria-label="Italic">I</button>
        <span className="mx-1.5 self-stretch border-r border-neutral-700" />
        {([1, 2, 3] as const).map((level) => (
          <button key={level} type="button" data-active={editor?.isActive("heading", { level })} onClick={() => editor?.chain().focus().toggleHeading({ level }).run()} className={toolbarBtn} aria-label={`Heading ${level}`}>H{level}</button>
        ))}
        <span className="mx-1.5 self-stretch border-r border-neutral-700" />
        <button type="button" data-active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} className={toolbarBtn} aria-label="Bullet list">• List</button>
        <span className="mx-1.5 self-stretch border-r border-neutral-700" />
        <button type="button" data-active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()} className={`${toolbarBtn} font-mono`} aria-label="Inline code">{"<>"}</button>
        <button type="button" data-active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`${toolbarBtn} font-mono`} aria-label="Code block">{"{ }"}</button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="min-h-[420px] rounded-b-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-500 [&_.tiptap]:outline-none [&_.tiptap]:min-h-[380px] [&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mb-2 [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:mb-2 [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mb-1 [&_.tiptap_code]:bg-neutral-800 [&_.tiptap_code]:rounded [&_.tiptap_code]:px-1 [&_.tiptap_code]:text-neutral-200 [&_.tiptap_pre]:bg-neutral-800 [&_.tiptap_pre]:rounded [&_.tiptap_pre]:p-3 [&_.tiptap_pre]:text-neutral-200 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5"
      />
    </main>
  );
}
