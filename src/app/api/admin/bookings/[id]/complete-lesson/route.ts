import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { completeLesson } from "@/lib/complete-lesson";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;

  const result = await completeLesson(Number(id), "admin");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ booking: result.booking, credited: result.credited, debited: result.debited });
}
