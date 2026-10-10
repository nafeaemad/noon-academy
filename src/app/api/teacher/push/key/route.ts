import { NextResponse } from "next/server";
import { getVapidKeys } from "@/lib/push";
import { requireTeacher } from "@/lib/require-teacher";

export async function GET() {
  const result = await requireTeacher();
  if ("denied" in result) return result.denied;
  const { publicKey } = await getVapidKeys();
  return NextResponse.json({ publicKey });
}
