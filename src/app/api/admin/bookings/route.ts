import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  return NextResponse.json(rows);
}
