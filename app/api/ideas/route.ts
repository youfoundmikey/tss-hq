import { NextRequest, NextResponse } from "next/server";
import { listIdeas, createIdea } from "@/lib/ideas";

export async function GET() {
  try {
    const ideas = await listIdeas();
    return NextResponse.json({ ideas });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = await createIdea(body);
    return NextResponse.json({ idea });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
