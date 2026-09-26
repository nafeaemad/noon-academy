import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(bookings)
    .set({ status: body.status })
    .where(eq(bookings.id, Number(id)))
    .returning();
  return NextResponse.json(row);
}
