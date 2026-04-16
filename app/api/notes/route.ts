import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNote, getNotesByUser } from "@/lib/notes";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notes = getNotesByUser(user.id).map(({ id, title, isPublic, updatedAt }) => ({
      id,
      title,
      isPublic,
      updatedAt,
    }));

    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title : undefined;
    const contentJson = typeof body.contentJson === "string" ? body.contentJson : undefined;

    const note = createNote(user.id, { title, contentJson });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
