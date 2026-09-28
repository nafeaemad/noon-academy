import { NextResponse } from "next/server";
import { getVapidKeys } from "@/lib/push";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { publicKey } = await getVapidKeys();
  return NextResponse.json({ publicKey });
}
