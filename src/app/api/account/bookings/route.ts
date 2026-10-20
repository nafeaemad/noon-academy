import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { bookings, teachers, users } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  const rows = await db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      program: bookings.program,
      startsAt: bookings.startsAt,
      status: bookings.status,
      teacherNameAr: teachers.nameAr,
      teacherNameEn: teachers.nameEn,
      duration: bookings.duration,
      creditedAt: bookings.creditedAt,
      // The link itself is only handed out by the join endpoint, after the lesson is counted.
      hasLink: sql<boolean>`(${teachers.meetingLink} is not null and ${teachers.meetingLink} <> '')`,
    })
    .from(bookings)
    .leftJoin(teachers, eq(bookings.teacherId, teachers.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));

  const [user] = await db.select({ lessonBalance: users.lessonBalance }).from(users).where(eq(users.id, userId));

  return NextResponse.json({ bookings: rows, lessonBalance: user?.lessonBalance ?? 0 });
}
