import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { bookings, teachers } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      program: bookings.program,
      startsAt: bookings.startsAt,
      status: bookings.status,
      teacherNameAr: teachers.nameAr,
      teacherNameEn: teachers.nameEn,
    })
    .from(bookings)
    .leftJoin(teachers, eq(bookings.teacherId, teachers.id))
    .where(eq(bookings.userId, Number(session.user.id)))
    .orderBy(desc(bookings.createdAt));
  return NextResponse.json(rows);
}
