import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  try {
    const [row] = await db
      .update(posts)
      .set({
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
      .where(eq(posts.id, Number(id)))
      .returning();
    return NextResponse.json(row);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "23505") return NextResponse.json({ error: "هذا المعرف (slug) مستخدم بالفعل، اختر معرفًا آخر." }, { status: 409 });
    return NextResponse.json({ error: "حدث خطأ غير متوقع." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(posts).where(eq(posts.id, Number(id)));
  return NextResponse.json({ ok: true });
}
