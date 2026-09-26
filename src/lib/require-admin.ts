import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validToken } from "@/lib/admin-auth";

export async function requireAdmin() {
  const store = await cookies();
  const ok = validToken(store.get("noon_admin")?.value);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
