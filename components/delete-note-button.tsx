"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setDeleting(true);
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setDeleting(false);
      dialogRef.current?.close();
    }
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md border border-red-800 px-4 py-1.5 text-sm font-medium text-red-400 hover:bg-red-950 transition-colors"
      >
        Usuń
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto rounded-lg border border-neutral-700 bg-neutral-900 p-6 text-neutral-100 shadow-xl backdrop:bg-black/60 max-w-sm w-full"
      >
        <h2 className="mb-2 text-lg font-semibold">Usuń notatkę</h2>
        <p className="mb-6 text-sm text-neutral-400">
          Tej operacji nie można cofnąć. Notatka zostanie trwale usunięta.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => dialogRef.current?.close()}
            disabled={deleting}
            className="rounded-md px-4 py-1.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-md bg-red-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "Usuwanie…" : "Usuń"}
          </button>
        </div>
      </dialog>
    </>
  );
}
