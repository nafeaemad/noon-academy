import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { programs } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(programs).where(eq(programs.active, true)).orderBy(programs.sortOrder);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
