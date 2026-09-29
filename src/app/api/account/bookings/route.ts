import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { bookings } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, Number(session.user.id)))
    .orderBy(desc(bookings.createdAt));
  return NextResponse.json(rows);
}
