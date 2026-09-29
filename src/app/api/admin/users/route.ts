import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users, bookings } from "@/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      provider: users.provider,
      createdAt: users.createdAt,
      bookingCount: sql<number>`count(${bookings.id})`,
    })
    .from(users)
    .leftJoin(bookings, sql`${bookings.userId} = ${users.id}`)
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
  return NextResponse.json(rows);
}
