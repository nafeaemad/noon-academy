import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  try {
    const [row] = await db
      .insert(posts)
      .values({
        slug: String(body.slug).trim(),
        titleAr: body.titleAr,
        titleEn: body.titleEn,
        excerptAr: body.excerptAr,
        excerptEn: body.excerptEn,
        contentAr: body.contentAr,
        contentEn: body.contentEn,
        coverImageUrl: body.coverImageUrl || null,
        published: Boolean(body.published),
      })
      .returning();
    return NextResponse.json(row);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "23505") return NextResponse.json({ error: "هذا المعرف (slug) مستخدم بالفعل، اختر معرفًا آخر." }, { status: 409 });
    return NextResponse.json({ error: "حدث خطأ غير متوقع." }, { status: 500 });
  }
}
