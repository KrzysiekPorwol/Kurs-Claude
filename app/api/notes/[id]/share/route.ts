import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setNotePublic } from "@/lib/notes";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const isPublic = typeof body.isPublic === "boolean" ? body.isPublic : false;

    const note = setNotePublic(user.id, id, isPublic);
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
