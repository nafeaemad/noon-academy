import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        titleAr: posts.titleAr,
        titleEn: posts.titleEn,
        excerptAr: posts.excerptAr,
        excerptEn: posts.excerptEn,
        coverImageUrl: posts.coverImageUrl,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
