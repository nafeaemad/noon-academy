import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TEACHER_COOKIE } from "@/lib/teacher-auth";

export async function POST() {
  const store = await cookies();
  store.delete(TEACHER_COOKIE);
  return NextResponse.json({ ok: true });
}
