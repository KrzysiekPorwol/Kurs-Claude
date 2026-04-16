import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteNote, getNoteById, updateNote } from "@/lib/notes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const note = getNoteById(user.id, id);
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const deleted = deleteNote(user.id, id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title : undefined;
    const contentJson = typeof body.contentJson === "string" ? body.contentJson : undefined;

    const note = updateNote(user.id, id, { title, contentJson });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
