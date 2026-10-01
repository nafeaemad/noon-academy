import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

const defaults = {
  whatsapp: "+1 555 123 4567",
  email: "hello@noonquran.academy",
  responseTimeAr: "عادة خلال 24 ساعة",
  responseTimeEn: "Usually within 24 hours",
  facebook: null as string | null,
  instagram: null as string | null,
  teachersVisible: true,
};

export async function GET() {
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, 1));
    return NextResponse.json(rows[0] ?? defaults);
  } catch {
    return NextResponse.json(defaults);
  }
}
