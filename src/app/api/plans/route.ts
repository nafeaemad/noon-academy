import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(plans).where(eq(plans.active, true));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
