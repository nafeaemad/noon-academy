import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(teachers).where(eq(teachers.active, true));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
