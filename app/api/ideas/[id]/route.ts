import { NextRequest, NextResponse } from "next/server";
import { getIdea, updateIdea } from "@/lib/ideas";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idea = await getIdea(params.id);
    if (!idea) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ idea });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patch = await req.json();
    const idea = await updateIdea(params.id, patch);
    if (!idea) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ idea });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
